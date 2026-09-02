"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getSavedArcadePlayerName, saveArcadePlayerName, submitArcadeScore } from '@/utils/arcade-player';

const TILE_COUNT = 9;

const TILE_ACCENTS = [
    'rgba(255, 255, 255, 1)',
    'rgba(255, 255, 255, 1)',
    'rgba(255, 255, 255, 1)',
    'rgba(255, 255, 255, 1)',
    'rgba(255, 255, 255, 1)',
    'rgba(255, 255, 255, 1)',
    'rgba(255, 255, 255, 1)',
    'rgba(255, 255, 255, 1)',
    'rgba(255, 255, 255, 1)',
];

export default function MemoryGame({ onFinished, highScore = 0, standalone = false }: { onFinished: () => void; highScore?: number; standalone?: boolean }) {
    const timeoutsRef = useRef<number[]>([]);
    const sequenceRef = useRef<number[]>([]);
    const inputIndexRef = useRef(0);
    const canInputRef = useRef(false);
    const playingRef = useRef(false);
    const scoreRef = useRef(0);
    const roundTokenRef = useRef(0);

    const [score, setScore] = useState(0);
    
    const [phaseLabel, setPhaseLabel] = useState('READY');
    const [statusText, setStatusText] = useState('Press start to begin. Watch the tiles closely.');
    const [playerProgress, setPlayerProgress] = useState(0);
    const [sequenceLength, setSequenceLength] = useState(0);
    const [activeTile, setActiveTile] = useState<number | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState(false);
    
    const [isTouch, setIsTouch] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsTouch(window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);
        const savedName = getSavedArcadePlayerName();
        if (savedName) setName(savedName.toUpperCase());

        return () => {
            stopGameLoop();
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
        const nextSequence = [...sequenceRef.current, Math.floor(Math.random() * TILE_COUNT)];
        sequenceRef.current = nextSequence;
        inputIndexRef.current = 0;
        canInputRef.current = false;
        
        setSequenceLength(nextSequence.length);
        setPlayerProgress(0);
        setPhaseLabel('WATCH');
        setStatusText('Memorize the flashing sequence...');
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
            setStatusText(isTouch ? 'Your turn! Tap the tiles in the exact order.' : 'Your turn! Click the tiles in the exact order.');
        }, delay + 100);
    };

    const startGame = () => {
        stopGameLoop();
        sequenceRef.current = [];
        inputIndexRef.current = 0;
        scoreRef.current = 0;
        playingRef.current = true;
        canInputRef.current = false;
        setScore(0);
        
        setSequenceLength(0);
        setPlayerProgress(0);
        setGameOver(false);
        setPlaying(true);
        setPhaseLabel('STARTING');
        setStatusText('Get ready...');
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
            queueTimeout(() => endGame('BROKEN', 'Wrong tile! Sequence broken.'), 220);
            return;
        }

        inputIndexRef.current += 1;
        setPlayerProgress(inputIndexRef.current);

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

    const submit = async () => {
        if (isSubmitting) return;
        const trimmedName = name.trim();
        if (!trimmedName) {
            setNameError(true);
            return;
        }
        setIsSubmitting(true);
        try {
            await submitArcadeScore(trimmedName, score, 'pattern');
            onFinished();
            router.push('/');
        } catch (error) {
            setIsSubmitting(false);
        }
    };

    const retry = async () => {
        if (isSubmitting) return;
        const trimmedName = name.trim();
        if (!trimmedName) {
            setNameError(true);
            return;
        }
        setIsSubmitting(true);
        try {
            await submitArcadeScore(trimmedName, score, 'pattern');
            onFinished(); // This triggers leaderboard refresh in parent
        } finally {
            setIsSubmitting(false);
        }
        startGame();
    };

    const trimmedName = name.trim();

    return (
        <div className="w-full max-w-[420px] mx-auto bg-neutral-900/[0.25] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 flex flex-col gap-5 md:gap-6 shadow-2xl relative">
            {/* HUD Status Bar */}
            <div className="flex justify-center items-center border-b border-white/5 pb-4">
                <div className="flex flex-col items-center">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-neutral-500">Current Score</span>
                    <span className="text-2xl md:text-3xl font-black text-white leading-tight">{score}</span>
                </div>
            </div>

            {/* Instruction Panel */}
            <div className="bg-white/[0.02] border border-white/[0.06] p-4 md:p-5 rounded-2xl flex flex-col gap-1.5 md:gap-2 text-center shadow-sm">
                <div className="flex justify-between items-center text-[0.65rem] md:text-[0.7rem] font-mono tracking-widest text-neutral-400">
                    <span className="text-[#4ADE80] font-black uppercase">{phaseLabel}</span>
                    <span>{playerProgress} / {sequenceLength || 1} MATCHED</span>
                </div>
                <p className="text-[0.7rem] md:text-xs text-white/80 font-medium leading-relaxed mt-1">
                    {statusText}
                </p>
            </div>

            {/* Game Grid Container */}
            <div className="relative aspect-square w-full bg-black/40 border border-white/[0.04] rounded-2xl p-4 md:p-6 flex items-center justify-center">
                {/* 3x3 Tile Grid */}
                <div className="grid grid-cols-3 gap-2 md:gap-3 w-full h-full max-w-[280px] max-h-[280px]">
                    {Array.from({ length: TILE_COUNT }).map((_, tileId) => {
                        const isActive = activeTile === tileId;
                        return (
                            <button
                                key={tileId}
                                type="button"
                                onClick={() => handleTilePress(tileId)}
                                disabled={!playing}
                                aria-label={`Memory tile ${tileId + 1}`}
                                className={`aspect-square rounded-2xl border transition-all duration-150 relative flex items-center justify-center ${
                                    isActive 
                                    ? 'bg-white border-white shadow-[0_0_30px_rgba(255,255,255,0.7)] scale-[1.04] z-10' 
                                    : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] active:scale-95 disabled:pointer-events-none'
                                }`}
                            >
                            </button>
                        );
                    })}
                </div>

                {/* START SCREEN OVERLAY */}
                {!playing && !gameOver && (
                    <div className="absolute inset-0 backdrop-blur-md bg-black/80 flex flex-col items-center justify-center p-4 text-center rounded-2xl z-20 overflow-hidden">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl md:text-3xl mb-3 md:mb-4 shadow-inner">
                            🧠
                        </div>
                        <h3 className="text-lg md:text-xl font-extrabold text-white mb-1 md:mb-2">Memory Test</h3>
                        <p className="text-neutral-400 text-[0.65rem] md:text-xs leading-relaxed max-w-[220px] mb-4 md:mb-6">
                            A sequence of flashing tiles will play. Repeat it exactly. Each round adds one more tile.
                        </p>
                        <button
                            onClick={startGame}
                            className="h-10 md:h-11 px-6 hover:bg-neutral-200 font-bold rounded-xl text-[0.8rem] md:text-sm transition-all duration-300 shadow-md"
                            style={{ backgroundColor: '#ffffff', color: '#000000' }}
                        >
                            Start Test
                        </button>
                    </div>
                )}

                {/* GAME OVER OVERLAY */}
                {gameOver && (
                    <div className="absolute inset-0 backdrop-blur-md bg-black/80 flex flex-col items-center justify-center p-4 text-center rounded-2xl z-20 overflow-hidden">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-2xl md:text-3xl mb-2 md:mb-4">
                            💥
                        </div>
                        <h3 className="text-lg md:text-xl font-extrabold text-white mb-1">Signal Lost</h3>
                        <p className="text-neutral-400 text-[0.7rem] md:text-xs mb-3 md:mb-4">
                            You scored <span className="text-white font-bold">{score}</span> points.
                        </p>

                        <div className="flex flex-col gap-2.5 w-full max-w-[240px]">
                            <input
                                value={name.toUpperCase()}
                                onChange={(e) => updateName(e.target.value.toUpperCase())}
                                placeholder="ENTER NAME"
                                maxLength={10}
                                className={`w-full h-10 md:h-12 px-4 rounded-xl bg-black/60 border ${nameError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/20 focus:border-white/50'} text-white text-center font-bold tracking-widest text-[0.75rem] md:text-sm outline-none uppercase placeholder-neutral-500 transition-colors shadow-inner`}
                            />

                            <div className={`grid ${standalone ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mt-1`}>
                                {!standalone && (
                                    <button
                                        onClick={submit}
                                        disabled={isSubmitting}
                                        className={`h-10 md:h-11 text-[0.7rem] md:text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center shadow-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-200 cursor-pointer'}`}
                                        style={{ backgroundColor: '#ffffff', color: '#000000' }}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Exit'}
                                    </button>
                                )}
                                <button
                                    onClick={retry}
                                    disabled={isSubmitting}
                                    className={`h-10 md:h-11 text-[0.7rem] md:text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center shadow-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-200 cursor-pointer'}`}
                                    style={{ backgroundColor: '#ffffff', color: '#000000' }}
                                >
                                    {isSubmitting ? 'Saving...' : 'Play Again'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        
        </div>
    );
}
