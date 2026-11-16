import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { isAuthorizedRequest } from '@/utils/admin';
import { bingeDb } from '@/utils/binge';
import { UPDATES, applyUpdate, type BingeUpdate } from '@/utils/binge-sync';

export const dynamic = 'force-dynamic';

/** Admin: what the sync found, newest first. `?status=new` (default) or `all`. */
export async function GET(request: Request) {
    if (!(await isAuthorizedRequest(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const status = new URL(request.url).searchParams.get('status') === 'all' ? {} : { status: 'new' };
    const db = await bingeDb();
    const docs = await db.collection(UPDATES).find(status).sort({ date: 1, createdAt: -1 }).limit(300).toArray();
    return NextResponse.json(docs.map(({ _id, key: _key, ...d }) => ({ id: String(_id), ...d })));
}

/** Admin: apply or dismiss one finding (or several with `ids`). */
export async function PATCH(request: Request) {
    if (!(await isAuthorizedRequest(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body.ids) ? body.ids : typeof body.id === 'string' ? [body.id] : [];
    if (!ids.length || ids.length > 100 || !ids.every((id) => typeof id === 'string' && ObjectId.isValid(id))) return NextResponse.json({ error: 'Bad id.' }, { status: 400 });
    if (!['apply', 'dismiss', 'reset'].includes(body.action)) return NextResponse.json({ error: 'Bad action.' }, { status: 400 });

    const db = await bingeDb();
    const results: { id: string; ok: boolean; error?: string }[] = [];
    for (const id of ids) {
        const doc = await db.collection(UPDATES).findOne({ _id: new ObjectId(id) });
        if (!doc) { results.push({ id, ok: false, error: 'Not found.' }); continue; }
        try {
            if (body.action === 'apply') await applyUpdate(db, { ...(doc as unknown as BingeUpdate), id });
            const status = body.action === 'apply' ? 'applied' : body.action === 'dismiss' ? 'dismissed' : 'new';
            await db.collection(UPDATES).updateOne({ _id: doc._id }, { $set: { status, reviewedAt: new Date().toISOString() } });
            results.push({ id, ok: true });
        } catch (err) {
            results.push({ id, ok: false, error: err instanceof Error ? err.message : 'Failed.' });
        }
    }
    return NextResponse.json({ results });
}
