"use client";

import { useEffect, useRef, useState } from 'react';
import type { Artwork } from '@/utils/binge';

/**
 * Lazy artwork for the binge page. Each title asks /api/binge/poster once it scrolls near the
 * viewport; at most four requests run at a time, and answers are remembered for the session.
 */

const EMPTY: Artwork = { poster: null, posterLarge: null, backdrop: null, sourceId: null, year: null, genres: [] };
const STORE = 'bx-art-v1';
const mem = new Map<string, Artwork>();
const inflight = new Map<string, Promise<Artwork>>();
let active = 0;
const queue: (() => void)[] = [];

let hydrated = false;
function hydrate() {
    if (hydrated || typeof window === 'undefined') return;
    hydrated = true;
    try {
        const raw = sessionStorage.getItem(STORE);
        if (raw) for (const [k, v] of Object.entries(JSON.parse(raw) as Record<string, Artwork>)) mem.set(k, v);
    } catch {
        // storage unavailable
    }
}
let saveTimer: number | undefined;
function persist() {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
        try {
            sessionStorage.setItem(STORE, JSON.stringify(Object.fromEntries(mem)));
        } catch {
            // storage full or unavailable
        }
    }, 400);
}

function run<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        const start = () => {
            active++;
            task().then(resolve, reject).finally(() => {
                active--;
                queue.shift()?.();
            });
        };
        if (active < 4) start();
        else queue.push(start);
    });
}

export const artKey = (kind: 'series' | 'film', title: string, year: number | null) => `${kind}|${title.toLowerCase()}|${year ?? ''}`;

export function cachedArt(kind: 'series' | 'film', title: string, year: number | null) {
    hydrate();
    return mem.get(artKey(kind, title, year)) ?? null;
}

export function fetchArt(kind: 'series' | 'film', title: string, year: number | null): Promise<Artwork> {
    hydrate();
    const key = artKey(kind, title, year);
    const hit = mem.get(key);
    if (hit) return Promise.resolve(hit);
    const pending = inflight.get(key);
    if (pending) return pending;
    const qs = new URLSearchParams({ kind, title, ...(year ? { year: String(year) } : {}) });
    const p = run(async () => {
        try {
            const res = await fetch(`/api/binge/poster?${qs}`);
            if (!res.ok) return EMPTY;
            return (await res.json()) as Artwork;
        } catch {
            return EMPTY;
        }
    }).then((art) => {
        mem.set(key, art);
        inflight.delete(key);
        persist();
        return art;
    });
    inflight.set(key, p);
    return p;
}

/** Artwork for one title, fetched when the element comes near the viewport (or at once when `eager`). */
export function useArtwork<T extends HTMLElement>(kind: 'series' | 'film', title: string, year: number | null, opts: { skip?: boolean; eager?: boolean } = {}) {
    const ref = useRef<T>(null);
    // Start empty on both server and client (the cache lives in sessionStorage); fill in after mount.
    const [art, setArt] = useState<Artwork | null>(null);

    useEffect(() => {
        if (opts.skip || art) return;
        let cancelled = false;
        const load = () => fetchArt(kind, title, year).then((a) => { if (!cancelled) setArt(a); });
        if (opts.eager || cachedArt(kind, title, year) || typeof IntersectionObserver === 'undefined' || !ref.current) {
            load();
            return () => { cancelled = true; };
        }
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                io.disconnect();
                load();
            }
        }, { rootMargin: '400px 300px' });
        io.observe(ref.current);
        return () => {
            cancelled = true;
            io.disconnect();
        };
    }, [kind, title, year, opts.skip, opts.eager, art]);

    return { ref, art };
}

const ALLOWED = ['static.tvmaze.com', 'upload.wikimedia.org'];
/** Only hosts configured for next/image are rendered as real images. */
export function isAllowedImage(url: string | null | undefined): url is string {
    if (!url) return false;
    try {
        return ALLOWED.includes(new URL(url).hostname);
    } catch {
        return false;
    }
}
