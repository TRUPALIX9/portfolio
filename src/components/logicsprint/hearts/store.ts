'use client';

import { useSyncExternalStore } from 'react';

/**
 * Hidden-hearts easter egg state. Collected heart ids live in localStorage under `ls-hearts`
 * (a JSON array of ids). Every change dispatches a window event:
 *
 *   window.addEventListener('ls:hearts', (e) => e.detail) // { count: number, ids: HeartId[] }
 *
 * The hero listens for count === HEART_TOTAL to unlock its secret ship colour.
 */

export const HEART_IDS = ['hero', 'footer', 'privacy'] as const;
export type HeartId = (typeof HEART_IDS)[number];
export const HEART_TOTAL = HEART_IDS.length;
export const HEARTS_KEY = 'ls-hearts';
export const HEARTS_EVENT = 'ls:hearts';

export type HeartsDetail = { count: number; ids: HeartId[] };

const EMPTY: HeartId[] = [];
let cachedRaw: string | null = null;
let cachedIds: HeartId[] = EMPTY;

function readRaw(): string | null {
    try {
        return window.localStorage.getItem(HEARTS_KEY);
    } catch {
        return null;
    }
}

function parse(raw: string | null): HeartId[] {
    if (!raw) return EMPTY;
    try {
        const value: unknown = JSON.parse(raw);
        if (!Array.isArray(value)) return EMPTY;
        return HEART_IDS.filter((id) => value.includes(id));
    } catch {
        return EMPTY;
    }
}

/** Collected ids, referentially stable while storage is unchanged (useSyncExternalStore needs that). */
export function getCollected(): HeartId[] {
    if (typeof window === 'undefined') return EMPTY;
    const raw = readRaw();
    if (raw !== cachedRaw) {
        cachedRaw = raw;
        cachedIds = parse(raw);
    }
    return cachedIds;
}

// In-memory fallback so the egg still works for the page view when storage is blocked.
let memoryIds: HeartId[] | null = null;

/** Collects a heart. Returns the new detail, or null if it was already collected. */
export function collectHeart(id: HeartId): HeartsDetail | null {
    const current = memoryIds ?? getCollected();
    if (current.includes(id)) return null;
    const ids = HEART_IDS.filter((h) => h === id || current.includes(h));
    try {
        window.localStorage.setItem(HEARTS_KEY, JSON.stringify(ids));
        memoryIds = null;
    } catch {
        memoryIds = ids;
    }
    const detail: HeartsDetail = { count: ids.length, ids };
    window.dispatchEvent(new CustomEvent<HeartsDetail>(HEARTS_EVENT, { detail }));
    return detail;
}

function subscribe(onChange: () => void) {
    // Same-tab changes arrive as ls:hearts; other tabs as storage events.
    const onStorage = (e: StorageEvent) => {
        if (e.key === null || e.key === HEARTS_KEY) onChange();
    };
    window.addEventListener(HEARTS_EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
        window.removeEventListener(HEARTS_EVENT, onChange);
        window.removeEventListener('storage', onStorage);
    };
}

function snapshot(): HeartId[] {
    return memoryIds ?? getCollected();
}

/** Collected heart ids (empty during SSR and the first hydration pass). */
export function useCollectedHearts(): HeartId[] {
    return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

/** Number of hidden hearts found so far (0 to HEART_TOTAL). */
export function useHeartsCount(): number {
    return useCollectedHearts().length;
}
