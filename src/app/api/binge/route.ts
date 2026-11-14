import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { isAuthorizedRequest } from '@/utils/admin';
import { TITLES, bingeDb, cleanSeasons, seriesStatus, str, toTitle, type BingeStatus, type BingeTitle } from '@/utils/binge';

export const dynamic = 'force-dynamic';

const STATUSES: BingeStatus[] = ['watchlist', 'watching', 'seen', 'left'];

/** Public: the whole list, newest change first. */
export async function GET() {
    try {
        const db = await bingeDb();
        const docs = await db.collection(TITLES).find({}).sort({ updatedAt: -1 }).limit(2000).toArray();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return NextResponse.json(docs.map((d) => toTitle(d as any)));
    } catch (error) {
        console.error('Binge GET failed:', error);
        return NextResponse.json({ error: 'Could not load the list.' }, { status: 500 });
    }
}

/** Admin: add a title (from a search hit or typed by hand). */
export async function POST(request: Request) {
    if (!(await isAuthorizedRequest(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json().catch(() => ({}));

    const kind = body.kind === 'film' ? 'film' : 'series';
    const title = str(body.title, 200);
    if (!title) return NextResponse.json({ error: 'A title is required.' }, { status: 400 });

    const source = body.source === 'tvmaze' || body.source === 'wikidata' ? body.source : 'manual';
    const sourceId = str(body.sourceId, 40) || null;
    const seasons = kind === 'series' ? cleanSeasons(body.seasons) : [];
    const status: BingeStatus = STATUSES.includes(body.status) ? body.status : kind === 'series' ? seriesStatus(seasons) : 'watchlist';
    const now = new Date().toISOString();

    const db = await bingeDb();
    if (sourceId) {
        const existing = await db.collection(TITLES).findOne({ source, sourceId });
        if (existing) return NextResponse.json({ error: `${title} is already on the list.` }, { status: 409 });
    }

    const doc: Omit<BingeTitle, 'id'> = {
        kind,
        source,
        sourceId,
        title,
        year: Number.isInteger(body.year) ? body.year : null,
        image: typeof body.image === 'string' && body.image.startsWith('https://') ? body.image.slice(0, 500) : null,
        genres: Array.isArray(body.genres) ? body.genres.filter((g: unknown) => typeof g === 'string').slice(0, 8) : [],
        shelf: str(body.shelf, 60),
        status,
        recommended: body.recommended === true,
        seasons,
        note: str(body.note, 600),
        addedAt: now,
        updatedAt: now,
    };
    const result = await db.collection(TITLES).insertOne(doc);
    return NextResponse.json({ id: result.insertedId.toString(), ...doc });
}

/** Admin: update status, recommended flag, seasons/episodes, shelf or note. */
export async function PATCH(request: Request) {
    if (!(await isAuthorizedRequest(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    if (typeof body.id !== 'string' || !ObjectId.isValid(body.id)) return NextResponse.json({ error: 'Bad id.' }, { status: 400 });

    const set: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (typeof body.recommended === 'boolean') set.recommended = body.recommended;
    if (typeof body.note === 'string') set.note = str(body.note, 600);
    if (typeof body.shelf === 'string') set.shelf = str(body.shelf, 60);
    const db = await bingeDb();
    if (Array.isArray(body.seasons)) {
        const seasons = cleanSeasons(body.seasons);
        set.seasons = seasons;
        // Status follows the seasons, except a hand-set "left" stays until changed by hand.
        const current = await db.collection(TITLES).findOne({ _id: new ObjectId(body.id) }, { projection: { status: 1 } });
        if (current?.status !== 'left') set.status = seriesStatus(seasons);
    }
    if (STATUSES.includes(body.status)) set.status = body.status;

    const result = await db.collection(TITLES).findOneAndUpdate({ _id: new ObjectId(body.id) }, { $set: set }, { returnDocument: 'after' });
    if (!result) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json(toTitle(result as any));
}

/** Admin: remove a title. */
export async function DELETE(request: Request) {
    if (!(await isAuthorizedRequest(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = new URL(request.url).searchParams.get('id') ?? '';
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Bad id.' }, { status: 400 });
    const db = await bingeDb();
    await db.collection(TITLES).deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
}
