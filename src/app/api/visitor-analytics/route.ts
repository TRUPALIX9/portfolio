import { NextResponse } from 'next/server';
import { getDb } from '@/utils/mongodb';
import { isAuthorizedRequest } from '@/utils/admin';
import { UAParser } from 'ua-parser-js';

const TRACKED_EVENTS = new Set([
    'page_view', 'link_open', 'resume_open', 'resume_download',
    'contact_submit', 'game_open', 'run_complete', 'behavior_ping',
]);

// This endpoint is public, so every value that reaches a Mongo filter or update
// must be a bounded primitive. Objects like { "$ne": null } would otherwise turn
// `{ deviceId: body.deviceId }` into an operator query (NoSQL injection).
function str(value: unknown, max = 200) {
    return typeof value === 'string' ? value.slice(0, max) : '';
}

function num(value: unknown, max = Number.MAX_SAFE_INTEGER) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0;
}

function sanitizeHardware(hw: any) {
    if (!hw || typeof hw !== 'object') return null;
    const field = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : str(v, 60));
    return {
        connection: field(hw.connection),
        memory: field(hw.memory),
        cores: field(hw.cores),
        batteryLevel: field(hw.batteryLevel),
        isCharging: hw.isCharging === true,
        exactModel: field(hw.exactModel),
    };
}

// x-forwarded-for is "client, proxy1, proxy2" — only the first hop is the visitor.
function getClientIp(request: Request) {
    const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    return forwarded.split(',')[0].trim();
}

function isPrivateIp(ip: string) {
    if (['127.0.0.1', '::1', 'localhost'].includes(ip)) return true;
    if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true;
    const match = ip.match(/^172\.(\d+)\./);
    return Boolean(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
}

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
        // A 200 with empty lists made "database down" indistinguishable from "no visitors".
        return NextResponse.json({ error: 'Failed to load analytics', sessions: [], devices: [] }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const raw = await request.json();
        if (!raw || typeof raw !== 'object' || !TRACKED_EVENTS.has(raw.event)) {
            return NextResponse.json({ success: false, error: 'Invalid event' }, { status: 400 });
        }

        const body = {
            event: raw.event as string,
            deviceId: str(raw.deviceId, 100),
            sessionId: str(raw.sessionId, 100),
            route: str(raw.route, 300) || '/',
            source: str(raw.source, 100),
            shareToken: str(raw.shareToken, 300),
            referrer: str(raw.referrer, 500),
            linkName: str(raw.linkName, 200),
            linkUrl: str(raw.linkUrl, 500),
            game: str(raw.game, 50),
            score: num(raw.score, 100000),
            hardware: sanitizeHardware(raw.hardware),
            utm: raw.utm && typeof raw.utm === 'object'
                ? { source: str(raw.utm.source, 100), medium: str(raw.utm.medium, 100), campaign: str(raw.utm.campaign, 100) }
                : null,
            behavior: raw.behavior && typeof raw.behavior === 'object'
                ? {
                    maxScrollDepth: num(raw.behavior.maxScrollDepth, 100),
                    sessionDuration: num(raw.behavior.sessionDuration, 60 * 60 * 24),
                    rageClicks: num(raw.behavior.rageClicks, 1000),
                    activeTimePerRoute: raw.behavior.activeTimePerRoute && typeof raw.behavior.activeTimePerRoute === 'object'
                        ? raw.behavior.activeTimePerRoute as Record<string, unknown>
                        : null,
                }
                : null,
        };
        const db = await getDb();

        const userAgent = (request.headers.get('user-agent') || '').slice(0, 500);
        const ip = getClientIp(request);
        const vercelCity = request.headers.get('x-vercel-ip-city') || '';
        const vercelCountry = request.headers.get('x-vercel-ip-country') || '';
        let actualCity = '';
        let actualCountry = '';

        if (ip) {
            const ignoredPrefixes = [
                '205.169.39.',
                '104.197.69.',
                '135.232.20.',
                '9.169.121.',
                '57.141.18.',
                '66.220.149.',
                '74.179.70.',
                '72.152.84.',
                '108.62.96.',
                '23.19.226.',
                '52.86.64.',
                '23.111.255.',
                '93.177.72.',
                '52.55.1.',
                '108.62.235.'
            ];
            for (const prefix of ignoredPrefixes) {
                if (ip.startsWith(prefix)) {
                    return NextResponse.json({ success: true, ignored: true });
                }
            }
        }

        // Also ignore synthetic vercel tests / bots with server hardware (e.g. >= 32 cores)
        // (the client sends core count as `cores`; `hardwareConcurrency` was never populated)
        if (body.hardware && Number(body.hardware.cores) >= 32) {
            return NextResponse.json({ success: true, ignored: true });
        }

        if (ip) {
            if (!isPrivateIp(ip)) {
                try {
                    const ipRes = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=city,country`, {
                        cache: 'force-cache',
                        signal: AbortSignal.timeout(1500),
                    });
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
        
        let isSuspicious = false;
        if (ip && body.deviceId) {
            // Mark as suspicious if this IP has been seen with a different device ID (different configuration)
            const otherDevicesCount = await db.collection('visitor_devices').countDocuments({
                ip: ip,
                deviceId: { $ne: body.deviceId }
            });
            if (otherDevicesCount > 0) isSuspicious = true;
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
                    isBot,
                    isSuspicious
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
                    isSuspicious,
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
                // The client sends cumulative values, so $max keeps them monotonic even
                // when pings arrive out of order (e.g. keepalive requests on unload).
                sessionUpdate.$max = {
                    maxScrollDepth: body.behavior.maxScrollDepth,
                    sessionDuration: body.behavior.sessionDuration,
                };
                // rageClicks is also cumulative per page load; $inc double-counted it on every ping.
                sessionUpdate.$max.rageClicks = body.behavior.rageClicks;

                if (body.behavior.activeTimePerRoute) {
                    for (const [r, time] of Object.entries(body.behavior.activeTimePerRoute).slice(0, 50)) {
                        // MongoDB field names can't contain "." or start with "$"
                        const cleanRoute = r.slice(0, 200).replace(/\./g, '_').replace(/^\$/, '_');
                        sessionUpdate.$max[`route_times.${cleanRoute}`] = num(time, 60 * 60 * 24);
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
