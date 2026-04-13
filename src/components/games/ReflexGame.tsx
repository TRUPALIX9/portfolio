"use client";
import { useEffect, useRef, useState } from 'react';
import { getSavedArcadePlayerName, submitArcadeScore } from '@/utils/arcade-player';

type Target = { x: number; y: number; r: number; life: number };
type Effect =
    | { type: 'text'; x: number; y: number; text: string; color: string; life: number; vy: number }
    | { type: 'pop'; x: number; y: number; color: string; life: number; r: number };

export default function ReflexGame({ onFinished }: { onFinished: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const playingRef = useRef(false);
    const cleanupRef = useRef<(() => void) | null>(null);

    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [isTouch, setIsTouch] = useState(false);
    const [name, setName] = useState("");

    useEffect(() => {
        setIsTouch(window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);
        const savedName = getSavedArcadePlayerName();
        if (savedName) setName(savedName);

        return () => {
            cleanupRef.current?.();
        };
    }, []);

    const updateName = (val: string) => {
        setName(val);
    };

    const submit = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'shooter');
        onFinished();
    };

    const retry = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'shooter');
        startGame();
    };

    const trimmedName = name.trim();

    const startGame = () => {
        cleanupRef.current?.();
        playingRef.current = true;
        setPlaying(true);
        setGameOver(false);
        setScore(0);

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        let targets: Target[] = [];
        let effects: Effect[] = [];
        let animationId = 0;
        let curScore = 0;
        let frames = 0;

        const endGame = () => {
            playingRef.current = false;
            setGameOver(true);
            setPlaying(false);
            cancelAnimationFrame(animationId);
        };

        const loop = () => {
            frames++;
            const spawnRate = Math.max(15, 45 - Math.floor(curScore / 100));
            if (frames % spawnRate === 0) {
                const r = Math.max(15, 22 - (curScore / 500));
                targets.push({
                    x: 50 + Math.random() * (canvas.width - 100),
                    y: 50 + Math.random() * (canvas.height - 100),
                    r,
                    life: Math.max(30, 65 - Math.min(40, curScore / 25)),
                });
            }

            ctx.fillStyle = '#fcfaf8';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            for (let i = 0; i <= canvas.width; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i + (Math.sin(i + frames * 0.01) * 2), canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i <= canvas.height; i += 40) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i + (Math.cos(i + frames * 0.01) * 2));
                ctx.stroke();
            }

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

            for (const target of targets) {
                target.life--;
                if (target.life <= 0) {
                    endGame();
                    return;
                }

                ctx.beginPath();
                ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(target.x, target.y, target.r * (target.life / 60), 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(target.x, target.y, target.r * 0.4, 0, Math.PI * 2);
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            for (const effect of effects) {
                effect.life--;
                if (effect.type === 'text') {
                    effect.y += effect.vy;
                    ctx.fillStyle = `${effect.color}${Math.floor((effect.life / 30) * 255).toString(16).padStart(2, '0')}`;
                    ctx.font = 'bold 16px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText(effect.text, effect.x, effect.y);
                } else {
                    effect.r += 3;
                    ctx.strokeStyle = `${effect.color}${Math.floor((effect.life / 30) * 255).toString(16).padStart(2, '0')}`;
                    ctx.beginPath();
                    ctx.arc(effect.x, effect.y, effect.r, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            effects = effects.filter((effect) => effect.life > 0);
            targets = targets.filter((target) => target.life > 0);
            animationId = requestAnimationFrame(loop);
        };

        const handleHit = (event: MouseEvent | TouchEvent) => {
            if (!playingRef.current) return;
            if (event.cancelable && event.type === 'touchstart') event.preventDefault();

            const rect = canvas.getBoundingClientRect();
            const point = 'touches' in event ? event.touches[0] ?? event.changedTouches[0] : event;
            const x = (point.clientX - rect.left) * (canvas.width / rect.width);
            const y = (point.clientY - rect.top) * (canvas.height / rect.height);

            let hit = false;
            targets.forEach((target) => {
                if (Math.hypot(target.x - x, target.y - y) < target.r) {
                    target.life = -1;
                    curScore += 25;
                    setScore(curScore);
                    effects.push({ x: target.x, y: target.y, text: '+25', color: '#16a34a', type: 'text', life: 30, vy: -1.5 });
                    effects.push({ x: target.x, y: target.y, color: '#ef4444', type: 'pop', life: 30, r: 10 });
                    hit = true;
                }
            });

            if (!hit) {
                curScore = Math.max(0, curScore - 5);
                setScore(curScore);
                effects.push({ x, y, text: '-5', color: '#dc2626', type: 'text', life: 30, vy: -1.5 });
            }
        };

        canvas.addEventListener('mousedown', handleHit as EventListener);
        canvas.addEventListener('touchstart', handleHit as EventListener, { passive: false });
        loop();

        cleanupRef.current = () => {
            playingRef.current = false;
            cancelAnimationFrame(animationId);
            canvas.removeEventListener('mousedown', handleHit as EventListener);
            canvas.removeEventListener('touchstart', handleHit as EventListener);
        };
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }} className="game-console game-console--portrait">
            <canvas ref={canvasRef} width={400} height={500} className="game-canvas game-canvas-portrait" />
            {!playing && !gameOver && (
                <div className="game-overlay">
                    <div style={{ background: '#000', color: '#fff', padding: '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>REFLEX</h2>
                    </div>

                    <div className="game-panel">
                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc', margin: 0 }}>MISSION: NEUTRALIZE</p>
                        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '0.5rem 0 1.5rem 0' }}>Eliminate nodes before they overcharge.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.88)', borderRadius: '20px', border: '1px solid rgba(148, 163, 184, 0.35)' }}>
                            <div style={{ width: '40px', height: '40px', border: '2px solid #ef4444', borderRadius: '50%', position: 'relative' }}>
                                <div style={{ width: '100%', height: '100%', border: '1px solid #ef4444', borderRadius: '50%' }} className="animate-ping" />
                            </div>
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '1px' }}>{!isTouch ? 'CLICK ACTIVE NODES' : 'TAP ACTIVE NODES'}</span>
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
                    <p style={{ fontSize: '0.7rem', opacity: 0.8, color: '#cbd5e1' }}>Penalty for miscalculation (-5 pts)</p>
                </div>
            )}
            {gameOver && (
                <div className="game-overlay">
                    <h2 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900 }}>SYSTEM OVERFLOW</h2>
                    <p style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 900 }}>SCORE: {score}</p>

                    <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '0.75rem', alignItems: 'stretch' }}>
                            <input value={name} onChange={(e) => updateName(e.target.value)} placeholder="ENTER NAME" style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', color: '#000', border: '3px solid #000', textAlign: 'center', fontSize: '1rem', fontWeight: 900, minWidth: 0 }} />
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
