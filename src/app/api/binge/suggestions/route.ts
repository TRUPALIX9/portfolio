import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { isAuthorizedRequest } from '@/utils/admin';
import { SUGGESTIONS, bingeDb, str, toSuggestion } from '@/utils/binge';

export const dynamic = 'force-dynamic';

const PER_HOUR = 5;

function ipHash(request: Request) {
    const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
    return crypto.createHash('sha256').update(`${ip}|${process.env.KEY ?? ''}`).digest('hex').slice(0, 24);
}

/** Public: suggest a film or series, with an optional note. */
export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    // Honeypot: real visitors never see or fill this field.
    if (typeof body.website === 'string' && body.website.trim()) return NextResponse.json({ ok: true });

    const title = str(body.title, 150);
    const note = str(body.note, 600);
    const name = str(body.name, 60);
    if (title.length < 2) return NextResponse.json({ error: 'Tell me the title first.' }, { status: 400 });

    const db = await bingeDb();
    const hash = ipHash(request);
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recent = await db.collection(SUGGESTIONS).countDocuments({ ipHash: hash, createdAt: { $gte: since } });
    if (recent >= PER_HOUR) return NextResponse.json({ error: 'That is plenty for one hour. Thank you!' }, { status: 429 });

    await db.collection(SUGGESTIONS).insertOne({ title, note, name, status: 'new', createdAt: new Date().toISOString(), ipHash: hash });
    return NextResponse.json({ ok: true });
}

/** Admin: list suggestions. */
export async function GET(request: Request) {
    if (!(await isAuthorizedRequest(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = await bingeDb();
    const docs = await db.collection(SUGGESTIONS).find({}).sort({ createdAt: -1 }).limit(300).toArray();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json(docs.map((d) => toSuggestion(d as any)));
}

/** Admin: mark a suggestion added or dismissed. */
export async function PATCH(request: Request) {
    if (!(await isAuthorizedRequest(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    if (typeof body.id !== 'string' || !ObjectId.isValid(body.id)) return NextResponse.json({ error: 'Bad id.' }, { status: 400 });
    if (!['new', 'added', 'dismissed'].includes(body.status)) return NextResponse.json({ error: 'Bad status.' }, { status: 400 });
    const db = await bingeDb();
    await db.collection(SUGGESTIONS).updateOne({ _id: new ObjectId(body.id) }, { $set: { status: body.status } });
    return NextResponse.json({ ok: true });
}
