import type { Named, TravelGeo } from '../geo';
import { COUNTRIES } from '@/data/travel';

/** Playful country colours shared by the light designs. */
export const INK: Record<string, string> = {
    India: '#ff6b35',
    'United States': '#3a86ff',
    Canada: '#ef233c',
    Nepal: '#8338ec',
    Australia: '#ffb703',
};

/** Region-file country code for each country label. */
export const CODE: Record<string, string> = { India: 'IND', 'United States': 'USA', Canada: 'CAN', Australia: 'AUS' };

export const LIT = new Set(COUNTRIES.flatMap((c) => c.regions?.visited ?? []));

export function countryFeature(geo: TravelGeo, name: string) {
    return geo.countries.find((c) => c.properties.name === name);
}

export function regionsOf(geo: TravelGeo, label: string): Named[] {
    const code = CODE[label];
    return code ? geo.regions.filter((r) => r.properties.country === code) : [];
}

/** Which country label a lit feature belongs to. */
export function ownerOf(f: Named): string {
    const code = f.properties.country;
    const hit = Object.entries(CODE).find(([, c]) => c === code);
    return hit ? hit[0] : COUNTRIES.find((c) => c.name === f.properties.name)?.label ?? '';
}

export const pretty = (n: string) => (n === 'District of Columbia' ? 'Washington, D.C.' : n);

/** Deterministic pseudo-random number from a string, for stable jitter. */
export function rand(seed: string, i = 0) {
    let h = 2166136261 ^ i;
    for (let k = 0; k < seed.length; k++) h = Math.imul(h ^ seed.charCodeAt(k), 16777619);
    return ((h >>> 0) % 10000) / 10000;
}

/** Every country except Antarctica, which only eats space on a flat map. */
export function land(geo: TravelGeo) {
    return geo.countries.filter((c) => c.properties.name !== 'Antarctica');
}

/** Fit target for flat world maps: the land, not the whole sphere. */
export function landFit(geo: TravelGeo) {
    return { type: 'FeatureCollection' as const, features: land(geo) };
}

const US_FAR = ['Alaska', 'Hawaii', 'Puerto Rico', 'United States Virgin Islands', 'Guam', 'Commonwealth of the Northern Mariana Islands', 'American Samoa'];

/** A country's shape for stickers and framing. The US uses its lower 48, since Alaska's islands cross the date line. */
export function shapeOf(geo: TravelGeo, label: string) {
    if (label === 'United States') return { type: 'FeatureCollection' as const, features: regionsOf(geo, label).filter((r) => !US_FAR.includes(r.properties.name)) };
    const c = COUNTRIES.find((x) => x.label === label);
    return c ? countryFeature(geo, c.name) : undefined;
}
