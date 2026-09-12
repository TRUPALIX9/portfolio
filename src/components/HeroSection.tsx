"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import dynamic from 'next/dynamic';
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useMotionValueEvent,
    useTransform,
    type MotionValue,
} from 'framer-motion';
import { EASE_OUT } from '@/components/motion/Reveal';

const SpaceScene = dynamic(() => import('./space/SpaceScene'), { ssr: false });

/** Scroll length of the hero in viewport heights. Every timing below is a 0–1 fraction of it. */
const HERO_VH = 500;

interface HeroSectionProps {
    onScrollNext?: () => void;
}

function remap(v: number, inMin: number, inMax: number) {
    // Non-finite input (NaN from a 0-height viewport) would otherwise flow through Math.min/max.
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, Math.min(1, (v - inMin) / (inMax - inMin)));
}

/**
 * Maps a 0–1 progress value from [inMin, inMax] onto [from, to], clamped. A function transform on
 * purpose: given range arrays, framer hands opacity on a scroll value to a native ScrollTimeline
 * animation, which drifted back toward visible past the end of each fade.
 */
function useRange(value: MotionValue<number>, inMin: number, inMax: number, from: number, to: number) {
    return useTransform(value, (v: number) => from + (to - from) * remap(v, inMin, inMax));
}

/**
 * 0 → 1 as the hero's scroll track passes. Computed from scrollY against a cached track position
 * (no layout reads per scroll event), and re-synced on every way the page can land mid-scroll:
 * mount, the next frame, load, back/forward cache restores (pageshow) and resize. framer's
 * useScroll missed the browser's scroll restoration when coming Back to the page, which left the
 * full-screen hero panel covering the content.
 */
function useHeroProgress(ref: RefObject<HTMLElement | null>) {
    const progress = useMotionValue(0);

    useEffect(() => {
        let top = 0;
        let range = 1;
        const update = () => progress.set(Math.max(0, Math.min(1, (window.scrollY - top) / range)));
        const resync = () => {
            const el = ref.current;
            if (el) {
                top = el.getBoundingClientRect().top + window.scrollY;
                range = Math.max(1, el.offsetHeight - window.innerHeight);
            }
            update();
        };

        resync();
        const frame = requestAnimationFrame(resync);
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', resync, { passive: true });
        window.addEventListener('load', resync);
        window.addEventListener('pageshow', resync);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', resync);
            window.removeEventListener('load', resync);
            window.removeEventListener('pageshow', resync);
        };
    }, [ref, progress]);

    return progress;
}

const CHARS = "!<>-_\\/[]{}—=+*^?#_";
const SCRAMBLE_GLOW = 'drop-shadow(0 0 8px rgba(74,222,128,0.8))';

/**
 * FTW → WTF scramble, painted straight from the scroll progress: each change rewrites the
 * characters through refs, so scrolling never re-renders React.
 */
function ScrambleWord({ from, to, progress }: { from: string; to: string; progress: MotionValue<number> }) {
    const len = Math.max(from.length, to.length);
    const chars = useRef<(HTMLSpanElement | null)[]>([]);

    const paint = useCallback((value: number) => {
        chars.current.forEach((el, i) => {
            if (!el) return;
            const cp = remap(value, (i / len) * 0.5, (i / len) * 0.5 + 0.6);
            const scrambling = cp > 0 && cp < 1;
            el.textContent = cp <= 0 ? (from[i] ?? '') : cp >= 1 ? (to[i] ?? '') : CHARS[Math.floor(Math.random() * CHARS.length)];
            el.style.color = scrambling ? '#4ADE80' : '';
            el.style.filter = scrambling ? SCRAMBLE_GLOW : '';
        });
    }, [from, to, len]);

    useMotionValueEvent(progress, 'change', paint);
    useEffect(() => paint(progress.get()), [paint, progress]);

    return (
        <>
            {Array.from({ length: len }, (_, i) => (
                <span key={i} ref={(el) => { chars.current[i] = el; }}>{from[i] ?? ''}</span>
            ))}
        </>
    );
}

