"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { geoGraticule, geoMercator, geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { COUNTRIES, type Country } from '@/data/travel';
import { TOTAL_REGIONS, useTravelGeo, type TravelGeo } from './geo';
import { INK, LIT, countryFeature, land, landFit, pretty, rand, regionsOf, shapeOf } from './lab/shared';
import TravelSuggest from './TravelSuggest';
import './travel.css';

const W = 1000;

/** Bright colours for the states and provinces that pop out of a country. */
const POP = ['#ff6b35', '#3a86ff', '#ef233c', '#8338ec', '#ffb703', '#06d6a0', '#ff4d8d', '#118ab2', '#f77f00', '#7bc043', '#9b5de5', '#00bbf9', '#e76f51', '#2a9d8f'];

function Sticker({ f, size, color, outline = 8 }: { f: GeoPermissibleObjects; size: number; color: string; outline?: number }) {
    const pad = outline + 3;
    const d = geoPath(geoMercator().fitExtent([[pad, pad], [size - pad, size - pad]], f))(f) ?? '';
    return (
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
            <path d={d} fill="#fff" stroke="#fff" strokeWidth={outline * 2} strokeLinejoin="round" />
            <path d={d} fill={color} />
        </svg>
    );
}

function useWide() {
    const [wide, setWide] = useState(true);
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 861px)');
        const on = () => setWide(mq.matches);
        on();
        mq.addEventListener('change', on);
        return () => mq.removeEventListener('change', on);
    }, []);
    return wide;
}

type Mode = { kind: 'world'; focus: number } | { kind: 'country'; label: string };

