"use client";
import { useEffect, useRef, useState } from 'react';
import { getSavedArcadePlayerName, saveArcadePlayerName, submitArcadeScore } from '@/utils/arcade-player';

type Star = { x: number; y: number; z: number };
type AsteroidPoint = { x: number; y: number };
type Asteroid = {
    x: number;
    y: number;
    w: number;
    h: number;
    points: AsteroidPoint[];
    rot: number;
    vRot: number;
    vy: number;
};

export default function RocketGame({ onFinished }: { onFinished: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
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
        };
    }, []);

    const updateName = (val: string) => {
        setName(val);
        saveArcadePlayerName(val);
    };

    const startGame = () => {
        cleanupRef.current?.();
        setPlaying(true); setGameOver(false); setScore(0);
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        const rW = 32, rH = 48;
        let rocket = { x: canvas.width / 2 - rW / 2, y: canvas.height * 0.75, targetX: canvas.width / 2 - rW / 2 };
        let obstacles: Asteroid[] = [];
        let curScore = 0;
        let animationId: number;
        let frames = 0;
        const stars: Star[] = Array.from({ length: 80 }, () => ({
            x: (Math.random() - 0.5) * canvas.width * 1.2,
            y: (Math.random() - 0.5) * canvas.height * 1.2,
            z: 0.2 + Math.random() * 1.8,
        }));
        const nebulaBands = Array.from({ length: 4 }, (_, index) => ({
            x: index * 110,
            width: 84 + index * 18,
            speed: 0.7 + index * 0.22,
            hue: [196, 220, 268, 330][index],
        }));

        const getSpawnInterval = () => Math.max(20, 45 - Math.floor(curScore / 100));
        const getObstacleSpeed = () => Math.min(10, 5.5 + (curScore / 200));

        const createAsteroid = () => {
            const w = 45 + Math.random() * 60;
            const points: AsteroidPoint[] = [];
            const steps = 8;
            for (let i = 0; i < steps; i++) {
                const angle = (i / steps) * Math.PI * 2;
                const dist = (w / 2) * (0.8 + Math.random() * 0.4);
                points.push({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
            }
            return {
                x: Math.random() * canvas.width,
                y: -100, w, h: w, points,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.1,
                vy: getObstacleSpeed() * (0.9 + Math.random() * 0.3)
            };
        };

        const loop = () => {
            frames++;
            if (frames % getSpawnInterval() === 0) {
                obstacles.push(createAsteroid());
            }

            rocket.x += (rocket.targetX - rocket.x) * 0.15;

            const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bg.addColorStop(0, '#020617');
            bg.addColorStop(0.45, '#0f172a');
            bg.addColorStop(1, '#111827');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (const band of nebulaBands) {
                const bandY = (frames * band.speed * 2.4) % (canvas.height + 220) - 220;
                const glow = ctx.createLinearGradient(0, bandY, 0, bandY + 220);
                glow.addColorStop(0, `hsla(${band.hue}, 90%, 70%, 0)`);
                glow.addColorStop(0.4, `hsla(${band.hue}, 82%, 60%, 0.1)`);
                glow.addColorStop(0.65, `hsla(${band.hue}, 88%, 58%, 0.18)`);
                glow.addColorStop(1, `hsla(${band.hue}, 90%, 70%, 0)`);
                ctx.fillStyle = glow;
                ctx.fillRect(band.x, bandY, band.width, 220);
            }

            ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 9; i++) {
                const streakX = (i * 48 + frames * 2.4) % (canvas.width + 120) - 60;
                ctx.beginPath();
                ctx.moveTo(streakX, -20);
                ctx.lineTo(streakX - 46, canvas.height + 20);
                ctx.stroke();
            }

            for (const star of stars) {
                star.z -= 0.018;
                if (star.z <= 0.1) {
                    star.x = (Math.random() - 0.5) * canvas.width * 1.2;
                    star.y = (Math.random() - 0.5) * canvas.height * 1.2;
                    star.z = 2;
                }

                const sx = canvas.width / 2 + star.x / star.z;
                const sy = canvas.height / 2 + star.y / star.z;
                const size = Math.max(1, (2 - star.z) * 1.8);
                const alpha = Math.max(0.35, 1 - star.z / 2);

                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.fillRect(sx, sy, size, size);
                ctx.fillStyle = `rgba(56,189,248,${alpha * 0.35})`;
                ctx.fillRect(sx - 0.5, sy - 0.5, size + 1, size + 1);

                if (size > 1.8) {
                    ctx.fillStyle = `rgba(125, 211, 252, ${alpha * 0.2})`;
                    ctx.fillRect(sx, sy, 1, 12 + size * 6);
                }
            }

            for (const o of obstacles) {
                o.y += o.vy; o.rot += o.vRot;
                ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot);
                ctx.beginPath(); ctx.moveTo(o.points[0].x, o.points[0].y);
                o.points.forEach((pt) => ctx.lineTo(pt.x, pt.y)); ctx.closePath();
                ctx.fillStyle = '#94a3b8'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 2.5; ctx.stroke();
                ctx.restore();

                const dist = Math.hypot(rocket.x + rW / 2 - o.x, rocket.y + rH / 2 - o.y);
                if (dist < (o.w / 2 + 10)) {
                    setGameOver(true); setPlaying(false); cancelAnimationFrame(animationId); return;
                }
            }
            obstacles = obstacles.filter(o => o.y < canvas.height + 100);

            ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

            ctx.save(); ctx.translate(rocket.x, rocket.y);
            ctx.fillStyle = '#ef4444'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
            ctx.fillRect(-5, rH - 15, 10, 15); ctx.strokeRect(-5, rH - 15, 10, 15);
            ctx.fillRect(rW - 5, rH - 15, 10, 15); ctx.strokeRect(rW - 5, rH - 15, 10, 15);
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(0, 5, rW, rH - 5, [15, 15, 5, 5]); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(rW / 2, 20, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            const flw = 15 + Math.sin(frames * 0.5) * 5;
            ctx.fillStyle = '#fbbf24'; ctx.beginPath();
            ctx.moveTo(rW / 2 - 5, rH); ctx.lineTo(rW / 2, rH + flw); ctx.lineTo(rW / 2 + 5, rH); ctx.fill();
            ctx.restore();

            curScore += 0.5; setScore(Math.floor(curScore));
            animationId = requestAnimationFrame(loop);
        };
        loop();

        const move = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const point = 'touches' in e ? e.touches[0] : e;
            if (!point) return;
            const x = (point.clientX - rect.left) * (canvas.width / rect.width);
            rocket.targetX = Math.max(0, Math.min(canvas.width - rW, x - rW / 2));
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('touchmove', move);
        cleanupRef.current = () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('mousemove', move);
            window.removeEventListener('touchmove', move);
        };
    };

    const submit = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'rocket');
        onFinished();
    };

    const retry = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'rocket');
        startGame();
    };

    const trimmedName = name.trim();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }} className="game-console game-console--portrait">
            <canvas ref={canvasRef} width={400} height={600} className="game-canvas game-canvas-portrait" />
            {!playing && !gameOver && (
                <div className="game-overlay">
                    <div style={{ background: '#000', color: '#fff', padding: '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>ROCKET</h2>
                    </div>

                    <div className="game-panel">
                        <p style={{ fontWeight: 900, fontSize: '1.2rem', color: '#f8fafc', margin: 0 }}>MISSION: SURVIVAL</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {!isTouch ? (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <div style={{ width: '44px', height: '44px', border: '1px solid rgba(148, 163, 184, 0.45)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 900, background: 'rgba(15, 23, 42, 0.95)', color: '#f8fafc' }}>M</div>
                                            <div style={{ width: '44px', height: '44px', border: '1px solid rgba(148, 163, 184, 0.45)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 900, background: 'rgba(15, 23, 42, 0.95)', color: '#f8fafc' }}>↔</div>
                                        </div>
                                        <span style={{ fontSize: '10px', color: '#e2e8f0', fontWeight: 800 }}>MOUSE MOVE</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.88)', borderRadius: '24px', border: '1px solid rgba(148, 163, 184, 0.35)' }}>
                                    <div style={{ position: 'relative', width: '60px', height: '24px', border: '1px dashed rgba(148, 163, 184, 0.55)', borderRadius: '12px' }}>
                                        <div style={{ width: '14px', height: '14px', background: '#f8fafc', borderRadius: '50%', position: 'absolute', top: '3px', left: '10px' }} className="animate-bounce" />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ display: 'block', fontSize: '1rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '1px' }}>DRAG / SWIPE</span>
                                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Tilt ship for navigation</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={startGame} style={{
                        background: '#000', color: '#fff', fontWeight: 900,
                        fontSize: '1.1rem', cursor: 'pointer', border: 'none',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }} className="game-start-button hover-scale">
                        LAUNCH MISSION
                    </button>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', opacity: 0.8 }}>TYPE: DODGE SURVIVAL</p>
                </div>
            )}
            {gameOver && (
                <div className="game-overlay" style={{ zIndex: 20 }}>
                    <h2 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase' }}>IMPACT DETECTED</h2>
                    <p style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 900 }}>SCORE: {score}</p>

                    <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '0.75rem', alignItems: 'stretch' }}>
                            <input value={name.toUpperCase()} onChange={e => updateName(e.target.value.toUpperCase())} placeholder="ENTER NAME" style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', color: '#000', border: '3px solid #000', textAlign: 'center', fontSize: '1rem', fontWeight: 900, minWidth: 0, textTransform: 'uppercase' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
                            <button onClick={submit} disabled={!trimmedName} style={{ background: trimmedName ? '#e2e8f0' : '#cbd5e1', color: '#000', padding: '1.1rem 0.75rem', borderRadius: '12px', fontWeight: 900, fontSize: '0.95rem', border: 'none', cursor: trimmedName ? 'pointer' : 'not-allowed' }}>
                                EXIT
                            </button>
                            <button onClick={retry} disabled={!trimmedName} style={{ background: trimmedName ? '#000' : '#475569', color: '#fff', padding: '1.1rem 0.75rem', borderRadius: '12px', fontWeight: 900, fontSize: '0.95rem', border: 'none', cursor: trimmedName ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <span>🔄</span> PLAY AGAIN
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: trimmedName ? '#94a3b8' : '#fca5a5', margin: 0 }}>{trimmedName ? 'Both actions will save this score with the entered name.' : 'Enter a name to enable both EXIT and PLAY AGAIN.'}</p>
                    </div>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 16, right: 16, padding: '6px 10px', fontSize: '1.1rem' }} className="game-score-badge">{score}m</div>}
        </div>
    );
}
