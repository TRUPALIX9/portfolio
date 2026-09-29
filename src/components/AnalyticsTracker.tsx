"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useReportWebVitals } from 'next/web-vitals';
import { analyticsEnabled, flush, newPageViewId, setCurrentPageViewId, track } from '@/utils/analytics/client';
import { ENGAGEMENT_IDLE_MS, classifyOutbound, normalizePath } from '@/utils/analytics/shared';

const MAX_ERRORS_PER_LOAD = 10;
/** The three Core Web Vitals; TTFB/FCP are noisy in dev and not used by the dashboard. */
const REPORTED_VITALS = new Set(['LCP', 'INP', 'CLS']);

/** Short, stable description of a clicked element for rage-click reports. */
function describeElement(el: Element | null) {
    if (!el) return 'unknown';
    const tag = el.tagName.toLowerCase();
    if (el.id) return `${tag}#${el.id}`;
    const label = el.getAttribute('aria-label') || (el.textContent || '').trim();
    return `${tag}${label ? `:"${label.slice(0, 40)}"` : ''}`;
}

/** Where on the page a link lives: explicit data attribute, else nav/footer/section id. */
function placementOf(el: Element) {
    const explicit = el.closest('[data-track-placement]')?.getAttribute('data-track-placement');
    if (explicit) return explicit;
    if (el.closest('nav, .mobile-menu-overlay')) return 'navbar';
    if (el.closest('footer')) return 'footer';
    return el.closest('[data-track-section]')?.getAttribute('data-track-section') || el.closest('section[id]')?.id || 'page';
}

/**
 * Site-wide visitor tracking: a page_view per route, engaged time and scroll depth per page,
 * home-section reach, outbound link clicks, rage clicks, JS errors, and Core Web Vitals.
 * Mounted once by SiteAnalytics.
 */
