import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { allowRequest, resolveArtwork } from '@/utils/binge';

/**
 * Public: poster and backdrop for one title.
 *   GET /api/binge/poster?kind=series&title=Dark
 *   GET /api/binge/poster?kind=film&title=Gone%20Girl&year=2014
 * Series come from TVMaze, films from Wikipedia. Responses are cached for a week.
 */
export async function GET(request: Request) {
    const params = new URL(request.url).searchParams;
    const kind = params.get('kind') === 'film' ? 'film' : params.get('kind') === 'series' ? 'series' : null;
    const title = (params.get('title') ?? '').trim().slice(0, 120);
    const yearRaw = params.get('year');
    const year = yearRaw && /^(19|20)\d{2}$/.test(yearRaw) ? Number(yearRaw) : null;
    if (!kind || title.length < 1) return NextResponse.json({ error: 'kind and title are required.' }, { status: 400 });

    const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'local';
    const key = crypto.createHash('sha256').update(`poster|${ip}`).digest('hex').slice(0, 20);
    if (!allowRequest(key, 240, 60_000)) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });

    const art = await resolveArtwork(kind, title, year);
    return NextResponse.json(art, {
        headers: { 'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400' },
    });
}