export default function HeroSection({ onScrollNext: _onScrollNext }: HeroSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);

    // 0 → 1 as the hero's scroll track passes; drives everything below without React renders.
    const p = useHeroProgress(sectionRef);

    // The only state scrolling touches, and each flips once per pass.
    const [active, setActive] = useState(true); // hero on screen: the 3D scene renders
    const [atTop, setAtTop] = useState(true);   // scroll cue visible
    useMotionValueEvent(p, 'change', (v) => {
        setActive(v < 1);
        setAtTop(v <= 0.02);
    });

    // Word drift distance, scaled down on smaller screens.
    const driftScale = useMotionValue(1);
    useEffect(() => {
        const onResize = () => driftScale.set(window.innerWidth < 640 ? 0.45 : window.innerWidth < 1024 ? 0.75 : 1);
        onResize();
        window.addEventListener('resize', onResize, { passive: true });
        return () => window.removeEventListener('resize', onResize);
    }, [driftScale]);

    const spaceScene = useMemo(() => <SpaceScene active={active} progress={p} />, [active, p]);

    // ── Mouse repel on the question text (first 200px of scroll only) ─────────
    // Runs a frame loop only while there's something to animate, and measures the
    // text once per wake-up instead of every frame.
    const textLayerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = textLayerRef.current;
        if (!el || window.matchMedia('(pointer: coarse)').matches) return;

        const mouse = { x: -1000, y: -1000 };
        const repel = { x: 0, y: 0 };
        let center = { x: 0, y: 0 };
        let frame = 0;

        const tick = () => {
            const scrollFactor = Math.max(0, 1 - window.scrollY / 200);
            const dx = center.x - mouse.x;
            const dy = center.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const pulling = scrollFactor > 0 && dist < 300;

            let targetX = 0;
            let targetY = 0;
            let ease = scrollFactor > 0 ? 0.1 : 0.2;
            if (pulling) {
                const force = Math.pow((300 - dist) / 300, 2);
                const angle = Math.atan2(dy, dx);
                targetX = Math.cos(angle) * force * 100 * scrollFactor;
                targetY = Math.sin(angle) * force * 100 * scrollFactor;
                ease = 0.15;
            }
            repel.x += (targetX - repel.x) * ease;
            repel.y += (targetY - repel.y) * ease;

            const settled = !pulling && Math.abs(repel.x) + Math.abs(repel.y) < 0.1;
            if (settled) repel.x = repel.y = 0;
            el.style.transform = `translate3d(${repel.x}px, ${repel.y}px, 0)`;
            frame = settled ? 0 : requestAnimationFrame(tick);
        };

        const wake = () => {
            if (frame) return;
            const rect = el.getBoundingClientRect();
            center = { x: rect.left + rect.width / 2 - repel.x, y: rect.top + rect.height / 2 - repel.y };
            frame = requestAnimationFrame(tick);
        };
        const onMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            if (window.scrollY < 200) wake();
        };
        const onScroll = () => {
            if (repel.x || repel.y) wake();
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(frame);
        };
    }, []);

    // ── Timing map ───────────────────────────────────────────────────────────

    // Phase 1: name fades 0→0.05
    const nameOpacity = useRange(p, 0, 0.05, 1, 0);

    // Phase 2: words drift OUT then BACK IN (0.05→0.55): driftT goes 0 → 1 → 0 (sine arc)
    const driftT = useTransform(p, (v) => Math.sin(remap(v, 0.05, 0.55) * Math.PI));
    const useDrift = (distance: number) =>
        useTransform([driftT, driftScale], ([t, scale]: number[]) => distance * scale * t);

    const soX = useDrift(-160);
    const soY = useDrift(-70);
    const soRotate = useTransform(driftT, (t) => -18 * t);

    const areX = useDrift(165);
    const areY = useDrift(85);
    const areRotate = useTransform(driftT, (t) => 12 * t);

    const wtfY = useDrift(-35);
    const wtfScale = useTransform(driftT, (t) => 1 + 0.06 * t);

    const engX = useDrift(-25);
    const engY = useDrift(45);

    const qX = useDrift(55);
    const qY = useDrift(-65);
    const qRotate = useTransform(driftT, (t) => 25 * t);

    // Phase 2 progress (0.05→0.45): scramble, word spacing, question mark
    const progressT = useRange(p, 0.05, 0.45, 0, 1);
    const questionScale = useRange(progressT, 0, 1, 0.3, 1);

    // The words open up to a 0.35em gap. A transform (not margin) keeps this off the layout path:
    // SO moves left and ARE moves right by the gap, exactly where the margins used to put them.
    const gapEm = useTransform(progressT, (t) => t * 0.35);
    const soTransform = useMotionTemplate`translate(calc(${soX}px - ${gapEm}em), ${soY}px) rotate(${soRotate}deg)`;
    const areTransform = useMotionTemplate`translate(calc(${areX}px + ${gapEm}em), ${areY}px) rotate(${areRotate}deg)`;

    // Phase 3–4: the question lifts away and fades (0.55→0.85) as the answer rises to center
    const questionY = useRange(p, 0.55, 0.75, 0, -320);
    const questionOpacity = useRange(p, 0.75, 0.85, 1, 0);
    const questionPointer = useTransform(questionOpacity, (o) => (o < 0.1 ? 'none' : 'auto'));

    const answerOpacity = useRange(p, 0.55, 0.65, 0, 1);
    // Rises from +320px to a staggered +120px (0.55→0.75), then settles at center (0.75→0.85).
    const answerY = useTransform(p, (v: number) => (v < 0.75 ? 320 - 200 * remap(v, 0.55, 0.75) : 120 - 120 * remap(v, 0.75, 0.85)));
    const answerPointer = useTransform(answerOpacity, (o) => (o > 0.3 ? 'auto' : 'none'));

    // Whole-panel exit (0.87→1.0); fully hidden once the hero has passed
    const panelOpacity = useRange(p, 0.87, 1, 1, 0);
    const panelVisibility = useTransform(p, (v) => (v >= 1 ? 'hidden' : 'visible'));
    const panelPointer = useTransform(panelOpacity, (o) => (o < 0.05 ? 'none' : 'auto'));

    const textSize = "text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-none";
    const answerText = {
        fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
        color: '#4ADE80',
        fontWeight: 800,
        lineHeight: 1.3,
        letterSpacing: '0.08em', // Wide cinematic tracking
        textTransform: 'uppercase',
    } as const;

    return (
        <>
            {/* Scroll track for the hero choreography; the visuals live in the fixed panel below. */}
            <section
                ref={sectionRef}
                id="hero"
                style={{ position: 'relative', height: `${HERO_VH}vh`, width: '100%' }}
            />

            <motion.div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 5,
                    overflow: 'hidden',
                    opacity: panelOpacity,
                    visibility: panelVisibility,
                    pointerEvents: panelPointer,
                }}
            >
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    {spaceScene}
                </div>

                <div style={{
                    position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent 40%, rgba(0,0,0,0.8))',
                }} />

                {/* ── QUESTION LAYER ──────────────────────────────────────── */}
                <motion.div style={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center',
                    padding: '0 1.5rem',
                    opacity: questionOpacity,
                    y: questionY,
                    pointerEvents: questionPointer,
                }}>
                    {/* NAME — the page's only h1. Entrance on the wrapper, scroll fade on the h1. */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: EASE_OUT }}
                        style={{ marginBottom: '1.25rem' }}
                    >
                        <motion.h1
                            style={{
                                opacity: nameOpacity,
                                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                                fontWeight: 800,
                                color: '#ffffff',
                                letterSpacing: '0.25em',
                                textTransform: 'uppercase',
                            }}
                        >
                            TRUPAL PATEL
                            <span className="sr-only"> — Software Engineer</span>
                        </motion.h1>
                    </motion.div>

                    {/* QUESTION TEXT */}
                    <div ref={textLayerRef} style={{ position: 'relative', willChange: 'transform' }}>
                        {/* Line 1: SO  WTF  ARE */}
                        {/* Note: Empty comments prevent JSX from inserting physical spaces */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.15, ease: EASE_OUT }}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'visible',
                                height: 'clamp(60px, 13vw, 140px)',
                            }}
                        >
                            <motion.span className={textSize} style={{
                                color: '#EDEDED', display: 'inline-block', whiteSpace: 'nowrap',
                                transform: soTransform,
                                transformOrigin: 'center center',
                                willChange: 'transform',
                            }}>SO</motion.span>{/*
                            */}<motion.span className={textSize} style={{
                                display: 'inline-block',
                                y: wtfY,
                                scale: wtfScale,
                                willChange: 'transform',
                            }}>
                                <ScrambleWord from="FTW" to="WTF" progress={progressT} />
                            </motion.span>{/*
                            */}<motion.span className={textSize} style={{
                                color: '#EDEDED', display: 'inline-block', whiteSpace: 'nowrap',
                                transform: areTransform,
                                transformOrigin: 'center center',
                                willChange: 'transform',
                            }}>ARE</motion.span>
                        </motion.div>

                        {/* Line 2: ENGINEER + ? */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.25, ease: EASE_OUT }}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'visible',
                                height: 'clamp(60px, 13vw, 140px)',
                                position: 'relative',
                            }}
                        >
                            <motion.span className={textSize} style={{
                                color: '#EDEDED', display: 'inline-block',
                                x: engX,
                                y: engY,
                                willChange: 'transform',
                            }}>ENGINEER</motion.span>{/*
                            */}<motion.span className={textSize} style={{
                                color: '#4ADE80',
                                filter: 'drop-shadow(0 0 16px rgba(74,222,128,0.7))',
                                display: 'inline-block',
                                opacity: progressT,
                                x: qX,
                                y: qY,
                                rotate: qRotate,
                                scale: questionScale,
                                transformOrigin: 'center center',
                                willChange: 'transform, opacity',
                            }}>?</motion.span>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ── ANSWER LAYER ───────────────────────────────────────── */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 11,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                }}>
                    <motion.div style={{
                        width: 'min(900px, calc(100vw - 2rem))',
                        textAlign: 'center',
                        opacity: answerOpacity,
                        y: answerY,
                        pointerEvents: answerPointer,
                    }}>
                        <p style={{ ...answerText, marginBottom: '2rem' }}>
                            Who doesn&apos;t just write code,<br />
                            but solves real-world problems.
                        </p>
                        <p style={answerText}>
                            Not just a developer. An engineer.
                        </p>
                    </motion.div>
                </div>

                {/* ── SCROLL CUE ─────────────────────────────────────────────
                    Decorative hint on the first screen only; fades out as soon as scrolling
                    starts. The travelling dot is a transform, so MotionConfig's
                    reducedMotion="user" holds it still for reduced-motion users. */}
                <motion.div
                    aria-hidden="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: atTop ? 1 : 0 }}
                    transition={{ duration: 0.5, delay: atTop ? 1.1 : 0 }}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 'max(2rem, env(safe-area-inset-bottom))',
                        zIndex: 12,
                        pointerEvents: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}
                >
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-2">Scroll</span>
                    <span className="relative block h-10 w-px overflow-hidden bg-white/15">
                        <motion.span
                            className="absolute left-0 top-0 block h-3 w-px bg-accent"
                            animate={{ y: [-12, 40] }}
                            transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.3 }}
                        />
                    </span>
                </motion.div>
            </motion.div>
        </>
    );
}
