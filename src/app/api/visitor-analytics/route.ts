import { NextResponse } from 'next/server';
import { getSupabaseServerClient, isAuthorizedRequest } from '@/utils/admin';

type VisitorEvent = {
    at: string;
    type: string;
    route: string;
    label?: string | null;
    value?: string | number | null;
};

type VisitorSession = {
    session_id: string;
    device_id: string;
    session_label?: string | null;
    route: string;
    source?: string | null;
    share_token?: string | null;
    started_at: string;
    last_seen_at: string;
    view_count: number;
    link_clicks: number;
    link_targets: string[];
    games_played: string[];
    game_opens: number;
    completed_runs: number;
    total_score: number;
    best_score: number;
    resume_opens: number;
    resume_downloads: number;
    contact_submissions: number;
    recent_events: VisitorEvent[];
    user_agent?: string | null;
};

type DeviceSummary = {
    deviceId: string;
    sessions: number;
    totalViews: number;
    totalLinkClicks: number;
    totalRuns: number;
    totalResumeDownloads: number;
    totalContacts: number;
    lastSeenAt: string;
    topRoutes: string[];
};

type IncomingBody = {
    deviceId?: string;
    sessionId?: string;
    route?: string;
    source?: string;
    shareToken?: string;
    event?: string;
    linkName?: string;
    linkUrl?: string;
    game?: string;
    score?: number;
};

function clean(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function asStringArray(value: unknown) {
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function asRecentEvents(value: unknown) {
    return Array.isArray(value) ? value.filter((entry): entry is VisitorEvent => typeof entry === 'object' && entry !== null && 'type' in entry) : [];
}

function appendUnique(values: string[], next: string) {
    if (!next) return values;
    return values.includes(next) ? values : [...values, next];
}

function summarizeDevices(sessions: VisitorSession[]) {
    const grouped = new Map<string, VisitorSession[]>();

    for (const session of sessions) {
        const list = grouped.get(session.device_id) ?? [];
        list.push(session);
        grouped.set(session.device_id, list);
    }

    const summaries: DeviceSummary[] = [...grouped.entries()].map(([deviceId, deviceSessions]) => {
        const routeCounts = new Map<string, number>();
        for (const session of deviceSessions) {
            routeCounts.set(session.route, (routeCounts.get(session.route) ?? 0) + 1);
        }

        const topRoutes = [...routeCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([route]) => route);

        return {
            deviceId,
            sessions: deviceSessions.length,
            totalViews: deviceSessions.reduce((sum, session) => sum + (session.view_count ?? 0), 0),
            totalLinkClicks: deviceSessions.reduce((sum, session) => sum + (session.link_clicks ?? 0), 0),
            totalRuns: deviceSessions.reduce((sum, session) => sum + (session.completed_runs ?? 0), 0),
            totalResumeDownloads: deviceSessions.reduce((sum, session) => sum + (session.resume_downloads ?? 0), 0),
            totalContacts: deviceSessions.reduce((sum, session) => sum + (session.contact_submissions ?? 0), 0),
            lastSeenAt: deviceSessions
                .map((session) => session.last_seen_at)
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0],
            topRoutes,
        };
    });

    return summaries.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());
}

