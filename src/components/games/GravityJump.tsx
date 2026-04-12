"use client";
import { useEffect, useRef, useState } from 'react';

export default function GravityJump({ onFinished }: { onFinished: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [name, setName] = useState("Player");

    const startGame = async () => {
        if (containerRef.current?.requestFullscreen) await containerRef.current.requestFullscreen();
        setPlaying(true); setGameOver(false); setScore(0);
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        // Rocket State
        const rW = 32, rH = 48;
        let rocket = { x: canvas.width / 2 - rW / 2, y: canvas.height * 0.75, targetX: canvas.width / 2 - rW / 2 };
        let obstacles: any[] = [];
        let curScore = 0;
        let animationId: number;
        let gameSpeed = 5.5;
        let frames = 0;

        // Difficulty Calibration
        const getSpawnInterval = () => Math.max(20, 45 - Math.floor(curScore / 100)); // Faster spawns
        const getObstacleSpeed = () => Math.min(10, 5.5 + (curScore / 200));

        // Asteroid Generator - Ensuring a fair gap
        const createAsteroid = () => {
            const w = 45 + Math.random() * 60;
            const points = [];
            const steps = 8;
            for (let i = 0; i < steps; i++) {
                const angle = (i / steps) * Math.PI * 2;
                const dist = (w / 2) * (0.8 + Math.random() * 0.4);
                points.push({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
            }
            // Logic: ensure x is not entirely blocking a single path if possible (simple randomization here)
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
            bg.addColorStop(0, '#f8fafc'); bg.addColorStop(0.5, '#e2e8f0'); bg.addColorStop(1, '#94a3b8');
            ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#fff';
            for (let i = 0; i < 30; i++) {
                const sx = (Math.sin(i * 999) * 0.5 + 0.5) * canvas.width;
                const sy = ((Math.cos(i * 777) * 0.5 + 0.5) * canvas.height + frames * 2) % canvas.height;
                ctx.globalAlpha = 0.3; ctx.fillRect(sx, sy, 2, 2); ctx.globalAlpha = 1;
            }

            for (let o of obstacles) {
                o.y += o.vy; o.rot += o.vRot;
                ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot);
                ctx.beginPath(); ctx.moveTo(o.points[0].x, o.points[0].y);
                o.points.forEach((pt: any) => ctx.lineTo(pt.x, pt.y)); ctx.closePath();
                ctx.fillStyle = '#94a3b8'; ctx.fill(); ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.stroke();
                ctx.restore();

                const dist = Math.hypot(rocket.x + rW / 2 - o.x, rocket.y + rH / 2 - o.y);
                if (dist < (o.w / 2 + 10)) {
                    setGameOver(true); setPlaying(false); cancelAnimationFrame(animationId); if (document.fullscreenElement) document.exitFullscreen(); return;
                }
            }
            obstacles = obstacles.filter(o => o.y < canvas.height + 100);

            // Rocket
            ctx.save(); ctx.translate(rocket.x, rocket.y);
            ctx.fillStyle = '#ef4444'; ctx.fillRect(-5, rH - 15, 10, 15); ctx.fillRect(rW - 5, rH - 15, 10, 15);
            ctx.fillStyle = '#f1f5f9'; ctx.beginPath(); ctx.roundRect(0, 5, rW, rH - 5, [15, 15, 5, 5]); ctx.fill();
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(rW / 2, 0); ctx.lineTo(rW, 15); ctx.fill();
            ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(rW / 2, 20, 6, 0, Math.PI * 2); ctx.fill();
            const flw = 15 + Math.sin(frames * 0.5) * 5;
            const grad = ctx.createRadialGradient(rW / 2, rH, 0, rW / 2, rH, flw);
            grad.addColorStop(0, '#fbbf24'); grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad; ctx.fillRect(rW / 2 - 20, rH, 40, flw * 2);
            ctx.restore();

            curScore += 0.5; setScore(Math.floor(curScore));
            animationId = requestAnimationFrame(loop);
        };
        loop();

        const move = (e: any) => {
            const rect = canvas.getBoundingClientRect();
            const x = ((e.clientX || e.touches?.[0].clientX) - rect.left) * (canvas.width / rect.width);
            rocket.targetX = Math.max(0, Math.min(canvas.width - rW, x - rW / 2));
        };
        window.addEventListener('mousemove', move); window.addEventListener('touchmove', move);
        return () => { cancelAnimationFrame(animationId); window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); };
    };

    const submit = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'gravity' }) });
        onFinished();
    };

    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '4px solid #ef4444', width: '100%', height: '100%', minHeight: '600px' }} className="game-console">
            <canvas ref={canvasRef} width={400} height={600} style={{ width: 'auto', height: '90vh', maxWidth: '400px', maxHeight: '600px', display: 'block' }} />
            {!playing && !gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(248, 250, 252, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', zIndex: 10, padding: '2rem', textAlign: 'center' }}>
                    <h2 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900 }}>ROCKET</h2>
                    <div style={{ background: 'rgba(0,0,0,0.05)', padding: '1.5rem', borderRadius: '20px', width: '100%', border: '1px solid rgba(0,0,0,0.1)' }}>
                        <p style={{ fontWeight: 800, marginBottom: '0.5rem', color: '#000', letterSpacing: '0.05em' }}>MISSION: SURVIVAL</p>
                        <p style={{ fontSize: '0.95rem', opacity: 0.8, color: '#000' }}>Navigate the celestial debris field.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', color: '#000' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>⌨️ 🖱️<br />DRAG TO STEER</div>
                        </div>
                    </div>
                    <button onClick={startGame} className="btn-primary" style={{ background: '#ef4444', color: '#fff', width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: 700 }}>LAUNCH MISSION</button>
                </div>
            )}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(248, 250, 252, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', zIndex: 10 }}>
                    <h2 style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 800 }}>HULL BREACHED</h2>
                    <p style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: 600 }}>Altitude: {score}m</p>
                    <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Cpt. Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', textAlign: 'center', width: '100%' }} />
                    </div>
                    <button onClick={submit} className="btn-primary" style={{ background: '#ef4444', color: '#fff', width: '80%' }}>Submit Score</button>
                    <button onClick={startGame} className="btn-outline" style={{ color: '#1e293b', border: '1px solid #1e293b', width: '80%' }}>Relaunch</button>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 20, right: 20, color: '#ef4444', fontWeight: 900, fontSize: '1.4rem' }}>{score}m</div>}
        </div>
    );
}
