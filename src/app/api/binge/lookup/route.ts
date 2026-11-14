import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { allowRequest, searchFilms, searchSeries, type SearchHit } from '@/utils/binge';

/**
 * Public: search beyond Trupal's list, so visitors can suggest something new.
 *   GET /api/binge/lookup?q=severance
 * TVMaze for series and Wikidata for films; top 8 combined. Lightly rate limited and cached.
 */
export async function GET(request: Request) {
    const q = (new URL(request.url).searchParams.get('q') ?? '').trim().slice(0, 100);
    if (q.length < 2) return NextResponse.json({ results: [] });

    const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'local';
    const key = crypto.createHash('sha256').update(`lookup|${ip}`).digest('hex').slice(0, 20);
    if (!allowRequest(key, 60, 60_000)) return NextResponse.json({ error: 'Slow down a little.' }, { status: 429 });

    const [series, films] = await Promise.allSettled([searchSeries(q), searchFilms(q)]);
    const s = series.status === 'fulfilled' ? series.value : [];
    const f = films.status === 'fulfilled' ? films.value : [];
    if (series.status === 'rejected' && films.status === 'rejected') {
        return NextResponse.json({ error: 'Search is unavailable right now.' }, { status: 502 });
    }

    // Interleave so both kinds show up, then keep the best 8.
    const results: SearchHit[] = [];
    for (let i = 0; results.length < 8 && (i < s.length || i < f.length); i++) {
        if (s[i]) results.push(s[i]);
        if (f[i] && results.length < 8) results.push(f[i]);
    }
    return NextResponse.json({ results }, {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
}