export async function GET(request: Request) {
    if (!(await isAuthorizedRequest(request))) {
        return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
    }

    try {
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase
            .from('visitor_sessions')
            .select('*')
            .order('last_seen_at', { ascending: false })
            .limit(300);

        if (error) {
            console.error('Visitor Analytics GET Error:', error);
            return NextResponse.json({ sessions: [], devices: [] });
        }

        const sessions = ((data ?? []) as VisitorSession[]).map((session) => ({
            ...session,
            link_targets: asStringArray(session.link_targets),
            games_played: asStringArray(session.games_played),
            recent_events: asRecentEvents(session.recent_events).slice(0, 12),
        }));

        return NextResponse.json({
            sessions,
            devices: summarizeDevices(sessions),
        });
    } catch (error) {
        console.error('Visitor Analytics GET Error:', error);
        return NextResponse.json({ error: 'Failed to read visitor analytics' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as IncomingBody;
        const deviceId = clean(body.deviceId);
        const sessionId = clean(body.sessionId);
        const route = clean(body.route) || '/';
        const source = clean(body.source) || null;
        const shareToken = clean(body.shareToken) || null;
        const event = clean(body.event) || 'page_view';
        const linkName = clean(body.linkName);
        const linkUrl = clean(body.linkUrl);
        const game = clean(body.game);
        const score = Number(body.score) || 0;

        if (!deviceId || !sessionId) {
            return NextResponse.json({ error: 'Missing device or session id' }, { status: 400 });
        }

        const supabase = await getSupabaseServerClient();
        const now = new Date().toISOString();

        const { data: existing, error: fetchError } = await supabase
            .from('visitor_sessions')
            .select('*')
            .eq('session_id', sessionId)
            .maybeSingle();

        if (fetchError) {
            console.error('Visitor Analytics lookup Error:', fetchError);
            return NextResponse.json({ error: 'Failed to track visitor activity' }, { status: 500 });
        }

        const currentLinkTargets = asStringArray(existing?.link_targets);
        const currentGames = asStringArray(existing?.games_played);
        const currentEvents = asRecentEvents(existing?.recent_events);

        const recentEvents = [
            {
                at: now,
                type: event,
                route,
                label: linkName || game || null,
                value: linkUrl || (score ? score : null),
            },
            ...currentEvents,
        ].slice(0, 20);

        const nextSession: VisitorSession = {
            session_id: sessionId,
            device_id: deviceId,
            session_label: existing?.session_label ?? null,
            route,
            source,
            share_token: shareToken,
            started_at: existing?.started_at ?? now,
            last_seen_at: now,
            view_count: (existing?.view_count ?? 0) + (event === 'page_view' ? 1 : 0),
            link_clicks: (existing?.link_clicks ?? 0) + (event === 'link_open' ? 1 : 0),
            link_targets: event === 'link_open'
                ? appendUnique(currentLinkTargets, linkName || linkUrl)
                : currentLinkTargets,
            games_played: game ? appendUnique(currentGames, game) : currentGames,
            game_opens: (existing?.game_opens ?? 0) + (event === 'game_open' ? 1 : 0),
            completed_runs: (existing?.completed_runs ?? 0) + (event === 'run_complete' ? 1 : 0),
            total_score: (existing?.total_score ?? 0) + (event === 'run_complete' ? score : 0),
            best_score: event === 'run_complete' ? Math.max(existing?.best_score ?? 0, score) : (existing?.best_score ?? 0),
            resume_opens: (existing?.resume_opens ?? 0) + (event === 'resume_open' ? 1 : 0),
            resume_downloads: (existing?.resume_downloads ?? 0) + (event === 'resume_download' ? 1 : 0),
            contact_submissions: (existing?.contact_submissions ?? 0) + (event === 'contact_submit' ? 1 : 0),
            recent_events: recentEvents,
            user_agent: request.headers.get('user-agent'),
        };

        const { error: upsertError } = await supabase
            .from('visitor_sessions')
            .upsert([nextSession], { onConflict: 'session_id' });

        if (upsertError) {
            console.error('Visitor Analytics POST Error:', upsertError);
            return NextResponse.json({ error: 'Failed to save visitor activity' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Visitor Analytics POST Error:', error);
        return NextResponse.json({ error: 'Failed to track visitor activity' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();

        if (!(await isAuthorizedRequest(request, body))) {
            return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
        }

        const sessionId = clean(body.sessionId);
        const sessionLabel = clean(body.sessionLabel);

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing session id' }, { status: 400 });
        }

        const supabase = await getSupabaseServerClient();
        const { error } = await supabase
            .from('visitor_sessions')
            .update({ session_label: sessionLabel })
            .eq('session_id', sessionId);

        if (error) {
            console.error('Visitor Analytics PATCH Error:', error);
            return NextResponse.json({ error: 'Failed to rename visitor session' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Visitor Analytics PATCH Error:', error);
        return NextResponse.json({ error: 'Failed to rename visitor session' }, { status: 500 });
    }
}
