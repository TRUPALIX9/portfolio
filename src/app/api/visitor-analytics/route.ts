import { NextResponse } from 'next/server';
import { getDb } from '@/utils/mongodb';
import { isAuthorizedRequest } from '@/utils/admin';
import { UAParser } from 'ua-parser-js';

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
            .aggregate([
                {
                    $lookup: {
                        from: 'visitor_sessions',
                        localField: 'deviceId',
                        foreignField: 'device_id',
                        as: 'sessions'
                    }
                },
                {
                    $addFields: {
                        sessions: {
                            $sortArray: {
                                input: '$sessions',
                                sortBy: { last_seen_at: -1 }
                            }
                        }
                    }
                },
                {
                    $sort: { lastSeenAt: -1 }
                },
                {
                    $limit: 100
                }
            ])
            .toArray();

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
        
        const userAgent = request.headers.get('user-agent') || '';
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
        const vercelCity = request.headers.get('x-vercel-ip-city') || '';
        const vercelCountry = request.headers.get('x-vercel-ip-country') || '';
        let actualCity = '';
        let actualCountry = '';

        if (ip) {
            const isLocal = ['127.0.0.1', '::1', 'localhost'].includes(ip) || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.');
            if (!isLocal) {
                try {
                    const ipRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,country`, { cache: 'force-cache' });
                    if (ipRes.ok) {
                        const ipData = await ipRes.json();
                        if (ipData.city) actualCity = ipData.city;
                        if (ipData.country) actualCountry = ipData.country;
                    }
                } catch (e) {
                    // Silent fail
                }
            }
        }
        
        const city = actualCity || vercelCity;
        const country = actualCountry || vercelCountry;
        
        let browser = '';
        let os = '';
        let deviceType = 'Desktop';
        let isBot = false;

        if (userAgent) {
            const parser = new UAParser(userAgent);
            const result = parser.getResult();
            browser = result.browser.name || '';
            os = result.os.name || '';
            deviceType = result.device.vendor ? `${result.device.vendor} ${result.device.model || ''}`.trim() : result.device.type || 'Desktop';
            
            const uaLower = userAgent.toLowerCase();
            isBot = uaLower.includes('bot') || uaLower.includes('crawler') || uaLower.includes('spider') || uaLower.includes('headless') || (result.device.type as string) === 'bot';
        }

        // Basic analytics tracking implementation
        // Upsert device
        if (body.deviceId) {
            const deviceUpdate: any = {
                $inc: { 
                    totalViews: body.event === 'page_view' ? 1 : 0,
                    totalLinkClicks: body.event === 'link_open' ? 1 : 0,
                    totalRuns: body.event === 'run_complete' ? 1 : 0,
                    totalResumeDownloads: body.event === 'resume_download' ? 1 : 0,
                    totalContacts: body.event === 'contact_submit' ? 1 : 0,
                },
                $set: { 
                    lastSeenAt: new Date().toISOString(),
                    browser,
                    os,
                    deviceType,
                    ip,
                    ...(city ? { city } : {}),
                    ...(country ? { country } : {}),
                    vercel_city: vercelCity,
                    vercel_country: vercelCountry,
                    actual_city: actualCity,
                    actual_country: actualCountry,
                    isBot
                }
            };
            if (body.hardware) {
                deviceUpdate.$set.hardware = body.hardware;
            }
            await db.collection('visitor_devices').updateOne(
                { deviceId: body.deviceId },
                deviceUpdate,
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

            const sessionUpdate: any = {
                $setOnInsert: {
                    device_id: body.deviceId,
                    started_at: new Date().toISOString(),
                    source: body.source || null,
                    share_token: body.shareToken || null,
                    referrer: body.referrer || null,
                    browser,
                    os,
                    deviceType,
                    isBot,
                    city,
                    country,
                    vercel_city: vercelCity,
                    vercel_country: vercelCountry,
                    actual_city: actualCity,
                    actual_country: actualCountry,
                    utm_source: body.utm?.source || null,
                    utm_medium: body.utm?.medium || null,
                    utm_campaign: body.utm?.campaign || null
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
                $addToSet: {
                    games_played: body.game || null,
                    link_targets: body.linkUrl || null
                }
            };

            if (body.event !== 'behavior_ping') {
                sessionUpdate.$push = {
                    recent_events: {
                        $each: [eventObj],
                        $slice: -50 // keep last 50 events
                    }
                };
            }

            if (body.hardware) {
                sessionUpdate.$set.hardware = body.hardware;
            }

            if (body.behavior) {
                // If maxScrollDepth is provided, only set it if it's greater than current (using $max, but we can just use $set for now since we send the cumulative max)
                sessionUpdate.$set.maxScrollDepth = body.behavior.maxScrollDepth;
                sessionUpdate.$set.sessionDuration = body.behavior.sessionDuration;
                sessionUpdate.$inc.rageClicks = body.behavior.rageClicks;
                
                if (body.behavior.activeTimePerRoute) {
                    sessionUpdate.$max = sessionUpdate.$max || {};
                    for (const [r, time] of Object.entries(body.behavior.activeTimePerRoute)) {
                        const cleanRoute = r.replace(/\./g, '_'); // MongoDB keys can't contain .
                        sessionUpdate.$max[`route_times.${cleanRoute}`] = time;
                    }
                }
            }

            await db.collection('visitor_sessions').updateOne(
                { session_id: body.sessionId },
                sessionUpdate,
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
                } as any
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

        const { sessionId, sessionLabel, deviceId, customName } = body;

        const db = await getDb();

        if (deviceId && typeof customName === 'string') {
            await db.collection('visitor_devices').updateOne(
                { deviceId },
                { $set: { customName: customName.trim() } }
            );
            return NextResponse.json({ success: true });
        }

        if (!sessionId || typeof sessionLabel !== 'string') {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

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

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        
        if (!(await isAuthorizedRequest(request, body))) {
            return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
        }
        
        const { targetIp } = body;
        if (!targetIp) {
            return NextResponse.json({ error: 'IP address required' }, { status: 400 });
        }
        
        const db = await getDb();
        
        const devices = await db.collection('visitor_devices').find({ ip: targetIp }).toArray();
        const deviceIds = devices.map(d => d.deviceId);
        
        let deletedSessions = 0;
        if (deviceIds.length > 0) {
            const sessionsResult = await db.collection('visitor_sessions').deleteMany({ device_id: { $in: deviceIds } });
            deletedSessions = sessionsResult.deletedCount;
        }
        
        const devicesResult = await db.collection('visitor_devices').deleteMany({ ip: targetIp });
        
        return NextResponse.json({ 
            success: true, 
            deletedDevices: devicesResult.deletedCount, 
            deletedSessions 
        });
    } catch (e) {
        console.error('Failed to wipe IP data:', e);
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
    }
}
