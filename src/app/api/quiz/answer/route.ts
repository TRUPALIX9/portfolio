import { NextResponse } from 'next/server';
import { getDb } from '@/utils/mongodb';
import { AGE_RANGES, REGIONS, ROLES, findOption, type QuizProfile } from '@/data/dilemmas';
import { ANSWERS, hashIp, questionStats } from '../shared';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BODY = 2048;
const PER_HOUR = 30;

function cleanProfile(raw: unknown): QuizProfile {
    const p = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const pick = <T extends readonly string[]>(value: unknown, allowed: T) =>
        typeof value === 'string' && (allowed as readonly string[]).includes(value) ? value : undefined;
    const profile: QuizProfile = {};
    const age = pick(p.age, AGE_RANGES);
    const region = pick(p.region, REGIONS);
    const role = pick(p.role, ROLES);
    if (age) profile.age = age;
    if (region) profile.region = region;
    if (role) profile.role = role;
    return profile;
}

/** Records one anonymous answer (one per session and question; answering again replaces it). */
export async function POST(request: Request) {
    const raw = await request.text();
    if (raw.length > MAX_BODY) return NextResponse.json({ error: 'Too large.' }, { status: 413 });

    let body: Record<string, unknown>;
    try {
        body = JSON.parse(raw);
    } catch {
        return NextResponse.json({ error: 'Bad JSON.' }, { status: 400 });
    }

    const { sessionId, questionId, optionId } = body;
    if (typeof sessionId !== 'string' || !UUID.test(sessionId)) return NextResponse.json({ error: 'Bad session.' }, { status: 400 });
    if (typeof questionId !== 'string' || typeof optionId !== 'string' || !findOption(questionId, optionId)) {
        return NextResponse.json({ error: 'Unknown question or option.' }, { status: 400 });
    }
    const profile = cleanProfile(body.profile);

    try {
        const db = await getDb();
        const ipHash = hashIp(request);
        const since = new Date(Date.now() - 60 * 60 * 1000);
        const recent = await db.collection(ANSWERS).countDocuments({ ipHash, updatedAt: { $gte: since } });
        if (recent >= PER_HOUR) return NextResponse.json({ error: 'Too many answers for now. Try again later.' }, { status: 429 });

        const now = new Date();
        await db.collection(ANSWERS).updateOne(
            { sessionId, questionId },
            { $set: { optionId, profile, ipHash, updatedAt: now }, $setOnInsert: { createdAt: now } },
            { upsert: true },
        );
        return NextResponse.json(await questionStats(db, questionId, profile.age));
    } catch (error) {
        console.error('Quiz answer failed:', error);
        return NextResponse.json({ error: 'Could not save your answer.' }, { status: 500 });
    }
}
