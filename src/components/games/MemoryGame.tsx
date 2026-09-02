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
            setStatusText(isTouch ? 'Tap the tiles in the exact order.' : 'Click the tiles in the exact order.');
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
            {/* HUD Status Bar & Instructions */}
            <div className="flex flex-col items-center justify-center border-b border-white/5 pb-5 gap-3">
                {/* Score */}
                <div className="flex flex-col items-center">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-neutral-500 mb-0.5">Current Score</span>
                    <span className="text-3xl md:text-4xl font-black text-white leading-none">{score}</span>
                </div>

                {/* Instructions */}
                <div className="flex flex-col items-center text-center gap-0.5">
                    <span className={`text-[0.65rem] md:text-[0.7rem] font-black uppercase tracking-widest ${
                        phaseLabel === 'WATCH' ? 'text-red-400' : 
                        (phaseLabel === 'REPEAT' || phaseLabel === 'SUCCESS') ? 'text-emerald-400' : 
                        phaseLabel === 'GAME OVER' ? 'text-red-500' : 'text-neutral-400'
                    }`}>
                        {phaseLabel}
                    </span>
                    <p className={`text-[0.7rem] md:text-xs font-bold leading-none ${
                        phaseLabel === 'WATCH' ? 'text-red-400' : 
                        phaseLabel === 'REPEAT' ? 'text-emerald-400' : 'text-white/70'
                    }`}>
                        {statusText}
                    </p>
                </div>
            </div>

            {/* Game Grid Container */}
            <motion.div 
                animate={phaseLabel === 'GAME OVER' ? { x: [-12, 12, -10, 10, -6, 6, -3, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`relative aspect-square w-full rounded-2xl p-4 md:p-6 flex items-center justify-center transition-all duration-300 ${
                phaseLabel === 'WATCH' 
                    ? 'bg-black/60 border-2 border-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.15)]' 
                    : phaseLabel === 'REPEAT' 
                    ? 'bg-black/60 border-2 border-emerald-500/60 shadow-[0_0_40px_rgba(52,211,153,0.15)]' 
                    : phaseLabel === 'SUCCESS'
                    ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_60px_rgba(52,211,153,0.4)]'
                    : phaseLabel === 'GAME OVER'
                    ? 'bg-red-900/30 border-2 border-red-600 shadow-[0_0_60px_rgba(220,38,38,0.4)]'
                    : 'bg-black/40 border border-white/[0.04]'
            }`}>
                {/* 3x3 Tile Grid - Tic Tac Toe Style */}
                <div className="grid grid-cols-3 w-full h-full max-w-[280px] max-h-[280px]">
                    {Array.from({ length: TILE_COUNT }).map((_, tileId) => {
                        const isActive = activeTile === tileId;
                        
                        const isRightEdge = tileId % 3 === 2;
                        const isBottomEdge = tileId >= 6;
                        
                        // Solid white 4px inner borders to create the # grid
                        let borderClasses = "border-solid border-white ";
                        if (!isRightEdge) borderClasses += "border-r-[4px] ";
                        else borderClasses += "border-r-0 ";
                        
                        if (!isBottomEdge) borderClasses += "border-b-[4px] ";
                        else borderClasses += "border-b-0 ";
                        
                        return (
                            <button
                                key={tileId}
                                type="button"
                                onClick={() => handleTilePress(tileId)}
                                disabled={!playing}
                                aria-label={`Memory tile ${tileId + 1}`}
                                className={`aspect-square transition-all duration-75 relative ${borderClasses} ${
                                    isActive 
                                    ? '!bg-white shadow-[0_0_40px_rgba(255,255,255,1)] z-10 scale-105' 
                                    : 'bg-transparent hover:bg-white/10 active:bg-white/20 disabled:pointer-events-none'
                                }`}
                            >
                            </button>
                        );
                    })}
                </div>

                {/* START SCREEN OVERLAY */}
                {!playing && !gameOver && (
                    <div className="absolute inset-0 backdrop-blur-md bg-black/80 flex flex-col items-center justify-center p-4 text-center rounded-2xl z-20 overflow-hidden">
                                                <h3 className="text-lg md:text-xl font-extrabold text-white mb-1 md:mb-2">Memory Test</h3>
                        <p className="text-neutral-400 text-[0.7rem] md:text-xs font-medium leading-relaxed max-w-[220px] mb-6">
                            Memorize the pattern. Tap it back.
                        </p>
                        <button
                            onClick={startGame}
                            className="h-12 md:h-14 hover:bg-neutral-200 font-black tracking-widest rounded-xl text-sm md:text-base w-full max-w-[180px] transition-all duration-300 shadow-xl"
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
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute inset-0 backdrop-blur-lg bg-red-950/90 flex flex-col items-center justify-center p-4 text-center rounded-2xl z-20 overflow-hidden"
                    >
                        <motion.h3 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                            className="text-3xl md:text-4xl font-black text-red-500 mb-6 tracking-widest uppercase drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                        >
                            FAILED
                        </motion.h3>

                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col gap-3 w-full max-w-[240px]"
                        >
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
                        </motion.div>
                    </motion.div>
                )}
                </AnimatePresence>
            </motion.div>
        
        </div>
    );
}
