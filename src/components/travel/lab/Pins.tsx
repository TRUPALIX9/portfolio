"use client";

import { useMemo, useState } from 'react';
import { geoInterpolate, geoNaturalEarth1, geoPath } from 'd3-geo';
import type { TravelGeo } from '../geo';
import { INK, ownerOf, land, landFit } from './shared';
import { COUNTRIES, HOMES, PLACES } from '@/data/travel';

const W = 1200, H = 620;

/** 6 · A pin board: colourful map pins on a clean map, with yarn strung from the two home bases. */
export default function Pins({ geo }: { geo: TravelGeo }) {
    const proj = useMemo(() => geoNaturalEarth1().fitExtent([[30, 30], [W - 30, H - 30]], landFit(geo)), [geo]);
    const path = useMemo(() => geoPath(proj), [proj]);
    const [open, setOpen] = useState<string | null>('Rishikesh');

    const homeFor = (country: string) => (country === 'India' || country === 'Nepal' || country === 'Australia' ? HOMES[0] : HOMES[1]);
    const yarn = (a: [number, number], b: [number, number]) => {
        const i = geoInterpolate(a, b);
        return path({ type: 'LineString', coordinates: Array.from({ length: 30 }, (_, k) => i(k / 29)) }) ?? '';
    };
    const pins = PLACES.filter((p) => !HOMES.some((h) => h.name === p.name));
    // Nepal has no named place yet, so its pin goes in the middle of the country.
    const nepal = COUNTRIES.find((c) => c.label === 'Nepal')!;

    return (
        <div className="lab-pins">
            <header>
                <p className="lab-eyebrow">The pin board</p>
                <h1>{pins.length + 1} pins and<br />a lot of <em>yarn.</em></h1>
            </header>
            <svg viewBox={`0 0 ${W} ${H}`} className="lab-pins__map" role="img" aria-label="World map with pins on every place visited">
                {land(geo).map((f, i) => <path key={i} d={path(f) ?? ''} fill="#e8eef6" stroke="#fff" strokeWidth={0.8} />)}
                {geo.lit.map((f, i) => <path key={`l${i}`} d={path(f) ?? ''} fill={INK[ownerOf(f)]} opacity={0.28} />)}
                {[...pins.map((p) => ({ c: p.country, to: p.coords })), { c: 'Nepal', to: nepal.center }].map((y, i) => (
                    <path key={`y${i}`} d={yarn(homeFor(y.c).coords, y.to)} fill="none" stroke={INK[y.c]} strokeWidth={1.4} strokeDasharray="1 4" strokeLinecap="round" className="lab-yarn" style={{ animationDelay: `${i * 60}ms` }} />
                ))}
                {HOMES.map((h) => {
                    const [x, y] = proj(h.coords)!;
                    return <g key={h.name} transform={`translate(${x} ${y})`}><circle r={10} fill="#1d1d1d" /><text y={4} textAnchor="middle" fontSize={11} fill="#fff">⌂</text></g>;
                })}
                {[...pins.map((p) => ({ name: p.name, country: p.country, coords: p.coords, note: p.note })), { name: 'Nepal', country: 'Nepal', coords: nepal.center, note: undefined }].map((p, i) => {
                    const [x, y] = proj(p.coords as [number, number])!;
                    const on = open === p.name;
                    return (
                        <g key={p.name} transform={`translate(${x} ${y})`} style={{ cursor: 'pointer' }} onClick={() => setOpen(on ? null : p.name)}>
                            <g className="lab-pin" style={{ animationDelay: `${300 + i * 70}ms` }}>
                            <ellipse cx={2} cy={1} rx={5} ry={2} fill="#000" opacity={0.15} />
                            <path d="M0 0 C -2 -10 -9 -14 -9 -21 a 9 9 0 1 1 18 0 c 0 7 -7 11 -9 21z" fill={INK[p.country]} stroke="#fff" strokeWidth={1.5} />
                            <circle cy={-21} r={3.2} fill="#fff" />
                            {on && (
                                <g transform="translate(12 -40)">
                                    <rect width={Math.max(p.name.length, (p.note ?? '').length) * 6.6 + 20} height={p.note ? 40 : 24} rx={8} fill="#1d1d1d" />
                                    <text x={10} y={16} fontSize={12} fill="#fff" fontWeight={600}>{p.name}</text>
                                    {p.note && <text x={10} y={31} fontSize={10.5} fill="#bbb">{p.note}</text>}
                                </g>
                            )}
                            </g>
                        </g>
                    );
                })}
            </svg>
            <ul className="lab-scratch__legend lab-paper__legend">
                {COUNTRIES.map((c) => <li key={c.name}><i style={{ background: INK[c.label] }} />{c.label}</li>)}
                <li><i style={{ background: '#1d1d1d' }} />Home base</li>
            </ul>
        </div>
    );
}
