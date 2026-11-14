import { NextResponse } from 'next/server';
import { isAuthorizedRequest } from '@/utils/admin';
import { searchFilms, searchSeries, tvmazeEpisodes, tvmazeSeasons } from '@/utils/binge';

export const dynamic = 'force-dynamic';

/**
 * Admin search proxy.
 *   ?q=dark&kind=series        → TVMaze shows
 *   ?q=gone girl&kind=film     → Wikidata films
 *   ?seasons=<tvmazeId>        → seasons with episode counts
 *   ?episodes=<tvmazeId>&season=2 → episode titles for one season
 */
export async function GET(request: Request) {
    if (!(await isAuthorizedRequest(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const params = new URL(request.url).searchParams;

    try {
        const seasonsFor = params.get('seasons');
        if (seasonsFor) return NextResponse.json(await tvmazeSeasons(seasonsFor));

        const episodesFor = params.get('episodes');
        if (episodesFor) return NextResponse.json(await tvmazeEpisodes(episodesFor, Number(params.get('season') ?? '1')));

        const q = (params.get('q') ?? '').trim().slice(0, 100);
        if (q.length < 2) return NextResponse.json([]);
        const kind = params.get('kind');
        if (kind === 'film') return NextResponse.json(await searchFilms(q));
        if (kind === 'series') return NextResponse.json(await searchSeries(q));
        const [series, films] = await Promise.allSettled([searchSeries(q), searchFilms(q)]);
        return NextResponse.json([
            ...(series.status === 'fulfilled' ? series.value : []),
            ...(films.status === 'fulfilled' ? films.value : []),
        ]);
    } catch (error) {
        console.error('Binge search failed:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Search failed.' }, { status: 502 });
    }
}
