import type { Db } from 'mongodb';
import { UAParser } from 'ua-parser-js';
import { getAnalyticsDb } from '@/utils/mongodb';

export const COLLECTIONS = {
    events: 'analytics_events',
    pageviews: 'analytics_pageviews',
    sessions: 'analytics_sessions',
    visitors: 'analytics_visitors',
    config: 'analytics_config',
} as const;

/** Raw events and page views expire after ~13 months; sessions and visitors are kept. */
const RAW_TTL_SECONDS = 400 * 24 * 60 * 60;

export type Flags = { owner: boolean; bot: boolean };

export type AnalyticsConfig = {
    blocked_ips: string[];
    /** IPs whose visits count as the owner's (e.g. home network), managed from the Data tab. */
    owner_ips: string[];
};

let indexesReady: Promise<void> | null = null;

/** createIndex is idempotent; run it once per server instance. */
function ensureIndexes(db: Db) {
    indexesReady ??= (async () => {
        const events = db.collection(COLLECTIONS.events);
        const pageviews = db.collection(COLLECTIONS.pageviews);
        const sessions = db.collection(COLLECTIONS.sessions);
        const visitors = db.collection(COLLECTIONS.visitors);
        await Promise.all([
            events.createIndex({ at: 1 }, { expireAfterSeconds: RAW_TTL_SECONDS }),
            events.createIndex({ session_id: 1, at: 1 }),
            events.createIndex({ visitor_id: 1, at: -1 }),
            events.createIndex({ type: 1, at: -1 }),
            pageviews.createIndex({ pv: 1 }, { unique: true }),
            pageviews.createIndex({ at: 1 }, { expireAfterSeconds: RAW_TTL_SECONDS }),
            pageviews.createIndex({ path: 1, at: -1 }),
            pageviews.createIndex({ session_id: 1 }),
            sessions.createIndex({ session_id: 1 }, { unique: true }),
            sessions.createIndex({ started_at: -1 }),
            sessions.createIndex({ last_at: -1 }),
            sessions.createIndex({ visitor_id: 1, started_at: -1 }),
            visitors.createIndex({ visitor_id: 1 }, { unique: true }),
            visitors.createIndex({ last_seen: -1 }),
            visitors.createIndex({ ip: 1 }),
        ]);
    })().catch((error) => {
        indexesReady = null;
        throw error;
    });
    return indexesReady;
}

export async function getAnalytics() {
    const db = await getAnalyticsDb();
    await ensureIndexes(db);
    return {
        db,
        events: db.collection(COLLECTIONS.events),
        pageviews: db.collection(COLLECTIONS.pageviews),
        sessions: db.collection(COLLECTIONS.sessions),
        visitors: db.collection(COLLECTIONS.visitors),
        config: db.collection<{ _id: string } & AnalyticsConfig>(COLLECTIONS.config),
    };
}

let configCache: { at: number; value: AnalyticsConfig } | null = null;

/** Blocked and owner IPs, cached for a minute so the public collect endpoint doesn't read it on every hit. */
export async function getConfig(db: Db, fresh = false): Promise<AnalyticsConfig> {
    if (!fresh && configCache && Date.now() - configCache.at < 60_000) return configCache.value;
    const doc = await db.collection<{ _id: string } & AnalyticsConfig>(COLLECTIONS.config).findOne({ _id: 'main' });
    const value = { blocked_ips: doc?.blocked_ips ?? [], owner_ips: doc?.owner_ips ?? [] };
    configCache = { at: Date.now(), value };
    return value;
}

export function invalidateConfigCache() {
    configCache = null;
}

// x-forwarded-for is "client, proxy1, proxy2"; only the first hop is the visitor.
export function getClientIp(request: Request) {
    const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    return forwarded.split(',')[0].trim().slice(0, 64);
}

export function isPrivateIp(ip: string) {
    if (!ip || ['127.0.0.1', '::1', 'localhost'].includes(ip)) return true;
    if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('fc') || ip.startsWith('fd')) return true;
    const match = ip.match(/^172\.(\d+)\./);
    return Boolean(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
}

export function ownerIps() {
    return (process.env.OWNER_IPS || '').split(',').map((ip) => ip.trim()).filter(Boolean);
}

