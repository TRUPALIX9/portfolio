"use client";
import { useEffect, useRef, useState } from 'react';
import { getSavedArcadePlayerName, submitArcadeScore } from '@/utils/arcade-player';

type RunnerObstacle = { x: number; y: number; w: number; h: number; type: string };
type RunnerEffect = { x: number; y: number; text: string; life: number; color: string };

export default function RunnerGame({ onFinished }: { onFinished: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const jumpRef = useRef<(() => void) | null>(null);
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
            jumpRef.current = null;
        };
    }, []);

    const updateName = (val: string) => {
        setName(val);
    };

    const submit = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'runner');
        onFinished();
    };

    const retry = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'runner');
        startGame();
    };

    const trimmedName = name.trim();

    const startGame = () => {
        cleanupRef.current?.();
        setPlaying(true); setGameOver(false); setScore(0);
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        const pSize = 35;
        let player = { x: 80, y: canvas.height - 60, w: pSize, h: pSize, vy: 0, jumps: 0, rot: 0 };
        let gravity = 0.65;
        let groundY = canvas.height - 30;
        let obstacles: RunnerObstacle[] = [];
        let curScore = 0;
        let animationId: number;
        let baseSpeed = 5.5;
        let frames = 0;
        let effects: RunnerEffect[] = [];

        const patterns = [
            [{ t: 'ground', x: 0 }], [{ t: 'ground', x: 0 }, { t: 'ground', x: 60 }],
            [{ t: 'air', x: 0 }], [{ t: 'ground', x: 0 }, { t: 'air', x: 0 }],
            [{ t: 'tall', x: 0 }], [{ t: 'ground', x: 0 }, { t: 'tall', x: 150 }]
        ];

        const spawnPattern = () => {
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            const baseX = canvas.width + 100;
            pattern.forEach(p => {
                let h = 30, y = groundY - 30;
                if (p.t === 'air') { y = groundY - 75; h = 25; }
                if (p.t === 'air_high') { y = groundY - 110; h = 25; }
                if (p.t === 'tall') { y = groundY - 60; h = 60; }
                obstacles.push({ x: baseX + p.x, y, w: 25, h, type: p.t });
            });
        };

        const jump = () => {
            if (player.jumps < 2) {
                player.vy = -13;
                player.jumps++;
                effects.push({ x: player.x + 15, y: player.y, text: player.jumps === 2 ? "SUPER!" : "HOP", life: 25, color: '#fff' });
            }
        };
        jumpRef.current = jump;

        const loop = () => {
            frames++;
            // Progressive Frequency
            const frequency = Math.max(60, 100 - Math.floor(curScore / 200));
            if (frames % frequency === 0) { spawnPattern(); }

            // Progressive Speed
            const currentSpeed = Math.min(10.5, baseSpeed + (curScore / 1000));

            player.vy += gravity;
            player.y += player.vy;
            if (player.y >= groundY - player.h) {
                player.y = groundY - player.h; player.vy = 0; player.jumps = 0; player.rot = 0;
            } else { player.rot += 0.12; }

            // Paper Background
            ctx.fillStyle = '#fcfaf8'; ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Doodle Grid
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
            const scroll = (frames * currentSpeed) % 40;
            for (let i = -40; i <= canvas.width + 40; i += 40) {
                ctx.beginPath(); ctx.moveTo(i - scroll, 0); ctx.lineTo(i - scroll + (Math.sin(i) * 2), canvas.height); ctx.stroke();
            }
            for (let i = 0; i <= canvas.height; i += 40) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i + (Math.cos(i) * 2)); ctx.stroke();
            }

            // Sketchy Ground
            ctx.fillStyle = '#1e293b'; ctx.fillRect(0, groundY, canvas.width, 30);
            ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(0, groundY, canvas.width, 1);

            ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

            // Player (Doodle Style)
            ctx.save();
            ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
            if (player.y < groundY - player.h) ctx.rotate(player.rot);
            ctx.fillStyle = '#f59e0b'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(-player.w / 2, -player.h / 2, player.w, player.h, 4); ctx.fill(); ctx.stroke();

            // Eyes
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(-7, -4, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(7, -4, 2.5, 0, Math.PI * 2); ctx.fill();
            const mood = curScore / 10;
            ctx.beginPath(); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
            if (mood < 200) { ctx.arc(0, 10, 6, Math.PI + 0.2, (Math.PI * 2) - 0.2); }
            else if (mood < 500) { ctx.moveTo(-5, 8); ctx.lineTo(5, 8); }
            else { ctx.arc(0, 5, 6, 0.2, Math.PI - 0.2); }
            ctx.stroke(); ctx.restore();

            for (let o of obstacles) {
                o.x -= currentSpeed;
                ctx.fillStyle = '#ef4444'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h, 4); ctx.fill(); ctx.stroke();

                if (player.x + 8 < o.x + o.w && player.x + player.w - 8 > o.x && player.y + 8 < o.y + o.h && player.y + player.h - 8 > o.y) {
                    setGameOver(true); setPlaying(false); cancelAnimationFrame(animationId); return;
                }
            }
            obstacles = obstacles.filter(o => o.x > -100);

            for (let e of effects) {
                e.life--; e.y -= 2; ctx.fillStyle = `rgba(0,0,0,${e.life / 25})`;
                ctx.font = 'bold 12px Inter'; ctx.fillText(e.text, e.x, e.y);
            }
            effects = effects.filter(e => e.life > 0);

            curScore += 1.5; setScore(Math.floor(curScore / 10));
            animationId = requestAnimationFrame(loop);
        };
        loop();

        const handleKey = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
        };
        window.addEventListener('keydown', handleKey);
        cleanupRef.current = () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleKey);
            jumpRef.current = null;
        };
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }} className="game-console game-console--landscape">
            <canvas ref={canvasRef} width={600} height={400} className="game-canvas game-canvas-wide" />
            {!playing && !gameOver && (
                <div className="game-overlay">
                    <div style={{ background: '#000', color: '#fff', padding: '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>RUNNER</h2>
                    </div>

                    <div className="game-panel">
                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc', margin: 0 }}>MISSION: SURVIVE</p>
                        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '0.5rem 0 2rem 0' }}>Clear the neural firewall obstacles.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {!isTouch ? (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                        <div style={{ width: '44px', height: '44px', border: '1px solid rgba(148, 163, 184, 0.45)', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc' }}>↑</div>
                                        <span style={{ fontSize: '10px', color: '#e2e8f0', fontWeight: 700 }}>SPACE / UP</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.88)', borderRadius: '24px', border: '1px solid rgba(148, 163, 184, 0.35)' }}>
                                    <div style={{ width: '20px', height: '20px', background: '#f59e0b', borderRadius: '50%' }} className="animate-bounce" />
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 900, color: '#f8fafc' }}>TAP TO JUMP</span>
                                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Clear the neural firewall</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={startGame} style={{ background: '#000', color: '#fff', fontWeight: 900, fontSize: '1.1rem', border: 'none', cursor: 'pointer' }} className="game-start-button">INITIALIZE</button>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 20 }}><button onPointerDown={(e) => { e.preventDefault(); jumpRef.current?.(); }} style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.45)', color: '#f8fafc', fontWeight: 900, backdropFilter: 'blur(5px)' }}>JUMP</button></div>}
            {gameOver && (
                <div className="game-overlay">
                    <h2 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900 }}>FIREWALL BREACH</h2>
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
            {playing && <div style={{ position: 'absolute', top: 16, right: 16, padding: '6px 10px' }} className="game-score-badge">{score}m</div>}
        </div>
    );
}
