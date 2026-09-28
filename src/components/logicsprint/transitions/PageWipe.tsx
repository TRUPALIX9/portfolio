'use client';

import './transitions.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/** Pages on the product site that get the wipe between them (browser paths on logicsprint.*). */
const WIPE_PATHS = new Set(['/', '/privacy']);
const COVER_MS = 320; // panel sweeps in and covers the screen
const REVEAL_MS = 380; // panel sweeps out the other side
const MAX_WAIT_MS = 2500; // give up waiting for the route and reveal anyway

type Phase = 'idle' | 'cover' | 'covered' | 'reveal';

/**
 * Chamfered teal→blue wipe for client navigations between the LogicSprint home and privacy pages.
 *
 * Intercepts clicks on same-origin links (in the capture phase, so any next/link sees
 * defaultPrevented and skips its own navigation), sweeps the panel in, navigates with the router
 * once the screen is covered, and sweeps it out when the new pathname renders. Same-page hash links,
 * modified clicks, new-tab links and reduced motion all fall through to normal navigation.
 *
 * Not React's <ViewTransition>: that needs the experimental `viewTransition` flag in
 * next.config for the whole portfolio, and the wipe is an overlay, not a morph between snapshots.
 */
export default function PageWipe() {
    const router = useRouter();
    const pathname = usePathname();
    const [phase, setPhase] = useState<Phase>('idle');
    const phaseRef = useRef<Phase>('idle');
    const fromPath = useRef<string | null>(null);
    const timers = useRef<number[]>([]);

    const go = useCallback((next: Phase) => {
        phaseRef.current = next;
        setPhase(next);
    }, []);

    useEffect(() => {
        const later = (fn: () => void, ms: number) => {
            timers.current.push(window.setTimeout(fn, ms));
        };
        const clear = () => {
            timers.current.forEach((t) => window.clearTimeout(t));
            timers.current = [];
        };

        const onClick = (e: MouseEvent) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (phaseRef.current !== 'idle') return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const anchor = (e.target as Element | null)?.closest?.('a[href]');
            if (!(anchor instanceof HTMLAnchorElement)) return;
            if (!anchor.closest('.ls-root')) return;
            if ((anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;
            const url = new URL(anchor.href, window.location.href);
            if (url.origin !== window.location.origin) return;
            const from = window.location.pathname;
            if (url.pathname === from || !WIPE_PATHS.has(url.pathname) || !WIPE_PATHS.has(from)) return;

            e.preventDefault();
            clear();
            fromPath.current = from;
            go('cover');
            later(() => {
                go('covered');
                router.push(url.pathname + url.search + url.hash);
                later(() => {
                    if (phaseRef.current === 'covered') go('reveal');
                }, MAX_WAIT_MS);
            }, COVER_MS);
        };

        window.addEventListener('click', onClick, true);
        return () => {
            window.removeEventListener('click', onClick, true);
            clear();
        };
    }, [router, go]);

    // New route rendered under the panel: sweep it away.
    useEffect(() => {
        if (phaseRef.current === 'covered' && window.location.pathname !== fromPath.current) {
            // One frame so the new page paints (and scrolls) before the reveal starts.
            const raf = requestAnimationFrame(() => go('reveal'));
            return () => cancelAnimationFrame(raf);
        }
    }, [pathname, go]);

    useEffect(() => {
        if (phase !== 'reveal') return;
        const t = window.setTimeout(() => go('idle'), REVEAL_MS);
        return () => window.clearTimeout(t);
    }, [phase, go]);

    if (phase === 'idle') return null;
    return (
        <div className="lst-wipe" data-phase={phase} aria-hidden="true">
            <div className="lst-panel">
                <span className="lst-mark ls-heading">
                    Logic<span>Sprint</span>
                </span>
            </div>
        </div>
    );
}
