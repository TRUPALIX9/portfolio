"use client";

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Earth, Search, X, Check } from 'lucide-react';
import { CONTINENTS, KINDS, continentOf, flagOf, type Continent, type ExploreSpot } from '@/data/explore';
import KindIcon from './KindIcon';

export type Pick = { continent: Continent | 'all'; country: string | null };

type Row =
    | { type: 'all'; id: string; n: number }
    | { type: 'continent'; id: string; continent: Continent; n: number; open: boolean }
    | { type: 'country'; id: string; continent: Continent; country: string; n: number }
    | { type: 'heading'; id: string; label: string }
    | { type: 'place'; id: string; spot: ExploreSpot; key: string };

const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * A searchable tree dropdown: All → continents → countries, with places in search results.
 * Arrow keys move, Right/Left open and close a continent, Enter picks, Esc closes.
 */
export default function PlacePicker({ spots, value, onPick, onPlace, keyOf }: {
    spots: ExploreSpot[];
    value: Pick;
    onPick: (p: Pick) => void;
    onPlace: (key: string) => void;
    keyOf: (s: ExploreSpot) => string;
}) {
    const id = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [expanded, setExpanded] = useState<Set<Continent>>(new Set());
    const [active, setActive] = useState(0);

    // Counts per continent and per country, biggest first.
    const tree = useMemo(() => {
        const byCont = new Map<Continent, Map<string, number>>();
        spots.forEach((s) => {
            const c = continentOf(s.country);
            const m = byCont.get(c) ?? new Map<string, number>();
            m.set(s.country, (m.get(s.country) ?? 0) + 1);
            byCont.set(c, m);
        });
        return CONTINENTS.filter((c) => byCont.has(c)).map((c) => {
            const countries = [...byCont.get(c)!].sort((a, b) => b[1] - a[1]);
            return { continent: c, n: countries.reduce((t, [, n]) => t + n, 0), countries };
        });
    }, [spots]);

    const rows = useMemo<Row[]>(() => {
        const q = norm(query.trim());
        const out: Row[] = [];
        if (!q) {
            out.push({ type: 'all', id: 'all', n: spots.length });
            tree.forEach((t) => {
                const isOpen = expanded.has(t.continent);
                out.push({ type: 'continent', id: `c-${t.continent}`, continent: t.continent, n: t.n, open: isOpen });
                if (isOpen) t.countries.forEach(([country, n]) => out.push({ type: 'country', id: `k-${country}`, continent: t.continent, country, n }));
            });
            return out;
        }
        // Searching: a continent that matches shows all its countries; otherwise only the matching ones.
        tree.forEach((t) => {
            const contHit = norm(t.continent).includes(q);
            const hits = contHit ? t.countries : t.countries.filter(([c]) => norm(c).includes(q));
            if (!contHit && !hits.length) return;
            out.push({ type: 'continent', id: `c-${t.continent}`, continent: t.continent, n: t.n, open: true });
            hits.forEach(([country, n]) => out.push({ type: 'country', id: `k-${country}`, continent: t.continent, country, n }));
        });
        const places = spots.filter((s) => norm(s.name).includes(q) || norm(s.where).includes(q)).slice(0, 8);
        if (places.length) {
            out.push({ type: 'heading', id: 'h-places', label: 'Places' });
            places.forEach((s) => out.push({ type: 'place', id: `p-${keyOf(s)}`, spot: s, key: keyOf(s) }));
        }
        return out;
    }, [query, tree, expanded, spots, keyOf]);

    const pickable = rows.map((r, i) => (r.type === 'heading' ? -1 : i)).filter((i) => i >= 0);

    // Close on a click outside.
    useEffect(() => {
        if (!open) return;
        const on = (e: PointerEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('pointerdown', on);
        return () => document.removeEventListener('pointerdown', on);
    }, [open]);

    // Opening: focus the search and show the current continent expanded.
    useEffect(() => {
        if (!open) return;
        setQuery('');
        if (value.continent !== 'all') setExpanded((e) => new Set(e).add(value.continent as Continent));
        requestAnimationFrame(() => inputRef.current?.focus());
    }, [open, value.continent]);

    useEffect(() => { setActive(pickable[0] ?? 0); }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [active]);

    const toggle = (c: Continent) => setExpanded((e) => { const n = new Set(e); if (n.has(c)) n.delete(c); else n.add(c); return n; });

    const choose = (r: Row) => {
        if (r.type === 'all') onPick({ continent: 'all', country: null });
        else if (r.type === 'continent') onPick({ continent: r.continent, country: null });
        else if (r.type === 'country') onPick({ continent: r.continent, country: r.country });
        else if (r.type === 'place') onPlace(r.key);
        else return;
        setOpen(false);
    };

    const onKey = (e: React.KeyboardEvent) => {
        const at = pickable.indexOf(active);
        const r = rows[active];
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(pickable[Math.min(at + 1, pickable.length - 1)] ?? active); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(pickable[Math.max(at - 1, 0)] ?? active); }
        else if (e.key === 'Enter') { e.preventDefault(); if (r) choose(r); }
        else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
        else if (!query && r?.type === 'continent' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
            e.preventDefault();
            if ((e.key === 'ArrowRight') !== r.open) toggle(r.continent);
        }
    };

    const label = value.country
        ? <><span aria-hidden="true">{flagOf(value.country)}</span> {value.country}<i>{value.continent}</i></>
        : value.continent !== 'all' ? <><Earth size={16} aria-hidden="true" /> {value.continent}</> : <><Earth size={16} aria-hidden="true" /> All places</>;

    return (
        <div className="tv-pick" ref={rootRef}>
            <button
                type="button"
                className="tv-pick__btn"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={`${id}-list`}
                onClick={() => setOpen((o) => !o)}
                onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); } }}
            >
                <span className="tv-pick__val">{label}</span>
                <ChevronDown size={16} className="tv-pick__chev" aria-hidden="true" />
            </button>
            {(value.continent !== 'all') && (
                <button type="button" className="tv-pick__clear" aria-label="Clear place filter" onClick={() => onPick({ continent: 'all', country: null })}><X size={14} /></button>
            )}

            {open && (
                <div className="tv-pick__pop">
                    <label className="tv-pick__searchwrap">
                    <Search size={16} aria-hidden="true" />
                    <input
                        ref={inputRef}
                        className="tv-pick__search"
                        type="search"
                        role="combobox"
                        aria-expanded="true"
                        aria-controls={`${id}-list`}
                        aria-activedescendant={rows[active] ? `${id}-${rows[active].id}` : undefined}
                        aria-autocomplete="list"
                        placeholder="Search a continent, country or place"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onKey}
                    />
                    </label>
                    <ul className="tv-pick__list" id={`${id}-list`} role="listbox" ref={listRef} aria-label="Places">
                        {rows.length === 0 && <li className="tv-pick__none">Nothing matches “{query}”.</li>}
                        {rows.map((r, i) => {
                            if (r.type === 'heading') return <li key={r.id} className="tv-pick__head" role="presentation">{r.label}</li>;
                            const selected =
                                (r.type === 'all' && value.continent === 'all') ||
                                (r.type === 'continent' && value.continent === r.continent && !value.country) ||
                                (r.type === 'country' && value.country === r.country);
                            return (
                                <li
                                    key={r.id}
                                    id={`${id}-${r.id}`}
                                    data-i={i}
                                    role="option"
                                    aria-selected={selected}
                                    aria-expanded={r.type === 'continent' && !query ? r.open : undefined}
                                    className={`tv-pick__row tv-pick__row--${r.type}`}
                                    data-active={String(i === active)}
                                    onMouseEnter={() => setActive(i)}
                                    onClick={() => choose(r)}
                                >
                                    {r.type === 'continent' && (
                                        <span
                                            className="tv-pick__twist"
                                            data-open={String(r.open)}
                                            aria-hidden="true"
                                            onClick={(e) => { e.stopPropagation(); if (!query) toggle(r.continent); }}
                                        >{r.open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                                    )}
                                    {r.type === 'all' && <><span className="tv-pick__ico"><Earth size={16} aria-hidden="true" /></span><b>All places</b><em>{r.n}</em></>}
                                    {r.type === 'continent' && <><b>{r.continent}</b><em>{r.n}</em></>}
                                    {r.type === 'country' && <><span aria-hidden="true">{flagOf(r.country)}</span><b>{r.country}</b><em>{r.n}</em></>}
                                    {r.type === 'place' && <><span className="tv-pick__ico" style={{ ['--c' as string]: KINDS[r.spot.kind].color }}><KindIcon kind={r.spot.kind} size={16} /></span><b>{r.spot.name}</b><small>{r.spot.where}</small></>}
                                    {selected && <Check size={16} className="tv-pick__tick" aria-hidden="true" />}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
