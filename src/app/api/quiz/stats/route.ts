import { NextResponse } from 'next/server';
import { getDb } from '@/utils/mongodb';
import { isAuthorizedRequest } from '@/utils/admin';
import { AGE_RANGES, DILEMMAS } from '@/data/dilemmas';
import { ANSWERS, isQuestion, questionStats } from '../shared';

export const dynamic = 'force-dynamic';

/**
 * GET ?questionId=wallet&age=25–34 → how everyone (and that age group) answered one question. Public.
 * GET ?all=1 → every question broken down by age, region and role. Admin only.
 */
export async function GET(request: Request) {
    const params = new URL(request.url).searchParams;

    try {
        if (params.get('all') === '1') {
            if (!(await isAuthorizedRequest(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            const db = await getDb();
            const rows = await db.collection(ANSWERS).aggregate<{ _id: { q: string; o: string; age?: string; region?: string; role?: string }; n: number }>([
                { $group: { _id: { q: '$questionId', o: '$optionId', age: '$profile.age', region: '$profile.region', role: '$profile.role' }, n: { $sum: 1 } } },
            ]).toArray();
            const sessions = (await db.collection(ANSWERS).distinct('sessionId')).length;
            const questions = DILEMMAS.map((d) => {
                const mine = rows.filter((r) => r._id.q === d.id);
                const tally = (key: 'age' | 'region' | 'role') => {
                    const out: Record<string, Record<string, number>> = {};
                    for (const r of mine) {
                        const k = r._id[key] ?? 'Not given';
                        out[k] ??= {};
                        out[k][r._id.o] = (out[k][r._id.o] ?? 0) + r.n;
                    }
                    return out;
                };
                const options: Record<string, number> = {};
                for (const r of mine) options[r._id.o] = (options[r._id.o] ?? 0) + r.n;
                return { id: d.id, title: d.title, total: mine.reduce((n, r) => n + r.n, 0), options, byAge: tally('age'), byRegion: tally('region'), byRole: tally('role') };
            });
            return NextResponse.json({ sessions, questions });
        }

        const questionId = params.get('questionId');
        if (!isQuestion(questionId)) return NextResponse.json({ error: 'Unknown question.' }, { status: 400 });
        const age = params.get('age') ?? undefined;
        const db = await getDb();
        const stats = await questionStats(db, questionId, age && (AGE_RANGES as readonly string[]).includes(age) ? age : undefined);
        return NextResponse.json(stats, { headers: { 'Cache-Control': 'public, max-age=5, s-maxage=5' } });
    } catch (error) {
        console.error('Quiz stats failed:', error);
        return NextResponse.json({ error: 'Could not load results.' }, { status: 500 });
    }
}
