"use client";

import { useEffect, useRef, useState } from 'react';
import { getSavedArcadePlayerName, saveArcadePlayerName, submitArcadeScore } from '@/utils/arcade-player';

const LEVEL_TWO_BY_TWO_END = 7;
const LEVEL_THREE_BY_THREE_END = 12;

function getGridDimension(level: number) {
    if (level <= LEVEL_TWO_BY_TWO_END) return 2;
    if (level <= LEVEL_THREE_BY_THREE_END) return 3;
    return 4;
}

function getRoundDuration(level: number) {
    if (level === 1) return 3000;
    if (level <= LEVEL_TWO_BY_TWO_END) return Math.max(620, 1100 - level * 45);
    if (level <= LEVEL_THREE_BY_THREE_END) return Math.max(430, 760 - (level - LEVEL_TWO_BY_TWO_END) * 45);
    return Math.max(280, 520 - (level - LEVEL_THREE_BY_THREE_END) * 22);
}

export default function ReflexGame({ onFinished, highScore = 0 }: { onFinished: () => void; highScore?: number }) {
    const timeoutRef = useRef<number | null>(null);
    const timerFrameRef = useRef<number | null>(null);
    const gridTransitionTimeoutRef = useRef<number | null>(null);
    const roundTokenRef = useRef(0);
    const livesRef = useRef(3);
    const levelRef = useRef(1);
    const scoreRef = useRef(0);
    const previousGridDimensionRef = useRef(2);

    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [isTouch, setIsTouch] = useState(false);
    const [name, setName] = useState('');
    const [activeCell, setActiveCell] = useState<number | null>(null);
    const [timerProgress, setTimerProgress] = useState(0);
    const [remainingMs, setRemainingMs] = useState(0);
    const [statusText, setStatusText] = useState('READY');
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [gridTransitioning, setGridTransitioning] = useState(false);

    useEffect(() => {
        setIsTouch(window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);

        const savedName = getSavedArcadePlayerName();
        if (savedName) setName(savedName);

        return () => {
            stopRound();
            if (gridTransitionTimeoutRef.current) {
                window.clearTimeout(gridTransitionTimeoutRef.current);
            }
        };
    }, []);

    const updateName = (val: string) => {
        setName(val);
        saveArcadePlayerName(val);
    };

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

    const finishGame = (message: string) => {
        stopRound();
        setPlaying(false);
        setGameOver(true);
        setActiveCell(null);
        setTimerProgress(100);
        setRemainingMs(0);
        setStatusText(message);
    };

    const scheduleRound = (nextLevel: number, nextScore: number) => {
        stopRound();
        roundTokenRef.current += 1;
        const token = roundTokenRef.current;
        const duration = getRoundDuration(nextLevel);
        const cellCount = getGridDimension(nextLevel) ** 2;
        const nextCell = Math.floor(Math.random() * cellCount);
        const startedAt = performance.now();

        levelRef.current = nextLevel;
        scoreRef.current = nextScore;

        setLevel(nextLevel);
        setActiveCell(nextCell);
        setTimerProgress(0);
        setRemainingMs(duration);
        setStatusText(
            nextLevel <= LEVEL_TWO_BY_TWO_END
                ? 'GRID 2X2'
                : nextLevel <= LEVEL_THREE_BY_THREE_END
                    ? 'GRID 3X3'
                    : 'GRID 4X4'
        );
        setLastAction(null);

        const tickTimer = (now: number) => {
            const elapsed = now - startedAt;
            const progress = Math.min(100, (elapsed / duration) * 100);
            const nextRemaining = Math.max(0, Math.ceil(duration - elapsed));
            setTimerProgress(progress);
            setRemainingMs(nextRemaining);

            if (progress < 100 && roundTokenRef.current === token) {
                timerFrameRef.current = window.requestAnimationFrame(tickTimer);
            }
        };

        timerFrameRef.current = window.requestAnimationFrame(tickTimer);

        timeoutRef.current = window.setTimeout(() => {
            if (roundTokenRef.current !== token) return;
            const nextLives = livesRef.current - 1;
            livesRef.current = nextLives;
            setLives(nextLives);
            setLastAction('-1 LIFE');

            if (nextLives <= 0) {
                finishGame('REFLEX FAILED');
                return;
            }

            scheduleRound(nextLevel, nextScore);
        }, duration);
    };

    const startGame = () => {
        stopRound();
        roundTokenRef.current = 0;
        livesRef.current = 3;
        levelRef.current = 1;
        scoreRef.current = 0;
        setScore(0);
        setLevel(1);
        setLives(3);
        setGameOver(false);
        setPlaying(true);
        setLastAction(null);
        setTimerProgress(0);
        setRemainingMs(0);
        scheduleRound(1, 0);
    };

    const handleCellPress = (index: number) => {
        if (!playing) return;

        if (index === activeCell) {
            const nextScore = scoreRef.current + 1;
            const nextLevel = levelRef.current + 1;
            setScore(nextScore);
            setLastAction('+1 LOCK');
            scheduleRound(nextLevel, nextScore);
            return;
        }

        const nextLives = livesRef.current - 1;
        livesRef.current = nextLives;
        setLives(nextLives);
        setLastAction('-1 LIFE');

        if (nextLives <= 0) {
            finishGame('REFLEX FAILED');
            return;
        }

        scheduleRound(levelRef.current, scoreRef.current);
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
    const compactLayout = isTouch;
    const gridDimension = getGridDimension(level);
    const gridCount = gridDimension ** 2;
    const gridMaxWidth = gridDimension === 2 ? '280px' : gridDimension === 3 ? '300px' : '288px';

    useEffect(() => {
        if (previousGridDimensionRef.current === gridDimension) return;
        previousGridDimensionRef.current = gridDimension;
        setGridTransitioning(true);
        if (gridTransitionTimeoutRef.current) {
            window.clearTimeout(gridTransitionTimeoutRef.current);
        }
        gridTransitionTimeoutRef.current = window.setTimeout(() => {
            setGridTransitioning(false);
            gridTransitionTimeoutRef.current = null;
        }, 500);
    }, [gridDimension]);

    return (
        <div
            className="game-console game-console--portrait"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '18px',
                    padding: compactLayout ? '0.6rem' : '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: compactLayout ? '0.5rem' : '0.75rem',
                    background:
                        'radial-gradient(circle at 50% 0%, rgba(248, 113, 113, 0.18), transparent 26%), radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.08), transparent 22%), linear-gradient(180deg, #020617 0%, #111827 58%, #030712 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -20px 40px rgba(2, 6, 23, 0.55)',
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.4rem', alignItems: 'stretch' }}>
                    <div className="game-score-badge" style={{ padding: compactLayout ? '0.38rem 0.48rem' : '0.5rem 0.65rem', fontSize: compactLayout ? '0.68rem' : '0.8rem', textAlign: 'center' }}>
                        SCORE {score}
                    </div>
                    <div className="game-score-badge" style={{ padding: compactLayout ? '0.38rem 0.48rem' : '0.5rem 0.65rem', fontSize: compactLayout ? '0.68rem' : '0.8rem', textAlign: 'center' }}>
                        LEVEL {level}
                    </div>
                    <div className="game-score-badge" style={{ padding: compactLayout ? '0.38rem 0.48rem' : '0.5rem 0.65rem', fontSize: compactLayout ? '0.68rem' : '0.8rem', textAlign: 'center', color: lives === 1 ? '#fca5a5' : '#f8fafc' }}>
                        LIVES {lives}
                    </div>
                    <div className="game-score-badge" style={{ padding: compactLayout ? '0.38rem 0.48rem' : '0.5rem 0.65rem', fontSize: compactLayout ? '0.68rem' : '0.8rem', textAlign: 'center' }}>
                        BEST {highScore}
                    </div>
                </div>

                <div
                    style={{
                        position: 'relative',
                        padding: compactLayout ? '0.65rem' : '0.8rem',
                        borderRadius: '18px',
                        background: 'linear-gradient(180deg, rgba(8, 15, 33, 0.92), rgba(8, 15, 33, 0.74))',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ color: '#f8fafc', fontWeight: 900, fontSize: compactLayout ? '0.64rem' : '0.74rem', letterSpacing: '0.12em' }}>
                            {statusText}
                        </span>
                        <div
                            style={{
                                padding: compactLayout ? '0.3rem 0.42rem' : '0.38rem 0.55rem',
                                borderRadius: '12px',
                                background: 'rgba(239, 68, 68, 0.14)',
                                border: '1px solid rgba(248, 113, 113, 0.25)',
                                color: remainingMs <= 900 ? '#fecaca' : '#f8fafc',
                                fontWeight: 900,
                                fontSize: compactLayout ? '0.64rem' : '0.72rem',
                                letterSpacing: '0.1em',
                            }}
                        >
                            TIMER {playing ? `${remainingMs}MS` : '0MS'}
                        </div>
                    </div>
                    <div style={{ width: '100%', height: compactLayout ? '4px' : '6px', borderRadius: '999px', background: 'rgba(148, 163, 184, 0.2)', overflow: 'hidden' }}>
                        <div
                            style={{
                                width: `${timerProgress}%`,
                                height: '100%',
                                borderRadius: '999px',
                                background: timerProgress > 78
                                    ? 'linear-gradient(90deg, #fb7185 0%, #ef4444 100%)'
                                    : 'linear-gradient(90deg, #ffffff 0%, #fda4af 60%, #ef4444 100%)',
                                transition: 'width 80ms linear',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: compactLayout ? '0.9rem' : '1rem' }}>
                        <div style={{ color: lastAction?.startsWith('+') ? '#4ade80' : '#fca5a5', fontSize: compactLayout ? '0.6rem' : '0.7rem', fontWeight: 900, minWidth: '54px', textAlign: 'right', flexShrink: 0 }}>
                            {lastAction ?? ''}
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        width: '100%',
                        maxWidth: gridMaxWidth,
                        margin: '0 auto',
                        flex: 1,
                        minHeight: 0,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridDimension}, minmax(0, 1fr))`,
                        gap: gridDimension === 4 ? (compactLayout ? '0.28rem' : '0.42rem') : gridDimension === 3 ? (compactLayout ? '0.34rem' : '0.52rem') : (compactLayout ? '0.45rem' : '0.7rem'),
                        padding: compactLayout ? '0.15rem' : '0.25rem',
                        alignContent: 'center',
                        transition: 'transform 500ms ease, opacity 500ms ease, filter 500ms ease, gap 500ms ease',
                        transform: gridTransitioning ? 'scale(0.9)' : 'scale(1)',
                        opacity: gridTransitioning ? 0.55 : 1,
                        filter: gridTransitioning ? 'blur(2px)' : 'blur(0)',
                    }}
                >
                    {Array.from({ length: gridCount }).map((_, index) => {
                        const active = playing && activeCell === index;
                        return (
                            <button
                                key={index}
                                type="button"
                                onPointerDown={(event) => {
                                    event.preventDefault();
                                    handleCellPress(index);
                                }}
                                disabled={!playing}
                                aria-label={`Reflex cell ${index + 1}`}
                                style={{
                                    aspectRatio: '1 / 1',
                                    borderRadius: gridDimension === 4 ? '22px' : '28px',
                                    border: active ? '2px solid rgba(254, 242, 242, 0.98)' : '1px solid rgba(203, 213, 225, 0.85)',
                                    background: active
                                        ? 'linear-gradient(180deg, #fff5f5 0%, #fecaca 18%, #ef4444 70%, #991b1b 100%)'
                                        : 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.98) 65%, rgba(226,232,240,0.95) 100%)',
                                    boxShadow: active
                                        ? '0 0 28px rgba(248, 113, 113, 0.42), 0 18px 26px rgba(2, 6, 23, 0.3), inset 0 2px 8px rgba(255,255,255,0.35)'
                                        : '0 12px 18px rgba(2, 6, 23, 0.24), inset 0 2px 10px rgba(255,255,255,0.92), inset 0 -8px 14px rgba(203,213,225,0.55)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0,
                                    touchAction: 'none',
                                    transition: 'transform 120ms ease, box-shadow 120ms ease, background 120ms ease, border 120ms ease',
                                    transform: active ? (gridDimension === 4 ? 'scale(1.05)' : 'scale(1.08)') : 'scale(1)',
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            {!playing && !gameOver && (
                <div className="game-overlay">
                    <div style={{ background: '#000', color: '#fff', padding: compactLayout ? '0.6rem 1.3rem' : '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: compactLayout ? '2rem' : '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>REFLEX</h2>
                    </div>

                    <div className="game-panel">
                        <p style={{ fontWeight: 800, fontSize: compactLayout ? '1rem' : '1.2rem', color: '#f8fafc', margin: 0 }}>MISSION: HIT THE RED CIRCLE</p>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                gap: '0.6rem',
                                padding: compactLayout ? '0.75rem' : '0.95rem',
                                borderRadius: '18px',
                                background: 'rgba(8, 15, 33, 0.84)',
                                border: '1px solid rgba(148, 163, 184, 0.22)',
                            }}
                        >
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    style={{
                                        aspectRatio: '1 / 1',
                                        borderRadius: '24px',
                                        border: index === 1 ? '2px solid rgba(254, 242, 242, 0.98)' : '1px solid rgba(226, 232, 240, 0.6)',
                                        background: index === 1
                                            ? 'linear-gradient(180deg, #ffffff 0%, #fecdd3 20%, #ef4444 72%, #991b1b 100%)'
                                            : 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(241,245,249,0.98) 100%)',
                                        boxShadow: index === 1 ? '0 0 20px rgba(248,113,113,0.36)' : '0 12px 18px rgba(2, 6, 23, 0.22)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={startGame}
                        style={{
                            background: '#000',
                            color: '#fff',
                            fontWeight: 900,
                            fontSize: compactLayout ? '0.98rem' : '1.1rem',
                            cursor: 'pointer',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        }}
                        className="game-start-button hover-scale"
                    >
                        START REFLEX RUN
                    </button>
                    <p style={{ fontSize: compactLayout ? '0.64rem' : '0.72rem', opacity: 0.85, color: '#cbd5e1', lineHeight: 1.4 }}>
                        THREE LIVES. FULL 2X2 START. OPENING TIMER: 3 SECONDS.
                    </p>
                </div>
            )}

            {gameOver && (
                <div className="game-overlay">
                    <h2 style={{ color: '#ef4444', fontSize: compactLayout ? '2.1rem' : '2.5rem', fontWeight: 900 }}>{statusText}</h2>
                    <p style={{ color: '#f8fafc', fontSize: compactLayout ? '1.25rem' : '1.5rem', fontWeight: 900 }}>SCORE: {score}</p>

                    <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '0.75rem', alignItems: 'stretch' }}>
                            <input
                                value={name.toUpperCase()}
                                onChange={(e) => updateName(e.target.value.toUpperCase())}
                                placeholder="ENTER NAME"
                                style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', color: '#000', border: '3px solid #000', textAlign: 'center', fontSize: '1rem', fontWeight: 900, minWidth: 0, textTransform: 'uppercase' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
                            <button
                                onClick={submit}
                                disabled={!trimmedName}
                                style={{ background: trimmedName ? '#e2e8f0' : '#cbd5e1', color: '#000', padding: '1.05rem 0.75rem', borderRadius: '12px', fontWeight: 900, fontSize: '0.95rem', border: 'none', cursor: trimmedName ? 'pointer' : 'not-allowed' }}
                            >
                                EXIT
                            </button>
                            <button
                                onClick={retry}
                                disabled={!trimmedName}
                                style={{ background: trimmedName ? '#000' : '#475569', color: '#fff', padding: '1.05rem 0.75rem', borderRadius: '12px', fontWeight: 900, fontSize: '0.95rem', border: 'none', cursor: trimmedName ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
                            >
                                <span>🔄</span> PLAY AGAIN
                            </button>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: trimmedName ? '#94a3b8' : '#fca5a5', margin: 0 }}>
                            {trimmedName ? 'Both actions will save this score with the entered name.' : 'Enter a name to enable both EXIT and PLAY AGAIN.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
