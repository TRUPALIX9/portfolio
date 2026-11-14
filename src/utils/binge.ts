import { ObjectId, type Db } from 'mongodb';
import { getDb } from './mongodb';

/**
 * Trupal's binge list: series and films he has seen, is watching, or wants to watch.
 * Managed from /playground (Binge tab), shown publicly on /binge. Visitors can suggest titles.
 *
 * Search uses free, keyless sources: TVMaze for series (with seasons and episodes) and
 * Wikidata for films.
 */

export const TITLES = 'binge_titles';
export const SUGGESTIONS = 'binge_suggestions';

export type BingeKind = 'series' | 'film';
/** 'left' = started or listed, but he has stopped / isn't planning to watch for now. Set by hand only. */
export type BingeStatus = 'watchlist' | 'watching' | 'seen' | 'left';

export type BingeSeason = {
    number: number;
    /** Episodes in the season, when known. */
    episodes: number | null;
    /** Episode numbers watched. A fully watched season lists every episode (or `complete: true` when the count is unknown). */
    seenEpisodes: number[];
    complete: boolean;
};

export type BingeTitle = {
    id: string;
    kind: BingeKind;
    source: 'tvmaze' | 'wikidata' | 'manual';
    sourceId: string | null;
    title: string;
    year: number | null;
    image: string | null;
    genres: string[];
    /** Trupal's own grouping (e.g. "Comedy", "Marvel & comics"). */
    shelf: string;
    status: BingeStatus;
    recommended: boolean;
    seasons: BingeSeason[];
    note: string;
    addedAt: string;
    updatedAt: string;
};

export type BingeSuggestion = {
    id: string;
    title: string;
    note: string;
    name: string;
    status: 'new' | 'added' | 'dismissed';
    createdAt: string;
};

export type SearchHit = {
    source: 'tvmaze' | 'wikidata';
    sourceId: string;
    kind: BingeKind;
    title: string;
    year: number | null;
    image: string | null;
    genres: string[];
    blurb: string;
};

type TitleDoc = Omit<BingeTitle, 'id'> & { _id: ObjectId };
type SuggestionDoc = Omit<BingeSuggestion, 'id'> & { _id: ObjectId; ipHash: string };

export async function bingeDb(): Promise<Db> {
    const db = await getDb();
    return db;
}

export function toTitle(doc: TitleDoc): BingeTitle {
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
}

export function toSuggestion(doc: SuggestionDoc): BingeSuggestion {
    return { id: doc._id.toString(), title: doc.title, note: doc.note, name: doc.name, status: doc.status, createdAt: doc.createdAt };
}

