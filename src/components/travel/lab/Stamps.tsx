"use client";

import { geoMercator, geoPath } from 'd3-geo';
import type { Named, TravelGeo } from '../geo';
import { INK, LIT, countryFeature, pretty, rand, regionsOf } from './shared';
import { COUNTRIES, PLACES } from '@/data/travel';

const SHAPES = ['circle', 'rect', 'oct', 'round'] as const;

function Stamp({ title, sub, f, color, size, seed }: { title: string; sub: string; f?: Named; color: string; size: number; seed: string }) {
    const shape = SHAPES[Math.floor(rand(seed, 3) * SHAPES.length)];
    const s = size, m = 6;
    const sil = f ? geoPath(geoMercator().fitExtent([[s * 0.3, s * 0.24], [s * 0.7, s * 0.6]], f))(f) ?? '' : '';
    const id = `t${seed.replace(/\W/g, '')}`;
    return (
        <svg viewBox={`0 0 ${s} ${s}`} width={s} height={s} className="lab-stamp" style={{ ['--r' as string]: `${(rand(seed) - 0.5) * 28}deg`, color }} aria-label={`${title} stamp`}>
            <defs>
                <path id={id} d={`M ${s / 2} ${s / 2} m -${s * 0.36} 0 a ${s * 0.36} ${s * 0.36} 0 1 1 ${s * 0.72} 0`} />
            </defs>
            <g filter="url(#ink)" fill="none" stroke="currentColor">
                {shape === 'circle' && (<><circle cx={s / 2} cy={s / 2} r={s / 2 - m} strokeWidth={3} /><circle cx={s / 2} cy={s / 2} r={s / 2 - m - 6} strokeWidth={1.2} /></>)}
                {shape === 'rect' && (<><rect x={m} y={m + s * 0.08} width={s - m * 2} height={s - m * 2 - s * 0.16} strokeWidth={3} /><rect x={m + 5} y={m + s * 0.08 + 5} width={s - m * 2 - 10} height={s - m * 2 - s * 0.16 - 10} strokeWidth={1} /></>)}
                {shape === 'oct' && <polygon points={Array.from({ length: 8 }, (_, k) => { const a = (Math.PI / 4) * k + Math.PI / 8; return `${s / 2 + Math.cos(a) * (s / 2 - m)},${s / 2 + Math.sin(a) * (s / 2 - m)}`; }).join(' ')} strokeWidth={3} />}
                {shape === 'round' && <rect x={m} y={m + s * 0.12} width={s - m * 2} height={s - m * 2 - s * 0.24} rx={s * 0.18} strokeWidth={3} strokeDasharray="1 0" />}
                {sil && <path d={sil} fill="currentColor" stroke="none" opacity={0.85} />}
                <text fill="currentColor" stroke="none" fontSize={s * 0.1} fontWeight={700} letterSpacing="0.08em">
                    {shape === 'circle' ? <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">{title.toUpperCase()}</textPath> : <tspan x={s / 2} y={s * 0.2 + (shape === 'round' ? 6 : 2)} textAnchor="middle">{title.toUpperCase()}</tspan>}
                </text>
                <text x={s / 2} y={s * 0.76} fill="currentColor" stroke="none" fontSize={s * 0.075} textAnchor="middle" letterSpacing="0.12em">{sub.toUpperCase()}</text>
            </g>
        </svg>
    );
}

/** 3 · Passport pages on white: a colourful ink stamp for every country and every state. */
export default function Stamps({ geo }: { geo: TravelGeo }) {
    return (
        <div className="lab-stamps">
            <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
                <filter id="ink"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={4} /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1 1.45" /><feComposite in="SourceGraphic" operator="in" /><feDisplacementMap in2="SourceGraphic" scale="1.5" /></filter>
            </svg>
            <header>
                <p className="lab-eyebrow">Passport · visas &amp; entries</p>
                <h1>Every page,<br /><em>stamped.</em></h1>
            </header>
            <div className="lab-stamps__book">
                {COUNTRIES.map((c) => {
                    const regions = regionsOf(geo, c.label).filter((r) => LIT.has(r.properties.name));
                    const place = PLACES.find((p) => p.country === c.label && p.note?.includes('·'));
                    return (
                        <section key={c.name} className="lab-stamps__page">
                            <span className="lab-stamps__no">VISAS · {c.label.toUpperCase()}</span>
                            <div className="lab-stamps__ink">
                                <Stamp title={c.label} sub={place?.note?.split('·')[1]?.trim() ?? 'admitted'} f={countryFeature(geo, c.name)} color={INK[c.label]} size={170} seed={c.name} />
                                {regions.map((r) => <Stamp key={r.properties.name} title={pretty(r.properties.name)} sub="entry" f={r} color={INK[c.label]} size={104} seed={r.properties.name} />)}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