function decodeHeader(value: string | null) {
    if (!value) return '';
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

/** Vercel's edge geo headers: ISO country code, region code, and URL-encoded city. */
export function getGeo(request: Request) {
    return {
        country: (request.headers.get('x-vercel-ip-country') || '').slice(0, 2).toUpperCase(),
        region: decodeHeader(request.headers.get('x-vercel-ip-country-region')).slice(0, 10),
        city: decodeHeader(request.headers.get('x-vercel-ip-city')).slice(0, 80),
    };
}

const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|discord|embedly|vercel|curl|wget|python|axios|node-fetch|go-http|java\/|phantom|puppeteer|playwright|selenium/i;

export function parseDevice(userAgent: string) {
    const result = new UAParser(userAgent).getResult();
    const type = result.device.type;
    const deviceClass = type === 'mobile' ? 'mobile' : type === 'tablet' ? 'tablet' : 'desktop';
    return {
        class: deviceClass as 'mobile' | 'tablet' | 'desktop',
        os: result.os.name || 'Unknown',
        browser: result.browser.name || 'Unknown',
        model: [result.device.vendor, result.device.model].filter(Boolean).join(' '),
        uaBot: !userAgent || BOT_UA.test(userAgent),
    };
}

const SEARCH_HOSTS = /(^|\.)(google|bing|duckduckgo|yahoo|baidu|yandex|ecosia|brave|perplexity|chatgpt)\./;

/** Traffic channel from campaign tags first, then the referrer. */
export function classifyChannel(referrerHost: string, utmSource: string, utmMedium: string, ref: string) {
    const tag = `${utmSource} ${ref}`.toLowerCase();
    const host = referrerHost.toLowerCase();
    const matches = (pattern: RegExp) => pattern.test(tag) || pattern.test(host);

    if (matches(/linkedin|lnkd/)) return 'LinkedIn';
    if (matches(/instagram|\big\b/)) return 'Instagram';
    if (matches(/facebook|\bfb\b/)) return 'Facebook';
    if (matches(/github/)) return 'GitHub';
    if (matches(/resume|cv/)) return 'Resume';
    if (matches(/mail|gmail|outlook|android\.gm/) || /email/i.test(utmMedium)) return 'Email';
    if (matches(/snapchat|twitter|x\.com|t\.co|reddit|youtube|whatsapp|discord/)) return 'Social';
    if (utmSource || ref) return 'Campaign';
    if (!host) return 'Direct';
    if (SEARCH_HOSTS.test(host)) return 'Search';
    if (host.startsWith('logicsprint.')) return 'LogicSprint';
    return 'Referral';
}

/** Host of a referrer URL, or android-app package for app referrers. */
export function referrerHost(referrer: string) {
    if (!referrer) return '';
    try {
        const url = new URL(referrer);
        return (url.protocol === 'android-app:' ? url.host : url.hostname).replace(/^www\./, '').slice(0, 100);
    } catch {
        return '';
    }
}

/** Tags visitors (and every session, event and page view they have) as the owner, or untags them. */
export async function setVisitorsOwner(visitorIds: string[], value: boolean) {
    if (!visitorIds.length) return;
    const { visitors, sessions, events, pageviews } = await getAnalytics();
    const match = { visitor_id: { $in: visitorIds } };
    // Flags live on every record so reports can filter without joins.
    await Promise.all([
        visitors.updateMany(match, { $set: { is_owner: value } }),
        sessions.updateMany(match, { $set: { is_owner: value } }),
        events.updateMany(match, { $set: { owner: value } }),
        pageviews.updateMany(match, { $set: { owner: value } }),
    ]);
}

/** Adds an owner IP: future visits from it count as the owner's, and so does everything already recorded from it. */
export async function addOwnerIp(ip: string) {
    const { config, visitors, sessions } = await getAnalytics();
    await config.updateOne({ _id: 'main' }, { $addToSet: { owner_ips: ip } }, { upsert: true });
    const ids = (await visitors.find({ ip }, { projection: { visitor_id: 1 } }).toArray()).map((v) => String(v.visitor_id));
    await Promise.all([
        setVisitorsOwner(ids, true),
        sessions.updateMany({ ip }, { $set: { is_owner: true } }),
    ]);
    invalidateConfigCache();
}

/**
 * Whoever signs in to /playground is the owner: mark the browser's visitor id and, for a public IP,
 * the network it's on. Skips the writes when both are already marked (this runs on every dashboard load).
 */
export async function claimOwnerDevice(visitorId: string, ip: string) {
    const { db, visitors } = await getAnalytics();
    const config = await getConfig(db);
    const tasks: Promise<unknown>[] = [];
    if (/^[\w-]{8,64}$/.test(visitorId)) {
        const visitor = await visitors.findOne({ visitor_id: visitorId }, { projection: { is_owner: 1 } });
        if (visitor && !visitor.is_owner) tasks.push(setVisitorsOwner([visitorId], true));
    }
    if (ip && !isPrivateIp(ip) && !config.owner_ips.includes(ip)) tasks.push(addOwnerIp(ip));
    await Promise.all(tasks);
}
