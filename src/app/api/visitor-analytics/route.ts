import { NextResponse } from 'next/server';
import { getDb } from '@/utils/mongodb';
import { isAuthorizedRequest } from '@/utils/admin';

export async function GET(request: Request) {
    if (!(await isAuthorizedRequest(request))) {
        return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
    }

    try {
        const db = await getDb();
        const sessions = await db.collection('visitor_sessions')
            .find({})
            .sort({ last_seen_at: -1 })
            .limit(100)
            .toArray();

        const devices = await db.collection('visitor_devices')
            .find({})
            .sort({ lastSeenAt: -1 })
            .limit(100)
            .toArray();

        // Map MongoDB ObjectIds to strings if necessary, though returning them as is usually works for Next.js JSON.
        // We'll return empty arrays if the collections don't exist or are empty.
        return NextResponse.json({
            sessions: sessions.map(s => ({...s, _id: undefined})),
            devices: devices.map(d => ({...d, _id: undefined}))
        });
    } catch (error) {
        console.error('Visitor Analytics GET Error:', error);
        return NextResponse.json({ sessions: [], devices: [] });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const db = await getDb();
        
        // Basic analytics tracking implementation
        // Upsert device
        if (body.deviceId) {
            await db.collection('visitor_devices').updateOne(
                { deviceId: body.deviceId },
                { 
                    $inc: { 
                        totalViews: body.event === 'page_view' ? 1 : 0,
                        totalLinkClicks: body.event === 'link_open' ? 1 : 0,
                        totalRuns: body.event === 'run_complete' ? 1 : 0,
                        totalResumeDownloads: body.event === 'resume_download' ? 1 : 0,
                        totalContacts: body.event === 'contact_submit' ? 1 : 0,
                    },
                    $set: { lastSeenAt: new Date().toISOString() }
                },
                { upsert: true }
            );
        }

        // Upsert session
        if (body.sessionId) {
            const eventObj = {
                at: new Date().toISOString(),
                type: body.event,
                route: body.route,
                label: body.linkName || body.game || null,
                value: body.score || body.linkUrl || null
            };

            await db.collection('visitor_sessions').updateOne(
                { session_id: body.sessionId },
                {
                    $setOnInsert: {
                        device_id: body.deviceId,
                        started_at: new Date().toISOString(),
                        source: body.source || null,
                        share_token: body.shareToken || null
                    },
                    $set: {
                        last_seen_at: new Date().toISOString(),
                        route: body.route
                    },
                    $inc: {
                        view_count: body.event === 'page_view' ? 1 : 0,
                        link_clicks: body.event === 'link_open' ? 1 : 0,
                        game_opens: body.event === 'game_open' ? 1 : 0,
                        completed_runs: body.event === 'run_complete' ? 1 : 0,
                        resume_opens: body.event === 'resume_open' ? 1 : 0,
                        resume_downloads: body.event === 'resume_download' ? 1 : 0,
                        contact_submissions: body.event === 'contact_submit' ? 1 : 0,
                        total_score: body.score || 0
                    },
                    $push: {
                        recent_events: {
                            $each: [eventObj],
                            $slice: -50 // keep last 50 events
                        }
                    },
                    $addToSet: {
                        games_played: body.game || null,
                        link_targets: body.linkName || null
                    }
                },
                { upsert: true }
            );
            
            // Clean up nulls from addToSet
            await db.collection('visitor_sessions').updateOne(
                { session_id: body.sessionId },
                {
                    $pull: {
                        games_played: null,
                        link_targets: null
                    }
                }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Visitor Analytics POST Error:', error);
        return NextResponse.json({ success: false });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();

        if (!(await isAuthorizedRequest(request, body))) {
            return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
        }

        const { sessionId, sessionLabel } = body;

        if (!sessionId || typeof sessionLabel !== 'string') {
            return NextResponse.json({ error: 'Missing session ID or label' }, { status: 400 });
        }

        const db = await getDb();
        await db.collection('visitor_sessions').updateOne(
            { session_id: sessionId },
            { $set: { session_label: sessionLabel } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Visitor Analytics PATCH Error:', error);
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }
}
