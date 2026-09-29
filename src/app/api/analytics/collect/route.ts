import { after, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/utils/admin';
import { EVENT_TYPES, OWNER_COOKIE, OUTBOUND_TARGETS, isDetailPath, normalizePath } from '@/utils/analytics/shared';
import {
    classifyChannel,
    getAnalytics,
    getClientIp,
    getConfig,
    getGeo,
    isPrivateIp,
    ownerIps,
    parseDevice,
    referrerHost,
} from '@/utils/analytics/server';

// Public endpoint: every value is validated into bounded primitives before it reaches Mongo,
// so objects like { "$ne": null } can never become operator queries.
const id = z.string().regex(/^[\w-]{8,64}$/);
const text = (max: number) => z.string().max(2000).transform((value) => value.slice(0, max));
const propValue = z.union([text(200), z.number().finite(), z.boolean(), z.null()]);

const payloadSchema = z.object({
    v: id,
    s: id,
    sent: z.number().finite(),
    ctx: z.object({
        referrer: text(300).optional().default(''),
        utm_source: text(100).optional().default(''),
        utm_medium: text(100).optional().default(''),
        utm_campaign: text(100).optional().default(''),
        ref: text(100).optional().default(''),
        lang: text(20).optional().default(''),
        tz: text(60).optional().default(''),
        screen: text(20).optional().default(''),
        webdriver: z.boolean().optional().default(false),
        cores: z.number().finite().optional().default(0),
        memory: z.number().finite().optional().default(0),
    }),
    events: z.array(z.object({
        type: z.enum(EVENT_TYPES),
        ts: z.number().finite(),
        path: text(300),
        pv: id.optional(),
        props: z.record(z.string().max(40), propValue).optional()
            .transform((props) => (props ? Object.fromEntries(Object.entries(props).slice(0, 12)) : {})),
    })).min(1).max(50),
});

type Payload = z.infer<typeof payloadSchema>;

const MAX_EVENTS_PER_MINUTE = 300;
const rateWindows = new Map<string, { start: number; count: number }>();

/** Best-effort per-instance limit so one misbehaving client can't flood the database. */
function rateLimited(visitorId: string, count: number) {
    const now = Date.now();
    const window = rateWindows.get(visitorId);
    if (!window || now - window.start > 60_000) {
        if (rateWindows.size > 5000) rateWindows.clear();
        rateWindows.set(visitorId, { start: now, count });
        return false;
    }
    window.count += count;
    return window.count > MAX_EVENTS_PER_MINUTE;
}

function isDuplicateKey(error: unknown) {
    return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
}

/** Two batches can race to create the same session/visitor; the loser retries as an update. */
async function upsertWithRetry(run: () => Promise<{ upsertedCount: number }>) {
    try {
        return await run();
    } catch (error) {
        if (!isDuplicateKey(error)) throw error;
        return run();
    }
}

async function lookupNetwork(ip: string) {
    const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,hosting,proxy,isp,org`, {
        signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const data = await response.json() as { status?: string; hosting?: boolean; proxy?: boolean; isp?: string; org?: string };
    if (data.status !== 'success') return null;
    return {
        hosting: data.hosting === true,
        proxy: data.proxy === true,
        isp: (data.isp || '').slice(0, 100),
        org: (data.org || '').slice(0, 100),
    };
}

export async function POST(request: Request) {
    let payload: Payload;
    try {
        const parsed = payloadSchema.safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
        payload = parsed.data;
    } catch {
        return NextResponse.json({ ok: false }, { status: 400 });
    }

    if (rateLimited(payload.v, payload.events.length)) {
        return NextResponse.json({ ok: false }, { status: 429 });
    }

    try {
        const { db, events, pageviews, sessions, visitors } = await getAnalytics();
        const ip = getClientIp(request);
        const config = await getConfig(db);
        if (ip && config.blocked_ips.includes(ip)) return new NextResponse(null, { status: 204 });

        const userAgent = (request.headers.get('user-agent') || '').slice(0, 400);
        const device = parseDevice(userAgent);
        const geo = getGeo(request);
        const { ctx } = payload;

        const cookieStore = await cookies();
        const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value ?? '';
        const visitor = await visitors.findOne(
            { visitor_id: payload.v },
            { projection: { is_owner: 1, bot_reason: 1, hosting: 1 } },
        );

        const owner = Boolean(
            cookieStore.get(OWNER_COOKIE)?.value === '1'
            || (adminToken && verifyAdminSessionToken(adminToken))
            || (ip && (ownerIps().includes(ip) || config.owner_ips.includes(ip)))
            || visitor?.is_owner,
        );
        const botReason: string = device.uaBot ? 'user_agent'
            : ctx.webdriver ? 'webdriver'
            : ctx.cores >= 32 ? 'server_hardware'
            : visitor?.bot_reason || '';
        const flags = { owner, bot: Boolean(botReason) };

        // Client clocks drift; place each event relative to when the batch was sent.
        const now = Date.now();
        const eventAt = (ts: number) => new Date(now - Math.min(Math.max(payload.sent - ts, 0), 15 * 60_000));

        const docs = payload.events.map((event) => ({
            at: eventAt(event.ts),
            type: event.type,
            visitor_id: payload.v,
            session_id: payload.s,
            pv: event.pv ?? null,
            path: normalizePath(event.path),
            props: event.props,
            owner: flags.owner,
            bot: flags.bot,
        }));
        const firstAt = docs.reduce((min, doc) => (doc.at < min ? doc.at : min), docs[0].at);
        const lastAt = docs.reduce((max, doc) => (doc.at > max ? doc.at : max), docs[0].at);

        // Engagement updates the page view (max of cumulative values); everything else is a raw event.
        const rawEvents = docs.filter((doc) => doc.type !== 'page_engagement');
        if (rawEvents.length) await events.insertMany(rawEvents, { ordered: false });

        const inc: Record<string, number> = {};
        const bump = (key: string, by = 1) => {
            inc[key] = (inc[key] ?? 0) + by;
        };
        const paths: string[] = [];
        const sections: string[] = [];
        let exitPath = '';
        let landingPath = '';

        for (const doc of docs) {
            bump(`counts.${doc.type}`);
            if (doc.type === 'page_view' && doc.pv) {
                paths.push(doc.path);
                exitPath = doc.path;
                landingPath ||= doc.path;
                if (isDetailPath(doc.path)) bump('counts.detail_view');
                await pageviews.updateOne(
                    { pv: doc.pv },
                    {
                        $setOnInsert: {
                            pv: doc.pv,
                            session_id: payload.s,
                            visitor_id: payload.v,
                            path: doc.path,
                            at: doc.at,
                            active_ms: 0,
                            max_scroll: 0,
                        },
                        $set: {
                            title: typeof doc.props.title === 'string' ? doc.props.title : '',
                            prev_path: typeof doc.props.prev_path === 'string' ? doc.props.prev_path : null,
                            owner: flags.owner,
                            bot: flags.bot,
                        },
                    },
                    { upsert: true },
                ).catch((error) => {
                    if (!isDuplicateKey(error)) throw error;
                });
            } else if (doc.type === 'page_engagement' && doc.pv) {
                const activeMs = Math.min(Math.max(Number(doc.props.active_ms) || 0, 0), 6 * 60 * 60_000);
                const maxScroll = Math.min(Math.max(Number(doc.props.max_scroll) || 0, 0), 100);
                const before = await pageviews.findOneAndUpdate(
                    { pv: doc.pv },
                    {
                        $max: { active_ms: activeMs, max_scroll: maxScroll },
                        $setOnInsert: {
                            pv: doc.pv, session_id: payload.s, visitor_id: payload.v, path: doc.path,
                            at: doc.at, owner: flags.owner, bot: flags.bot,
                        },
                    },
                    { upsert: true, returnDocument: 'before' },
                ).catch((error) => {
                    if (isDuplicateKey(error)) return null;
                    throw error;
                });
                const delta = Math.max(0, activeMs - (Number(before?.active_ms) || 0));
                if (delta) bump('engaged_ms', delta);
            } else if (doc.type === 'section_view' && typeof doc.props.section === 'string') {
                sections.push(doc.props.section.slice(0, 40));
                if (doc.pv) await pageviews.updateOne({ pv: doc.pv }, { $addToSet: { sections: doc.props.section.slice(0, 40) } });
            } else if (doc.type === 'outbound_click') {
                const target = String(doc.props.target);
                bump(`outbound.${(OUTBOUND_TARGETS as readonly string[]).includes(target) ? target : 'other'}`);
            }
        }

        const refHost = referrerHost(ctx.referrer);
        const flagOps = (prefix: '' | 'is_') => {
            const set: Record<string, unknown> = {};
            const setOnInsert: Record<string, unknown> = {};
            (flags.owner ? set : setOnInsert)[`${prefix}owner`] = flags.owner;
            (flags.bot ? set : setOnInsert)[`${prefix}bot`] = flags.bot;
            if (botReason) set.bot_reason = botReason;
            return { set, setOnInsert };
        };

        const sessionFlags = flagOps('is_');
        const sessionResult = await upsertWithRetry(() => sessions.updateOne(
            { session_id: payload.s },
            {
                $setOnInsert: {
                    session_id: payload.s,
                    visitor_id: payload.v,
                    started_at: firstAt,
                    landing_path: landingPath || docs[0].path,
                    referrer: ctx.referrer || null,
                    referrer_host: refHost || null,
                    channel: classifyChannel(refHost, ctx.utm_source, ctx.utm_medium, ctx.ref),
                    utm: { source: ctx.utm_source, medium: ctx.utm_medium, campaign: ctx.utm_campaign, ref: ctx.ref },
                    geo,
                    device: { class: device.class, os: device.os, browser: device.browser, model: device.model },
                    lang: ctx.lang,
                    tz: ctx.tz,
                    screen: ctx.screen,
                    ip,
                    hosting: visitor?.hosting === true,
                    ...sessionFlags.setOnInsert,
                },
                $max: { last_at: lastAt },
                $set: { ...(exitPath ? { exit_path: exitPath } : {}), ...sessionFlags.set },
                $inc: inc,
                ...(paths.length || sections.length
                    ? { $addToSet: { paths: { $each: paths }, sections: { $each: sections } } }
                    : {}),
            },
            { upsert: true },
        ));
        const newSession = sessionResult.upsertedCount > 0;

        // Signing in to /playground mid-visit: retag what this session already sent as the owner's.
        if (flags.owner) {
            await Promise.all([
                events.updateMany({ session_id: payload.s, owner: false }, { $set: { owner: true } }),
                pageviews.updateMany({ session_id: payload.s, owner: false }, { $set: { owner: true } }),
            ]);
        }

        const visitorFlags = flagOps('is_');
        const visitorInc: Record<string, number> = {
            session_count: newSession ? 1 : 0,
            pageviews: inc['counts.page_view'] ?? 0,
            engaged_ms: inc.engaged_ms ?? 0,
        };
        await upsertWithRetry(() => visitors.updateOne(
            { visitor_id: payload.v },
            {
                $setOnInsert: { visitor_id: payload.v, first_seen: firstAt, ...visitorFlags.setOnInsert },
                $max: { last_seen: lastAt },
                $set: {
                    ip,
                    geo,
                    device: { class: device.class, os: device.os, browser: device.browser, model: device.model },
                    lang: ctx.lang,
                    tz: ctx.tz,
                    ...visitorFlags.set,
                },
                $inc: visitorInc,
            },
            { upsert: true },
        ));

        // First sighting of a public IP: look up whether it is a datacenter/VPN and who owns it.
        // Runs after the response, so it never slows the page down.
        if (!visitor && ip && !isPrivateIp(ip)) {
            after(async () => {
                try {
                    const network = await lookupNetwork(ip);
                    if (!network) return;
                    await visitors.updateOne({ visitor_id: payload.v }, { $set: network });
                    if (network.hosting) {
                        await sessions.updateMany({ visitor_id: payload.v }, { $set: { hosting: true } });
                    }
                } catch {
                    // Enrichment is optional.
                }
            });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Analytics collect error:', error);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
