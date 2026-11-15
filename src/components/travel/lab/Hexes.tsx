"use client";

import { useMemo } from 'react';
import { geoCentroid, geoMercator } from 'd3-geo';
import type { TravelGeo } from '../geo';
import { INK, LIT, pretty, regionsOf } from './shared';
import { COUNTRIES } from '@/data/travel';

const HEX = 26; // hex radius in px
const hexPoints = (r: number) => Array.from({ length: 6 }, (_, k) => { const a = (Math.PI / 3) * k + Math.PI / 6; return `${Math.cos(a) * r},${Math.sin(a) * r}`; }).join(' ');

/** Short tile label: initials for multi-word names, else the first two letters. */
const abbr = (n: string) => { const ini = n.replace(/[^A-Z]/g, ''); return (ini.length > 1 ? ini : n.slice(0, 2)).slice(0, 3).toUpperCase(); };

/** Snap each region's centroid to a free cell on a hex grid, keeping rough geography. */
function layout(points: { name: string; xy: [number, number] }[]) {
    const w = Math.sqrt(3) * HEX, h = 1.5 * HEX;
    const used = new Set<string>();
    return points.map((p) => {
        let best: [number, number] = [0, 0], bestD = Infinity;
        const r0 = Math.round(p.xy[1] / h), c0 = Math.round(p.xy[0] / w);
        for (let r = r0 - 3; r <= r0 + 3; r++) {
            for (let c = c0 - 3; c <= c0 + 3; c++) {
                if (used.has(`${r},${c}`)) continue;
                const x = c * w + (r % 2 ? w / 2 : 0), y = r * h;
                const d = (x - p.xy[0]) ** 2 + (y - p.xy[1]) ** 2;
                if (d < bestD) { bestD = d; best = [r, c]; }
            }
        }
        used.add(`${best[0]},${best[1]}`);
        return { ...p, x: best[1] * w + (best[0] % 2 ? w / 2 : 0), y: best[0] * h };
    });
}

/** 8 · Candy hex mosaics: every state or province is a tile; the ones visited pop in colour. */
export default function Hexes({ geo }: { geo: TravelGeo }) {
    const boards = useMemo(() => COUNTRIES.map((c) => {
        const regions = regionsOf(geo, c.label).filter((r) => !['Puerto Rico', 'United States Virgin Islands', 'Guam', 'Commonwealth of the Northern Mariana Islands', 'American Samoa', 'Jervis Bay Territory', 'Macquarie Island', 'Lord Howe Island'].includes(r.properties.name));
        if (!regions.length) return { c, tiles: [{ name: c.label, x: 0, y: 0, lit: true }], w: HEX * 2, h: HEX * 2 };
        const proj = geoMercator().fitSize([regions.length > 30 ? 300 : 220, regions.length > 30 ? 300 : 220], { type: 'FeatureCollection', features: regions });
        const tiles = layout(regions.map((r) => ({ name: r.properties.name, xy: proj(geoCentroid(r)) as [number, number] })))
            .map((t) => ({ ...t, lit: LIT.has(t.name) }));
        const xs = tiles.map((t) => t.x), ys = tiles.map((t) => t.y);
        const minX = Math.min(...xs), minY = Math.min(...ys);
        return { c, tiles: tiles.map((t) => ({ ...t, x: t.x - minX, y: t.y - minY })), w: Math.max(...xs) - minX, h: Math.max(...ys) - minY };
    }), [geo]);

    return (
        <div className="lab-hex">
            <header>
                <p className="lab-eyebrow">Region bingo</p>
                <h1>Filling in the <em>board</em>, one tile at a time.</h1>
            </header>
            <div className="lab-hex__boards">
                {boards.map(({ c, tiles, w, h }) => {
                    const lit = tiles.filter((t) => t.lit).length;
                    return (
                        <figure key={c.name} className="lab-hex__board">
                            <svg viewBox={`${-HEX - 4} ${-HEX - 4} ${w + HEX * 2 + 8} ${h + HEX * 2 + 8}`} role="img" aria-label={`${c.label}: ${lit} of ${tiles.length} visited`}>
                                {tiles.map((t, i) => (
                                    <g key={t.name} transform={`translate(${t.x} ${t.y})`}><g className="lab-hex__tile" style={{ animationDelay: `${i * 25}ms` }}>
                                        <polygon points={hexPoints(HEX - 2)} fill={t.lit ? INK[c.label] : '#eef0f4'} stroke="#fff" strokeWidth={2} />
                                        <title>{pretty(t.name)}{t.lit ? ' · visited' : ''}</title>
                                        {t.lit && <text y={4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">{abbr(pretty(t.name))}</text>}
                                    </g></g>
                                ))}
                            </svg>
                            <figcaption>
                                <b style={{ color: INK[c.label] }}>{c.label}</b>
                                <span>{c.regions ? `${lit} / ${tiles.length}` : 'all of it'}</span>
                            </figcaption>
                        </figure>
                    );
                })}
            </div>
        </div>
    );
}
