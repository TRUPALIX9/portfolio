"use client";
import { useEffect, useRef, useState } from 'react';
import { getSavedArcadePlayerName, submitArcadeScore } from '@/utils/arcade-player';

type Ball = { x: number; y: number; dx: number; dy: number; r: number; power: number };
type Paddle = { x: number; w: number; h: number; targetW: number };
type Brick = { x: number; y: number; w: number; h: number; active: boolean; color: string; isMystery: boolean };
type PowerUpType = 'multi' | 'wide' | 'big';
type PowerUp = { x: number; y: number; type: PowerUpType; active: boolean };

export default function BreakoutGame({ onFinished }: { onFinished: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
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
        };
    }, []);

    const updateName = (val: string) => {
        setName(val);
    };

    const startGame = () => {
        cleanupRef.current?.();
        setPlaying(true); setGameOver(false); setScore(0); setLevel(1);
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        // Game State
        let balls: Ball[] = [{ x: canvas.width / 2, y: canvas.height - 50, dx: 4, dy: -4, r: 6, power: 1 }];
        let paddle: Paddle = { x: canvas.width / 2 - 50, w: 100, h: 10, targetW: 100 };
        let bricks: Brick[] = [];
        let curLevel = 1;
        let curScore = 0;
        let powerUps: PowerUp[] = [];
        let animationId: number;
        const timeoutIds: number[] = [];

        const generateLevel = (lv: number) => {
            bricks = [];
            const rows = 3 + Math.min(5, Math.floor(lv / 10));
            const cols = 8;
            const w = (canvas.width - 40) / cols;
            const h = 20;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const skip = (lv % 2 === 0 && (r + c) % 2 === 0) || (lv % 3 === 0 && r % 2 === 0);
                    if (!skip) {
                        const isMystery = Math.random() < 0.15;
                        bricks.push({ x: 20 + c * w, y: 50 + r * (h + 5), w: w - 5, h: h, active: true, color: `hsl(${(lv * 40 + r * 20) % 360}, 70%, 50%)`, isMystery });
                    }
                }
            }
        };

        generateLevel(curLevel);

        const loop = () => {
            // Paper Background
            ctx.fillStyle = '#fcfaf8'; ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Doodle Grid
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
            for (let i = 0; i <= canvas.width; i += 40) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + (Math.sin(i + curScore * 0.1) * 2), canvas.height); ctx.stroke();
            }
            for (let i = 0; i <= canvas.height; i += 40) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i + (Math.cos(i + curScore * 0.1) * 2)); ctx.stroke();
            }

            ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

            // Paddle Smoothing & Rendering (Sketchy)
            paddle.w += (paddle.targetW - paddle.w) * 0.1;
            ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(paddle.x, canvas.height - 30, paddle.w, paddle.h, 4); ctx.fill(); ctx.stroke();

            // PowerUps (Ink Blobs)
            for (let p of powerUps) {
                p.y += 3;
                ctx.fillStyle = p.type === 'multi' ? '#3b82f6' : p.type === 'wide' ? '#10b981' : '#f59e0b';
                ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
                ctx.fillText(p.type === 'multi' ? '3' : p.type === 'wide' ? 'W' : 'B', p.x, p.y + 4);

                if (p.y > canvas.height - 35 && p.x > paddle.x && p.x < paddle.x + paddle.w) {
                    p.active = false;
                    if (p.type === 'multi') {
                        const b = balls[0];
                        balls.push({ ...b, dx: -b.dx, dy: b.dy * 0.9, r: 6, power: 1 });
                        balls.push({ ...b, dx: b.dx * 0.5, dy: -Math.abs(b.dy), r: 6, power: 1 });
                    } else if (p.type === 'wide') {
                        paddle.targetW = 160;
                        timeoutIds.push(window.setTimeout(() => {
                            paddle.targetW = 100;
                        }, 8000));
                    } else if (p.type === 'big') {
                        balls.forEach(b => { b.r = 12; b.power = 2; });
                        timeoutIds.push(window.setTimeout(() => {
                            balls.forEach(b => { b.r = 6; b.power = 1; });
                        }, 8000));
                    }
                }
            }
            powerUps = powerUps.filter(p => p.active && p.y < canvas.height);

            // Balls (Ink Drops)
            for (let b of balls) {
                b.x += b.dx; b.y += b.dy;
                if (b.x < 10 || b.x > canvas.width - 10) b.dx *= -1;
                if (b.y < 10) b.dy *= -1;

                if (b.y > canvas.height - 35 && b.x > paddle.x && b.x < paddle.x + paddle.w) {
                    b.dy = -Math.abs(b.dy);
                    b.dx = 8 * ((b.x - (paddle.x + paddle.w / 2)) / paddle.w);
                }

                for (let br of bricks) {
                    if (br.active && b.x > br.x && b.x < br.x + br.w && b.y > br.y && b.y < br.y + br.h) {
                        br.active = false; b.dy *= -1; curScore += 10; setScore(curScore);
                        if (br.isMystery) {
                            const types: PowerUpType[] = ['multi', 'wide', 'big'];
                            powerUps.push({ x: br.x + br.w / 2, y: br.y, type: types[Math.floor(Math.random() * 3)], active: true });
                        }
                    }
                }
                ctx.fillStyle = b.power > 1 ? '#ef4444' : '#000';
                ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
            }

            balls = balls.filter(b => b.y < canvas.height);
            if (balls.length === 0) {
                setGameOver(true); setPlaying(false); cancelAnimationFrame(animationId); return;
            }

            // Bricks (Sketchy tiles)
            for (let br of bricks) {
                if (br.active) {
                    ctx.fillStyle = br.color; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.roundRect(br.x, br.y, br.w, br.h, 3); ctx.fill(); ctx.stroke();
                    if (br.isMystery) {
                        ctx.fillStyle = '#000'; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
                        ctx.fillText('?', br.x + br.w / 2, br.y + br.h - 5);
                    }
                }
            }

            if (bricks.every(b => !b.active)) {
                curLevel++; setLevel(curLevel);
                generateLevel(curLevel);
                balls = [{ x: canvas.width / 2, y: canvas.height - 50, dx: 4 + curLevel / 10, dy: -(4 + curLevel / 10), r: 6, power: 1 }];
            }

            animationId = requestAnimationFrame(loop);
        };
        loop();

        const move = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const point = 'touches' in e ? e.touches[0] : e;
            if (!point) return;
            const x = (point.clientX - rect.left) * (canvas.width / rect.width);
            paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, x - paddle.w / 2));
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('touchmove', move);
        cleanupRef.current = () => {
            cancelAnimationFrame(animationId);
            timeoutIds.forEach((id) => window.clearTimeout(id));
            window.removeEventListener('mousemove', move);
            window.removeEventListener('touchmove', move);
        };
    };

    const submit = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'breakout');
        onFinished();
    };

    const retry = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'breakout');
        startGame();
    };

    const trimmedName = name.trim();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }} className="game-console game-console--portrait">
            <canvas ref={canvasRef} width={400} height={600} className="game-canvas game-canvas-portrait" />
            {!playing && !gameOver && (
                <div className="game-overlay" style={{ zIndex: 20 }}>
                    <div style={{ background: '#000', color: '#fff', padding: '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>BREAKOUT</h2>
                    </div>

                    <div className="game-panel">
                        <p style={{ fontWeight: 900, fontSize: '1.2rem', color: '#f8fafc', margin: 0 }}>MISSION: SYSTEM CLEANSE</p>
                        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '0.5rem 0 2rem 0' }}>Smash mystery bricks for power-ups.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {!isTouch ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ width: '44px', height: '44px', border: '1px solid rgba(148, 163, 184, 0.45)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 900, background: 'rgba(15, 23, 42, 0.95)', color: '#f8fafc' }}>M</div>
                                        <div style={{ width: '44px', height: '44px', border: '1px solid rgba(148, 163, 184, 0.45)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 900, background: 'rgba(15, 23, 42, 0.95)', color: '#f8fafc' }}>↔</div>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e2e8f0' }}>MOUSE MOVE</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem', background: 'rgba(15, 23, 42, 0.88)', borderRadius: '24px', border: '1px solid rgba(148, 163, 184, 0.35)' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#f8fafc', borderRadius: '50%' }} className="animate-ping" />
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 900, color: '#f8fafc' }}>TOUCH & DRAG</span>
                                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Move paddle across width</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={startGame} style={{
                        background: '#000', color: '#fff', fontWeight: 900,
                        fontSize: '1.2rem', cursor: 'pointer', border: 'none',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }} className="game-start-button hover-scale">
                        INITIALIZE BRAIN
                    </button>
                </div>
            )}
            {gameOver && (
                <div className="game-overlay" style={{ zIndex: 20 }}>
                    <h2 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase' }}>SYSTEM OVERFLOW</h2>
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
            {playing && (
                <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
                    <span style={{ padding: '4px 12px', fontSize: '0.8rem' }} className="game-score-badge">LEVEL {level}</span>
                    <span style={{ padding: '4px 12px', fontSize: '0.8rem' }} className="game-score-badge">{score}</span>
                </div>
            )}
        </div>
    );
}
