import crypto from 'crypto';
import type { Db } from 'mongodb';
import { DILEMMAS } from '@/data/dilemmas';

export const ANSWERS = 'quiz_answers';

export type QuestionStats = {
    total: number;
    options: Record<string, number>;
    ageGroup?: { age: string; total: number; options: Record<string, number> };
};

export function hashIp(request: Request) {
    const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
    return crypto.createHash('sha256').update(`${ip}|${process.env.KEY ?? ''}`).digest('hex').slice(0, 24);
}

async function countBy(db: Db, match: Record<string, unknown>) {
    const rows = await db.collection(ANSWERS).aggregate<{ _id: string; n: number }>([
        { $match: match },
        { $group: { _id: '$optionId', n: { $sum: 1 } } },
    ]).toArray();
    const options: Record<string, number> = {};
    let total = 0;
    for (const r of rows) {
        options[r._id] = r.n;
        total += r.n;
    }
    return { total, options };
}

/** Counts for one question, plus the visitor's age group when given. */
export async function questionStats(db: Db, questionId: string, age?: string): Promise<QuestionStats> {
    const all = await countBy(db, { questionId });
    if (!age) return all;
    const group = await countBy(db, { questionId, 'profile.age': age });
    return { ...all, ageGroup: { age, ...group } };
}

export function isQuestion(id: unknown): id is string {
    return typeof id === 'string' && DILEMMAS.some((d) => d.id === id);
}
