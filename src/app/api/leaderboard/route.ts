import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

type LeaderboardEntry = {
    id: number;
    name: string;
    score: number;
    game: string;
    date: string;
};

const ADMIN_KEY_HEADER = 'x-admin-key';
const DEFAULT_GAME = 'unknown';

function getAdminKey(request: Request, body?: { key?: string }) {
    return request.headers.get(ADMIN_KEY_HEADER) ?? body?.key ?? '';
}

function isAuthorized(request: Request, body?: { key?: string }) {
    const key = getAdminKey(request, body);
    return Boolean(process.env.KEY) && key === process.env.KEY;
}

function createInsights(entries: LeaderboardEntry[]) {
    const gameStats = new Map<string, { submissions: number; highestScore: number; totalScore: number }>();
    const dateStats = new Map<string, number>();

    for (const entry of entries) {
        const gameName = entry.game || DEFAULT_GAME;
        const currentGame = gameStats.get(gameName) ?? { submissions: 0, highestScore: 0, totalScore: 0 };
        currentGame.submissions += 1;
        currentGame.totalScore += entry.score;
        currentGame.highestScore = Math.max(currentGame.highestScore, entry.score);
        gameStats.set(gameName, currentGame);

        const day = new Date(entry.date).toISOString().slice(0, 10);
        dateStats.set(day, (dateStats.get(day) ?? 0) + entry.score);
    }

    const topGames = [...gameStats.entries()]
        .map(([game, stats]) => ({ game, ...stats }))
        .sort((a, b) => b.totalScore - a.totalScore || b.highestScore - a.highestScore);

    const topDates = [...dateStats.entries()]
        .map(([date, totalScore]) => ({ date, totalScore }))
        .sort((a, b) => b.totalScore - a.totalScore);

    return {
        totalScores: entries.length,
        gamesTracked: gameStats.size,
        topGames,
        topDates,
    };
}

async function getSupabase() {
    const cookieStore = await cookies();
    return createClient(cookieStore);
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const adminMode = searchParams.get('admin') === '1';
        const supabase = await getSupabase();

        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .limit(adminMode ? 500 : 200);

        if (error) {
            console.error('Supabase GET Error:', error);
            return adminMode
                ? NextResponse.json({ scores: [], insights: createInsights([]) })
                : NextResponse.json([]);
        }

        const leaderboard = (data ?? []) as LeaderboardEntry[];

        if (!adminMode) {
            return NextResponse.json(leaderboard);
        }

        if (!isAuthorized(request)) {
            return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
        }

        return NextResponse.json({
            scores: leaderboard,
            insights: createInsights(leaderboard),
        });
    } catch (error) {
        console.error('Leaderboard GET Error:', error);
        return NextResponse.json({ error: 'Failed to read leaderboard' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const supabase = await getSupabase();

        const entry = {
            name: body.name || 'Anonymous',
            score: Number(body.score) || 0,
            game: body.game || DEFAULT_GAME,
            date: new Date().toISOString(),
        };

        const { error: insertError } = await supabase.from('leaderboard').insert([entry]);

        if (insertError) {
            console.error('Supabase POST Error:', insertError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        const { data: leaderboard, error: selectError } = await supabase
            .from('leaderboard')
            .select('*')
            .eq('game', entry.game)
            .order('score', { ascending: false })
            .limit(20);

        if (selectError) {
            console.error('Supabase POST Select Error:', selectError);
        }

        return NextResponse.json(leaderboard || []);
    } catch (error) {
        console.error('Leaderboard POST Error:', error);
        return NextResponse.json({ error: 'Failed to update leaderboard' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();

        if (!isAuthorized(request, body)) {
            return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
        }

        const supabase = await getSupabase();
        const deleteAll = body.deleteAll === true;

        if (!deleteAll && (body.id === undefined || body.id === null)) {
            return NextResponse.json({ error: 'Missing leaderboard id' }, { status: 400 });
        }

        const query = supabase.from('leaderboard').delete();
        const { error } = deleteAll ? await query.neq('id', 0) : await query.eq('id', body.id);

        if (error) {
            console.error('Supabase DELETE Error:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json({ success: true, deletedAll: deleteAll });
    } catch (error) {
        console.error('Leaderboard DELETE Error:', error);
        return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }
}
