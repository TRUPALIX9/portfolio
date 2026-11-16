"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GeoJSONSource, Map as MlMap, MapGeoJSONFeature, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import PlacePicker, { type Pick } from './PlacePicker';
import KindPicker from './KindPicker';
import KindIcon from './KindIcon';
import { CONTINENTS, EXPLORE, KINDS, continentOf, flagOf, mapsLink, type Continent, type ExploreKind, type ExploreSpot } from '@/data/explore';

/** Free vector tiles, no key needed. */
const STYLE = 'https://tiles.openfreemap.org/styles/positron';
const WORLD = { center: [20, 25] as [number, number], zoom: 1.9 };

const keyOf = (s: ExploreSpot) => `${s.name}|${s.at.join(',')}`;
const byKey = new Map(EXPLORE.map((s) => [keyOf(s), s]));

function toGeoJSON(spots: ExploreSpot[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
    return {
        type: 'FeatureCollection',
        features: spots.map((s) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [s.at[1], s.at[0]] },
            properties: { key: keyOf(s), color: KINDS[s.kind].color },
        })),
    };
}

function boundsOf(spots: ExploreSpot[]): [[number, number], [number, number]] {
    const lng = spots.map((s) => s.at[1]), lat = spots.map((s) => s.at[0]);
    return [[Math.min(...lng), Math.min(...lat)], [Math.max(...lng), Math.max(...lat)]];
}

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/**
 * The someday list as a map you can browse: places from Trupal's own Google Maps lists on a vector map.
 * Pan or zoom and the list follows what is in view; hover or tap a card and the map follows the list.
 */
