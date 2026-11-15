"use client";

import { useMemo } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { TravelGeo } from '../geo';
import { INK, ownerOf, land, landFit } from './shared';
import { COUNTRIES, PLACES } from '@/data/travel';

const W = 1200, H = 640;

/** Hand-placed annotations for places with a story. Offsets are [dx, dy] from the point. */
const NOTES: { place: string; text: string; dx: number; dy: number }[] = [
    { place: 'Ahmedabad', text: 'grew up here ♥', dx: -150, dy: 60 },
    { place: 'Rishikesh', text: 'rafted the Ganga! Mar ’24', dx: -40, dy: -110 },
    { place: 'Bhrigu Lake', text: 'trekked up here', dx: -170, dy: -40 },
    { place: 'Georgia', text: 'home now', dx: 30, dy: 70 },
    { place: 'Ottawa', text: 'more rafting, Jul ’25', dx: 40, dy: -80 },
    { place: 'Orlando', text: 'Universal!!', dx: 80, dy: 40 },
    { place: 'Gold Coast', text: 'Dreamworld ✶', dx: -30, dy: 80 },
];

/** 7 · A doodled map on graph paper: pencil hatching, wobbly lines and handwritten notes. */
export default function Doodle({ geo }: { geo: TravelGeo }) {
    const proj = useMemo(() => geoNaturalEarth1().fitExtent([[30, 40], [W - 30, H - 30]], landFit(geo)), [geo]);
    const path = useMemo(() => geoPath(proj), [proj]);
    return (
        <div className="lab-doodle">
            <header>
                <p className="lab-eyebrow lab-hand">trupal’s travel doodles</p>
                <h1 className="lab-hand">places I’ve <u>actually</u> been →</h1>
            </header>
            <svg viewBox={`0 0 ${W} ${H}`} className="lab-doodle__map" role="img" aria-label="Hand-drawn map with visited places hatched and annotated">
                <defs>
                    <filter id="wobble"><feTurbulence type="turbulence" baseFrequency="0.03" numOctaves={2} seed={7} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="4" /></filter>
                    {COUNTRIES.map((c) => (
                        <pattern key={c.name} id={`hatch-${c.label.replace(/\W/g, '')}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
                            <line x1="0" y1="0" x2="0" y2="7" stroke={INK[c.label]} strokeWidth="2.4" />
                        </pattern>
                    ))}
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10" fill="none" stroke="#2b2b2b" strokeWidth="1.6" /></marker>
                </defs>
                <g filter="url(#wobble)">
                    {land(geo).map((f, i) => <path key={i} d={path(f) ?? ''} fill="none" stroke="#3a3a3a" strokeWidth={1} strokeLinejoin="round" opacity={0.55} />)}
                    {geo.lit.map((f, i) => <path key={`l${i}`} d={path(f) ?? ''} fill={`url(#hatch-${ownerOf(f).replace(/\W/g, '')})`} stroke={INK[ownerOf(f)]} strokeWidth={1.6} />)}
                </g>
                {NOTES.map((n) => {
                    const p = PLACES.find((x) => x.name === n.place);
                    if (!p) return null;
                    const [x, y] = proj(p.coords)!;
                    const tx = x + n.dx, ty = y + n.dy;
                    return (
                        <g key={n.place} className="lab-doodle__note">
                            <path d={`M ${tx} ${ty + (n.dy < 0 ? 8 : -16)} Q ${(x + tx) / 2 + 20} ${(y + ty) / 2 - 20} ${x} ${y}`} fill="none" stroke="#2b2b2b" strokeWidth={1.4} markerEnd="url(#arrow)" />
                            <circle cx={x} cy={y} r={4} fill="none" stroke="#2b2b2b" strokeWidth={1.4} />
                            <text x={tx} y={ty} className="lab-hand" fontSize={21} fill="#2b2b2b" textAnchor={n.dx < 0 ? 'end' : 'start'}>{n.text}</text>
                        </g>
                    );
                })}
            </svg>
            <ul className="lab-doodle__key lab-hand">
                {COUNTRIES.map((c) => <li key={c.name}><i style={{ background: `repeating-linear-gradient(-35deg, ${INK[c.label]} 0 2px, transparent 2px 6px)`, borderColor: INK[c.label] }} />{c.label}</li>)}
            </ul>
        </div>
    );
}
