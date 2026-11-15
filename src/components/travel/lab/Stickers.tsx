"use client";

import { geoMercator, geoPath } from 'd3-geo';
import type { Named, TravelGeo } from '../geo';
import { INK, LIT, countryFeature, pretty, rand, regionsOf } from './shared';
import { COUNTRIES } from '@/data/travel';

function Silhouette({ f, size, color, outline = 10 }: { f: Named; size: number; color: string; outline?: number }) {
    const pad = outline + 4;
    const proj = geoMercator().fitExtent([[pad, pad], [size - pad, size - pad]], f);
    const d = geoPath(proj)(f) ?? '';
    return (
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
            <path d={d} fill="#fff" stroke="#fff" strokeWidth={outline * 2} strokeLinejoin="round" />
            <path d={d} fill={color} />
        </svg>
    );
}

/** 2 · A sticker album: each country is a die-cut sticker, each state a little round badge. */
export default function Stickers({ geo }: { geo: TravelGeo }) {
    return (
        <div className="lab-stickers">
            <header>
                <p className="lab-eyebrow">Sticker album · vol. 1</p>
                <h1>Collected <em>{COUNTRIES.length}</em> countries.<br />Still collecting.</h1>
            </header>
            <div className="lab-stickers__grid">
                {COUNTRIES.map((c, ci) => {
                    const f = countryFeature(geo, c.name);
                    const regions = regionsOf(geo, c.label).filter((r) => LIT.has(r.properties.name));
                    return (
                        <section key={c.name} className="lab-stickers__page">
                            <div className="lab-sticker lab-sticker--big" style={{ ['--r' as string]: `${(rand(c.name) - 0.5) * 14}deg` }}>
                                {f && <Silhouette f={f} size={200} color={INK[c.label]} />}
                                <span className="lab-sticker__tag" style={{ background: INK[c.label] }}>{c.label}</span>
                            </div>
                            <div className="lab-stickers__badges">
                                {regions.map((r, i) => (
                                    <div key={r.properties.name} className="lab-badge" style={{ ['--r' as string]: `${(rand(r.properties.name, ci) - 0.5) * 24}deg`, ['--d' as string]: `${i * 40}ms` }}>
                                        <Silhouette f={r} size={70} color={INK[c.label]} outline={4} />
                                        <span>{pretty(r.properties.name)}</span>
                                    </div>
                                ))}
                                {!regions.length && <p className="lab-hand">the whole thing! ✶</p>}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