export default function Explore() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const mapEl = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MlMap | null>(null);
    const popupRef = useRef<Popup | null>(null);
    const hoverRef = useRef<string | null>(null);

    const [kinds, setKinds] = useState<Set<ExploreKind>>(new Set());
    const [continent, setContinent] = useState<Continent | 'all'>('all');
    const [country, setCountry] = useState<string | null>(null);
    const [inView, setInView] = useState<Set<string> | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [hover, setHover] = useState<string | null>(null);
    const [ready, setReady] = useState(false);
    const [near, setNear] = useState(false);

    const byKind = useMemo(() => (kinds.size ? EXPLORE.filter((s) => kinds.has(s.kind)) : EXPLORE), [kinds]);
    // Counts per kind inside the picked continent or country, for the kind dropdown.
    const kindCounts = useMemo(() => {
        const c = Object.fromEntries(Object.keys(KINDS).map((k) => [k, 0])) as Record<ExploreKind, number>;
        EXPLORE.filter((s) => (continent === 'all' || continentOf(s.country) === continent) && (!country || s.country === country)).forEach((s) => { c[s.kind] += 1; });
        return c;
    }, [continent, country]);
    const spots = useMemo(
        () => byKind.filter((s) => (continent === 'all' || continentOf(s.country) === continent) && (!country || s.country === country)),
        [byKind, continent, country],
    );
    const shown = inView ? spots.filter((s) => inView.has(keyOf(s))) : spots;
    // The list, grouped by country, in continent order then by size.
    const groups = useMemo(() => {
        const m = new Map<string, ExploreSpot[]>();
        shown.forEach((s) => m.set(s.country, [...(m.get(s.country) ?? []), s]));
        return [...m].sort((a, b) => CONTINENTS.indexOf(continentOf(a[0])) - CONTINENTS.indexOf(continentOf(b[0])) || b[1].length - a[1].length);
    }, [shown]);
    const countries = new Set(EXPLORE.map((s) => s.country)).size;

    // Only fetch the map library once the section is close to the screen.
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '600px' });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const updateInView = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;
        const b = map.getBounds();
        // Zoomed out to the whole world, everything counts as in view.
        if (map.getZoom() < 2.2) { setInView(null); return; }
        setInView(new Set(EXPLORE.filter((s) => b.contains([s.at[1], s.at[0]])).map(keyOf)));
    }, []);

    const setPinState = useCallback((key: string | null, state: 'hover' | 'selected', on: boolean) => {
        const map = mapRef.current;
        if (!map || !key || !map.getSource('spots')) return;
        map.setFeatureState({ source: 'spots', id: key }, { [state]: on });
    }, []);

    const openPopup = useCallback(async (key: string) => {
        const map = mapRef.current;
        const s = byKey.get(key);
        if (!map || !s) return;
        const { Popup } = await import('maplibre-gl');
        popupRef.current?.remove();
        popupRef.current = new Popup({ offset: 14, closeButton: false, className: 'tv-xpop', maxWidth: '260px' })
            .setLngLat([s.at[1], s.at[0]])
            .setHTML(`<i style="--c:${KINDS[s.kind].color}">${KINDS[s.kind].label}</i><b>${esc(s.name)}</b><small>${esc(s.where)}</small>`)
            .addTo(map);
    }, []);

    const scrollCardIntoList = (key: string) => {
        const list = listRef.current;
        const card = list?.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`);
        if (!list || !card) return;
        list.scrollTo({ top: card.offsetTop - list.clientHeight / 2 + card.offsetHeight / 2, behavior: 'smooth' });
    };

    const select = useCallback((key: string, fly: boolean) => {
        const map = mapRef.current;
        const s = byKey.get(key);
        if (!map || !s) return;
        setSelected((prev) => { if (prev) setPinState(prev, 'selected', false); return key; });
        if (fly) map.flyTo({ center: [s.at[1], s.at[0]], zoom: Math.max(map.getZoom(), 8.5), speed: 1.6, essential: true });
        openPopup(key);
    }, [openPopup, setPinState]);

    // Build the map.
    useEffect(() => {
        if (!near || !mapEl.current || mapRef.current) return;
        let cancelled = false;
        (async () => {
            const ml = await import('maplibre-gl');
            if (cancelled || !mapEl.current) return;
            const map = new ml.Map({
                container: mapEl.current,
                style: STYLE,
                center: WORLD.center,
                zoom: WORLD.zoom,
                attributionControl: { compact: true },
                cooperativeGestures: true,
                maxZoom: 15,
            });
            mapRef.current = map;
            map.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right');

            map.on('style.load', () => {
                map.setProjection({ type: 'globe' });
                map.addSource('spots', { type: 'geojson', data: toGeoJSON(EXPLORE), promoteId: 'key', cluster: true, clusterRadius: 38, clusterMaxZoom: 6 });
                map.addLayer({
                    id: 'clusters', type: 'circle', source: 'spots', filter: ['has', 'point_count'],
                    paint: {
                        'circle-color': '#1d1d1d',
                        'circle-radius': ['step', ['get', 'point_count'], 13, 5, 16, 15, 20, 40, 25],
                        'circle-stroke-width': 3, 'circle-stroke-color': '#fff',
                    },
                });
                map.addLayer({
                    id: 'cluster-count', type: 'symbol', source: 'spots', filter: ['has', 'point_count'],
                    layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Noto Sans Bold'], 'text-size': 12, 'text-allow-overlap': true },
                    paint: { 'text-color': '#fff' },
                });
                map.addLayer({
                    id: 'pins', type: 'circle', source: 'spots', filter: ['!', ['has', 'point_count']],
                    paint: {
                        'circle-color': ['get', 'color'],
                        'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 11, ['boolean', ['feature-state', 'hover'], false], 10, 7],
                        'circle-stroke-width': ['case', ['boolean', ['feature-state', 'selected'], false], 4, 2.5],
                        'circle-stroke-color': '#fff',
                        'circle-radius-transition': { duration: 150 },
                    },
                });
                setReady(true);
                updateInView();
            });

            map.on('moveend', updateInView);
            map.on('click', 'clusters', async (e) => {
                const f = e.features?.[0] as MapGeoJSONFeature | undefined;
                if (!f) return;
                const zoom = await (map.getSource('spots') as GeoJSONSource).getClusterExpansionZoom(f.properties.cluster_id as number);
                map.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom: zoom + 0.3 });
            });
            map.on('click', 'pins', (e) => {
                const key = e.features?.[0]?.properties.key as string | undefined;
                if (!key) return;
                select(key, false);
                scrollCardIntoList(key);
            });
            map.on('mousemove', 'pins', (e) => {
                const key = (e.features?.[0]?.properties.key as string) ?? null;
                map.getCanvas().style.cursor = 'pointer';
                if (key === hoverRef.current) return;
                if (hoverRef.current) map.setFeatureState({ source: 'spots', id: hoverRef.current }, { hover: false });
                hoverRef.current = key;
                if (key) map.setFeatureState({ source: 'spots', id: key }, { hover: true });
                setHover(key);
            });
            map.on('mouseleave', 'pins', () => {
                map.getCanvas().style.cursor = '';
                if (hoverRef.current) map.setFeatureState({ source: 'spots', id: hoverRef.current }, { hover: false });
                hoverRef.current = null;
                setHover(null);
            });
            map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
        })();
        return () => { cancelled = true; };
    }, [near, select, updateInView]);

    useEffect(() => () => { mapRef.current?.remove(); mapRef.current = null; }, []);

    // Filter chips change what is on the map too.
    useEffect(() => {
        const src = mapRef.current?.getSource('spots') as GeoJSONSource | undefined;
        if (ready && src) src.setData(toGeoJSON(spots));
    }, [spots, ready]);

    useEffect(() => { setPinState(selected, 'selected', true); }, [selected, setPinState]);

    const flyTo = (list: ExploreSpot[]) => {
        const map = mapRef.current;
        if (!map) return;
        popupRef.current?.remove();
        if (!list.length) { map.flyTo({ ...WORLD, speed: 1.4 }); return; }
        if (list.length === 1) { map.flyTo({ center: [list[0].at[1], list[0].at[0]], zoom: 6, speed: 1.4 }); return; }
        map.fitBounds(boundsOf(list), { padding: 70, maxZoom: 7, duration: 1400 });
    };

    const pick = (p: Pick) => {
        setContinent(p.continent);
        setCountry(p.country);
        listRef.current?.scrollTo({ top: 0 });
        flyTo(byKind.filter((s) => (p.country ? s.country === p.country : p.continent === 'all' || continentOf(s.country) === p.continent)));
    };

    /** A place picked from the search: show its country and fly straight to it. */
    const pickPlace = (key: string) => {
        const s = byKey.get(key);
        if (!s) return;
        if (kinds.size && !kinds.has(s.kind)) setKinds(new Set());
        setContinent(continentOf(s.country));
        setCountry(s.country);
        select(key, true);
        requestAnimationFrame(() => scrollCardIntoList(key));
    };

    const showAll = () => { setContinent('all'); setCountry(null); flyTo([]); };

    // The country panel up top can send people here, filtered to that country.
    const pickRef = useRef(pick);
    pickRef.current = pick;
    useEffect(() => {
        const on = (e: Event) => {
            const c = (e as CustomEvent<{ country: string }>).detail?.country;
            if (!c) return;
            setKinds(new Set());
            pickRef.current({ continent: continentOf(c), country: c });
            wrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        window.addEventListener('tv-explore', on);
        return () => window.removeEventListener('tv-explore', on);
    }, []);

    // If a filter was set before the map finished loading, frame it once the map is ready.
    useEffect(() => {
        if (ready && (continent !== 'all' || country)) flyTo(spots);
    }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

    const hoverCard = (key: string | null) => {
        if (hoverRef.current && hoverRef.current !== key) setPinState(hoverRef.current, 'hover', false);
        hoverRef.current = key;
        if (key) setPinState(key, 'hover', true);
        setHover(key);
    };

    return (
        <section className="tv-explore" aria-labelledby="tv-x-h" ref={wrapRef}>
            <header className="tv-xhead">
                <p className="tv-eyebrow">Explore · the someday list</p>
                <h2 id="tv-x-h"><em>{EXPLORE.length}</em> places I still want to go.</h2>
                <p className="tv-lede">Straight from my saved lists on Google Maps: trails, beaches, whole countries and a few things I want to jump off. {countries} countries so far. Move the map and the list follows.</p>
            </header>

            <div className="tv-xsplit">
                <div className="tv-xmapbox">
                    <div ref={mapEl} className="tv-xmap" role="region" aria-label="Map of places still to explore" />
                    {!ready && <p className="tv-xmap__wait">Unfolding the map…</p>}
                </div>

                <div className="tv-xpanel">
                    <div className="tv-xbar">
                        <div className="tv-xfilters">
                            <PlacePicker spots={byKind} value={{ continent, country }} onPick={pick} onPlace={pickPlace} keyOf={keyOf} />
                            <KindPicker value={kinds} counts={kindCounts} onChange={setKinds} />
                        </div>
                        <p className="tv-xlist__count" aria-live="polite">
                            <b>{shown.length}</b> {inView ? 'in this view' : shown.length === 1 ? 'place' : 'places'}
                            {country && <> in {flagOf(country)} {country}</>}
                            {(inView || continent !== 'all') && <button type="button" onClick={showAll}>Whole world</button>}
                        </p>
                    </div>

                    <div className="tv-xlist" ref={listRef}>
                        {groups.length === 0 && <p className="tv-xlist__empty">Nothing saved around here yet. Zoom out or try another filter.</p>}
                        {groups.map(([c, list]) => (
                            <section key={c} className="tv-xgroup" aria-label={c}>
                                <h3><button type="button" onClick={() => pick({ continent: continentOf(c), country: c })}><span aria-hidden="true">{flagOf(c)}</span> {c}</button> <span>{list.length}</span></h3>
                                <ul>
                                    {list.map((s) => {
                                        const k = keyOf(s);
                                        return (
                                            <li key={k} data-key={k} data-hot={String(k === hover || k === selected)} style={{ ['--c' as string]: KINDS[s.kind].color }}>
                                                <button
                                                    type="button"
                                                    onClick={() => select(k, true)}
                                                    onMouseEnter={() => hoverCard(k)}
                                                    onMouseLeave={() => hoverCard(null)}
                                                    onFocus={() => hoverCard(k)}
                                                    onBlur={() => hoverCard(null)}
                                                >
                                                    <span className="tv-xcard__emoji" title={KINDS[s.kind].label}><KindIcon kind={s.kind} size={18} /></span>
                                                    <span className="tv-xcard__text"><b>{s.name}</b><small>{s.where}</small></span>
                                                </button>
                                                <a href={mapsLink(s)} target="_blank" rel="noopener noreferrer" className="tv-xcard__go" aria-label={`Open ${s.name} in Google Maps`}>↗</a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
