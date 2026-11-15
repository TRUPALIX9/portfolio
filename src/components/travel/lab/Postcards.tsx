"use client";

import { useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { TravelGeo } from '../geo';
import { INK, LIT, countryFeature, pretty, regionsOf } from './shared';
import { COUNTRIES, PLACES } from '@/data/travel';

/** 4 · A fan of retro postcards, one per country. Click one to bring it to the front. */
export default function Postcards({ geo }: { geo: TravelGeo }) {
    const [front, setFront] = useState(0);
    const n = COUNTRIES.length;
    return (
        <div className="lab-post">
            <header>
                <p className="lab-eyebrow">Wish you were here</p>
                <h1>Postcards from<br /><em>{n} countries</em></h1>
            </header>
            <div className="lab-post__fan">
                {COUNTRIES.map((c, i) => {
                    const f = countryFeature(geo, c.name);
                    const ink = INK[c.label];
                    const sil = f ? geoPath(geoMercator().fitExtent([[20, 30], [300, 250]], f))(f) ?? '' : '';
                    const regions = regionsOf(geo, c.label).filter((r) => LIT.has(r.properties.name)).map((r) => pretty(r.properties.name));
                    const places = PLACES.filter((p) => p.country === c.label).map((p) => p.name);
                    const off = ((i - front + n) % n);
                    return (
                        <button
                            key={c.name}
                            type="button"
                            className="lab-card"
                            data-front={String(off === 0)}
                            style={{ ['--i' as string]: off, ['--ink' as string]: ink, zIndex: n - off }}
                            onClick={() => setFront(i)}
                            aria-label={`Postcard from ${c.label}`}
                        >
                            <div className="lab-card__art">
                                <svg viewBox="0 0 320 280" aria-hidden="true">
                                    <defs>
                                        <pattern id={`st${i}`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="6" height="12" fill={ink} /><rect x="6" width="6" height="12" fill="#fff" opacity="0.25" /></pattern>
                                    </defs>
                                    <rect width="320" height="280" fill={ink} opacity="0.12" />
                                    <circle cx="250" cy="70" r="46" fill="#ffd166" />
                                    <path d={sil} fill={`url(#st${i})`} stroke="#1d1d1d" strokeWidth="2" strokeLinejoin="round" />
                                </svg>
                                <span className="lab-card__greet">Greetings from</span>
                                <span className="lab-card__name" style={{ color: ink }}>{c.label}</span>
                            </div>
                            <div className="lab-card__back">
                                <span className="lab-card__stamp" style={{ borderColor: ink, color: ink }}>{c.label.slice(0, 3).toUpperCase()}<small>air mail</small></span>
                                <svg className="lab-card__postmark" viewBox="0 0 120 60" aria-hidden="true"><circle cx="30" cy="30" r="24" fill="none" stroke="#999" strokeWidth="1.5" /><path d="M58 18 q10 -6 20 0 t20 0 t20 0 M58 30 q10 -6 20 0 t20 0 t20 0 M58 42 q10 -6 20 0 t20 0 t20 0" fill="none" stroke="#999" strokeWidth="1.5" /></svg>
                                <p className="lab-hand">
                                    {places.length ? `Been to ${places.slice(0, 4).join(', ')}${places.length > 4 ? '…' : ''}.` : 'Saw the whole country!'}
                                    {regions.length ? ` ${regions.length} ${c.regions?.noun} so far.` : ''}
                                </p>
                                <p className="lab-hand lab-hand--sign">— T.</p>
                                <div className="lab-card__lines"><span /><span /><span /></div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
