import { NextResponse } from 'next/server';
import { getSupabaseServerClient, isAuthorizedRequest } from '@/utils/admin';

type PlaygroundSession = {
    id?: string;
    session_id: string;
    route: string;
    share_token?: string | null;
    source?: string | null;
    label?: string | null;
    started_at: string;
    last_seen_at: string;
    visit_count: number;
    game_opens: number;
    completed_runs: number;
    total_score: number;
    best_score: number;
    games_played: string[];
};

type AnalyticsEventBody = {
    sessionId?: string;
    route?: string;
    shareToken?: string;
    source?: string;
    event?: 'view' | 'game_open' | 'run_complete';
    game?: string;
    score?: number;
};

function clean(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function ensureGamesPlayed(value: unknown) {
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function summarizeSessions(sessions: PlaygroundSession[]) {
    const uniqueLabels = new Set(
        sessions
            .map((session) => clean(session.label))
            .filter(Boolean),
    ).size;

    const totalVisits = sessions.reduce((sum, session) => sum + (session.visit_count ?? 0), 0);
    const totalRuns = sessions.reduce((sum, session) => sum + (session.completed_runs ?? 0), 0);
    const totalOpens = sessions.reduce((sum, session) => sum + (session.game_opens ?? 0), 0);
    const bestSession = sessions.reduce<PlaygroundSession | null>((best, session) => {
        if (!best) return session;
        return (session.best_score ?? 0) > (best.best_score ?? 0) ? session : best;
    }, null);

    return {
        totalSessions: sessions.length,
        namedSessions: uniqueLabels,
        totalVisits,
        totalRuns,
        totalOpens,
        bestSession,
    };
}

export async function GET(request: Request) {
    if (!(await isAuthorizedRequest(request))) {
        return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
    }

    try {
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase
            .from('playground_sessions')
            .select('*')
            .order('last_seen_at', { ascending: false })
            .limit(300);

        if (error) {
            console.error('Playground Analytics GET Error:', error);
            return NextResponse.json({ sessions: [], summary: summarizeSessions([]) });
        }

        const sessions = ((data ?? []) as PlaygroundSession[]).map((session) => ({
            ...session,
            games_played: ensureGamesPlayed(session.games_played),
        }));

        return NextResponse.json({
            sessions,
            summary: summarizeSessions(sessions),
        });
    } catch (error) {
        console.error('Playground Analytics GET Error:', error);
        return NextResponse.json({ error: 'Failed to read playground analytics' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as AnalyticsEventBody;
        const sessionId = clean(body.sessionId);
        const route = clean(body.route) || '/arcade-only';
        const shareToken = clean(body.shareToken) || null;
        const source = clean(body.source) || null;
        const event = body.event ?? 'view';
        const game = clean(body.game);
        const score = Number(body.score) || 0;

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing session id' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const supabase = await getSupabaseServerClient();

        const { data: existing, error: fetchError } = await supabase
            .from('playground_sessions')
            .select('*')
            .eq('session_id', sessionId)
            .maybeSingle();

        if (fetchError) {
            console.error('Playground Analytics lookup Error:', fetchError);
            return NextResponse.json({ error: 'Failed to track session' }, { status: 500 });
        }

        const currentGames = ensureGamesPlayed(existing?.games_played);
        const nextGames = game && !currentGames.includes(game) ? [...currentGames, game] : currentGames;

        const nextRecord: PlaygroundSession = {
            session_id: sessionId,
            route,
            share_token: shareToken,
            source,
            label: existing?.label ?? null,
            started_at: existing?.started_at ?? now,
            last_seen_at: now,
            visit_count: (existing?.visit_count ?? 0) + (event === 'view' ? 1 : 0),
            game_opens: (existing?.game_opens ?? 0) + (event === 'game_open' ? 1 : 0),
            completed_runs: (existing?.completed_runs ?? 0) + (event === 'run_complete' ? 1 : 0),
            total_score: (existing?.total_score ?? 0) + (event === 'run_complete' ? score : 0),
            best_score: event === 'run_complete' ? Math.max(existing?.best_score ?? 0, score) : (existing?.best_score ?? 0),
            games_played: nextGames,
        };

        const { error: upsertError } = await supabase.from('playground_sessions').upsert([nextRecord], {
            onConflict: 'session_id',
        });

        if (upsertError) {
            console.error('Playground Analytics POST Error:', upsertError);
            return NextResponse.json({ error: 'Failed to store session event' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Playground Analytics POST Error:', error);
        return NextResponse.json({ error: 'Failed to store playground analytics' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();

        if (!(await isAuthorizedRequest(request, body))) {
            return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
        }

        const sessionId = clean(body.sessionId);
        const label = clean(body.label);

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing session id' }, { status: 400 });
        }

        const supabase = await getSupabaseServerClient();
        const { error } = await supabase
            .from('playground_sessions')
            .update({ label })
            .eq('session_id', sessionId);

        if (error) {
            console.error('Playground Analytics PATCH Error:', error);
            return NextResponse.json({ error: 'Failed to rename session' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Playground Analytics PATCH Error:', error);
        return NextResponse.json({ error: 'Failed to rename playground session' }, { status: 500 });
    }
}
