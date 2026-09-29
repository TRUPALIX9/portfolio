// Shared by the browser tracker, the collect endpoint, and the admin reports.

export const ANALYTICS_ENDPOINT = '/api/analytics/collect';

export const EVENT_TYPES = [
    'page_view',
    'page_engagement',
    'section_view',
    'outbound_click',
    'contact_start',
    'contact_submit',
    'contact_error',
    'rage_click',
    'js_error',
    'web_vital',
] as const;

export type AnalyticsEventType = (typeof EVENT_TYPES)[number];

export type EventProps = Record<string, string | number | boolean | null>;

/** First-party cookie mirroring the localStorage visitor id, so either can restore the other. */
export const VISITOR_COOKIE = 'pv_vid';
/** Set when the admin signs in to /playground; every later hit from that browser is tagged as the owner. */
export const OWNER_COOKIE = 'pv_owner';

/** GA-style session rule: 30 minutes without an event starts a new session. */
export const SESSION_IDLE_MS = 30 * 60 * 1000;

/** Engaged time only accrues while the tab is visible and there was input in the last 30s. */
export const ENGAGEMENT_IDLE_MS = 30 * 1000;

export const OUTBOUND_TARGETS = ['github', 'linkedin', 'email', 'instagram', 'x', 'logicsprint', 'app_store', 'live_demo', 'other'] as const;
export type OutboundTarget = (typeof OUTBOUND_TARGETS)[number];

/** Outbound targets that signal hiring/contact interest (as opposed to curiosity clicks). */
export const INTENT_OUTBOUND: OutboundTarget[] = ['github', 'linkedin', 'email'];

/**
 * Per-session intent score. A contact message is the strongest signal; profile clicks
 * and case-study reads are supporting ones. Engaged time over a minute gets a small bonus.
 */
export const INTENT_WEIGHTS = {
    contact_submit: 8,
    intent_click: 3,
    detail_view: 1,
    engaged_minute: 2,
} as const;

export function classifyOutbound(hostname: string, protocol = 'https:'): OutboundTarget {
    if (protocol === 'mailto:') return 'email';
    const host = hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'github.com' || host.endsWith('.github.io')) return 'github';
    if (host.endsWith('linkedin.com') || host === 'lnkd.in') return 'linkedin';
    if (host.endsWith('instagram.com')) return 'instagram';
    if (host === 'x.com' || host === 'twitter.com') return 'x';
    if (host.startsWith('logicsprint.')) return 'logicsprint';
    if (host === 'apps.apple.com' || host === 'play.google.com') return 'app_store';
    if (host.endsWith('.vercel.app') || host.endsWith('.netlify.app') || host.endsWith('.onrender.com')) return 'live_demo';
    return 'other';
}

/** Canonical path for reporting: no query, hash, or trailing slash. */
export function normalizePath(path: string) {
    let clean = (path || '/').split(/[?#]/)[0] || '/';
    if (clean.length > 1) clean = clean.replace(/\/+$/, '');
    return clean.slice(0, 200) || '/';
}

/** Case-study style pages whose views count toward intent. */
export function isDetailPath(path: string) {
    return /^\/(projects|products|experience)\/[^/]+/.test(path);
}