export function str(value: unknown, max: number) {
    return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** Derived status for a series from its seasons. */
export function seriesStatus(seasons: BingeSeason[]): BingeStatus {
    if (seasons.length === 0) return 'watchlist';
    const done = seasons.filter((s) => s.complete).length;
    const started = seasons.some((s) => s.complete || s.seenEpisodes.length > 0);
    if (done === seasons.length) return 'seen';
    return started ? 'watching' : 'watchlist';
}

/** Cleans a seasons array coming from the client. */
export function cleanSeasons(value: unknown): BingeSeason[] {
    if (!Array.isArray(value)) return [];
    return value.slice(0, 60).map((raw, i) => {
        const s = (raw ?? {}) as Record<string, unknown>;
        const number = Number.isInteger(s.number) ? (s.number as number) : i + 1;
        const episodes = Number.isInteger(s.episodes) && (s.episodes as number) > 0 ? Math.min(s.episodes as number, 500) : null;
        const seenEpisodes = Array.isArray(s.seenEpisodes)
            ? [...new Set((s.seenEpisodes as unknown[]).filter((n): n is number => Number.isInteger(n) && (n as number) > 0 && (n as number) <= 500))].sort((a, b) => a - b)
            : [];
        const complete = s.complete === true || (episodes !== null && seenEpisodes.length >= episodes);
        return { number, episodes, seenEpisodes: complete && episodes ? Array.from({ length: episodes }, (_, k) => k + 1) : seenEpisodes, complete };
    });
}

// ── External search ──────────────────────────────────────────────────────────

const UA = { 'User-Agent': 'trupalpatel.com binge list (portfolio)' };

function stripTags(html: string | null | undefined) {
    return (html ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

export async function searchSeries(q: string): Promise<SearchHit[]> {
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`, { headers: UA, next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`TVMaze search failed (${res.status})`);
    const data = (await res.json()) as { show: { id: number; name: string; premiered: string | null; image: { medium?: string } | null; genres: string[]; summary: string | null } }[];
    return data.slice(0, 10).map(({ show }) => ({
        source: 'tvmaze',
        sourceId: String(show.id),
        kind: 'series',
        title: show.name,
        year: show.premiered ? Number(show.premiered.slice(0, 4)) : null,
        image: show.image?.medium?.replace('http://', 'https://') ?? null,
        genres: show.genres ?? [],
        blurb: stripTags(show.summary).slice(0, 220),
    }));
}

export async function searchFilms(q: string): Promise<SearchHit[]> {
    const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=en&uselang=en&type=item&limit=20&format=json&origin=*`;
    const res = await fetch(url, { headers: UA, next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Wikidata search failed (${res.status})`);
    const data = (await res.json()) as { search: { id: string; label?: string; description?: string }[] };
    return (data.search ?? [])
        .filter((r) => /\bfilm\b|\bmovie\b/i.test(r.description ?? '') && !/television|tv series|episode/i.test(r.description ?? ''))
        .slice(0, 10)
        .map((r) => {
            const year = r.description?.match(/\b(19|20)\d{2}\b/)?.[0];
            return {
                source: 'wikidata',
                sourceId: r.id,
                kind: 'film',
                title: r.label ?? q,
                year: year ? Number(year) : null,
                image: null,
                genres: [],
                blurb: r.description ?? '',
            };
        });
}

/** Seasons and episode counts for a TVMaze show. */
export async function tvmazeSeasons(showId: string): Promise<BingeSeason[]> {
    if (!/^\d{1,9}$/.test(showId)) throw new Error('Bad show id');
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/seasons`, { headers: UA, next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`TVMaze seasons failed (${res.status})`);
    const data = (await res.json()) as { number: number; episodeOrder: number | null; premiereDate: string | null }[];
    return data
        .filter((s) => s.number > 0)
        .map((s) => ({ number: s.number, episodes: s.episodeOrder ?? null, seenEpisodes: [], complete: false }));
}

/** Episode titles for one season (shown when ticking individual episodes). */
export async function tvmazeEpisodes(showId: string, season: number) {
    if (!/^\d{1,9}$/.test(showId)) throw new Error('Bad show id');
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`, { headers: UA, next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`TVMaze episodes failed (${res.status})`);
    const data = (await res.json()) as { season: number; number: number | null; name: string; airdate: string }[];
    return data.filter((e) => e.season === season && e.number !== null).map((e) => ({ number: e.number as number, name: e.name, airdate: e.airdate }));
}

// ── Artwork (posters and backdrops) ─────────────────────────────────────────

export type Artwork = {
    poster: string | null;
    /** A larger poster for the details view, when the source has one. */
    posterLarge: string | null;
    /** A wide background image (TVMaze "background" art), when there is one. */
    backdrop: string | null;
    sourceId: string | null;
    year: number | null;
    genres: string[];
};

const ART_TTL = 60 * 60 * 24 * 7; // a week: artwork rarely changes

/** Image URLs without tracking query strings, upgraded to https. */
function cleanImageUrl(url: string | null | undefined) {
    if (!url) return null;
    try {
        const u = new URL(url.replace(/^http:\/\//, 'https://'));
        if (u.hostname !== 'static.tvmaze.com' && u.hostname !== 'upload.wikimedia.org') return null;
        u.search = '';
        return u.toString();
    } catch {
        return null;
    }
}

/** Drops "(Season 2)" style suffixes so the show itself is found. */
export function baseTitle(title: string) {
    return title.replace(/\s*\((season|series)\s*\d+\)\s*$/i, '').trim();
}

async function seriesArtwork(title: string): Promise<Artwork | null> {
    const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(baseTitle(title))}`, { headers: UA, next: { revalidate: ART_TTL } });
    if (!res.ok) return null;
    const show = (await res.json()) as { id: number; premiered: string | null; genres: string[]; image: { medium?: string; original?: string } | null };
    let backdrop: string | null = null;
    try {
        const imgs = await fetch(`https://api.tvmaze.com/shows/${show.id}/images`, { headers: UA, next: { revalidate: ART_TTL } });
        if (imgs.ok) {
            const list = (await imgs.json()) as { type: string; main: boolean; resolutions: { original?: { url: string; width: number } } }[];
            const bg = list.filter((i) => i.type === 'background' && i.resolutions.original).sort((a, b) => Number(b.main) - Number(a.main))[0];
            backdrop = cleanImageUrl(bg?.resolutions.original?.url);
        }
    } catch {
        // backdrop is optional
    }
    return {
        poster: cleanImageUrl(show.image?.medium),
        posterLarge: cleanImageUrl(show.image?.original ?? show.image?.medium),
        backdrop,
        sourceId: String(show.id),
        year: show.premiered ? Number(show.premiered.slice(0, 4)) : null,
        genres: show.genres ?? [],
    };
}

async function filmArtwork(title: string, year: number | null): Promise<Artwork | null> {
    const t = title.replace(/\s+/g, '_');
    const candidates = [...(year ? [`${t}_(${year}_film)`] : []), `${t}_(film)`, t];
    for (const page of candidates) {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page)}`, { headers: UA, next: { revalidate: ART_TTL } });
        if (!res.ok) continue;
        const d = (await res.json()) as { type?: string; description?: string; thumbnail?: { source: string }; originalimage?: { source: string } };
        if (d.type !== 'standard' || !/film|movie|special/i.test(d.description ?? '')) continue;
        const poster = cleanImageUrl(d.thumbnail?.source ?? d.originalimage?.source);
        if (!poster) continue;
        const y = d.description?.match(/\b(19|20)\d{2}\b/)?.[0];
        return { poster, posterLarge: cleanImageUrl(d.originalimage?.source) ?? poster, backdrop: null, sourceId: null, year: y ? Number(y) : year, genres: [] };
    }
    return null;
}

/** Poster and backdrop for a title: TVMaze for series, Wikipedia for films. */
export async function resolveArtwork(kind: BingeKind, title: string, year: number | null): Promise<Artwork> {
    const empty: Artwork = { poster: null, posterLarge: null, backdrop: null, sourceId: null, year, genres: [] };
    try {
        return (kind === 'series' ? await seriesArtwork(title) : await filmArtwork(title, year)) ?? empty;
    } catch {
        return empty;
    }
}

/** Approximate per-instance rate limiter for public read endpoints. */
const buckets = new Map<string, { count: number; reset: number }>();
export function allowRequest(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || b.reset < now) {
        buckets.set(key, { count: 1, reset: now + windowMs });
        if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
        return true;
    }
    b.count += 1;
    return b.count <= limit;
}
