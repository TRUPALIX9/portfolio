import { ObjectId, type Db } from 'mongodb';
import { TITLES, baseTitle, type BingeSeason } from './binge';

/** Proposed changes found by the weekly sync, waiting for Trupal to apply or dismiss. */
export const UPDATES = 'binge_updates';

export type UpdateKind = 'new_season' | 'coming_soon' | 'fix' | 'link';
export type BingeUpdate = {
    id: string;
    titleId: string;
    title: string;
    image: string | null;
    kind: UpdateKind;
    /** One human line, e.g. "Season 4 · 8 episodes · premieres 2026-12-01". */
    detail: string;
    /** What applying it changes. */
    patch: { seasons?: { number: number; episodes: number | null }[]; image?: string; year?: number; genres?: string[]; sourceId?: string; source?: 'tvmaze'; episodes?: { number: number; episodes: number }[] };
    /** Air date for coming-soon items (YYYY-MM-DD). */
    date: string | null;
    status: 'new' | 'applied' | 'dismissed';
    createdAt: string;
};

const UA = { 'User-Agent': 'trupalpatel.com binge sync (portfolio)' };
const PAUSE_MS = 600; // TVMaze allows ~20 calls per 10 seconds

type Show = {
    id: number;
    name: string;
    premiered: string | null;
    genres: string[];
    image: { medium?: string; original?: string } | null;
    _embedded?: {
        seasons?: { number: number; episodeOrder: number | null; premiereDate: string | null }[];
        nextepisode?: { season: number; number: number | null; name: string; airdate: string } | null;
    };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const https = (u?: string | null) => (u ? u.replace(/^http:\/\//, 'https://') : null);
const today = () => new Date().toISOString().slice(0, 10);

async function getShow(id: string): Promise<Show | null> {
    const res = await fetch(`https://api.tvmaze.com/shows/${id}?embed[]=seasons&embed[]=nextepisode`, { headers: UA, cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`TVMaze ${res.status} for show ${id}`);
    return res.json();
}

async function findShow(title: string): Promise<Show | null> {
    const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(baseTitle(title))}&embed[]=seasons`, { headers: UA, cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`TVMaze search ${res.status}`);
    return res.json();
}

type TitleRow = { _id: ObjectId; title: string; kind: string; source: string; sourceId: string | null; image: string | null; year: number | null; genres: string[]; seasons: BingeSeason[]; status: string };

/** Compare one series with TVMaze and return the changes worth proposing. */
function diff(t: TitleRow, show: Show, linking: boolean): Omit<BingeUpdate, 'id' | 'status' | 'createdAt'>[] {
    const out: Omit<BingeUpdate, 'id' | 'status' | 'createdAt'>[] = [];
    const base = { titleId: t._id.toString(), title: t.title, image: t.image ?? https(show.image?.medium) };
    const remote = (show._embedded?.seasons ?? []).filter((s) => s.number > 0);
    const have = new Map((t.seasons ?? []).map((s) => [s.number, s]));
    const maxHave = Math.max(0, ...have.keys());

    if (linking) {
        out.push({ ...base, kind: 'link', date: null, detail: `Match “${t.title}” to TVMaze: ${show.name}${show.premiered ? ` (${show.premiered.slice(0, 4)})` : ''}, ${remote.length} season${remote.length === 1 ? '' : 's'}`, patch: { source: 'tvmaze', sourceId: String(show.id), seasons: remote.map((s) => ({ number: s.number, episodes: s.episodeOrder })) } });
        return out;
    }

    // New seasons beyond what's stored
    for (const s of remote.filter((r) => r.number > maxHave)) {
        const upcoming = !!s.premiereDate && s.premiereDate > today();
        out.push({
            ...base,
            kind: upcoming ? 'coming_soon' : 'new_season',
            date: s.premiereDate,
            detail: `Season ${s.number}${s.episodeOrder ? ` · ${s.episodeOrder} episodes` : ''}${s.premiereDate ? ` · ${upcoming ? 'premieres' : 'premiered'} ${s.premiereDate}` : ' · date not announced'}`,
            patch: { seasons: [{ number: s.number, episodes: s.episodeOrder }] },
        });
    }

    // Next episode of a season already on the list
    const next = show._embedded?.nextepisode;
    if (next && next.season <= maxHave && next.airdate >= today()) {
        out.push({ ...base, kind: 'coming_soon', date: next.airdate, detail: `S${next.season}E${next.number ?? '?'} “${next.name}” airs ${next.airdate}`, patch: {} });
    }

    // Data fixes: missing poster, year, genres or episode counts
    const fix: BingeUpdate['patch'] = {};
    const notes: string[] = [];
    if (!t.image && show.image?.medium) { fix.image = https(show.image.medium)!; notes.push('poster'); }
    if (!t.year && show.premiered) { fix.year = Number(show.premiered.slice(0, 4)); notes.push('year'); }
    if ((!t.genres || t.genres.length === 0) && show.genres.length) { fix.genres = show.genres.slice(0, 8); notes.push('genres'); }
    const counts = remote.filter((r) => have.has(r.number) && r.episodeOrder && have.get(r.number)!.episodes !== r.episodeOrder).map((r) => ({ number: r.number, episodes: r.episodeOrder as number }));
    if (counts.length) { fix.episodes = counts; notes.push(`episode counts for season ${counts.map((c) => c.number).join(', ')}`); }
    if (notes.length) out.push({ ...base, kind: 'fix', date: null, detail: `Fill in ${notes.join(', ')}`, patch: fix });

    return out;
}

/** A stable key so the same finding is stored once, and a dismissed one never comes back. */
const keyOf = (u: Omit<BingeUpdate, 'id' | 'status' | 'createdAt'>) => `${u.titleId}:${u.kind}:${u.detail}`;

/**
 * Check up to `limit` series on the list, least recently checked first.
 * Returns how many were checked, how many new findings were stored, and how many titles are still due.
 */
export async function runSync(db: Db, limit = 40) {
    const col = db.collection(TITLES);
    const due = { kind: 'series', status: { $ne: 'left' } };
    const rows = (await col.find(due).sort({ syncedAt: 1 }).limit(Math.min(Math.max(limit, 1), 80)).toArray()) as unknown as (TitleRow & { syncedAt?: string })[];
    const started = new Date().toISOString();
    let found = 0;
    const errors: string[] = [];

    for (const t of rows) {
        try {
            const linking = t.source !== 'tvmaze' || !t.sourceId;
            const show = linking ? await findShow(t.title) : await getShow(t.sourceId!);
            if (show) {
                for (const u of diff(t, show, linking)) {
                    const res = await db.collection(UPDATES).updateOne({ key: keyOf(u) }, { $setOnInsert: { ...u, key: keyOf(u), status: 'new', createdAt: started } }, { upsert: true });
                    if (res.upsertedCount) found += 1;
                }
            }
        } catch (err) {
            errors.push(`${t.title}: ${err instanceof Error ? err.message : 'failed'}`);
        }
        await col.updateOne({ _id: t._id }, { $set: { syncedAt: started } });
        await sleep(PAUSE_MS);
    }

    const remaining = await col.countDocuments({ ...due, $or: [{ syncedAt: { $exists: false } }, { syncedAt: { $lt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString() } }] });
    return { checked: rows.length, found, remaining, errors };
}

/** Apply one finding to its title. Coming-soon items have nothing to change; applying just files them. */
export async function applyUpdate(db: Db, u: BingeUpdate) {
    const col = db.collection(TITLES);
    const t = (await col.findOne({ _id: new ObjectId(u.titleId) })) as unknown as TitleRow | null;
    if (!t) throw new Error('That title is no longer on the list.');
    const set: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    let seasons = [...(t.seasons ?? [])];

    if (u.patch.source) { set.source = u.patch.source; set.sourceId = u.patch.sourceId; }
    if (u.patch.seasons) {
        const have = new Set(seasons.map((s) => s.number));
        // On a fresh link, keep what was already ticked and add any seasons that were missing.
        seasons = [...seasons, ...u.patch.seasons.filter((s) => !have.has(s.number)).map((s) => ({ number: s.number, episodes: s.episodes, seenEpisodes: [], complete: false }))].sort((a, b) => a.number - b.number);
    }
    if (u.patch.episodes) {
        seasons = seasons.map((s) => {
            const c = u.patch.episodes!.find((e) => e.number === s.number);
            return c ? { ...s, episodes: c.episodes, complete: s.complete || s.seenEpisodes.length >= c.episodes } : s;
        });
    }
    if (u.patch.seasons || u.patch.episodes) {
        set.seasons = seasons;
        // A new season on a finished show puts it back to "watching".
        if (t.status === 'seen' && seasons.some((s) => !s.complete)) set.status = 'watching';
    }
    if (u.patch.image) set.image = u.patch.image;
    if (u.patch.year) set.year = u.patch.year;
    if (u.patch.genres) set.genres = u.patch.genres;
    await col.updateOne({ _id: t._id }, { $set: set });
}
