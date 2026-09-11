"use client";

import { useCallback, useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import MemoryGame from './games/MemoryGame';
import { EASE_OUT } from '@/components/motion/Reveal';
import { trackVisitorEvent } from '@/utils/visitor-analytics';

type LeaderboardEntry = {
    id: number;
    name: string;
    score: number;
    game: string;
    date: string;
};

const GAME_ID = 'pattern' as const;

function formatEntryDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MemoryArcade({
    standalone = false,
    route = '/game',
    shareToken,
    source,
}: {
    standalone?: boolean;
    route?: string;
    shareToken?: string;
    source?: string;
}) {
    const reduceMotion = useReducedMotion();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [newHighCelebration, setNewHighCelebration] = useState<number | null>(null);
    const [isLoadingBoard, setIsLoadingBoard] = useState(true);
    const [boardError, setBoardError] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const hasTrackedGameOpen = useRef(false);
    const highScoreRef = useRef(0);
    const helpTriggerRef = useRef<HTMLButtonElement>(null);
    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const res = await fetch('/api/leaderboard');
            if (!res.ok) throw new Error(`Leaderboard request failed (${res.status})`);
            const data = await res.json();
            const entries: LeaderboardEntry[] = Array.isArray(data) ? data : [];
            const memoryEntries = entries
                .filter(e => e.game === GAME_ID)
                .sort((a, b) => b.score - a.score);
            if (!mountedRef.current) return;
            setLeaderboard(memoryEntries);
            setBoardError(false);
            highScoreRef.current = memoryEntries[0]?.score ?? 0;
        } catch {
            // Keep whatever we already have on screen; only surface the error.
            if (mountedRef.current) setBoardError(true);
        } finally {
            if (mountedRef.current) setIsLoadingBoard(false);
        }
    }, []);

    useEffect(() => {
        void fetchLeaderboard();
        void trackVisitorEvent({ event: 'page_view', route, shareToken, source });
    }, [fetchLeaderboard, route, shareToken, source]);

    // Clear celebration after 2.4s
    useEffect(() => {
        if (newHighCelebration === null) return;
        const id = window.setTimeout(() => setNewHighCelebration(null), 2400);
        return () => window.clearTimeout(id);
    }, [newHighCelebration]);

    // How-to-play modal: close (on Escape too) and hand focus back to the trigger.
    const closeHelp = useCallback(() => {
        setShowHelp(false);
        helpTriggerRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!showHelp) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeHelp();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showHelp, closeHelp]);

    const handleFinished = useCallback(async (score: number) => {
        // MemoryGame already submitted the score; record the run and refresh the board.
        void trackVisitorEvent({ event: 'run_complete', route, shareToken, source, game: GAME_ID, score });
        const prevHigh = highScoreRef.current;
        await fetchLeaderboard();
        if (score > 0 && score > prevHigh && mountedRef.current) setNewHighCelebration(score);
    }, [fetchLeaderboard, route, shareToken, source]);

    const lastScoreDate = leaderboard.reduce<string | null>((latest, entry) => {
        if (!entry.date) return latest;
        if (!latest) return entry.date;
        return new Date(entry.date).getTime() > new Date(latest).getTime() ? entry.date : latest;
    }, null);
    const lastScoreLabel = lastScoreDate ? formatEntryDate(lastScoreDate) : null;

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-16">
            {/* Header: Single Title */}
            <motion.div
                initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
                className="text-center mb-12 flex flex-col gap-3"
            >
                <h1 className="text-4xl md:text-5xl font-extrabold text-ink-1 tracking-tight leading-tight">
                    Can You Remember?
                </h1>
            </motion.div>

            {/* Game + Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 items-start relative z-10">
                {/* Game: Left Side */}
                <motion.div
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.08, ease: EASE_OUT }}
                    className="w-full min-w-0 flex justify-center"
                    onClick={() => {
                        if (!hasTrackedGameOpen.current) {
                            hasTrackedGameOpen.current = true;
                            void trackVisitorEvent({ event: 'game_open', route, shareToken, source, game: GAME_ID });
                        }
                    }}
                >
                    <MemoryGame onFinished={handleFinished} standalone={standalone} />
                </motion.div>

                {/* Right Side Column */}
                <div className="flex flex-col gap-4 min-w-0 lg:sticky lg:top-24">
                    {/* Leaderboard panel */}
                    <motion.section
                        aria-labelledby="memory-leaderboard-heading"
                        initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.14, ease: EASE_OUT }}
                        className="card bg-surface-1 rounded-3xl p-5 md:p-6 flex flex-col gap-5"
                    >
                    <div className="text-center flex flex-col gap-1.5">
                        <span className="eyebrow">Hall of Fame</span>
                        <h2 id="memory-leaderboard-heading" className="text-xl font-bold text-ink-1 tracking-tight">Global Rankings</h2>
                    </div>

                    <div role="status" aria-live="polite">
                        <AnimatePresence>
                            {newHighCelebration !== null && (
                                <motion.p
                                    initial={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25, ease: EASE_OUT }}
                                    className="text-center text-xs font-black uppercase tracking-widest text-accent border border-accent/30 bg-accent/10 rounded-xl py-2.5 tabular-nums"
                                >
                                    New high score: {newHighCelebration}!
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {isLoadingBoard ? (
                        <div role="status" className="py-8 text-center text-ink-3 text-sm">
                            Loading scores…
                        </div>
                    ) : boardError && leaderboard.length === 0 ? (
                        <div role="alert" className="text-center py-8 px-4 text-sm text-ink-2 border border-dashed border-line-2 rounded-2xl flex flex-col items-center gap-3">
                            Couldn&apos;t load the rankings.
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoadingBoard(true);
                                    void fetchLeaderboard();
                                }}
                                className="text-ink-1 font-bold underline underline-offset-4 decoration-line-2 hover:decoration-accent transition-colors duration-150"
                            >
                                Try again
                            </button>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-10 px-4 text-sm text-ink-3 border border-dashed border-line-2 rounded-2xl">
                            Be the first to set a score.
                        </div>
                    ) : (
                        <ol className="flex flex-col gap-2" aria-label="Top 10 scores">
                            {leaderboard.slice(0, 10).map((entry, i) => {
                                const isPodium = i < 3;
                                return (
                                    <motion.li
                                        key={entry.id ?? `${entry.name}-${i}`}
                                        className={`flex justify-between gap-3 items-center border px-3.5 md:px-4 py-3 rounded-xl transition-colors duration-150 ${
                                            isPodium
                                                ? 'bg-surface-3 border-line-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-accent/30'
                                                : 'bg-surface-2 border-line-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:bg-surface-3 hover:border-line-2'
                                        }`}
                                        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.35, ease: EASE_OUT, delay: reduceMotion ? 0 : i * 0.04 }}
                                    >
                                        <span className="text-sm tracking-wide flex gap-3 items-center min-w-0">
                                            <span className={`text-xs tabular-nums min-w-[32px] h-7 px-2 rounded-lg flex-shrink-0 flex items-center justify-center border ${
                                                isPodium
                                                    ? 'bg-accent/10 border-accent/35 text-accent font-black'
                                                    : 'bg-surface-1 border-line-1 text-ink-3 font-bold'
                                            }`}>
                                                {i + 1}
                                            </span>
                                            <span
                                                className={`truncate ${isPodium ? 'text-ink-1 font-semibold' : 'text-ink-2 font-medium'}`}
                                                title={entry.name}
                                            >
                                                {entry.name}
                                            </span>
                                        </span>
                                        <span className={`tabular-nums text-base flex-shrink-0 ${
                                            i === 0 ? 'text-accent font-extrabold' : isPodium ? 'text-ink-1 font-extrabold' : 'text-ink-2 font-bold'
                                        }`}>
                                            {entry.score}
                                        </span>
                                    </motion.li>
                                );
                            })}
                        </ol>
                    )}

                    {/* Most recent entry date */}
                    {lastScoreLabel && (
                        <div className="pt-4 border-t border-line-1 text-xs text-ink-3 text-center">
                            Last score: {lastScoreLabel}
                        </div>
                    )}
                    </motion.section>

                    {/* How To Play Button — motion lives on the wrapper so .card-interactive's hover lift isn't overridden */}
                    <motion.div
                        initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
                    >
                        <button
                            ref={helpTriggerRef}
                            type="button"
                            aria-haspopup="dialog"
                            onClick={() => setShowHelp(true)}
                            className="group card card-interactive rounded-2xl p-4 flex items-center justify-between w-full text-left cursor-pointer"
                        >
                            <span className="text-sm font-bold text-ink-1 tracking-wide">How to play?</span>
                            <span
                                className="text-ink-3 transition-[color,transform] duration-200 ease-out-expo group-hover:text-accent group-hover:translate-x-0.5"
                                aria-hidden="true"
                            >
                                →
                            </span>
                        </button>
                    </motion.div>
                </div>
            </div>
        {/* HOW TO PLAY MODAL */}
            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm"
                        onClick={closeHelp}
                    >
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="memory-help-title"
                            initial={{ scale: reduceMotion ? 1 : 0.98, opacity: 0, y: reduceMotion ? 0 : 12 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: reduceMotion ? 1 : 0.98, opacity: 0, y: reduceMotion ? 0 : 12 }}
                            transition={{ duration: 0.25, ease: EASE_OUT }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-surface-2 border border-line-2 rounded-2xl max-w-sm w-full shadow-[var(--shadow-raised)] mx-auto overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-6 pt-6 pb-4 border-b border-line-1">
                                <h3 id="memory-help-title" className="text-xl font-extrabold text-ink-1 text-center tracking-tight">How to Play</h3>
                            </div>

                            {/* Steps */}
                            <ol className="px-6 py-5 flex flex-col gap-4 text-sm text-ink-2">
                                {[
                                    "Watch the tiles flash in a specific order.",
                                    <>Wait for the game board to glow <b className="text-accent">GREEN</b>.</>,
                                    <>Tap the tiles in the <b className="text-ink-1">exact same sequence</b>.</>
                                ].map((text, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span aria-hidden="true" className="flex-shrink-0 w-7 h-7 rounded-full bg-surface-3 border border-line-2 text-ink-1 flex items-center justify-center font-bold text-xs mt-0.5 tabular-nums">{i + 1}</span>
                                        <p className="leading-relaxed pt-0.5">{text}</p>
                                    </li>
                                ))}
                            </ol>

                            {/* Button */}
                            <div className="px-6 pb-6">
                                <button
                                    type="button"
                                    autoFocus
                                    onClick={closeHelp}
                                    className="w-full h-12 bg-white hover:bg-neutral-200 text-black font-black text-sm tracking-widest rounded-xl transition-colors duration-150"
                                >
                                    GOT IT
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
