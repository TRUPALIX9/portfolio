import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { isAuthorizedRequest } from '@/utils/admin';
import { bingeDb, str } from '@/utils/binge';

export const dynamic = 'force-dynamic';

/** Travel suggestions share the Binge database, in their own collection. */
const COLLECTION = 'travel_suggestions';
const PER_HOUR = 5;
const KINDS = ['country', 'state', 'city'];

function ipHash(request: Request) {
    const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
    return crypto.createHash('sha256').update(`${ip}|${process.env.KEY ?? ''}`).digest('hex').slice(0, 24);
}

/** Public: suggest a place to visit (country, then optionally state and city), with an optional "what to try there" note. */
export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    // Honeypot: real visitors never see or fill this field.
    if (typeof body.website === 'string' && body.website.trim()) return NextResponse.json({ ok: true });

    const place = str(body.place, 120);
    const kind = KINDS.includes(body.kind) ? body.kind : 'city';
    const country = str(body.country, 80);
    const state = str(body.state, 120);
    const city = str(body.city, 120);
    const note = str(body.note, 600);
    const name = str(body.name, 60);
    if (place.length < 2) return NextResponse.json({ error: 'Tell me the place first.' }, { status: 400 });

    const db = await bingeDb();
    const hash = ipHash(request);
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recent = await db.collection(COLLECTION).countDocuments({ ipHash: hash, createdAt: { $gte: since } });
    if (recent >= PER_HOUR) return NextResponse.json({ error: 'That is plenty for one hour. Thank you!' }, { status: 429 });

    await db.collection(COLLECTION).insertOne({ place, kind, country, state, city, note, name, status: 'new', createdAt: new Date().toISOString(), ipHash: hash });
    return NextResponse.json({ ok: true });
}

/** Admin: list travel suggestions. */
export async function GET(request: Request) {
    if (!(await isAuthorizedRequest(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = await bingeDb();
    const docs = await db.collection(COLLECTION).find({}, { projection: { ipHash: 0 } }).sort({ createdAt: -1 }).limit(300).toArray();
    return NextResponse.json(docs.map(({ _id, ...d }) => ({ id: String(_id), ...d })));
}

/** Admin: approve, dismiss or reset a travel suggestion. Approved ones show on /travel. */
export async function PATCH(request: Request) {
    if (!(await isAuthorizedRequest(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    if (typeof body.id !== 'string' || !ObjectId.isValid(body.id)) return NextResponse.json({ error: 'Bad id.' }, { status: 400 });
    if (!['new', 'approved', 'dismissed'].includes(body.status)) return NextResponse.json({ error: 'Bad status.' }, { status: 400 });
    const db = await bingeDb();
    await db.collection(COLLECTION).updateOne({ _id: new ObjectId(body.id) }, { $set: { status: body.status, reviewedAt: new Date().toISOString() } });
    return NextResponse.json({ ok: true });
}
