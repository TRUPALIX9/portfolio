"use client";

import { useEffect, useRef, useState } from 'react';
import { getSavedArcadePlayerName, submitArcadeScore } from '@/utils/arcade-player';

const PANEL_ROWS = [4, 3, 4] as const;
const PANEL_SLOTS = PANEL_ROWS.reduce((total, count) => total + count, 0);

export default function ReflexGame({ onFinished }: { onFinished: () => void }) {
    const timeoutRef = useRef<number | null>(null);
    const timerFrameRef = useRef<number | null>(null);
    const roundRef = useRef(0);

    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [isTouch, setIsTouch] = useState(false);
    const [name, setName] = useState('');
    const [activeButton, setActiveButton] = useState<number | null>(null);
    const [pulse, setPulse] = useState(100);
    const [timerProgress, setTimerProgress] = useState(0);
    const [remainingMs, setRemainingMs] = useState(0);
    const [statusText, setStatusText] = useState('READY');
    const [lastAction, setLastAction] = useState<string | null>(null);

    useEffect(() => {
        setIsTouch(window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);

        const savedName = getSavedArcadePlayerName();
        if (savedName) setName(savedName);

        return () => {
            if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
            if (timerFrameRef.current) window.cancelAnimationFrame(timerFrameRef.current);
        };
    }, []);

    useEffect(() => {
        if (!playing) return;

        const tick = window.setInterval(() => {
            setPulse((current) => Math.max(0, current - 2));
        }, 16);

        return () => window.clearInterval(tick);
    }, [playing, activeButton]);

    const stopRound = () => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (timerFrameRef.current) {
            window.cancelAnimationFrame(timerFrameRef.current);
            timerFrameRef.current = null;
        }
    };

    const finishGame = () => {
        stopRound();
        setPlaying(false);
        setGameOver(true);
        setActiveButton(null);
        setTimerProgress(100);
        setRemainingMs(0);
        setStatusText('SYSTEM OVERFLOW');
    };

    const scheduleRound = (nextScore: number) => {
        stopRound();
        roundRef.current += 1;
        const nextRound = roundRef.current;
        const duration = Math.max(220, 900 - Math.floor(nextScore / 25) * 35);
        const nextButton = Math.floor(Math.random() * PANEL_SLOTS);
        const startedAt = performance.now();

        setActiveButton(nextButton);
        setPulse(100);
        setTimerProgress(0);
        setRemainingMs(duration);
        setStatusText(duration <= 260 ? 'HUMAN LIMIT' : duration <= 420 ? 'ELITE REACT' : 'LOCK TARGET');
        setLastAction(null);

        const tickTimer = (now: number) => {
            const elapsed = now - startedAt;
            const progress = Math.min(100, (elapsed / duration) * 100);
            const nextRemaining = Math.max(0, Math.ceil(duration - elapsed));
            setTimerProgress(progress);
            setRemainingMs(nextRemaining);

            if (progress < 100 && roundRef.current === nextRound) {
                timerFrameRef.current = window.requestAnimationFrame(tickTimer);
            }
        };

        timerFrameRef.current = window.requestAnimationFrame(tickTimer);

        timeoutRef.current = window.setTimeout(() => {
            if (roundRef.current !== nextRound) return;
            finishGame();
        }, duration);
    };

    const startGame = () => {
        stopRound();
        roundRef.current = 0;
        setScore(0);
        setGameOver(false);
        setPlaying(true);
        setLastAction(null);
        setTimerProgress(0);
        setRemainingMs(0);
        scheduleRound(0);
    };

    const handleButtonPress = (index: number) => {
        if (!playing) return;

        if (index === activeButton) {
            const nextScore = score + 25;
            setScore(nextScore);
            setLastAction('+25 lock');
            scheduleRound(nextScore);
            return;
        }

        const nextScore = Math.max(0, score - 5);
        setScore(nextScore);
        setLastAction('-5 miss');
    };

    const submit = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'shooter');
        onFinished();
    };

    const retry = async () => {
        const trimmedName = name.trim();
        if (trimmedName) {
            await submitArcadeScore(trimmedName, score, 'shooter');
        }
        startGame();
    };

    const trimmedName = name.trim();

    return (
        <div
            className="game-console game-console--portrait"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '18px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    background:
                        'radial-gradient(circle at top, rgba(239, 68, 68, 0.18), transparent 35%), linear-gradient(180deg, #020617 0%, #111827 100%)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="game-score-badge" style={{ padding: '0.5rem 0.75rem' }}>
                        SCORE {score}
                    </div>
                    <div
                        style={{
                            minWidth: '110px',
                            padding: '0.45rem 0.55rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(248, 250, 252, 0.18)',
                            background: 'rgba(15, 23, 42, 0.8)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.35rem',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: pulse < 35 ? '#f87171' : '#f8fafc', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.08em' }}>
                                {statusText}
                            </span>
                            <span style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.65rem' }}>
                                {playing ? `${remainingMs}ms` : '0ms'}
                            </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: 'rgba(148, 163, 184, 0.2)', overflow: 'hidden' }}>
                            <div
                                style={{
                                    width: `${timerProgress}%`,
                                    height: '100%',
                                    borderRadius: '999px',
                                    background: timerProgress > 78
                                        ? 'linear-gradient(90deg, #fb7185 0%, #ef4444 100%)'
                                        : 'linear-gradient(90deg, #22c55e 0%, #f59e0b 55%, #f87171 100%)',
                                    transition: 'width 80ms linear',
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', flex: 1, minHeight: 0, justifyContent: 'center' }}>
                    {(() => {
                        let buttonIndex = 0;

                        return PANEL_ROWS.map((count, rowIndex) => (
                            <div
                                key={rowIndex}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
                                    gap: '0.75rem',
                                    width: rowIndex === 1 ? '76%' : '100%',
                                    alignSelf: 'center',
                                }}
                            >
                                {Array.from({ length: count }).map((_, columnIndex) => {
                                    const currentIndex = buttonIndex++;
                                    const active = playing && activeButton === currentIndex;

                                    return (
                                        <button
                                            key={`${rowIndex}-${columnIndex}`}
                                            type="button"
                                            onClick={() => handleButtonPress(currentIndex)}
                                            disabled={!playing}
                                            aria-label={`Reflex button ${currentIndex + 1}`}
                                            style={{
                                                minHeight: 0,
                                                aspectRatio: '1 / 1',
                                                borderRadius: '18px',
                                                border: active ? '2px solid #f8fafc' : '1px solid rgba(148, 163, 184, 0.28)',
                                                background: active
                                                    ? `radial-gradient(circle, rgba(248, 113, 113, ${0.25 + (pulse / 100) * 0.45}) 0%, rgba(127, 29, 29, 0.98) 72%)`
                                                    : 'linear-gradient(180deg, rgba(15, 23, 42, 0.82), rgba(30, 41, 59, 0.95))',
                                                boxShadow: active
                                                    ? '0 0 0 1px rgba(248, 250, 252, 0.1), 0 0 32px rgba(248, 113, 113, 0.5)'
                                                    : 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#f8fafc',
                                                fontWeight: 900,
                                                fontSize: active ? '1rem' : '0.7rem',
                                                letterSpacing: '0.08em',
                                                transition: 'transform 120ms ease, box-shadow 120ms ease, background 120ms ease',
                                                transform: active ? 'scale(1.03)' : 'scale(1)',
                                            }}
                                        >
                                            {active ? 'HIT' : 'BTN'}
                                        </button>
                                    );
                                })}
                            </div>
                        ));
                    })()}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', minHeight: '2rem' }}>
                    <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}>
                        {isTouch ? 'Tap the red blinking button before it times out.' : 'Click the red blinking button before it times out.'}
                    </p>
                    <p style={{ margin: 0, color: lastAction?.startsWith('+') ? '#4ade80' : '#fca5a5', fontSize: '0.8rem', fontWeight: 900, minWidth: '64px', textAlign: 'right' }}>
                        {lastAction ?? ''}
                    </p>
                </div>
            </div>

            {!playing && !gameOver && (
                <div className="game-overlay">
                    <div style={{ background: '#000', color: '#fff', padding: '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>REFLEX</h2>
                    </div>

                    <div className="game-panel">
                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc', margin: 0 }}>MISSION: HIT THE RED BUTTON</p>
                        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '0.5rem 0 1.5rem 0' }}>
                            The panel blinks one live button at a time in a 4 / 3 / 4 layout. Hit it fast for +25. Wrong taps cost -5.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            {(() => {
                                let previewIndex = 0;

                                return PANEL_ROWS.map((count, rowIndex) => (
                                    <div
                                        key={rowIndex}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
                                            gap: '0.65rem',
                                            width: rowIndex === 1 ? '76%' : '100%',
                                            alignSelf: 'center',
                                        }}
                                    >
                                        {Array.from({ length: count }).map((_, columnIndex) => {
                                            const isLive = previewIndex === 5;
                                            previewIndex += 1;

                                            return (
                                                <div
                                                    key={`${rowIndex}-${columnIndex}`}
                                                    style={{
                                                        aspectRatio: '1 / 1',
                                                        borderRadius: '14px',
                                                        border: isLive ? '2px solid #f8fafc' : '1px solid rgba(148, 163, 184, 0.28)',
                                                        background: isLive
                                                            ? 'radial-gradient(circle, rgba(248, 113, 113, 0.7) 0%, rgba(127, 29, 29, 0.95) 75%)'
                                                            : 'linear-gradient(180deg, rgba(15, 23, 42, 0.82), rgba(30, 41, 59, 0.95))',
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>

                    <button
                        onClick={startGame}
                        style={{
                            background: '#000',
                            color: '#fff',
                            fontWeight: 900,
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        }}
                        className="game-start-button hover-scale"
                    >
                        INITIALIZE
                    </button>
                    <p style={{ fontSize: '0.7rem', opacity: 0.8, color: '#cbd5e1' }}>Designed for reliable mobile and desktop play.</p>
                </div>
            )}

            {gameOver && (
                <div className="game-overlay">
                    <h2 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900 }}>SYSTEM OVERFLOW</h2>
                    <p style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 900 }}>SCORE: {score}</p>

                    <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '0.75rem', alignItems: 'stretch' }}>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ENTER NAME"
                                style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', color: '#000', border: '3px solid #000', textAlign: 'center', fontSize: '1rem', fontWeight: 900, minWidth: 0 }}
                            />
                            <button
                                onClick={submit}
                                disabled={!trimmedName}
                                style={{ background: trimmedName ? '#e2e8f0' : '#cbd5e1', color: '#000', padding: '0 1rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', border: 'none', cursor: trimmedName ? 'pointer' : 'not-allowed' }}
                            >
                                SAVE
                            </button>
                        </div>

                        <button
                            onClick={retry}
                            style={{ background: '#000', color: '#fff', padding: '1.25rem', borderRadius: '12px', fontWeight: 900, fontSize: '1.1rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <span>🔄</span> PLAY AGAIN
                        </button>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                            Add a name to save this score, or play again instantly.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
