"use client";

import { useMemo, useState, type FormEvent } from 'react';
import type { TravelGeo } from './geo';

const CODE_FOR: Record<string, string> = { India: 'IND', 'United States of America': 'USA', Canada: 'CAN', Australia: 'AUS' };

/** "Where should I go next?" Drill down from a country to a state to a city, then say what to try there. */
export default function TravelSuggest({ geo }: { geo: TravelGeo | null }) {
    const [country, setCountry] = useState('');
    const [region, setRegion] = useState('');
    const [city, setCity] = useState('');
    const [note, setNote] = useState('');
    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [countryError, setCountryError] = useState('');

    const countries = useMemo(() => (geo ? [...new Set(geo.countries.map((c) => c.properties.name))].sort() : []), [geo]);
    const regions = useMemo(() => {
        const code = CODE_FOR[country];
        return geo && code ? geo.regions.filter((r) => r.properties.country === code).map((r) => r.properties.name).sort() : [];
    }, [geo, country]);

    const pickCountry = (v: string) => {
        setCountry(v);
        setRegion('');
        setCity('');
        setCountryError('');
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (country.trim().length < 2) {
            setCountryError('Pick a country first.');
            return;
        }
        const kind = city.trim() ? 'city' : region.trim() ? 'state' : 'country';
        const place = city.trim() || region.trim() || country.trim();
        setState('sending');
        setMessage('');
        try {
            const res = await fetch('/api/travel/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ place, kind, country, state: region, city, note, name, website }),
            });
            if (res.status === 429) throw new Error("That's plenty for now, thank you.");
            const data = (await res.json().catch(() => null)) as { error?: string } | null;
            if (!res.ok) throw new Error(data?.error ?? 'That did not go through. Try again in a moment.');
            setState('done');
        } catch (err) {
            setState('error');
            setMessage(err instanceof Error ? err.message : 'That did not go through.');
        }
    };

    if (state === 'done') {
        return (
            <div className="tv-suggest tv-suggest--done" role="status">
                <p className="tv-suggest__big">Pinned it! ✈</p>
                <p>Thanks. It goes straight onto Trupal’s someday list.</p>
                <button type="button" className="tv-btn" onClick={() => { setState('idle'); pickCountry(''); setNote(''); }}>Suggest another</button>
            </div>
        );
    }

    const trail = [country, region, city].filter(Boolean);

    return (
        <form className="tv-suggest" onSubmit={submit} noValidate>
            <div className="tv-suggest__intro">
                <p className="tv-eyebrow">Your turn</p>
                <h2>Where should I go next?</h2>
                <p className="tv-lede">Pick a country, narrow it to a state or a city if you like, and tell me what I have to try there.</p>
            </div>

            <ol className="tv-drill">
                <li data-done={String(!!country)}>
                    <label className="tv-field">
                        <span><b>1</b> Country</span>
                        <input list="tv-countries" value={country} onChange={(e) => pickCountry(e.target.value)} maxLength={80} placeholder="Japan" aria-invalid={!!countryError} />
                        <datalist id="tv-countries">{countries.map((c) => <option key={c} value={c} />)}</datalist>
                    </label>
                    {countryError && <em className="tv-field__err">{countryError}</em>}
                </li>
                <li data-done={String(!!region)} data-locked={String(!country)}>
                    <label className="tv-field">
                        <span><b>2</b> State or province <i>optional</i></span>
                        <input list={regions.length ? 'tv-states' : undefined} value={region} onChange={(e) => setRegion(e.target.value)} maxLength={120} placeholder={regions[0] ?? 'Kyoto Prefecture'} disabled={!country} />
                        {regions.length > 0 && <datalist id="tv-states">{regions.map((s) => <option key={s} value={s} />)}</datalist>}
                    </label>
                </li>
                <li data-done={String(!!city)} data-locked={String(!country)}>
                    <label className="tv-field">
                        <span><b>3</b> City <i>optional</i></span>
                        <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={120} placeholder="Kyoto" disabled={!country} />
                    </label>
                </li>
            </ol>
            {trail.length > 0 && <p className="tv-trail" aria-live="polite">📍 {trail.join(' → ')}</p>}

            <label className="tv-field">
                <span>What should I try there? (optional)</span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} rows={3} placeholder="Ramen in a tiny shop near the station, and the bamboo forest at sunrise." />
            </label>
            <label className="tv-field">
                <span>Your name (optional)</span>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Sam" />
            </label>
            <input className="tv-hp" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} aria-hidden="true" />

            <div className="tv-suggest__actions">
                <button type="submit" className="tv-btn" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send suggestion'}</button>
                {state === 'error' && <span className="tv-field__err" role="alert">{message}</span>}
            </div>
        </form>
    );
}
