import { NextResponse } from 'next/server';
import { isAuthorizedRequest, safeEqual } from '@/utils/admin';
import { bingeDb } from '@/utils/binge';
import { runSync } from '@/utils/binge-sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Weekly sync (GitHub Actions) or a manual run from the playground.
 * Auth: `Authorization: Bearer <BINGE_SYNC_SECRET>` for the workflow, or the admin session.
 */
export async function POST(request: Request) {
    const secret = process.env.BINGE_SYNC_SECRET ?? '';
    const bearer = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
    const fromWorkflow = secret.length >= 16 && bearer.length > 0 && safeEqual(bearer, secret);
    if (!fromWorkflow && !(await isAuthorizedRequest(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const limit = Number.isInteger(body.limit) ? body.limit : 40;
    try {
        const result = await runSync(await bingeDb(), limit);
        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Sync failed.' }, { status: 500 });
    }
}
