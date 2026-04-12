"use client";
import { useEffect, useRef, useState } from 'react';

export default function NeonBreakout({ onFinished }: { onFinished: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [name, setName] = useState("Player");

    const startGame = async () => {
        if (containerRef.current?.requestFullscreen) await containerRef.current.requestFullscreen();
        setPlaying(true); setGameOver(false); setScore(0); setLevel(1);
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        // Game State
        let balls = [{ x: canvas.width / 2, y: canvas.height - 50, dx: 4, dy: -4, r: 6, power: 1 }];
        let paddle = { x: canvas.width / 2 - 50, w: 100, h: 10, targetW: 100 };
        let bricks: any[] = [];
        let curLevel = 1;
        let curScore = 0;
        let powerUps: any[] = [];
        let animationId: number;

        const generateLevel = (lv: number) => {
            bricks = [];
            const rows = 3 + Math.min(5, Math.floor(lv / 10));
            const cols = 8;
            const w = (canvas.width - 40) / cols;
            const h = 20;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    // Procedural filtering for patterns based on level
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
            ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, canvas.width, canvas.height); // White Background
            ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

            // Paddle Smoothing
            paddle.w += (paddle.targetW - paddle.w) * 0.1;
            ctx.fillStyle = '#000'; ctx.fillRect(paddle.x, canvas.height - 30, paddle.w, paddle.h);

            // PowerUps
            for (let p of powerUps) {
                p.y += 3;
                ctx.fillStyle = p.type === 'multi' ? '#3b82f6' : p.type === 'wide' ? '#10b981' : '#f59e0b';
                ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
                ctx.fillText(p.type === 'multi' ? '3' : p.type === 'wide' ? 'W' : 'B', p.x, p.y + 4);

                // Collection
                if (p.y > canvas.height - 35 && p.x > paddle.x && p.x < paddle.x + paddle.w) {
                    p.active = false;
                    if (p.type === 'multi') {
                        const b = balls[0];
                        balls.push({ ...b, dx: -b.dx, dy: b.dy * 0.9 });
                        balls.push({ ...b, dx: b.dx * 0.5, dy: -Math.abs(b.dy) });
                    } else if (p.type === 'wide') {
                        paddle.targetW = 160; setTimeout(() => paddle.targetW = 100, 8000);
                    } else if (p.type === 'big') {
                        balls.forEach(b => { b.r = 12; b.power = 2; });
                        setTimeout(() => balls.forEach(b => { b.r = 6; b.power = 1; }), 8000);
                    }
                }
            }
            powerUps = powerUps.filter(p => p.active && p.y < canvas.height);

            // Balls
            for (let b of balls) {
                b.x += b.dx; b.y += b.dy;
                if (b.x < 10 || b.x > canvas.width - 10) b.dx *= -1;
                if (b.y < 10) b.dy *= -1;

                // Paddle collision
                if (b.y > canvas.height - 35 && b.x > paddle.x && b.x < paddle.x + paddle.w) {
                    b.dy = -Math.abs(b.dy);
                    b.dx = 8 * ((b.x - (paddle.x + paddle.w / 2)) / paddle.w);
                }

                // Brick collision
                for (let br of bricks) {
                    if (br.active && b.x > br.x && b.x < br.x + br.w && b.y > br.y && b.y < br.y + br.h) {
                        br.active = false; b.dy *= -1; curScore += 10; setScore(curScore);
                        if (br.isMystery) {
                            const types = ['multi', 'wide', 'big'];
                            powerUps.push({ x: br.x + br.w / 2, y: br.y, type: types[Math.floor(Math.random() * 3)], active: true });
                        }
                    }
                }

                ctx.fillStyle = b.power > 1 ? '#ef4444' : '#000';
                ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
            }

            // Cleanup dead balls
            balls = balls.filter(b => b.y < canvas.height);
            if (balls.length === 0) {
                setGameOver(true); setPlaying(false); cancelAnimationFrame(animationId); if (document.fullscreenElement) document.exitFullscreen(); return;
            }

            // Draw Bricks
            for (let br of bricks) {
                if (br.active) {
                    ctx.fillStyle = br.color; ctx.fillRect(br.x, br.y, br.w, br.h);
                    if (br.isMystery) {
                        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
                        ctx.fillText('?', br.x + br.w / 2, br.y + br.h - 5);
                    }
                }
            }

            // Level Clear
            if (bricks.every(b => !b.active)) {
                curLevel++; setLevel(curLevel);
                if (curLevel > 100) { /* Win State */ }
                generateLevel(curLevel);
                balls = [{ x: canvas.width / 2, y: canvas.height - 50, dx: 4 + curLevel / 10, dy: -(4 + curLevel / 10), r: 6, power: 1 }];
            }

            animationId = requestAnimationFrame(loop);
        };
        loop();

        const move = (e: any) => {
            const rect = canvas.getBoundingClientRect();
            const x = ((e.clientX || e.touches?.[0].clientX) - rect.left) * (canvas.width / rect.width);
            paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, x - paddle.w / 2));
        };
        window.addEventListener('mousemove', move); window.addEventListener('touchmove', move);
        return () => { cancelAnimationFrame(animationId); window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); };
    };

    const submit = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'breakout' }) });
        onFinished();
    };

    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '4px solid #000', width: '100%', height: '100%', minHeight: '600px' }} className="game-console">
            <canvas ref={canvasRef} width={400} height={600} style={{ width: 'auto', height: '90vh', maxWidth: '400px', maxHeight: '600px', display: 'block' }} />
            {!playing && !gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(248, 250, 252, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', zIndex: 10, padding: '2rem', textAlign: 'center' }}>
                    <h2 style={{ color: '#000', fontSize: '2rem', fontWeight: 900 }}>BREAKOUT</h2>
                    <div style={{ background: 'rgba(0,0,0,0.05)', padding: '1.5rem', borderRadius: '16px', width: '100%', border: '1px solid rgba(0,0,0,0.1)' }}>
                        <p style={{ fontWeight: 800, marginBottom: '0.5rem', color: '#000', letterSpacing: '0.05em' }}>STAGES: 100</p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8, color: '#000' }}>Smash mystery bricks for power-ups.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', color: '#000' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>🖱️ 👆<br />MOVE PADDLE</div>
                        </div>
                    </div>
                    <button onClick={startGame} className="btn-primary" style={{ background: '#000', color: '#fff', width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: 700 }}>BEGIN SYSTEM CLEANSE</button>
                </div>
            )}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', zIndex: 10 }}>
                    <h2 style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 800 }}>SYSTEM OVERFLOW</h2>
                    <p style={{ color: '#fff', fontSize: '1.1rem' }}>Level: {level} • Score: {score}</p>
                    <input value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', background: '#111', color: '#fff', border: '1px solid #333', textAlign: 'center' }} />
                    <button onClick={submit} className="btn-primary" style={{ background: '#ef4444', color: '#fff' }}>UPLOAD DATA</button>
                    <button onClick={startGame} className="btn-outline" style={{ color: '#fff', border: '1px solid #fff' }}>RETRY</button>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 20, right: 20, color: '#000', fontWeight: 800, fontSize: '1.1rem' }}>Lvl {level} • {score}</div>}
        </div>
    );
}
