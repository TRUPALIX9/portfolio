"use client";

import { useEffect, useRef, useState } from 'react';
import { getSavedArcadePlayerName, saveArcadePlayerName, submitArcadeScore } from '@/utils/arcade-player';

const TILE_COUNT = 9;
const TILE_ACCENTS = [
    'rgba(34, 211, 238, 0.95)',
    'rgba(168, 85, 247, 0.95)',
    'rgba(251, 191, 36, 0.95)',
    'rgba(236, 72, 153, 0.95)',
    'rgba(59, 130, 246, 0.95)',
    'rgba(16, 185, 129, 0.95)',
    'rgba(244, 114, 182, 0.95)',
    'rgba(14, 165, 233, 0.95)',
    'rgba(250, 204, 21, 0.95)',
];

export default function MemoryGame({ onFinished, highScore = 0 }: { onFinished: () => void; highScore?: number }) {
    const timeoutsRef = useRef<number[]>([]);
    const sequenceRef = useRef<number[]>([]);
    const inputIndexRef = useRef(0);
    const canInputRef = useRef(false);
    const playingRef = useRef(false);
    const scoreRef = useRef(0);
    const roundTokenRef = useRef(0);

    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);
    const [phaseLabel, setPhaseLabel] = useState('READY');
    const [statusText, setStatusText] = useState('WATCH THE CHAIN, THEN REPEAT IT');
    const [playerProgress, setPlayerProgress] = useState(0);
    const [sequenceLength, setSequenceLength] = useState(0);
    const [activeTile, setActiveTile] = useState<number | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [name, setName] = useState('');
    const [isTouch, setIsTouch] = useState(false);

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
        setRound(nextSequence.length);
        setSequenceLength(nextSequence.length);
        setPlayerProgress(0);
        setPhaseLabel('WATCH');
        setStatusText('LOCK IN THE FULL PATTERN');
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
            setStatusText(isTouch ? 'TAP THE TILES IN THE SAME ORDER' : 'CLICK THE TILES IN THE SAME ORDER');
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
        setRound(1);
        setSequenceLength(0);
        setPlayerProgress(0);
        setGameOver(false);
        setPlaying(true);
        setPhaseLabel('BOOT');
        setStatusText('CALIBRATING MEMORY CHAMBER');
        setActiveTile(null);
        beginRound();
    };

    const handleTilePress = (tileId: number) => {
        if (!playingRef.current || !canInputRef.current) return;

        pulseTile(tileId);
        const expectedTile = sequenceRef.current[inputIndexRef.current];

        if (tileId !== expectedTile) {
            setPhaseLabel('BROKEN');
            setStatusText('WRONG TILE. SIGNAL LOST.');
            canInputRef.current = false;
            queueTimeout(() => endGame('BROKEN', 'WRONG TILE. SIGNAL LOST.'), 220);
            return;
        }

        inputIndexRef.current += 1;
        setPlayerProgress(inputIndexRef.current);

        if (inputIndexRef.current === sequenceRef.current.length) {
            canInputRef.current = false;
            const nextScore = scoreRef.current + 1;
            scoreRef.current = nextScore;
            setScore(nextScore);
            setPhaseLabel('LOCKED');
            setStatusText('CHAIN STABLE. NEXT LINK LOADING.');
            queueTimeout(() => {
                if (!playingRef.current) return;
                beginRound();
            }, 650);
        }
    };

    const submit = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'pattern');
        onFinished();
    };

    const retry = async () => {
        const trimmedName = name.trim();
        if (trimmedName) {
            await submitArcadeScore(trimmedName, score, 'pattern');
        }
        startGame();
    };

    const trimmedName = name.trim();

    return (
        <div
            className="game-console game-console--portrait"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    padding: '0.7rem',
                    borderRadius: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.7rem',
                    position: 'relative',
                    background: 'radial-gradient(circle at top, rgba(56, 189, 248, 0.14), transparent 30%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.18), transparent 24%), linear-gradient(180deg, #050816 0%, #0f172a 38%, #160c2d 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -20px 40px rgba(2, 6, 23, 0.5)',
                }}
            >
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '18px',
                        background: 'repeating-linear-gradient(180deg, rgba(148, 163, 184, 0.05) 0 1px, transparent 1px 34px)',
                        opacity: 0.35,
                        pointerEvents: 'none',
                    }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.45rem', position: 'relative' }}>
                    <div className="game-score-badge" style={{ padding: '0.45rem 0.5rem', fontSize: '0.74rem', textAlign: 'center' }}>
                        SCORE {score}
                    </div>
                    <div className="game-score-badge" style={{ padding: '0.45rem 0.5rem', fontSize: '0.74rem', textAlign: 'center' }}>
                        ROUND {round}
                    </div>
                </div>

                <div
                    style={{
                        position: 'relative',
                        padding: '0.75rem',
                        borderRadius: '18px',
                        background: 'linear-gradient(180deg, rgba(8, 15, 33, 0.92), rgba(8, 15, 33, 0.72))',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.55rem',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span style={{ color: '#f8fafc', fontWeight: 900, fontSize: '0.72rem', letterSpacing: '0.12em' }}>{phaseLabel}</span>
                        <span style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.68rem' }}>{playerProgress} / {sequenceLength || 1} LOCKED</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '0.7rem', alignItems: 'start' }}>
                        <div style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '0.72rem', lineHeight: 1.35 }}>{statusText}</div>
                        <div
                            style={{
                                minWidth: '72px',
                                padding: '0.45rem 0.55rem',
                                borderRadius: '14px',
                                background: 'rgba(15, 23, 42, 0.7)',
                                border: '1px solid rgba(148, 163, 184, 0.14)',
                                textAlign: 'right',
                            }}
                        >
                            <div style={{ color: '#94a3b8', fontSize: '0.54rem', fontWeight: 900, letterSpacing: '0.12em' }}>HIGH SCORE</div>
                            <div style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 900, lineHeight: 1.1 }}>{highScore}</div>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        flex: 1,
                        minHeight: 0,
                        position: 'relative',
                        borderRadius: '22px',
                        padding: '0.85rem',
                        background: 'linear-gradient(180deg, rgba(8, 15, 33, 0.9), rgba(5, 10, 22, 0.98))',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -22px 36px rgba(0,0,0,0.36)',
                        display: 'grid',
                        alignItems: 'stretch',
                    }}
                >
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: '14px',
                            borderRadius: '18px',
                            border: '1px solid rgba(34, 211, 238, 0.12)',
                            pointerEvents: 'none',
                        }}
                    />

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                            gap: '0.68rem',
                            alignContent: 'center',
                            width: '100%',
                            maxWidth: '300px',
                            margin: '0 auto',
                            height: '100%',
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        {Array.from({ length: TILE_COUNT }).map((_, tileId) => {
                            const isActive = activeTile === tileId;
                            const accent = TILE_ACCENTS[tileId];

                            return (
                                <button
                                    key={tileId}
                                    type="button"
                                    onClick={() => handleTilePress(tileId)}
                                    disabled={!playing}
                                    aria-label={`Memory tile ${tileId + 1}`}
                                    style={{
                                        aspectRatio: '1 / 1',
                                        borderRadius: '22px',
                                        border: isActive ? `2px solid ${accent}` : `1px solid ${accent.replace('0.95', '0.2')}`,
                                        background: isActive
                                            ? `radial-gradient(circle at 30% 24%, rgba(255,255,255,0.34), transparent 32%), linear-gradient(180deg, ${accent}, rgba(15, 23, 42, 0.92))`
                                            : 'linear-gradient(180deg, rgba(35, 43, 63, 0.98), rgba(9, 14, 28, 1))',
                                        boxShadow: isActive
                                            ? `inset 0 2px 8px rgba(255,255,255,0.22), 0 0 28px ${accent.replace('0.95', '0.38')}, 0 18px 28px rgba(2, 6, 23, 0.38)`
                                            : `inset 0 1px 0 rgba(255,255,255,0.08), 0 16px 24px rgba(2, 6, 23, 0.34), 0 0 0 1px ${accent.replace('0.95', '0.08')}`,
                                        transform: isActive ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
                                        transition: 'transform 140ms ease, box-shadow 140ms ease, border 140ms ease, background 140ms ease',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        }}
                                    >
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            position: 'absolute',
                                            inset: '8px',
                                            borderRadius: '16px',
                                            background: isActive
                                                ? 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02))'
                                                : 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(15,23,42,0.02))',
                                            border: isActive ? '1px solid rgba(255,255,255,0.26)' : '1px solid rgba(255,255,255,0.08)',
                                        }}
                                    />
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            position: 'absolute',
                                            inset: '24%',
                                            borderRadius: '999px',
                                            background: isActive
                                                ? 'radial-gradient(circle, rgba(255,255,255,0.76) 0%, rgba(255,255,255,0.14) 40%, rgba(255,255,255,0) 72%)'
                                                : `radial-gradient(circle, ${accent.replace('0.95', '0.18')} 0%, rgba(255,255,255,0) 72%)`,
                                        }}
                                    />
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            left: '10px',
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '999px',
                                            background: accent.replace('0.95', isActive ? '0.95' : '0.45'),
                                            boxShadow: isActive ? `0 0 12px ${accent.replace('0.95', '0.45')}` : 'none',
                                        }}
                                    />
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            bottom: '10px',
                                            width: '12px',
                                            height: '3px',
                                            borderRadius: '999px',
                                            background: isActive ? 'rgba(255,255,255,0.78)' : 'rgba(148,163,184,0.42)',
                                        }}
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>

            {!playing && !gameOver && (
                <div className="game-overlay">
                    <div style={{ background: '#000', color: '#fff', padding: '0.65rem 1.6rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>MEMORY</h2>
                    </div>

                    <div className="game-panel">
                        <p style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc', margin: 0 }}>MISSION: HOLD THE WHOLE CHAIN</p>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                gap: '0.48rem',
                                width: '100%',
                                maxWidth: '276px',
                                margin: '0 auto',
                                padding: '0.75rem',
                                borderRadius: '18px',
                                background: 'rgba(8, 15, 33, 0.84)',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                            }}
                        >
                            {Array.from({ length: TILE_COUNT }).map((_, tileId) => (
                                <div
                                    key={tileId}
                                    style={{
                                        aspectRatio: '1 / 1',
                                        borderRadius: '18px',
                                        border: tileId === 2 ? `2px solid ${TILE_ACCENTS[tileId]}` : `1px solid ${TILE_ACCENTS[tileId].replace('0.95', '0.2')}`,
                                        background: tileId === 2
                                            ? `radial-gradient(circle at 30% 24%, rgba(255,255,255,0.34), transparent 32%), linear-gradient(180deg, ${TILE_ACCENTS[tileId]}, rgba(15, 23, 42, 0.92))`
                                            : 'linear-gradient(180deg, rgba(35, 43, 63, 0.98), rgba(9, 14, 28, 1))',
                                        boxShadow: tileId === 2 ? `0 0 24px ${TILE_ACCENTS[tileId].replace('0.95', '0.3')}` : `0 12px 20px rgba(2, 6, 23, 0.24)`,
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div style={{ position: 'absolute', inset: '7px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }} />
                                    <div style={{ position: 'absolute', inset: '26%', borderRadius: '999px', background: tileId === 2 ? 'radial-gradient(circle, rgba(255,255,255,0.76) 0%, rgba(255,255,255,0.14) 40%, rgba(255,255,255,0) 72%)' : `radial-gradient(circle, ${TILE_ACCENTS[tileId].replace('0.95', '0.18')} 0%, rgba(255,255,255,0) 72%)` }} />
                                    <div style={{ position: 'absolute', top: '9px', left: '9px', width: '7px', height: '7px', borderRadius: '999px', background: TILE_ACCENTS[tileId].replace('0.95', tileId === 2 ? '0.95' : '0.45') }} />
                                    <div style={{ position: 'absolute', right: '9px', bottom: '9px', width: '12px', height: '3px', borderRadius: '999px', background: tileId === 2 ? 'rgba(255,255,255,0.78)' : 'rgba(148,163,184,0.42)' }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={startGame}
                        style={{
                            background: '#000',
                            color: '#fff',
                            fontWeight: 900,
                            fontSize: '1.05rem',
                            cursor: 'pointer',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        }}
                        className="game-start-button hover-scale"
                    >
                        START MEMORY RUN
                    </button>
                    <p style={{ fontSize: '0.68rem', opacity: 0.85, color: '#cbd5e1', lineHeight: 1.4 }}>
                        LONGER CHAIN EVERY ROUND.
                    </p>
                </div>
            )}

            {gameOver && (
                <div className="game-overlay">
                    <h2 style={{ color: '#f472b6', fontSize: '2.3rem', fontWeight: 900 }}>SIGNAL LOST</h2>
                    <p style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: 900 }}>SCORE: {score}</p>

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
                        <p style={{ fontSize: '0.72rem', color: trimmedName ? '#94a3b8' : '#fca5a5', margin: 0, lineHeight: 1.4 }}>
                            {trimmedName ? 'Both actions will save this score with the entered name.' : 'Enter a name to enable both EXIT and PLAY AGAIN.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