function Atlas({ geo, mode, onPick, wide, H, px }: { geo: TravelGeo; mode: Mode; onPick: (label: string) => void; wide: boolean; H: number; px: number }) {
    // On wide screens leave the bottom for the carousel; on narrow ones, centre the world in the band above it.
    const proj = useMemo(() => geoNaturalEarth1().fitExtent(wide ? [[W * 0.24, 28], [W - 8, H * 0.75]] : [[16, H * 0.24], [W - 16, H * 0.66]], landFit(geo)), [geo, H, wide]);
    const path = useMemo(() => geoPath(proj), [proj]);
    const country = mode.kind === 'country' ? COUNTRIES.find((c) => c.label === mode.label)! : null;
    const focusLabel = mode.kind === 'world' ? COUNTRIES[mode.focus]?.label : null;

    // Pop the states out a beat after the zoom lands.
    const [popped, setPopped] = useState<string | null>(null);
    useEffect(() => {
        if (!country) { setPopped(null); return; }
        const t = setTimeout(() => setPopped(country.label), 750);
        return () => clearTimeout(t);
    }, [country]);

    const view = useMemo(() => {
        if (!country) return { k: 1, tx: 0, ty: 0 };
        const target = shapeOf(geo, country.label)!;
        let [[x0, y0], [x1, y1]] = path.bounds(target);
        const min = W * 0.08;
        if (x1 - x0 < min) { const m = (x0 + x1) / 2; x0 = m - min / 2; x1 = m + min / 2; }
        if (y1 - y0 < min) { const m = (y0 + y1) / 2; y0 = m - min / 2; y1 = m + min / 2; }
        // Leave room for the panel: right side on desktop, bottom sheet on mobile.
        const areaW = wide ? W * 0.46 : W * 0.72, areaH = wide ? H * 0.66 : H * 0.34; // room for states to pop outward
        const cx = wide ? W * 0.32 : W / 2, cy = wide ? H / 2 : H * 0.3;
        const k = Math.min(12, Math.min(areaW / (x1 - x0), areaH / (y1 - y0)));
        return { k, tx: cx - k * (x0 + x1) / 2, ty: cy - k * (y0 + y1) / 2 };
    }, [country, geo, path, wide, H]);

    const regions = useMemo(() => (country ? regionsOf(geo, country.label) : []), [country, geo]);
    const center = useMemo(() => (country ? path.centroid(shapeOf(geo, country.label)!) : [0, 0]), [country, geo, path]);
    const visited = regions.filter((r) => LIT.has(r.properties.name));
    const s = px / view.k; // one screen pixel, in map units at this zoom

    const zoomPx = view.k / px; // screen pixels per map unit
    const visitedCountries = COUNTRIES.filter((c) => !country || c.label !== country.label);
    const grid = useMemo(() => path(geoGraticule().step([20, 20])()) ?? '', [path]);
    const line = (lat: number) => path({ type: 'LineString', coordinates: Array.from({ length: 73 }, (_, i) => [-180 + i * 5, lat]) }) ?? '';

    return (
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="tv-map" role="img" aria-label={country ? `${country.label}, with the visited regions popped out` : 'World map of the countries visited'}>
            <defs>
                {/* Shadows are sized in screen pixels so they stay soft at any zoom. */}
                <filter id="tvPaper" x="-5%" y="-5%" width="110%" height="115%"><feDropShadow dx="0" dy={1.6 * s} stdDeviation={1.4 * s} floodColor="#7d93b5" floodOpacity="0.45" /></filter>
                <filter id="tvSticker" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy={2.5 * s} stdDeviation={2.2 * s} floodColor="#1d2b4a" floodOpacity="0.32" /></filter>
                <filter id="tvLift" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy={5 * s} stdDeviation={4 * s} floodColor="#1d2b4a" floodOpacity="0.3" /></filter>
                <linearGradient id="tvGloss" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
                    <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
            </defs>
            <g className="tv-cam" style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.k})` }}>
                {/* Sea: faint graticule, dashed equator and tropics */}
                <path d={grid} className="tv-grid" />
                <path d={line(0)} className="tv-equator" />
                <path d={line(23.44)} className="tv-tropic" />
                <path d={line(-23.44)} className="tv-tropic" />

                {/* Land as raised paper */}
                <g filter="url(#tvPaper)">
                    {land(geo).map((f, i) => {
                        const c = COUNTRIES.find((x) => x.name === f.properties.name);
                        return <path key={i} d={path(f) ?? ''} className="tv-land" data-dim={String(!!country && !(c && c.label === country.label))} />;
                    })}
                </g>

                {/* Visited countries as glossy stickers */}
                <g filter="url(#tvSticker)">
                    {visitedCountries.map((c) => {
                        const f = countryFeature(geo, c.name);
                        if (!f) return null;
                        const d = path(f) ?? '';
                        const dim = !!focusLabel && c.label !== focusLabel;
                        return (
                            <g key={c.name} className="tv-country" data-dim={String(dim)} data-away={String(!!country)} data-focus={String(c.label === focusLabel)} onClick={!country ? () => onPick(c.label) : undefined}>
                                <path d={d} fill={INK[c.label]} className="tv-country__fill" />
                                <path d={d} fill="url(#tvGloss)" className="tv-country__gloss" />
                                <title>{c.label}</title>
                            </g>
                        );
                    })}
                </g>
                {!country && visitedCountries.map((c) => {
                    const shape = shapeOf(geo, c.label);
                    if (!shape) return null;
                    const [x, y] = path.centroid(shape);
                    const nudge = c.label === 'Nepal' ? -18 * s : c.label === 'Canada' ? 14 * s : 0;
                    return (
                        <text key={c.name} x={x} y={y + nudge} className="tv-clabel" data-dim={String(!!focusLabel && c.label !== focusLabel)} style={{ fontSize: 13 * s, strokeWidth: 4 * s }} textAnchor="middle">
                            {c.label}
                        </text>
                    );
                })}

                {/* Country view: every region in white, visited ones popped out in colour */}
                {country && regions.length > 0 && (
                    <g>
                        <g filter="url(#tvPaper)">
                            {regions.map((r) => <path key={r.properties.name} d={path(r) ?? ''} className="tv-region" />)}
                        </g>
                        <g filter="url(#tvLift)">
                            {visited.map((r, i) => {
                                const [rx, ry] = path.centroid(r);
                                const out = popped === country.label;
                                const dx = (rx - center[0]) * 0.2, dy = (ry - center[1]) * 0.2 - 8 * s;
                                const d = path(r) ?? '';
                                return (
                                    <g key={r.properties.name} className="tv-pop" style={{ transform: out ? `translate(${dx}px, ${dy}px) scale(1.08)` : 'none', transitionDelay: `${i * 45}ms` }}>
                                        <path d={d} fill={POP[i % POP.length]} className="tv-pop__fill" />
                                        <path d={d} fill="url(#tvGloss)" className="tv-country__gloss" />
                                        <title>{pretty(r.properties.name)}</title>
                                    </g>
                                );
                            })}
                        </g>
                        {popped === country.label && visited.map((r, i) => {
                            // Label only the states big enough to hold a name; the panel lists them all.
                            if (path.area(r) * zoomPx * zoomPx < 1600) return null;
                            const [rx, ry] = path.centroid(r);
                            const dx = (rx - center[0]) * 0.2, dy = (ry - center[1]) * 0.2 - 8 * s;
                            return (
                                <text key={r.properties.name} x={rx + dx} y={ry + dy + 4 * s} className="tv-pop__label" style={{ fontSize: 12 * s, strokeWidth: 3.5 * s, animationDelay: `${300 + i * 45}ms` }} textAnchor="middle">
                                    {pretty(r.properties.name)}
                                </text>
                            );
                        })}
                    </g>
                )}
                {country && regions.length === 0 && (
                    <g className="tv-pop" filter="url(#tvLift)" style={{ transform: popped ? `translate(0, ${-6 * s}px) scale(1.06)` : 'none' }}>
                        <path d={path(countryFeature(geo, country.name)!) ?? ''} fill={INK[country.label]} className="tv-pop__fill" />
                        <path d={path(countryFeature(geo, country.name)!) ?? ''} fill="url(#tvGloss)" className="tv-country__gloss" />
                    </g>
                )}
            </g>
        </svg>
    );
}

function Panel({ country, geo, onBack, onStep }: { country: Country; geo: TravelGeo; onBack: () => void; onStep: (d: number) => void }) {
    const visited = regionsOf(geo, country.label).filter((r) => LIT.has(r.properties.name));
    return (
        <aside className="tv-panel" style={{ ['--ink' as string]: INK[country.label] }} aria-live="polite">
            <button type="button" className="tv-panel__back" onClick={onBack}>← All countries</button>
            <h2>{country.label}</h2>
            <p className="tv-panel__count">{country.regions ? <><b>{country.regions.visited.length}</b> of {country.regions.total} {country.regions.noun}</> : 'The whole country'}</p>
            {visited.length > 0 && (
                <ul className="tv-chips">
                    {visited.map((r, i) => <li key={r.properties.name} style={{ ['--c' as string]: POP[i % POP.length], animationDelay: `${600 + i * 40}ms` }}>{pretty(r.properties.name)}</li>)}
                </ul>
            )}
            <div className="tv-panel__nav">
                <button type="button" onClick={() => onStep(-1)}>← Previous</button>
                <button type="button" onClick={() => onStep(1)}>Next →</button>
            </div>
        </aside>
    );
}

/** The travel page: a white world map with each visited country in its own colour, a scroll-driven
 *  carousel of countries, and a country view where the visited states pop out of the map. */
export default function StickerTravel() {
    const geo = useTravelGeo();
    const wide = useWide();
    const mapRef = useRef<HTMLDivElement>(null);
    const [box, setBox] = useState({ w: 1000, h: 600 });
    useEffect(() => {
        const el = mapRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width || 1000, h: e.contentRect.height || 600 }));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    const mapH = Math.round(W * (box.h / box.w));
    const px = W / box.w;
    const trackRef = useRef<HTMLDivElement>(null);
    const [focus, setFocus] = useState(0);
    const [open, setOpen] = useState<string | null>(null);
    const n = COUNTRIES.length;

    // The carousel scrolls sideways on its own; the card nearest the middle is the one in focus.
    const onTrackScroll = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        const mid = el.scrollLeft + el.clientWidth / 2;
        let best = 0, dist = Infinity;
        Array.from(el.children).forEach((c, i) => {
            const card = c as HTMLElement;
            const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid);
            if (d < dist) { dist = d; best = i; }
        });
        setFocus(best);
    }, []);

    // Lock the page while a country is open; Esc closes it.
    useEffect(() => {
        if (!open) return;
        const prev = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
        window.addEventListener('keydown', onKey);
        return () => { document.documentElement.style.overflow = prev; window.removeEventListener('keydown', onKey); };
    }, [open]);

    const step = useCallback((d: number) => {
        setOpen((cur) => {
            const i = COUNTRIES.findIndex((c) => c.label === cur);
            return COUNTRIES[(i + d + n) % n].label;
        });
    }, [n]);

    const mode: Mode = open ? { kind: 'country', label: open } : { kind: 'world', focus };
    const openCountry = COUNTRIES.find((c) => c.label === open);

    return (
        <main className="tv" data-open={String(!!open)}>
            <header className="tv-top">
                <Link href="/about" className="tv-back"><img src="/logo-penrose.png" alt="" width={24} height={24} />Trupal Patel</Link>
                <span className="tv-top__count">{n} countries · {TOTAL_REGIONS} regions</span>
            </header>

            <section className="tv-hero">
                <div className="tv-sticky">
                    <div className="tv-intro" data-hide={String(!!open)}>
                        <p className="tv-eyebrow">Travel · sticker album</p>
                        <h1>Collected <em>{n}</em> countries.<br />Still collecting.</h1>
                        <p className="tv-scroll" aria-hidden="true">swipe the stickers →</p>
                    </div>

                    <div className="tv-mapwrap" ref={mapRef}>{geo ? <Atlas geo={geo} mode={mode} onPick={setOpen} wide={wide} H={mapH} px={px} /> : <p className="tv-loading">Unfolding the map…</p>}</div>

                    <div className="tv-carousel" data-hide={String(!!open)} aria-label="Countries">
                        <div className="tv-track" ref={trackRef} onScroll={onTrackScroll}>
                            {COUNTRIES.map((c, i) => {
                                const shape = geo ? shapeOf(geo, c.label) : undefined;
                                return (
                                    <button
                                        key={c.name}
                                        type="button"
                                        className="tv-slide"
                                        data-focus={String(i === focus)}
                                        style={{ ['--ink' as string]: INK[c.label], ['--r' as string]: `${(rand(c.name) - 0.5) * 8}deg` }}
                                        onClick={() => setOpen(c.label)}
                                        onMouseEnter={() => setFocus(i)}
                                        onFocus={() => setFocus(i)}
                                    >
                                        <span className="tv-slide__art">{shape && <Sticker f={shape} size={92} color={INK[c.label]} outline={6} />}</span>
                                        <span className="tv-slide__name">{c.label}</span>
                                        <span className="tv-slide__meta">{c.regions ? `${c.regions.visited.length} / ${c.regions.total} ${c.regions.noun.split(' ')[0]}` : 'whole country'}</span>
                                        <span className="tv-slide__go">Open →</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {openCountry && geo && <Panel key={openCountry.label} country={openCountry} geo={geo} onBack={() => setOpen(null)} onStep={step} />}
                </div>
            </section>

            <section className="tv-end">
                <TravelSuggest geo={geo} />
            </section>
        </main>
    );
}