export default function AnalyticsTracker() {
    const pathname = usePathname();
    const prevPathRef = useRef('');
    const lastPageViewRef = useRef<{ path: string; pv: string; at: number } | null>(null);
    const vitalsSentRef = useRef(new Set<string>());

    useReportWebVitals((metric) => {
        if (!analyticsEnabled || !REPORTED_VITALS.has(metric.name)) return;
        const key = `${normalizePath(window.location.pathname)}:${metric.name}`;
        if (vitalsSentRef.current.has(key)) return;
        vitalsSentRef.current.add(key);
        track('web_vital', {
            name: metric.name,
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            rating: metric.rating,
        });
    });

    // One page view per route, with its own engagement clock.
    useEffect(() => {
        if (!analyticsEnabled) return;
        const path = normalizePath(pathname || '/');
        // React StrictMode (dev) remounts effects immediately; reuse that page view instead of logging two.
        const last = lastPageViewRef.current;
        const isRemount = last !== null && last.path === path && Date.now() - last.at < 1000;
        const pv = isRemount ? last.pv : newPageViewId();
        setCurrentPageViewId(pv);
        if (!isRemount) {
            track('page_view', { title: document.title.slice(0, 120), prev_path: prevPathRef.current || null }, { path, pv });
            prevPathRef.current = path;
            lastPageViewRef.current = { path, pv, at: Date.now() };
        }

        let activeMs = 0;
        let lastTick = Date.now();
        let lastInput = Date.now();
        let maxScroll = 0;
        let sentActiveMs = -1;
        let sentScroll = -1;

        const tick = () => {
            const now = Date.now();
            if (document.visibilityState === 'visible' && now - lastInput < ENGAGEMENT_IDLE_MS) {
                activeMs += Math.min(now - lastTick, 5000);
            }
            lastTick = now;
        };
        const onInput = () => {
            tick();
            lastInput = Date.now();
        };
        const measureScroll = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollable <= 0) return false;
            const pct = Math.round((window.scrollY / scrollable) * 100);
            if (pct > maxScroll) maxScroll = Math.min(100, pct);
            return true;
        };
        const onScroll = () => {
            onInput();
            measureScroll();
        };

        const sendEngagement = (beacon: boolean) => {
            tick();
            // A page that never needed scrolling was seen in full (checked late, once content has rendered).
            if (!measureScroll()) maxScroll = 100;
            if (activeMs === sentActiveMs && maxScroll === sentScroll) return;
            sentActiveMs = activeMs;
            sentScroll = maxScroll;
            // Cumulative per page view: the server keeps the max, so repeats and reordering are safe.
            track('page_engagement', { active_ms: activeMs, max_scroll: maxScroll }, { path, pv });
            if (beacon) flush(true);
        };

        const onVisibility = () => {
            if (document.visibilityState === 'hidden') sendEngagement(true);
            else {
                lastTick = Date.now();
                lastInput = Date.now();
            }
        };
        const onPageHide = () => sendEngagement(true);

        const interval = window.setInterval(tick, 1000);
        // Long reads on one page still report progress if the tab is killed without pagehide.
        const heartbeat = window.setInterval(() => sendEngagement(false), 60_000);

        // Home-section reach: a section counts once it fills half the viewport (or 35% of itself).
        const seenSections = new Set<string>();
        const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
            for (const entry of entries) {
                const section = entry.target.getAttribute('data-track-section');
                if (!section || seenSections.has(section) || !entry.isIntersecting) continue;
                const fillsViewport = entry.intersectionRect.height >= window.innerHeight * 0.5;
                if (entry.intersectionRatio >= 0.35 || fillsViewport) {
                    seenSections.add(section);
                    track('section_view', { section }, { path, pv });
                }
            }
        }, { threshold: [0, 0.2, 0.35, 0.5] });
        const observeTimer = window.setTimeout(() => {
            document.querySelectorAll('[data-track-section]').forEach((el) => observer?.observe(el));
        }, 300);

        const inputEvents = ['pointerdown', 'keydown', 'touchstart', 'mousemove', 'wheel'] as const;
        inputEvents.forEach((type) => window.addEventListener(type, onInput, { passive: true }));
        window.addEventListener('scroll', onScroll, { passive: true });
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('pagehide', onPageHide);

        return () => {
            sendEngagement(false);
            window.clearInterval(interval);
            window.clearInterval(heartbeat);
            window.clearTimeout(observeTimer);
            observer?.disconnect();
            inputEvents.forEach((type) => window.removeEventListener(type, onInput));
            window.removeEventListener('scroll', onScroll);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('pagehide', onPageHide);
        };
    }, [pathname]);

    // Page-independent listeners: outbound links, rage clicks, errors.
    useEffect(() => {
        if (!analyticsEnabled) return;
        let clicks: { x: number; y: number; t: number }[] = [];
        let errorCount = 0;
        const seenErrors = new Set<string>();

        const onClick = (event: MouseEvent) => {
            const target = event.target instanceof Element ? event.target : null;

            const now = Date.now();
            clicks = clicks.filter((c) => now - c.t < 1500);
            clicks.push({ x: event.clientX, y: event.clientY, t: now });
            if (clicks.length >= 4 && clicks.every((c) => Math.abs(c.x - clicks[0].x) < 40 && Math.abs(c.y - clicks[0].y) < 40)) {
                clicks = [];
                track('rage_click', { element: describeElement(target) });
            }

            const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
            if (!anchor) return;
            let url: URL;
            try {
                url = new URL(anchor.href, window.location.href);
            } catch {
                return;
            }
            const isMail = url.protocol === 'mailto:';
            const isExternal = /^https?:$/.test(url.protocol) && url.hostname !== window.location.hostname;
            if (!isMail && !isExternal) return;

            track('outbound_click', {
                target: classifyOutbound(url.hostname, url.protocol),
                // mailto addresses stay out of analytics; only the host+path of web links.
                url: isMail ? 'mailto' : `${url.hostname}${url.pathname}`.slice(0, 200),
                label: (anchor.getAttribute('aria-label') || anchor.textContent || '').trim().slice(0, 80),
                placement: placementOf(anchor),
            }, { immediate: true });
        };

        const reportError = (message: string) => {
            const clean = message.slice(0, 200);
            if (!clean || seenErrors.has(clean) || errorCount >= MAX_ERRORS_PER_LOAD) return;
            seenErrors.add(clean);
            errorCount += 1;
            track('js_error', { message: clean });
        };
        const onError = (event: ErrorEvent) => reportError(event.message || 'Script error');
        const onRejection = (event: PromiseRejectionEvent) => {
            const reason = event.reason;
            reportError(reason instanceof Error ? reason.message : String(reason ?? 'Unhandled rejection'));
        };

        // Capture phase, so the click is recorded before navigation or stopPropagation.
        document.addEventListener('click', onClick, true);
        window.addEventListener('error', onError);
        window.addEventListener('unhandledrejection', onRejection);
        return () => {
            document.removeEventListener('click', onClick, true);
            window.removeEventListener('error', onError);
            window.removeEventListener('unhandledrejection', onRejection);
        };
    }, []);

    return null;
}
