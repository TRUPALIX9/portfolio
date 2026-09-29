"use client";

import {
    ANALYTICS_ENDPOINT,
    SESSION_IDLE_MS,
    VISITOR_COOKIE,
    normalizePath,
    type AnalyticsEventType,
    type EventProps,
} from './shared';

/**
 * Writes only happen in production builds, or in dev with NEXT_PUBLIC_ANALYTICS_DEV=1
 * (which the server routes to a separate dev database). Local browsing never pollutes real data.
 */
export const analyticsEnabled =
    process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ANALYTICS_DEV === '1';

const VISITOR_KEY = 'pv_vid';
const SESSION_KEY = 'pv_session';
const ID_PATTERN = /^[\w-]{8,64}$/;

type StoredSession = { id: string; last: number; source: string };

type QueuedEvent = {
    type: AnalyticsEventType;
    ts: number;
    path: string;
    pv?: string;
    props?: EventProps;
};

function createId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

// Storage can throw (private mode, blocked site data); fall back to in-memory values.
function storageGet(key: string) {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function storageSet(key: string, value: string) {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // Ignored: the in-memory copy still works for this page load.
    }
}

function readCookie(name: string) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
}

function writeCookie(name: string, value: string, maxAgeDays: number) {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeDays * 86400}; Path=/; SameSite=Lax${secure}`;
}

let visitorId = '';

export function getVisitorId() {
    if (typeof window === 'undefined') return '';
    if (visitorId) return visitorId;

    // In-app browsers (Instagram, LinkedIn) often clear one store but not the other.
    const stored = storageGet(VISITOR_KEY) || readCookie(VISITOR_COOKIE);
    visitorId = stored && ID_PATTERN.test(stored) ? stored : createId();
    storageSet(VISITOR_KEY, visitorId);
    writeCookie(VISITOR_COOKIE, visitorId, 400);
    return visitorId;
}

type LandingContext = {
    referrer: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    ref: string;
    /** Campaign/referrer fingerprint: a change starts a new session (GA rule). Empty for direct/internal. */
    source: string;
};

let landing: LandingContext | null = null;

function getLanding(): LandingContext {
    if (landing) return landing;
    const params = new URLSearchParams(window.location.search);
    const pick = (key: string) => (params.get(key) || '').slice(0, 100);
    let referrer = '';
    try {
        const ref = document.referrer ? new URL(document.referrer) : null;
        if (ref && ref.hostname !== window.location.hostname) referrer = document.referrer.slice(0, 300);
    } catch {
        referrer = '';
    }
    const utm_source = pick('utm_source');
    const utm_medium = pick('utm_medium');
    const utm_campaign = pick('utm_campaign');
    const ref = pick('ref');
    let referrerHost = '';
    try {
        referrerHost = referrer ? new URL(referrer).hostname : '';
    } catch {
        referrerHost = '';
    }
    const source = [utm_source, utm_campaign, ref].some(Boolean)
        ? `c:${utm_source}|${utm_campaign}|${ref}`
        : referrerHost ? `r:${referrerHost}` : '';
    landing = { referrer, utm_source, utm_medium, utm_campaign, ref, source };
    return landing;
}

let memorySession: StoredSession | null = null;

function readSession(): StoredSession | null {
    const raw = storageGet(SESSION_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw) as StoredSession;
            if (parsed && ID_PATTERN.test(parsed.id) && Number.isFinite(parsed.last)) return parsed;
        } catch {
            // Corrupt value: start a new session.
        }
    }
    return memorySession;
}

/** Shared by every tab (localStorage), renewed on activity, replaced after 30 idle minutes or a new campaign. */
export function getSessionId() {
    if (typeof window === 'undefined') return '';
    const now = Date.now();
    const { source } = getLanding();
    let session = readSession();

    if (!session || now - session.last > SESSION_IDLE_MS || (source && source !== session.source)) {
        session = { id: createId(), last: now, source };
    }
    session.last = now;
    memorySession = session;
    storageSet(SESSION_KEY, JSON.stringify(session));
    return session.id;
}

function getContext() {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const land = getLanding();
    return {
        referrer: land.referrer,
        utm_source: land.utm_source,
        utm_medium: land.utm_medium,
        utm_campaign: land.utm_campaign,
        ref: land.ref,
        lang: (navigator.language || '').slice(0, 20),
        tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || '').slice(0, 60),
        screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
        webdriver: navigator.webdriver === true,
        cores: navigator.hardwareConcurrency || 0,
        memory: nav.deviceMemory || 0,
    };
}

const queue: QueuedEvent[] = [];
let queueSessionId = '';
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let currentPageViewId = '';

export function setCurrentPageViewId(id: string) {
    currentPageViewId = id;
}

export function newPageViewId() {
    return createId();
}

/** Sends queued events. Use `beacon` when the page may be unloading. */
export function flush(beacon = false) {
    if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
    }
    while (queue.length) {
        const events = queue.splice(0, 50);
        const body = JSON.stringify({
            v: getVisitorId(),
            s: queueSessionId,
            sent: Date.now(),
            ctx: getContext(),
            events,
        });
        try {
            if (beacon && typeof navigator.sendBeacon === 'function') {
                navigator.sendBeacon(ANALYTICS_ENDPOINT, new Blob([body], { type: 'application/json' }));
            } else {
                void fetch(ANALYTICS_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body,
                    keepalive: true,
                }).catch(() => undefined);
            }
        } catch {
            // Analytics must never break the page.
        }
    }
}

/**
 * Queue an analytics event. Batches for ~1.5s; `path`/`pv` default to the current page,
 * and can be passed explicitly for events about a page that is being left.
 */
export function track(type: AnalyticsEventType, props?: EventProps, opts?: { path?: string; pv?: string; immediate?: boolean }) {
    if (!analyticsEnabled || typeof window === 'undefined') return;
    try {
        const sessionId = getSessionId();
        if (queue.length && sessionId !== queueSessionId) flush();
        queueSessionId = sessionId;

        queue.push({
            type,
            ts: Date.now(),
            path: normalizePath(opts?.path ?? window.location.pathname),
            pv: opts?.pv ?? (currentPageViewId || undefined),
            props,
        });

        if (opts?.immediate || queue.length >= 20) {
            flush(opts?.immediate);
        } else if (!flushTimer) {
            flushTimer = setTimeout(() => flush(), 1500);
        }
    } catch {
        // Analytics must never break the page.
    }
}

export function getAnalyticsIds() {
    if (typeof window === 'undefined') return { visitorId: '', sessionId: '' };
    try {
        return { visitorId: getVisitorId(), sessionId: getSessionId() };
    } catch {
        return { visitorId: '', sessionId: '' };
    }
}
