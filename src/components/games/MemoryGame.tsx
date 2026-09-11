"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getSavedArcadePlayerName, saveArcadePlayerName, submitArcadeScore } from '@/utils/arcade-player';
import { EASE_OUT } from '@/components/motion/Reveal';

const TILE_COUNT = 9;
const GAME_ID = 'pattern';

const randomTile = () => Math.floor(Math.random() * TILE_COUNT);

// Only called from event handlers / client-only overlays, never during the SSR/hydration pass.
const isTouchDevice = () =>
    typeof window !== 'undefined' && (window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);

export default function MemoryGame({ onFinished, standalone = false }: { onFinished: (score: number) => void; standalone?: boolean }) {
    const timeoutsRef = useRef<number[]>([]);
    const sequenceRef = useRef<number[]>([]);
    const inputIndexRef = useRef(0);
    const canInputRef = useRef(false);
    const playingRef = useRef(false);
    const scoreRef = useRef(0);
    const roundTokenRef = useRef(0);
    const mountedRef = useRef(false);
    const submittingRef = useRef(false);

    const [score, setScore] = useState(0);

    const [phaseLabel, setPhaseLabel] = useState('READY');
    const [statusText, setStatusText] = useState('Press start to begin. Watch the tiles closely.');
    const [activeTile, setActiveTile] = useState<number | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [playing, setPlaying] = useState(false);
    // The name is only rendered inside the game-over overlay (never server-rendered), so reading storage here is hydration-safe.
    const [name, setName] = useState(() => getSavedArcadePlayerName().toUpperCase());
    const [nameError, setNameError] = useState(false);
    const [submitError, setSubmitError] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const reduceMotion = useReducedMotion();
    const router = useRouter();

    useEffect(() => {
        mountedRef.current = true;
        const timeouts = timeoutsRef;
        return () => {
            // Same as stopGameLoop(), inlined so the unmount cleanup only touches refs.
            mountedRef.current = false;
            timeouts.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
            timeouts.current = [];
            playingRef.current = false;
            canInputRef.current = false;
        };
    }, []);

    const updateName = (val: string) => {
        setName(val);
        setNameError(false);
        saveArcadePlayerName(val);
    };

    const clearQueuedTimeouts = () => {
        timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
        timeoutsRef.current = [];
    };

    const queueTimeout = (callback: () => void, delay: number) => {
        const timeoutId = window.setTimeout(callback, delay);
        timeoutsRef.current.push(timeoutId);
    };

    const stopGameLoop = () => {
        clearQueuedTimeouts();
        playingRef.current = false;
        canInputRef.current = false;
    };

    const pulseTile = (tileId: number, duration = 180) => {
        setActiveTile(tileId);
        queueTimeout(() => {
            setActiveTile((current) => (current === tileId ? null : current));
        }, duration);
    };

    const endGame = (phase: string, message: string) => {
        stopGameLoop();
        setPhaseLabel(phase);
        setStatusText(message);
        setPlaying(false);
        setGameOver(true);
        setActiveTile(null);
    };

    const beginRound = () => {
        clearQueuedTimeouts();
        roundTokenRef.current += 1;
        const token = roundTokenRef.current;
        const nextSequence = [...sequenceRef.current, randomTile()];
        sequenceRef.current = nextSequence;
        inputIndexRef.current = 0;
        canInputRef.current = false;

        setPhaseLabel('WATCH');
        setStatusText('Remember the flashing sequence...');
        setActiveTile(null);

        const flashDuration = Math.max(260, 500 - nextSequence.length * 16);
        let delay = 360;

        nextSequence.forEach((tileId) => {
            queueTimeout(() => {
                if (!playingRef.current || token !== roundTokenRef.current) return;
                setActiveTile(tileId);
            }, delay);
            delay += flashDuration;

            queueTimeout(() => {
                if (!playingRef.current || token !== roundTokenRef.current) return;
                setActiveTile(null);
            }, delay - 120);

            delay += 120;
        });

        queueTimeout(() => {
            if (!playingRef.current || token !== roundTokenRef.current) return;
            canInputRef.current = true;
            setPhaseLabel('REPEAT');
            setStatusText(isTouchDevice() ? 'Tap the tiles in the exact order.' : 'Click the tiles in the exact order.');
        }, delay + 100);
    };

    const startGame = () => {
        stopGameLoop();
        sequenceRef.current = [];
        inputIndexRef.current = 0;
        scoreRef.current = 0;
        submittingRef.current = false;
        playingRef.current = true;
        canInputRef.current = false;
        setScore(0);

        setGameOver(false);
        setPlaying(true);
        setIsSubmitting(false);
        setSubmitError(false);
        setNameError(false);
        setActiveTile(null);
        beginRound();
    };

    const handleTilePress = (tileId: number) => {
        if (!playingRef.current || !canInputRef.current) return;

        pulseTile(tileId);
        const expectedTile = sequenceRef.current[inputIndexRef.current];

        if (tileId !== expectedTile) {
            setPhaseLabel('GAME OVER');
            setStatusText('Wrong tile! Sequence broken.');
            canInputRef.current = false;
            queueTimeout(() => endGame('GAME OVER', 'Wrong tile! Sequence broken.'), 220);
            return;
        }

        inputIndexRef.current += 1;

        if (inputIndexRef.current === sequenceRef.current.length) {
            canInputRef.current = false;
            const nextScore = scoreRef.current + 1;
            scoreRef.current = nextScore;
            setScore(nextScore);
            setPhaseLabel('SUCCESS');
            setStatusText('Correct! Adding another tile...');
            queueTimeout(() => {
                if (!playingRef.current) return;
                beginRound();
            }, 650);
        }
    };

    // Saves the finished run once. Stays in the submitting state on success so the
    // buttons can't fire a duplicate POST before navigation/restart takes over.
    const saveScore = async () => {
        if (submittingRef.current) return false;
        const trimmedName = name.trim();
        if (!trimmedName) {
            setNameError(true);
            return false;
        }
        submittingRef.current = true;
        setIsSubmitting(true);
        setSubmitError(false);
        try {
            const finalScore = scoreRef.current;
            await submitArcadeScore(trimmedName, finalScore, GAME_ID);
            onFinished(finalScore);
            return true;
        } catch {
            submittingRef.current = false;
            if (mountedRef.current) {
                setIsSubmitting(false);
                setSubmitError(true);
            }
            return false;
        }
    };

    const submit = async () => {
        if (await saveScore()) router.push('/');
    };

    const retry = async () => {
        if (submittingRef.current) return;
        // After a failed save, a second press restarts without saving so the player is never stuck.
        if (submitError) {
            startGame();
            return;
        }
        if ((await saveScore()) && mountedRef.current) startGame();
    };

    return (
        <div className="card w-full max-w-[420px] mx-auto rounded-3xl p-4 sm:p-6 flex flex-col gap-5 md:gap-6 relative">
            {/* HUD Status Bar & Instructions */}
            <div className="flex flex-col items-center justify-center border-b border-line-1 pb-5 gap-3">
                {/* Score */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink-3">Current Score</span>
                    <span className="text-3xl md:text-4xl font-black text-ink-1 leading-none tabular-nums">{score}</span>
                </div>

                {/* Instructions */}
                <div role="status" aria-live="polite" aria-atomic="true" className="flex flex-col items-center text-center gap-1">
                    <span className={`text-xs font-black uppercase tracking-[0.18em] transition-colors duration-200 ${
                        phaseLabel === 'WATCH' ? 'text-red-400' :
                        (phaseLabel === 'REPEAT' || phaseLabel === 'SUCCESS') ? 'text-accent' :
                        phaseLabel === 'GAME OVER' ? 'text-red-400' : 'text-ink-3'
                    }`}>
                        {phaseLabel}
                    </span>
                    <p className={`text-xs md:text-sm font-semibold leading-snug transition-colors duration-200 ${
                        phaseLabel === 'WATCH' ? 'text-red-400' :
                        phaseLabel === 'REPEAT' ? 'text-accent' : 'text-ink-2'
                    }`}>
                        {statusText}
                    </p>
                </div>
            </div>

            {/* Game Grid Container */}
            <motion.div
                animate={phaseLabel === 'GAME OVER' && !reduceMotion ? { x: [-8, 8, -6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`relative aspect-square w-full rounded-2xl p-4 md:p-6 flex items-center justify-center border-2 transition-[background-color,border-color,box-shadow] duration-250 ease-out-expo ${
                phaseLabel === 'WATCH'
                    ? 'bg-surface-0 border-red-500/60 shadow-[inset_0_2px_20px_rgba(0,0,0,0.9),0_0_40px_rgba(239,68,68,0.15)]'
                    : phaseLabel === 'REPEAT'
                    ? 'bg-surface-0 border-accent/60 shadow-[inset_0_2px_20px_rgba(0,0,0,0.9),0_0_40px_rgba(74,222,128,0.15)]'
                    : phaseLabel === 'SUCCESS'
                    ? 'bg-accent/15 border-accent shadow-[inset_0_2px_20px_rgba(0,0,0,0.6),0_0_48px_rgba(74,222,128,0.3)]'
                    : phaseLabel === 'GAME OVER'
                    ? 'bg-red-900/30 border-red-500 shadow-[inset_0_2px_20px_rgba(0,0,0,0.6),0_0_48px_rgba(220,38,38,0.3)]'
                    : 'bg-surface-0 border-line-1 shadow-[inset_0_2px_20px_rgba(0,0,0,0.9)]'
            }`}>
                {/* 3x3 Tile Grid: raised keys that light up white when flashed or pressed */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full h-full max-w-[280px] max-h-[280px]">
                    {Array.from({ length: TILE_COUNT }).map((_, tileId) => {
                        const isActive = activeTile === tileId;

                        return (
                            <button
                                key={tileId}
                                type="button"
                                onClick={() => handleTilePress(tileId)}
                                disabled={!playing}
                                aria-label={`Memory tile ${tileId + 1}`}
                                className={`aspect-square rounded-xl border relative touch-manipulation select-none outline-none transition-[background-color,border-color,box-shadow,transform] duration-75 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                                    isActive
                                    ? '!bg-ink-1 border-white z-10 scale-[1.03] shadow-[0_0_0_1px_rgba(255,255,255,0.6),0_0_28px_rgba(255,255,255,0.55),inset_0_-3px_0_rgba(0,0,0,0.12)]'
                                    : 'bg-surface-3 border-line-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-3px_0_rgba(0,0,0,0.45),0_6px_14px_-8px_rgba(0,0,0,0.9)] hover:bg-white/[0.12] hover:border-white/25 active:translate-y-px active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] disabled:pointer-events-none'
                                }`}
                            >
                            </button>
                        );
                    })}
                </div>

                {/* START SCREEN OVERLAY */}
                {!playing && !gameOver && (
                    <div className="absolute inset-0 backdrop-blur-md bg-black/80 flex flex-col items-center justify-center p-4 text-center rounded-2xl z-20 overflow-hidden">
                        <h3 className="text-lg md:text-xl font-extrabold text-ink-1 mb-1 md:mb-2">Memory Test</h3>
                        <p className="text-ink-2 text-xs md:text-sm font-medium leading-relaxed max-w-[220px] mb-6">
                            Memorize the pattern. Tap it back.
                        </p>
                        <button
                            type="button"
                            onClick={startGame}
                            className="h-12 md:h-14 font-black tracking-widest rounded-xl text-sm md:text-base w-full max-w-[180px] transition-[transform,box-shadow] duration-200 ease-out-expo shadow-[0_8px_24px_-12px_rgba(255,255,255,0.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(255,255,255,0.45)] active:translate-y-0"
                            style={{ backgroundColor: '#ffffff', color: '#000000' }}
                        >
                            START
                        </button>
                    </div>
                )}

                {/* GAME OVER OVERLAY */}
                <AnimatePresence>
                {gameOver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: EASE_OUT }}
                        className="absolute inset-0 backdrop-blur-lg bg-red-950/90 flex flex-col items-center justify-center p-4 text-center rounded-2xl z-20 overflow-hidden"
                    >
                        <motion.h3
                            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.35, ease: EASE_OUT }}
                            className="text-3xl md:text-4xl font-black text-red-400 mb-2 tracking-widest uppercase drop-shadow-[0_0_16px_rgba(239,68,68,0.45)]"
                        >
                            FAILED
                        </motion.h3>
                        <p className="text-ink-2 text-sm font-bold tracking-widest uppercase mb-4 tabular-nums">
                            Score: {score}
                        </p>

                        <motion.div
                            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.18, duration: 0.35, ease: EASE_OUT }}
                            className="flex flex-col gap-3 w-full max-w-[240px]"
                        >
                            <input
                                value={name.toUpperCase()}
                                onChange={(e) => updateName(e.target.value.toUpperCase())}
                                placeholder="ENTER NAME"
                                aria-label="Player name"
                                aria-invalid={nameError}
                                aria-describedby={nameError || submitError ? 'memory-game-save-message' : undefined}
                                autoComplete="nickname"
                                autoFocus={!isTouchDevice()}
                                spellCheck={false}
                                maxLength={10}
                                className={`w-full h-10 md:h-12 px-4 rounded-xl bg-black/60 border ${nameError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/20 focus:border-white/50'} text-ink-1 text-center font-bold tracking-widest text-base sm:text-sm outline-none focus:ring-2 focus:ring-white/20 uppercase placeholder:text-ink-3 transition-[border-color,box-shadow] duration-150 shadow-inner`}
                            />

                            {(nameError || submitError) && (
                                <p id="memory-game-save-message" role="alert" className="text-xs font-bold text-red-300 leading-snug">
                                    {nameError ? 'Enter a name to save your score.' : "Couldn't save your score. Please try again."}
                                </p>
                            )}

                            <div className={`grid ${standalone ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mt-1`}>
                                {!standalone && (
                                    <button
                                        type="button"
                                        onClick={submit}
                                        disabled={isSubmitting}
                                        className={`h-10 md:h-11 text-xs md:text-sm font-bold rounded-xl transition-[transform,opacity,box-shadow] duration-200 ease-out-expo flex items-center justify-center shadow-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 cursor-pointer'}`}
                                        style={{ backgroundColor: '#ffffff', color: '#000000' }}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Exit'}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={retry}
                                    disabled={isSubmitting}
                                    className={`h-10 md:h-11 text-xs md:text-sm font-bold rounded-xl transition-[transform,opacity,box-shadow] duration-200 ease-out-expo flex items-center justify-center shadow-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 cursor-pointer'}`}
                                    style={{ backgroundColor: '#ffffff', color: '#000000' }}
                                >
                                    {isSubmitting ? 'Saving...' : submitError ? 'Play Without Saving' : 'Play Again'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                </AnimatePresence>
            </motion.div>

        </div>
    );
}
