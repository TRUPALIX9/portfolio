import type { Collection, Document, Filter } from 'mongodb';
import { INTENT_OUTBOUND, INTENT_WEIGHTS, OUTBOUND_TARGETS } from './shared';
import { getAnalytics } from './server';

export const RANGES = { '24h': 1, '7d': 7, '30d': 30, '90d': 90, all: 0 } as const;
export type RangeKey = keyof typeof RANGES;

export const TRAFFIC_FILTERS = ['human', 'bots', 'owner', 'all'] as const;
export type TrafficFilter = (typeof TRAFFIC_FILTERS)[number];
export const DEVICE_FILTERS = ['all', 'mobile', 'desktop', 'tablet'] as const;
export type DeviceFilter = (typeof DEVICE_FILTERS)[number];

export type ReportOptions = {
    range: RangeKey;
    /** Real visitors (default), only bots/datacenter, only the owner's own visits, or everything. */
    traffic: TrafficFilter;
    device: DeviceFilter;
    /** IANA time zone for daily buckets (the viewer's). */
    tz: string;
};

type SessionDoc = {
    session_id: string;
    visitor_id: string;
    started_at: Date;
    last_at: Date;
    landing_path?: string;
    exit_path?: string;
    referrer_host?: string | null;
    channel?: string;
    utm?: { source?: string; medium?: string; campaign?: string; ref?: string };
    geo?: { country?: string; region?: string; city?: string };
    device?: { class?: string; os?: string; browser?: string; model?: string };
    counts?: Record<string, number>;
    outbound?: Record<string, number>;
    engaged_ms?: number;
    paths?: string[];
    sections?: string[];
    is_owner?: boolean;
    is_bot?: boolean;
    bot_reason?: string;
    hosting?: boolean;
    ip?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
/** Datacenter IPs are only treated as bots when the visit shows no real engagement. */
const DATACENTER_MIN_ENGAGED_MS = 5000;
const HOME_SECTIONS = ['hero', 'about', 'products', 'projects', 'experience', 'contact'];

function periodBounds(range: RangeKey) {
    const days = RANGES[range];
    const to = new Date();
    if (!days) return { from: new Date(0), to, prevFrom: null, prevTo: null };
    const from = new Date(to.getTime() - days * DAY_MS);
    return { from, to, prevFrom: new Date(from.getTime() - days * DAY_MS), prevTo: from };
}

const DATACENTER_IDLE: Filter<Document> = { hosting: true, engaged_ms: { $not: { $gte: DATACENTER_MIN_ENGAGED_MS } } };

/** Session-level filter for the traffic and device selectors (matches sessionKind below). */
export function sessionFilter({ traffic, device }: Pick<ReportOptions, 'traffic' | 'device'>): Filter<Document> {
    const filter: Filter<Document> = device === 'all' ? {} : { 'device.class': device };
    if (traffic === 'human') {
        Object.assign(filter, { is_owner: { $ne: true }, is_bot: { $ne: true }, $nor: [DATACENTER_IDLE] });
    } else if (traffic === 'bots') {
        Object.assign(filter, { is_owner: { $ne: true }, $or: [{ is_bot: true }, DATACENTER_IDLE] });
    } else if (traffic === 'owner') {
        filter.is_owner = true;
    }
    return filter;
}

/** The same selectors applied to visitor records (a visitor is a bot if flagged or on a datacenter IP). */
function visitorFilter({ traffic, device }: Pick<ReportOptions, 'traffic' | 'device'>): Filter<Document> {
    const filter: Filter<Document> = device === 'all' ? {} : { 'device.class': device };
    if (traffic === 'human') Object.assign(filter, { is_owner: { $ne: true }, is_bot: { $ne: true } });
    else if (traffic === 'bots') Object.assign(filter, { is_owner: { $ne: true }, $or: [{ is_bot: true }, { hosting: true }] });
    else if (traffic === 'owner') filter.is_owner = true;
    return filter;
}

export function sessionKind(session: SessionDoc) {
    if (session.is_owner) return 'owner';
    if (session.is_bot) return 'bot';
    if (session.hosting && (session.engaged_ms ?? 0) < DATACENTER_MIN_ENGAGED_MS) return 'datacenter';
    return 'human';
}

export function intentScore(session: SessionDoc) {
    const counts = session.counts ?? {};
    const outbound = session.outbound ?? {};
    const intentClicks = INTENT_OUTBOUND.reduce((sum, target) => sum + (outbound[target] ?? 0), 0);
    return (counts.contact_submit ?? 0) * INTENT_WEIGHTS.contact_submit
        + intentClicks * INTENT_WEIGHTS.intent_click
        + (counts.detail_view ?? 0) * INTENT_WEIGHTS.detail_view
        + ((session.engaged_ms ?? 0) >= 60_000 ? INTENT_WEIGHTS.engaged_minute : 0);
}

function intentClicks(session: SessionDoc) {
    return INTENT_OUTBOUND.reduce((sum, target) => sum + (session.outbound?.[target] ?? 0), 0);
}

function isBounce(session: SessionDoc) {
    return (session.counts?.page_view ?? 0) <= 1
        && (session.engaged_ms ?? 0) < 10_000
        && !intentClicks(session)
        && !(session.counts?.contact_submit);
}

function countBy<T>(items: T[], key: (item: T) => string | null | undefined, limit = 20) {
    const map = new Map<string, number>();
    for (const item of items) {
        const k = key(item);
        if (!k) continue;
        map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, limit);
}

function avg(values: number[]) {
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function percentile(values: number[], p: number) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

async function loadSessions(sessions: Collection, from: Date, to: Date, opts: ReportOptions) {
    return sessions
        .find({ started_at: { $gte: from, $lt: to }, ...sessionFilter(opts) }, { projection: { _id: 0, referrer: 0 } })
        .toArray() as unknown as Promise<SessionDoc[]>;
}

function summarize(list: SessionDoc[], newVisitorIds: Set<string>) {
    const visitors = new Set(list.map((s) => s.visitor_id));
    const pageViews = list.reduce((sum, s) => sum + (s.counts?.page_view ?? 0), 0);
    const engaged = list.map((s) => s.engaged_ms ?? 0);
    const newVisitors = [...visitors].filter((id) => newVisitorIds.has(id)).length;
    return {
        visitors: visitors.size,
        newVisitors,
        returningVisitors: visitors.size - newVisitors,
        sessions: list.length,
        pageViews,
        pagesPerSession: list.length ? pageViews / list.length : 0,
        avgEngagedMs: avg(engaged),
        bounceRate: list.length ? list.filter(isBounce).length / list.length : 0,
        intentClicks: list.reduce((sum, s) => sum + intentClicks(s), 0),
        intentSessions: list.filter((s) => intentScore(s) >= INTENT_WEIGHTS.intent_click).length,
        contactStarts: list.reduce((sum, s) => sum + (s.counts?.contact_start ?? 0), 0),
        contactSubmits: list.reduce((sum, s) => sum + (s.counts?.contact_submit ?? 0), 0),
    };
}

async function newVisitorSet(visitorsCol: Collection, ids: string[], from: Date) {
    if (!ids.length) return new Set<string>();
    const docs = await visitorsCol.find({ visitor_id: { $in: ids }, first_seen: { $gte: from } }, { projection: { visitor_id: 1 } }).toArray();
    return new Set(docs.map((d) => String(d.visitor_id)));
}

function hourKey(date: Date, tz: string) {
    try {
        return `${new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hourCycle: 'h23' }).format(date)}:00`;
    } catch {
        return `${String(date.getUTCHours()).padStart(2, '0')}:00`;
    }
}

function dayKey(date: Date, tz: string) {
    try {
        return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
    } catch {
        return date.toISOString().slice(0, 10);
    }
}

export async function overviewReport(opts: ReportOptions) {
    const { range, tz } = opts;
    const { sessions, visitors, events } = await getAnalytics();
    const { from, to, prevFrom, prevTo } = periodBounds(range);

    const [current, previous, allInRange] = await Promise.all([
        loadSessions(sessions, from, to, opts),
        prevFrom && prevTo ? loadSessions(sessions, prevFrom, prevTo, opts) : Promise.resolve<SessionDoc[] | null>(null),
        sessions.find({ started_at: { $gte: from, $lt: to } }, { projection: { is_owner: 1, is_bot: 1, hosting: 1, engaged_ms: 1 } }).toArray() as unknown as Promise<SessionDoc[]>,
    ]);

    const currentNew = await newVisitorSet(visitors, [...new Set(current.map((s) => s.visitor_id))], from);
    const previousNew = previous && prevFrom
        ? await newVisitorSet(visitors, [...new Set(previous.map((s) => s.visitor_id))], prevFrom)
        : null;

    // Daily series: sessions and unique visitors per calendar day in the viewer's time zone.
    const days = new Map<string, { sessions: number; visitors: Set<string>; intent: number }>();
    const spanDays = RANGES[range] || Math.max(1, Math.ceil((to.getTime() - Math.min(...current.map((s) => new Date(s.started_at).getTime()), to.getTime())) / DAY_MS) + 1);
    // Pre-fill every bucket in chronological order so empty hours/days still show as zero.
    if (range === '24h') {
        for (let i = 23; i >= 0; i -= 1) {
            days.set(hourKey(new Date(to.getTime() - i * 60 * 60_000), tz), { sessions: 0, visitors: new Set(), intent: 0 });
        }
    } else {
        for (let i = Math.min(spanDays, 120) - 1; i >= 0; i -= 1) {
            days.set(dayKey(new Date(to.getTime() - i * DAY_MS), tz), { sessions: 0, visitors: new Set(), intent: 0 });
        }
    }
    for (const s of current) {
        const key = range === '24h' ? hourKey(new Date(s.started_at), tz) : dayKey(new Date(s.started_at), tz);
        const bucket = days.get(key) ?? { sessions: 0, visitors: new Set<string>(), intent: 0 };
        bucket.sessions += 1;
        bucket.visitors.add(s.visitor_id);
        if (intentScore(s) >= INTENT_WEIGHTS.intent_click) bucket.intent += 1;
        days.set(key, bucket);
    }
    const series = [...days.entries()]
        .map(([label, b]) => ({ label, sessions: b.sessions, visitors: b.visitors.size, intent: b.intent }));
    // Day keys (YYYY-MM-DD) sort chronologically; hour keys are already in order.
    if (range !== '24h') series.sort((a, b) => a.label.localeCompare(b.label));

    const sessionIds = current.map((s) => s.session_id);
    const [errorCount, rageCount, vitals] = await Promise.all([
        events.countDocuments({ type: 'js_error', session_id: { $in: sessionIds } }),
        events.countDocuments({ type: 'rage_click', session_id: { $in: sessionIds } }),
        events.find({ type: 'web_vital', session_id: { $in: sessionIds } }, { projection: { props: 1 } }).toArray(),
    ]);
    const vitalValues = (name: string) => vitals.filter((v) => v.props?.name === name).map((v) => Number(v.props?.value) || 0);

    const excluded = { owner: 0, bot: 0, datacenter: 0 };
    for (const s of allInRange) {
        const kind = sessionKind(s);
        if (kind !== 'human') excluded[kind] += 1;
    }

    return {
        range,
        current: summarize(current, currentNew),
        previous: previous && previousNew ? summarize(previous, previousNew) : null,
        series,
        audience: {
            devices: countBy(current, (s) => s.device?.class),
            countries: countBy(current, (s) => s.geo?.country || 'Unknown', 10),
            browsers: countBy(current, (s) => s.device?.browser, 8),
            os: countBy(current, (s) => s.device?.os, 8),
        },
        health: {
            excluded,
            jsErrors: errorCount,
            rageClicks: rageCount,
            // CLS is stored x1000 by the tracker.
            vitals: {
                LCP: percentile(vitalValues('LCP'), 0.75),
                INP: percentile(vitalValues('INP'), 0.75),
                CLS: percentile(vitalValues('CLS'), 0.75),
            },
        },
    };
}

export async function acquisitionReport(opts: ReportOptions) {
    const { range } = opts;
    const { sessions } = await getAnalytics();
    const { from, to } = periodBounds(range);
    const list = await loadSessions(sessions, from, to, opts);

    const byChannel = new Map<string, SessionDoc[]>();
    for (const s of list) {
        const key = s.channel || 'Direct';
        byChannel.set(key, [...(byChannel.get(key) ?? []), s]);
    }
    const channels = [...byChannel.entries()].map(([channel, group]) => ({
        channel,
        sessions: group.length,
        visitors: new Set(group.map((s) => s.visitor_id)).size,
        avgEngagedMs: avg(group.map((s) => s.engaged_ms ?? 0)),
        pagesPerSession: avg(group.map((s) => s.counts?.page_view ?? 0)),
        bounceRate: group.filter(isBounce).length / group.length,
        intentRate: group.filter((s) => intentScore(s) >= INTENT_WEIGHTS.intent_click).length / group.length,
        contacts: group.reduce((sum, s) => sum + (s.counts?.contact_submit ?? 0), 0),
    })).sort((a, b) => b.sessions - a.sessions);

    return {
        channels,
        referrers: countBy(list, (s) => s.referrer_host),
        campaigns: countBy(list, (s) => {
            const u = s.utm ?? {};
            return [u.ref && `ref=${u.ref}`, u.source && `utm_source=${u.source}`, u.campaign && `campaign=${u.campaign}`].filter(Boolean).join(' · ') || null;
        }),
        landingPages: countBy(list, (s) => s.landing_path),
        cities: countBy(list, (s) => (s.geo?.city ? `${s.geo.city}${s.geo.country ? `, ${s.geo.country}` : ''}` : null)),
    };
}

export async function contentReport(opts: ReportOptions) {
    const { range } = opts;
    const { sessions, pageviews } = await getAnalytics();
    const { from, to } = periodBounds(range);
    const list = await loadSessions(sessions, from, to, opts);
    const ids = list.map((s) => s.session_id);
    const views = await pageviews
        .find({ session_id: { $in: ids } }, { projection: { _id: 0, path: 1, visitor_id: 1, active_ms: 1, max_scroll: 1, sections: 1 } })
        .toArray();

    const exits = countBy(list, (s) => s.exit_path, 1000);
    const entrances = countBy(list, (s) => s.landing_path, 1000);
    const exitMap = new Map(exits.map((e) => [e.label, e.count]));
    const entryMap = new Map(entrances.map((e) => [e.label, e.count]));

    const byPath = new Map<string, typeof views>();
    for (const v of views) byPath.set(String(v.path), [...(byPath.get(String(v.path)) ?? []), v]);

    const pages = [...byPath.entries()].map(([path, group]) => {
        const engagedViews = group.filter((v) => (v.active_ms ?? 0) > 0);
        return {
            path,
            kind: path === '/' ? 'home' : path.split('/')[1] || 'page',
            views: group.length,
            visitors: new Set(group.map((v) => v.visitor_id)).size,
            avgActiveMs: avg(engagedViews.map((v) => Number(v.active_ms) || 0)),
            avgScroll: avg(engagedViews.map((v) => Number(v.max_scroll) || 0)),
            entrances: entryMap.get(path) ?? 0,
            exits: exitMap.get(path) ?? 0,
            exitRate: group.length ? (exitMap.get(path) ?? 0) / group.length : 0,
        };
    }).sort((a, b) => b.views - a.views);

    const homeViews = views.filter((v) => v.path === '/');
    const sectionReach = HOME_SECTIONS.map((section) => ({
        section,
        views: homeViews.filter((v) => Array.isArray(v.sections) && v.sections.includes(section)).length,
        rate: homeViews.length ? homeViews.filter((v) => Array.isArray(v.sections) && v.sections.includes(section)).length / homeViews.length : 0,
    }));

    return { pages, homeViews: homeViews.length, sectionReach };
}

function sessionSummary(s: SessionDoc) {
    return {
        session_id: s.session_id,
        visitor_id: s.visitor_id,
        started_at: s.started_at,
        last_at: s.last_at,
        landing_path: s.landing_path ?? '/',
        exit_path: s.exit_path ?? null,
        channel: s.channel ?? 'Direct',
        referrer_host: s.referrer_host ?? null,
        geo: s.geo ?? {},
        device: s.device ?? {},
        pages: s.counts?.page_view ?? 0,
        paths: (s.paths ?? []).slice(0, 30),
        engaged_ms: s.engaged_ms ?? 0,
        outbound: s.outbound ?? {},
        contact: s.counts?.contact_submit ?? 0,
        score: intentScore(s),
        kind: sessionKind(s),
    };
}

export async function intentReport(opts: ReportOptions) {
    const { range } = opts;
    const { sessions, events } = await getAnalytics();
    const { from, to } = periodBounds(range);
    const list = await loadSessions(sessions, from, to, opts);

    const exploredWork = list.filter((s) => (s.counts?.detail_view ?? 0) > 0
        || (s.sections ?? []).some((sec) => sec === 'projects' || sec === 'products'));
    const funnel = [
        { step: 'Visited', sessions: list.length },
        { step: 'Explored work', sessions: exploredWork.length },
        { step: 'Clicked GitHub / LinkedIn / email', sessions: list.filter((s) => intentClicks(s) > 0).length },
        { step: 'Started contact form', sessions: list.filter((s) => (s.counts?.contact_start ?? 0) > 0).length },
        { step: 'Sent a message', sessions: list.filter((s) => (s.counts?.contact_submit ?? 0) > 0).length },
    ];

    const clicks = await events
        .find({ type: 'outbound_click', session_id: { $in: list.map((s) => s.session_id) } }, { projection: { props: 1 } })
        .toArray();
    const targets = OUTBOUND_TARGETS.map((target) => ({
        target,
        clicks: clicks.filter((c) => c.props?.target === target).length,
    })).filter((t) => t.clicks > 0).sort((a, b) => b.clicks - a.clicks);
    const placements = countBy(clicks, (c) => `${c.props?.target ?? 'other'} · ${c.props?.placement ?? 'page'}`, 15);
    const links = countBy(clicks, (c) => (c.props?.url === 'mailto' ? 'Email (mailto)' : String(c.props?.url ?? '')), 15);

    const hot = list
        .map(sessionSummary)
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score || new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
        .slice(0, 30);

    return { funnel, targets, placements, links, hot };
}

export async function liveReport(opts: ReportOptions) {
    const { sessions, events, pageviews, visitors } = await getAnalytics();
    const since = new Date(Date.now() - 30 * 60_000);
    const active = await sessions
        .find({ last_at: { $gte: since }, ...sessionFilter(opts) }, { projection: { _id: 0 } })
        .sort({ last_at: -1 })
        .limit(50)
        .toArray() as unknown as SessionDoc[];
    // Visits in the selected range as per-device journeys: who they are, then everything they did, in order.
    const { from } = periodBounds(opts.range);
    const recent = await sessions
        .find({ last_at: { $gte: from }, ...sessionFilter(opts) }, { projection: { _id: 0, referrer: 0 } })
        .sort({ last_at: -1 })
        .limit(50)
        .toArray() as unknown as SessionDoc[];
    const ids = recent.map((s) => s.session_id);
    const [steps, views, names] = await Promise.all([
        events.find(
            { session_id: { $in: ids }, type: { $nin: ['web_vital'] } },
            { projection: { _id: 0, at: 1, type: 1, path: 1, props: 1, pv: 1, session_id: 1 } },
        ).sort({ at: 1 }).limit(2000).toArray(),
        pageviews.find({ session_id: { $in: ids } }, { projection: { _id: 0, pv: 1, active_ms: 1, max_scroll: 1 } }).toArray(),
        visitors.find(
            { visitor_id: { $in: [...new Set(recent.map((s) => s.visitor_id))] }, custom_name: { $nin: [null, ''] } },
            { projection: { visitor_id: 1, custom_name: 1 } },
        ).toArray(),
    ]);
    const engagement = new Map(views.map((v) => [String(v.pv), { active_ms: v.active_ms ?? 0, max_scroll: v.max_scroll ?? 0 }]));
    const nameOf = new Map(names.map((v) => [String(v.visitor_id), String(v.custom_name)]));
    const stepsBySession = new Map<string, typeof steps>();
    for (const step of steps) {
        const key = String(step.session_id);
        stepsBySession.set(key, [...(stepsBySession.get(key) ?? []), step]);
    }

    const journeys = recent.map((s) => ({
        ...sessionSummary(s),
        visitor_name: nameOf.get(s.visitor_id) ?? null,
        steps: (stepsBySession.get(s.session_id) ?? []).map((step) => ({
            at: step.at,
            type: step.type,
            path: step.path,
            props: step.props,
            // Page views carry how long the page was actively viewed and how far it was scrolled.
            ...(step.type === 'page_view' && step.pv ? engagement.get(String(step.pv)) ?? {} : {}),
        })),
    }));
    return { active: active.map(sessionSummary), journeys };
}

export async function visitorsReport(opts: ReportOptions, search: string) {
    const { visitors } = await getAnalytics();
    const { from } = periodBounds(opts.range);
    const query: Filter<Document> = { last_seen: { $gte: from }, ...visitorFilter(opts) };
    const term = search.trim().slice(0, 80);
    if (term) {
        const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        query.$and = [{ $or: [
            { visitor_id: pattern }, { ip: pattern }, { custom_name: pattern }, { org: pattern }, { isp: pattern },
            { 'geo.city': pattern }, { 'geo.country': pattern }, { 'device.os': pattern }, { 'device.browser': pattern },
        ] }];
    }
    const list = await visitors.find(query, { projection: { _id: 0 } }).sort({ last_seen: -1 }).limit(300).toArray();
    return { visitors: list };
}

export async function visitorDetail(visitorId: string) {
    const { visitors, sessions, events } = await getAnalytics();
    const visitor = await visitors.findOne({ visitor_id: visitorId }, { projection: { _id: 0 } });
    if (!visitor) return null;
    const visits = await sessions.find({ visitor_id: visitorId }, { projection: { _id: 0 } }).sort({ started_at: -1 }).limit(100).toArray() as unknown as SessionDoc[];
    const timeline = await events
        .find({ visitor_id: visitorId, type: { $ne: 'web_vital' } }, { projection: { _id: 0, at: 1, type: 1, path: 1, props: 1, session_id: 1 } })
        .sort({ at: -1 })
        .limit(600)
        .toArray();
    const sameIp = visitor.ip
        ? await visitors.countDocuments({ ip: visitor.ip, visitor_id: { $ne: visitorId } })
        : 0;
    return { visitor, sessions: visits.map(sessionSummary), timeline, sameIpVisitors: sameIp };
}

const PAGEVIEWS_PAGE_SIZE = 100;

/** Most recent page views (newest first) with who viewed them, for the Page views tab. */
export async function pageviewsReport(opts: ReportOptions, page: number, pathFilter: string) {
    const { sessions, pageviews, visitors } = await getAnalytics();
    const { from, to } = periodBounds(opts.range);
    // Sessions that started before the range can still have page views inside it.
    const matching = await sessions
        .find({ last_at: { $gte: from }, started_at: { $lt: to }, ...sessionFilter(opts) }, { projection: { _id: 0, referrer: 0 } })
        .toArray() as unknown as SessionDoc[];
    const bySession = new Map(matching.map((s) => [s.session_id, s]));

    const query: Filter<Document> = { at: { $gte: from, $lt: to }, session_id: { $in: [...bySession.keys()] } };
    const path = pathFilter.trim().slice(0, 200);
    if (path) query.path = path;
    const [total, rows] = await Promise.all([
        pageviews.countDocuments(query),
        pageviews.find(query, { projection: { _id: 0 } })
            .sort({ at: -1 })
            .skip(Math.max(0, page) * PAGEVIEWS_PAGE_SIZE)
            .limit(PAGEVIEWS_PAGE_SIZE)
            .toArray(),
    ]);

    const visitorIds = [...new Set(rows.map((r) => String(r.visitor_id)))];
    const names = new Map((await visitors
        .find({ visitor_id: { $in: visitorIds }, custom_name: { $nin: [null, ''] } }, { projection: { visitor_id: 1, custom_name: 1 } })
        .toArray()).map((v) => [String(v.visitor_id), String(v.custom_name)]));

    return {
        total,
        page,
        pageSize: PAGEVIEWS_PAGE_SIZE,
        paths: countBy(await pageviews.find({ at: { $gte: from, $lt: to }, session_id: { $in: [...bySession.keys()] } }, { projection: { path: 1 } }).toArray(), (v) => String(v.path), 50)
            .map((p) => p.label),
        rows: rows.map((r) => {
            const session = bySession.get(String(r.session_id));
            return {
                pv: r.pv,
                at: r.at,
                path: r.path,
                title: r.title ?? '',
                prev_path: r.prev_path ?? null,
                active_ms: r.active_ms ?? 0,
                max_scroll: r.max_scroll ?? 0,
                visitor_id: r.visitor_id,
                visitor_name: names.get(String(r.visitor_id)) ?? null,
                channel: session?.channel ?? 'Direct',
                geo: session?.geo ?? {},
                device: session?.device ?? {},
                kind: session ? sessionKind(session) : 'human',
            };
        }),
    };
}
