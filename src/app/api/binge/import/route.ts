import { NextResponse } from 'next/server';
import { isAuthorizedRequest } from '@/utils/admin';
import { TITLES, bingeDb, seriesStatus, type BingeSeason, type BingeTitle } from '@/utils/binge';
import { FILMS, SERIES } from '@/data/watchlog';

export const dynamic = 'force-dynamic';

/**
 * Admin: one-time import of the hand-written list in src/data/watchlog.ts.
 * Titles already in the database (same kind and title) are skipped, so it is safe to run twice.
 */
export async function POST(request: Request) {
    if (!(await isAuthorizedRequest(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await bingeDb();
    const existing = new Set(
        (await db.collection(TITLES).find({}, { projection: { kind: 1, title: 1 } }).toArray()).map((d) => `${d.kind}|${String(d.title).toLowerCase()}`),
    );
    const now = new Date().toISOString();
    const docs: Omit<BingeTitle, 'id'>[] = [];

    for (const group of SERIES) {
        for (const show of group.shows) {
            if (existing.has(`series|${show.title.toLowerCase()}`)) continue;
            const total = show.total ?? 0;
            const seen = show.seen ?? 0;
            const seasons: BingeSeason[] = Array.from({ length: total }, (_, i) => ({ number: i + 1, episodes: null, seenEpisodes: [], complete: i < seen }));
            docs.push({
                kind: 'series', source: 'manual', sourceId: null, title: show.title, year: null, image: null, genres: [],
                shelf: group.genre, seasons,
                status: show.seen === null ? 'watching' : seriesStatus(seasons),
                recommended: false, note: '', addedAt: now, updatedAt: now,
            });
        }
    }
    for (const group of FILMS) {
        for (const film of group.films) {
            if (existing.has(`film|${film.title.toLowerCase()}`)) continue;
            docs.push({
                kind: 'film', source: 'manual', sourceId: null, title: film.title, year: null, image: null, genres: [],
                shelf: group.genre, seasons: [], status: 'seen', recommended: !!film.pick, note: film.note ?? '', addedAt: now, updatedAt: now,
            });
        }
    }

    if (docs.length) await db.collection(TITLES).insertMany(docs);
    return NextResponse.json({ imported: docs.length, skipped: existing.size });
}
