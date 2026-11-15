"use client";

import { useEffect, useState } from 'react';
import { feature } from 'topojson-client';
import { geoArea } from 'd3-geo';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import { COUNTRIES } from '@/data/travel';

export type Named = Feature<Geometry, { name: string; country?: string }>;
export type TravelGeo = { countries: Named[]; regions: Named[]; lit: Named[] };

const LIT_REGIONS = new Set(COUNTRIES.flatMap((c) => c.regions?.visited ?? []));
const WHOLE_COUNTRIES = new Set(COUNTRIES.filter((c) => !c.regions).map((c) => c.name));

let cache: Promise<TravelGeo> | null = null;

/** Simplifying can turn a tiny shape inside-out, so it covers the whole globe. Flip those rings back. */
function rewind(f: Named): Named {
    if (geoArea(f) <= 2 * Math.PI) return f;
    const g = f.geometry;
    const rev = (poly: number[][][]) => poly.map((ring) => [...ring].reverse());
    if (g.type === 'Polygon') return { ...f, geometry: { ...g, coordinates: rev(g.coordinates) } };
    if (g.type === 'MultiPolygon') return { ...f, geometry: { ...g, coordinates: g.coordinates.map(rev) } };
    return f;
}

/** Loads world countries plus US, India, Canada and Australia regions once, and works out what is lit. */
export function loadTravelGeo(): Promise<TravelGeo> {
    if (!cache) {
        cache = Promise.all(['/geo/countries.json', '/geo/states-10m.json', '/geo/regions.json'].map((u) => fetch(u).then((r) => r.json())))
            .then(([world, us, regions]: Topology[]) => {
                const pick = (t: Topology, key: string) => (feature(t, t.objects[key] as GeometryCollection<{ name: string }>).features as Named[]).map(rewind);
                const countries = pick(world, 'countries');
                const usStates = pick(us, 'states').map((f) => ({ ...f, properties: { ...f.properties, country: 'USA' } }));
                const all = [...usStates, ...pick(regions, 'regions')];
                const lit = [...all.filter((r) => LIT_REGIONS.has(r.properties.name)), ...countries.filter((c) => WHOLE_COUNTRIES.has(c.properties.name))];
                return { countries, regions: all, lit };
            });
    }
    return cache;
}

export function useTravelGeo() {
    const [geo, setGeo] = useState<TravelGeo | null>(null);
    useEffect(() => {
        let alive = true;
        loadTravelGeo().then((g) => alive && setGeo(g)).catch(() => {});
        return () => { alive = false; };
    }, []);
    return geo;
}

export const TOTAL_REGIONS = COUNTRIES.reduce((n, c) => n + (c.regions?.visited.length ?? 0), 0);
