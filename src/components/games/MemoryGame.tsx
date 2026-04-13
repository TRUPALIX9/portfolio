"use client";
import { useEffect, useRef, useState } from 'react';
import { getSavedArcadePlayerName, submitArcadeScore } from '@/utils/arcade-player';

type MemoryPad = { id: number; x: number; y: number; color?: string };

export default function MemoryGame({ onFinished }: { onFinished: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const playingRef = useRef(false);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [name, setName] = useState("");
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        setIsTouch(window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);
        const savedName = getSavedArcadePlayerName();
        if (savedName) setName(savedName);

        return () => {
            cleanupRef.current?.();
            playingRef.current = false;
        };
    }, []);

    const updateName = (val: string) => {
        setName(val);
    };

    const submit = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'pattern');
        onFinished();
    };
    const retry = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'pattern');
        startGame();
    };

    const trimmedName = name.trim();

    const startGame = () => {
        cleanupRef.current?.();
        playingRef.current = true;
        setPlaying(true); setGameOver(false); setScore(0);
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        let sequence: number[] = [];
        let userSequence: number[] = [];
        let showing = false;
        let curScore = 0;
        let flashIndex = 0;
        let flashTime = 0;
        let animationId = 0;
        let nextLevelTimeout = 0;
        const grid: MemoryPad[] = [
            { id: 0, x: 50, y: 50, color: '#ec4899' }, { id: 1, x: 210, y: 50, color: '#8b5cf6' },
            { id: 2, x: 50, y: 210, color: '#3b82f6' }, { id: 3, x: 210, y: 210, color: '#10b981' }
        ];

        const nextLevel = () => {
            sequence.push(Math.floor(Math.random() * 4));
            userSequence = [];
            showing = true;
            flashIndex = 0;
            flashTime = Math.max(15, 40 - curScore); // Progressive Speed
        };

        const loop = () => {
            // Paper Background
            ctx.fillStyle = '#fcfaf8'; ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Doodle Grid
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
            const frames = Date.now() / 100;
            for (let i = 0; i <= canvas.width; i += 40) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + (Math.sin(i + frames * 0.1) * 2), canvas.height); ctx.stroke();
            }
            for (let i = 0; i <= canvas.height; i += 40) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i + (Math.cos(i + frames * 0.1) * 2)); ctx.stroke();
            }

            ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

            if (showing) {
                flashTime--;
                if (flashTime <= 0) {
                    flashIndex++;
                    flashTime = Math.max(15, 40 - curScore);
                    if (flashIndex >= sequence.length) showing = false;
                }
            }

            grid.forEach(g => {
                const isActive = showing && sequence[flashIndex] === g.id && flashTime > 5;
                ctx.fillStyle = isActive ? g.color : g.color + '15'; // Very subtle inactive
                ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.roundRect(g.x, g.y, 140, 140, 12); ctx.fill(); ctx.stroke();
                if (isActive) {
                    ctx.beginPath(); ctx.roundRect(g.x - 5, g.y - 5, 150, 150, 16);
                    ctx.strokeStyle = g.color; ctx.lineWidth = 4; ctx.stroke();
                }
            });

            if (playingRef.current) {
                animationId = requestAnimationFrame(loop);
            }
        };

        const endGame = () => {
            playingRef.current = false;
            setGameOver(true);
            setPlaying(false);
            window.clearTimeout(nextLevelTimeout);
            cancelAnimationFrame(animationId);
        };

        const click = (e: MouseEvent | TouchEvent) => {
            if (showing || !playingRef.current) return;
            const rect = canvas.getBoundingClientRect();
            const point = 'touches' in e ? e.touches[0] : e;
            if (!point) return;
            const x = (point.clientX - rect.left) * (canvas.width / rect.width);
            const y = (point.clientY - rect.top) * (canvas.height / rect.height);

            grid.forEach(g => {
                if (x > g.x && x < g.x + 140 && y > g.y && y < g.y + 140) {
                    userSequence.push(g.id);
                    if (userSequence[userSequence.length - 1] !== sequence[userSequence.length - 1]) {
                        endGame();
                        return;
                    }
                    if (userSequence.length === sequence.length) {
                        curScore++; setScore(curScore);
                        nextLevelTimeout = window.setTimeout(nextLevel, 600);
                    }
                }
            });
        };

        canvas.addEventListener('mousedown', click);
        canvas.addEventListener('touchstart', click, { passive: false });
        nextLevel(); loop();
        cleanupRef.current = () => {
            playingRef.current = false;
            window.clearTimeout(nextLevelTimeout);
            cancelAnimationFrame(animationId);
            canvas.removeEventListener('mousedown', click);
            canvas.removeEventListener('touchstart', click);
        };
    };



    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }} className="game-console game-console--square">
            <canvas ref={canvasRef} width={400} height={400} className="game-canvas game-canvas-square" />
            {!playing && !gameOver && (
                <div className="game-overlay">
                    <div style={{ background: '#000', color: '#fff', padding: '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>MEMORY</h2>
                    </div>

                    <div className="game-panel">
                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc', margin: 0 }}>MISSION: SYNC</p>
                        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '0.5rem 0 1.5rem 0' }}>Repeat the synaptic sequence precisely.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.88)', borderRadius: '20px', border: '1px solid rgba(148, 163, 184, 0.35)' }}>
                            <div style={{ width: '40px', height: '40px', border: '1px solid #ec4899', borderRadius: '4px', position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: 2, background: '#ec4899', opacity: 0.8 }} className="animate-pulse" />
                            </div>
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '1px' }}>{!isTouch ? 'MATCH THE SEQUENCE' : 'TAP THE SEQUENCE'}</span>
                        </div>
                    </div>

                    <button onClick={startGame} style={{
                        background: '#000', color: '#fff', fontWeight: 900,
                        fontSize: '1.1rem', cursor: 'pointer', border: 'none',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }} className="game-start-button hover-scale">SYNC NEURONS</button>
                    <p style={{ fontSize: '0.7rem', opacity: 0.8, color: '#cbd5e1' }}>Synaptic lag results in immediate disconnect.</p>
                </div>
            )}
            {gameOver && (
                <div className="game-overlay">
                    <h2 style={{ color: '#ec4899', fontSize: '2.5rem', fontWeight: 900 }}>SYNC LOST</h2>
                    <p style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 900 }}>SCORE: {score}</p>

                    <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '0.75rem', alignItems: 'stretch' }}>
                            <input value={name} onChange={e => updateName(e.target.value)} placeholder="ENTER NAME" style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', color: '#000', border: '3px solid #000', textAlign: 'center', fontSize: '1rem', fontWeight: 900, minWidth: 0 }} />
                            <button onClick={submit} disabled={!trimmedName} style={{ background: trimmedName ? '#e2e8f0' : '#cbd5e1', color: '#000', padding: '0 1rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', border: 'none', cursor: trimmedName ? 'pointer' : 'not-allowed' }}>
                                SAVE
                            </button>
                        </div>

                        <button onClick={retry} disabled={!trimmedName} style={{ background: trimmedName ? '#000' : '#475569', color: '#fff', padding: '1.25rem', borderRadius: '12px', fontWeight: 900, fontSize: '1.1rem', border: 'none', cursor: trimmedName ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <span>🔄</span> PLAY AGAIN
                        </button>
                        <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0 }}>A name is required before saving or restarting.</p>
                    </div>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 16, right: 16, padding: '6px 10px' }} className="game-score-badge">{score}</div>}
        </div>
    );
}
