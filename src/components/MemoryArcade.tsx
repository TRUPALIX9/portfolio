"use client";

import { useCallback, useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import MemoryGame from './games/MemoryGame';
import { trackVisitorEvent } from '@/utils/visitor-analytics';

type LeaderboardEntry = {
    id: number;
    name: string;
    score: number;
    game: string;
    date: string;
};

const GAME_ID = 'pattern' as const;

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
    const [highScore, setHighScore] = useState(0);
    const [newHighCelebration, setNewHighCelebration] = useState<number | null>(null);
    const [isLoadingBoard, setIsLoadingBoard] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    const hasTrackedGameOpen = useRef(false);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const res  = await fetch('/api/leaderboard');
            const data = await res.json();
            const entries: LeaderboardEntry[] = Array.isArray(data) ? data : [];
            const memoryEntries = entries
                .filter(e => e.game === GAME_ID)
                .sort((a, b) => b.score - a.score);
            setLeaderboard(memoryEntries);
            setHighScore(memoryEntries[0]?.score ?? 0);
        } catch {
            setLeaderboard([]);
        } finally {
            setIsLoadingBoard(false);
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

    const handleFinished = useCallback(async () => {
        // MemoryGame already submits score internally; just refresh board
        const prevHigh = highScore;
        await fetchLeaderboard();
        // Check for new high after fetch
        setLeaderboard(prev => {
            const top = prev[0]?.score ?? 0;
            if (top > prevHigh) setNewHighCelebration(top);
            return prev;
        });
        void trackVisitorEvent({ event: 'run_complete', route, shareToken, source, game: GAME_ID });
    }, [highScore, fetchLeaderboard, route, shareToken, source]);

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-16">
            {/* Header: Single Title */}
            <motion.div
                initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-center mb-12 flex flex-col gap-3"
            >
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                    Can You Remember?
                </h1>
            </motion.div>
 
            {/* Game + Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 items-start relative z-10">
                {/* Game: Left Side */}
                <motion.div
                    initial={{ opacity: 0, x: reduceMotion ? 0 : -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.08 }}
                    className="w-full flex justify-center"
                    onClick={() => {
                        if (!hasTrackedGameOpen.current) {
                            hasTrackedGameOpen.current = true;
                            void trackVisitorEvent({ event: 'game_open', route, shareToken, source, game: GAME_ID });
                        }
                    }}
                >
                    <MemoryGame onFinished={handleFinished} highScore={highScore} standalone={standalone} />
                </motion.div>
 
                {/* Right Side Column */}
                <div className="flex flex-col gap-6 sticky top-24">
                    {/* Leaderboard panel */}
                    <motion.div
                        initial={{ opacity: 0, x: reduceMotion ? 0 : 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.14 }}
                        className="bg-neutral-900/[0.25] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl"
                    >
                    <div className="text-center">
                        <span className="text-[#4ADE80] font-bold text-xs uppercase tracking-[0.2em] mb-1 block">Hall of Fame</span>
                        <h2 className="text-xl font-bold text-white tracking-wide">Global Rankings</h2>
                    </div>
 
                    {isLoadingBoard ? (
                        <div className="py-8 text-center text-neutral-500 text-sm font-light">
                            Loading scores…
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-10 px-4 text-xs font-light text-neutral-500 border border-dashed border-white/20 rounded-2xl">
                            Be the first to set a score.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {leaderboard.slice(0, 10).map((entry, i) => (
                                <motion.div
                                    key={entry.id ?? `${entry.name}-${i}`}
                                    className="flex justify-between gap-4 items-center bg-white/[0.03] border border-white/[0.06] px-5 py-3.5 rounded-xl hover:bg-white/[0.08] transition-colors shadow-sm"
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                >
                                    <span className="text-sm font-medium tracking-wide flex gap-3 items-center text-white truncate pr-4">
                                        <span className={`text-[0.75rem] font-black min-w-[32px] md:min-w-[36px] h-7 px-2 rounded-lg flex-shrink-0 flex items-center justify-center bg-black/40 border ${
                                            i === 0 ? 'border-amber-400 text-amber-400' :
                                            i === 1 ? 'border-neutral-400 text-neutral-400' :
                                            i === 2 ? 'border-amber-700 text-amber-600' : 'border-white/5 text-neutral-500'
                                        }`}>
                                            {i + 1}
                                        </span>
                                        {entry.name}
                                    </span>
                                    <span className={`font-extrabold text-base ${i === 0 ? 'text-[#4ADE80]' : 'text-white'}`}>
                                        {entry.score}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    )}
 
                    {/* Date of last entry */}
                    {leaderboard[0] && (
                        <div className="mt-2 pt-4 border-t border-white/5 text-[0.7rem] text-neutral-500 text-center font-light">
                            Last score: {new Date(leaderboard[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    )}
                    </motion.div>

                    {/* How To Play Button */}
                    <motion.button
                        initial={{ opacity: 0, x: reduceMotion ? 0 : 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        onClick={() => setShowHelp(true)}
                        className="bg-neutral-900/[0.25] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 shadow-2xl flex items-center justify-between hover:bg-white/[0.05] transition-colors w-full text-left cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-white tracking-wide">How to play?</span>
                        </div>
                        <span className="text-white/50">→</span>
                    </motion.button>
                </div>
            </div>
        {/* HOW TO PLAY MODAL */}
            <AnimatePresence>
                {showHelp && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowHelp(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-neutral-900 border border-white/10 rounded-[2rem] p-7 md:p-10 max-w-md w-full shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setShowHelp(false)}
                                className="absolute top-5 right-5 md:top-6 md:right-6 w-9 h-9 flex items-center justify-center text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                ✕
                            </button>
                            
                            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-6 md:mb-8 text-left">How to Play</h3>
                            
                            <div className="flex flex-col gap-5 md:gap-6 text-[0.95rem] md:text-base text-neutral-300 text-left mb-8 md:mb-10">
                                <div className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm md:text-base mt-0.5 md:mt-0">1</span>
                                    <p className="leading-relaxed">Watch the tiles flash in a specific order.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm md:text-base mt-0.5 md:mt-0">2</span>
                                    <p className="leading-relaxed">Wait for the game board to glow <b className="text-emerald-400">GREEN</b>.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm md:text-base mt-0.5 md:mt-0">3</span>
                                    <p className="leading-relaxed">Tap the tiles in the <b>exact same sequence</b>.</p>
                                </div>
                            </div>

                            

                            <button 
                                onClick={() => setShowHelp(false)}
                                className="w-full h-14 bg-white hover:bg-neutral-200 text-black font-black text-sm md:text-base tracking-widest rounded-xl transition-colors"
                            >
                                GOT IT
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
