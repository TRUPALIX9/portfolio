"use client";

import { useMemo, useState } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { TravelGeo } from '../geo';
import { INK, ownerOf, pretty, land, landFit } from './shared';
import { COUNTRIES } from '@/data/travel';

const W = 1200, H = 620;
const LAYERS = 5;

/** 4-layer tint from a base colour toward white, for stacked paper. */
function tint(hex: string, k: number) {
    const n = parseInt(hex.slice(1), 16);
    const mix = (c: number) => Math.round(c + (255 - c) * k);
    return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
}

/** 5 · A paper-cut pop-up map: visited places rise off the page in stacked colour layers. */
export default function PaperCut({ geo }: { geo: TravelGeo }) {
    const path = useMemo(() => geoPath(geoNaturalEarth1().fitExtent([[30, 30], [W - 30, H - 30]], landFit(geo))), [geo]);
    const [hover, setHover] = useState<string | null>(null);
    return (
        <div className="lab-paper">
            <header>
                <p className="lab-eyebrow">Pop-up atlas</p>
                <h1>The places that <em>stuck.</em></h1>
            </header>
            <svg viewBox={`0 0 ${W} ${H}`} className="lab-paper__map" role="img" aria-label="Paper-cut world map with visited places raised">
                <defs>
                    <filter id="paperShadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#5b4a3a" floodOpacity="0.25" /></filter>
                </defs>
                <g filter="url(#paperShadow)">
                    {land(geo).map((f, i) => <path key={i} d={path(f) ?? ''} fill="#fffdf8" stroke="#efe6d6" strokeWidth={0.7} />)}
                </g>
                {geo.lit.map((f, i) => {
                    const owner = ownerOf(f);
                    const name = f.properties.name;
                    const lift = hover === name ? 1.8 : 1;
                    return (
                        <g key={i} onPointerEnter={() => setHover(name)} onPointerLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
                            {Array.from({ length: LAYERS }, (_, k) => (
                                <path
                                    key={k}
                                    d={path(f) ?? ''}
                                    transform={`translate(0 ${-k * 1.6 * lift})`}
                                    fill={tint(INK[owner] ?? '#ff6b35', 0.75 - k * 0.18)}
                                    stroke="#fff"
                                    strokeWidth={0.6}
                                    filter={k === LAYERS - 1 ? 'url(#paperShadow)' : undefined}
                                    style={{ transition: 'transform 220ms cubic-bezier(.3,1.6,.5,1)' }}
                                />
                            ))}
                            <title>{pretty(name)}</title>
                        </g>
                    );
                })}
            </svg>
            <p className="lab-paper__tip">{hover ? `↑ ${pretty(hover)}` : 'Hover a raised piece'}</p>
            <ul className="lab-scratch__legend lab-paper__legend">
                {COUNTRIES.map((c) => <li key={c.name}><i style={{ background: INK[c.label] }} />{c.label}</li>)}
            </ul>
        </div>
    );
}
