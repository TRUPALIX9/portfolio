'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';

/* Shared runtime for the gameplay "recordings": every loop runs only while its phone is on screen,
   the tab is visible and the visitor hasn't asked for reduced motion. With reduced motion a still
   frame shows. */

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReduced(onChange: () => void) {
    const mql = window.matchMedia(REDUCED_QUERY);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
}

function subscribeVisibility(onChange: () => void) {
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
}

export function useReducedMotion(): boolean {
    return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED_QUERY).matches, () => false);
}

function usePageVisible(): boolean {
    return useSyncExternalStore(subscribeVisibility, () => document.visibilityState !== 'hidden', () => true);
}

function useInView(ref: RefObject<Element | null>): boolean {
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === 'undefined') return;
        const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: '80px 0px' });
        io.observe(el);
        return () => io.disconnect();
    }, [ref]);
    return inView;
}

/** `active`: the loop may run. `reduced`: render a still frame and never animate. */
export function useDemoActive(ref: RefObject<Element | null>) {
    const reduced = useReducedMotion();
    const visible = usePageVisible();
    const inView = useInView(ref);
    return { active: inView && visible && !reduced, reduced };
}

/** Small, fast, seeded PRNG so every recording replays identically. */
export function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* ── Scripted DOM recordings ───────────────────────────────────────────────── */

/** One step of a recording: a state change and how long to hold it (ms). */
export type Beat<S> = [Partial<S>, number];

/**
 * Plays an endless `script` of beats while `active`; pausing keeps its place. With reduced motion
 * it returns `still`. `script` must be stable (a module-level generator function).
 */
export function useScript<S>(active: boolean, reduced: boolean, initial: S, still: S, script: () => Iterator<Beat<S>>): S {
    const [state, setState] = useState<S>(initial);
    const genRef = useRef<Iterator<Beat<S>> | null>(null);

    useEffect(() => {
        if (!active) return;
        const gen = (genRef.current ??= script());
        let id = 0;
        const tick = () => {
            const next = gen.next();
            if (next.done) return;
            const [patch, hold] = next.value;
            setState((s) => ({ ...s, ...patch }));
            id = window.setTimeout(tick, hold);
        };
        id = window.setTimeout(tick, 350);
        return () => window.clearTimeout(id);
    }, [active, script]);

    return reduced ? still : state;
}

/* ── Canvas recordings ─────────────────────────────────────────────────────── */

export type SceneFonts = { heading: string; mono: string };

/** A canvas recording. `resize` gets the canvas's on-screen size in CSS pixels (after the phone's scale). */
export type Scene = {
    resize(width: number, height: number): void;
    step(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
    /** Put the scene in its representative still state (reduced motion). */
    still?(): void;
};

type Controls = { apply(active: boolean, reduced: boolean): void };

/**
 * Runs a Scene on a canvas: backing store sized to the canvas's rendered size (so it stays crisp
 * inside the scaled phone), DPR-aware (capped at 2), rAF loop only while active.
 * `createScene` must be stable.
 */
export function useCanvasScene(
    canvasRef: RefObject<HTMLCanvasElement | null>,
    createScene: (fonts: SceneFonts) => Scene,
    active: boolean,
    reduced: boolean,
) {
    const controlsRef = useRef<Controls | null>(null);
    const modeRef = useRef({ active, reduced });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const style = getComputedStyle(canvas);
        const fonts: SceneFonts = {
            heading: style.getPropertyValue('--ls-font-heading').trim() || 'system-ui, sans-serif',
            mono: style.getPropertyValue('--ls-font-mono').trim() || 'ui-monospace, monospace',
        };
        const scene = createScene(fonts);
        let dpr = 1;
        let raf = 0;
        let sizeRaf = 0;
        let last = 0;
        let running = false;
        let isStill = false;

        const render = () => {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            scene.draw(ctx);
        };

        const resize = () => {
            // getBoundingClientRect includes the phone's transform: the size the canvas really shows at.
            const rect = canvas.getBoundingClientRect();
            if (rect.width < 1 || rect.height < 1) return;
            dpr = Math.min(2, window.devicePixelRatio || 1);
            canvas.width = Math.round(rect.width * dpr);
            canvas.height = Math.round(rect.height * dpr);
            scene.resize(rect.width, rect.height);
            if (isStill) scene.still?.();
            if (!running) render();
        };
        // The phone rescales in its own ResizeObserver; measure a frame later so its new scale is in.
        const queueResize = () => {
            cancelAnimationFrame(sizeRaf);
            sizeRaf = requestAnimationFrame(resize);
        };

        const frame = (now: number) => {
            const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
            last = now;
            scene.step(dt);
            render();
            raf = requestAnimationFrame(frame);
        };

        const controls: Controls = {
            apply(nextActive, nextReduced) {
                isStill = nextReduced;
                if (nextActive && !nextReduced) {
                    if (running) return;
                    running = true;
                    last = 0;
                    resize();
                    raf = requestAnimationFrame(frame);
                    return;
                }
                if (running) {
                    running = false;
                    cancelAnimationFrame(raf);
                }
                if (nextReduced) {
                    scene.still?.();
                    render();
                }
            },
        };
        controlsRef.current = controls;

        const ro = new ResizeObserver(queueResize);
        ro.observe(canvas);
        const phone = canvas.closest('.lsg-phone');
        if (phone) ro.observe(phone);
        resize();
        controls.apply(modeRef.current.active, modeRef.current.reduced);
        // Web fonts may land after the first still frame; draw it again once they do.
        document.fonts?.ready.then(() => {
            if (!running && controlsRef.current === controls) render();
        });

        return () => {
            running = false;
            cancelAnimationFrame(raf);
            cancelAnimationFrame(sizeRaf);
            ro.disconnect();
            controlsRef.current = null;
        };
    }, [canvasRef, createScene]);

    useEffect(() => {
        modeRef.current = { active, reduced };
        controlsRef.current?.apply(active, reduced);
    }, [active, reduced]);
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
