"use client";

import { useEffect } from 'react';

/**
 * One delegated, passive pointer listener for the whole page. It writes the pointer
 * position into `--mx` / `--my` on whichever `.spotlight` element is under the cursor;
 * the glow itself is pure CSS (see `.spotlight` in globals.css). Skipped on touch devices
 * and for users who prefer reduced motion.
 */
export default function SpotlightTracker() {
    useEffect(() => {
        if (window.matchMedia('(pointer: coarse)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let frame = 0;
        let pending: { el: HTMLElement; x: number; y: number } | null = null;

        const flush = () => {
            frame = 0;
            if (!pending) return;
            pending.el.style.setProperty('--mx', `${pending.x}px`);
            pending.el.style.setProperty('--my', `${pending.y}px`);
            pending = null;
        };

        const onMove = (e: PointerEvent) => {
            const el = (e.target as Element | null)?.closest?.('.spotlight') as HTMLElement | null;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            pending = { el, x: e.clientX - rect.left, y: e.clientY - rect.top };
            // Batch to one style write per frame
            if (!frame) frame = requestAnimationFrame(flush);
        };

        document.addEventListener('pointermove', onMove, { passive: true });
        return () => {
            document.removeEventListener('pointermove', onMove);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    return null;
}
