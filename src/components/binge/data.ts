import type { BingeSeason, BingeStatus, BingeTitle } from '@/utils/binge';
import { FILMS, SERIES } from '@/data/watchlog';

/** What the binge UI renders: the API's BingeTitle, or the static list mapped to the same shape. */
export type Item = Pick<BingeTitle, 'id' | 'kind' | 'title' | 'year' | 'image' | 'genres' | 'shelf' | 'status' | 'recommended' | 'seasons' | 'note'>;

/** The hand-written lists in src/data/watchlog.ts, used until the playground list has entries. */
export function fallbackItems(): Item[] {
    const items: Item[] = [];
    for (const group of SERIES) {
        for (const show of group.shows) {
            const total = show.total ?? 0;
            const seen = show.seen ?? 0;
            const seasons: BingeSeason[] = Array.from({ length: total }, (_, i) => ({ number: i + 1, episodes: null, seenEpisodes: [], complete: i < seen }));
            let status: BingeStatus = 'watchlist';
            if (show.seen === null) status = 'watching';
            else if (seen > 0 && seen >= total) status = 'seen';
            else if (seen > 0) status = 'watching';
            items.push({ id: `s:${show.title}`, kind: 'series', title: show.title, year: null, image: null, genres: [], shelf: group.genre, status, recommended: false, seasons, note: '' });
        }
    }
    for (const group of FILMS) {
        for (const film of group.films) {
            items.push({ id: `f:${film.title}`, kind: 'film', title: film.title, year: null, image: null, genres: [], shelf: group.genre, status: 'seen', recommended: !!film.pick, seasons: [], note: film.note ? `Parts ${film.note}` : '' });
        }
    }
    return items;
}

export async function loadItems(): Promise<{ items: Item[]; live: boolean }> {
    try {
        // Don't keep visitors waiting on a slow database: after 6 s, show the saved list.
        const res = await fetch('/api/binge', { cache: 'no-store', signal: AbortSignal.timeout(6000) });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Item[];
        if (Array.isArray(data) && data.length > 0) return { items: data, live: true };
    } catch {
        // fall through to the static list
    }
    return { items: fallbackItems(), live: false };
}

/** "6/6 watched" for a series; null when the season count is unknown. */
export function progress(item: Item): { done: number; total: number; label: string; pct: number } | null {
    if (item.kind !== 'series' || item.seasons.length === 0) return null;
    const done = item.seasons.filter((s) => s.complete).length;
    const total = item.seasons.length;
    return { done, total, label: `${done}/${total} watched`, pct: Math.round((done / total) * 100) };
}

export type StatusFilter = 'all' | 'seen' | 'watching' | 'watchlist' | 'left';

/** Public names for each status. */
export const STATUS_NAMES: Record<Exclude<StatusFilter, 'all'>, string> = {
    seen: 'Watched',
    watching: 'Continue watching',
    watchlist: 'On the list',
    left: 'Left · not planning for now',
};
export type KindFilter = 'all' | 'series' | 'film';
export type SortKey = 'recent' | 'az' | 'year';

/** "6/6 watched" when finished, "3/5 seasons" in progress, "Watched" / "On the list" otherwise. */
export function statusLabel(item: Item) {
    if (item.status === 'watchlist') return 'On the list';
    if (item.status === 'left') {
        const lp = progress(item);
        return lp && lp.done > 0 ? `Left · ${lp.done}/${lp.total} seasons` : 'Left for now';
    }
    if (item.kind === 'film') return item.status === 'watching' ? 'Watching' : 'Watched';
    const p = progress(item);
    if (!p) return item.status === 'seen' ? 'Watched' : 'Watching';
    return item.status === 'seen' ? p.label : `${p.done}/${p.total} seasons`;
}

/** Lower-case, accents stripped, for forgiving search. */
export function normalize(text: string) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function matches(item: Item, q: string) {
    if (!q) return true;
    const hay = normalize([item.title, item.shelf, ...item.genres].join(' '));
    return q.split(/\s+/).every((word) => hay.includes(word));
}

export type ItemFilters = { kind: 'series' | 'film'; statuses: BingeStatus[]; shelves: string[]; recOnly?: boolean; sort: SortKey };

/** Filters one kind of title (TV or Movies mode). Empty arrays mean "all". */
export function filterItems(items: Item[], f: ItemFilters) {
    const list = items.filter((i) =>
        i.kind === f.kind &&
        (f.statuses.length === 0 || f.statuses.includes(i.status)) &&
        (f.shelves.length === 0 || f.shelves.includes(i.shelf)) &&
        (!f.recOnly || i.recommended));
    if (f.sort === 'az') return [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (f.sort === 'year') return [...list].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    return list; // the API already returns most recently updated first
}

/** Search across a list, ignoring case and accents. */
export function searchItems(items: Item[], query: string) {
    const q = normalize(query);
    return q ? items.filter((i) => matches(i, q)) : [];
}

/** A stable hue per title for the generated typographic posters. */
export function hueFor(title: string) {
    let h = 0;
    for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
    return h % 360;
}
