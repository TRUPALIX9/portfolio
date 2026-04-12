"use client";
import { useEffect, useRef, useState } from 'react';

export default function GravityJump({ onFinished }: { onFinished: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [name, setName] = useState("Player");
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        setIsTouch(window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);
        const savedName = localStorage.getItem('arcade-player-name');
        if (savedName) setName(savedName);
    }, []);

    const updateName = (val: string) => {
        setName(val);
        localStorage.setItem('arcade-player-name', val);
    };

    const startGame = async () => {
        if (containerRef.current?.requestFullscreen) await containerRef.current.requestFullscreen();
        setPlaying(true); setGameOver(false); setScore(0);
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        const rW = 32, rH = 48;
        let rocket = { x: canvas.width / 2 - rW / 2, y: canvas.height * 0.75, targetX: canvas.width / 2 - rW / 2 };
        let obstacles: any[] = [];
        let curScore = 0;
        let animationId: number;
        let gameSpeed = 5.5;
        let frames = 0;

        const getSpawnInterval = () => Math.max(20, 45 - Math.floor(curScore / 100));
        const getObstacleSpeed = () => Math.min(10, 5.5 + (curScore / 200));

        const createAsteroid = () => {
            const w = 45 + Math.random() * 60;
            const points = [];
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
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'rocket' }) });
        onFinished();
    };

    const retry = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'rocket' }) });
        startGame();
    };

    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '4px solid #ef4444', width: '100%', height: '100%', minHeight: '600px' }} className="game-console">
            <canvas ref={canvasRef} width={400} height={600} style={{ width: 'auto', height: '90vh', maxWidth: '400px', maxHeight: '600px', display: 'block' }} />
            {!playing && !gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', zIndex: 10, padding: '2rem', textAlign: 'center' }}>
                    <div style={{ background: '#ef4444', color: '#fff', padding: '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>ROCKET</h2>
                    </div>

                    <div style={{ padding: '2rem', borderRadius: '24px', background: '#fff', border: '2px solid #ef4444', width: '100%', maxWidth: '340px', boxShadow: '8px 8px 0px #fee2e2' }}>
                        <p style={{ fontWeight: 900, fontSize: '1.2rem', color: '#000', margin: 0 }}>MISSION: SURVIVAL</p>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0.5rem 0 1.5rem 0' }}>Navigate the celestial debris field.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {!isTouch ? (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <div style={{ width: '44px', height: '44px', border: '3px solid #000', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900, boxShadow: '0 5px 0 #000', background: '#fff', color: '#000' }}>A</div>
                                            <div style={{ width: '44px', height: '44px', border: '3px solid #000', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900, boxShadow: '0 5px 0 #000', background: '#fff', color: '#000' }}>D</div>
                                        </div>
                                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 800 }}>STEER</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <div style={{ width: '44px', height: '44px', border: '3px solid #000', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900, boxShadow: '0 5px 0 #000', background: '#fff', color: '#000' }}>←</div>
                                            <div style={{ width: '44px', height: '44px', border: '3px solid #000', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900, boxShadow: '0 5px 0 #000', background: '#fff', color: '#000' }}>→</div>
                                        </div>
                                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 800 }}>LATERAL</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '1.5rem', background: '#fef2f2', borderRadius: '24px', border: '2px solid #fee2e2' }}>
                                    <div style={{ position: 'relative', width: '60px', height: '24px', border: '2px dashed #ef4444', borderRadius: '12px' }}>
                                        <div style={{ width: '14px', height: '14px', background: '#ef4444', borderRadius: '50%', position: 'absolute', top: '3px', left: '10px' }} className="animate-bounce" />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ display: 'block', fontSize: '1rem', fontWeight: 900, color: '#000', letterSpacing: '1px' }}>DRAG / SWIPE</span>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Tilt ship for navigation</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={startGame} style={{
                        background: '#ef4444', color: '#fff', width: '100%', maxWidth: '300px',
                        padding: '1.25rem', borderRadius: '16px', fontWeight: 900,
                        fontSize: '1.1rem', cursor: 'pointer', border: 'none',
                        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }} className="hover-scale">
                        LAUNCH MISSION
                    </button>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', opacity: 0.6 }}>TYPE: DODGE SURVIVAL</p>
                </div>
            )}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', zIndex: 20, padding: '2rem' }}>
                    <h2 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase' }}>IMPACT DETECTED</h2>
                    <p style={{ color: '#000', fontSize: '1.5rem', fontWeight: 900 }}>SCORE: {score}</p>

                    <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input value={name} onChange={e => updateName(e.target.value)} placeholder="ENTER ID" style={{ padding: '1rem', borderRadius: '12px', background: '#fff', color: '#000', border: '3px solid #000', textAlign: 'center', fontSize: '1.2rem', fontWeight: 900 }} />

                        <button onClick={retry} style={{ background: '#000', color: '#fff', padding: '1.25rem', borderRadius: '12px', fontWeight: 900, fontSize: '1.1rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <span>🔄</span> PLAY AGAIN
                        </button>

                        <button onClick={submit} style={{ background: '#e2e8f0', color: '#000', padding: '1rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}>
                            SAVE & HUB
                        </button>
                    </div>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 20, right: 20, color: '#ef4444', fontWeight: 900, fontSize: '1.4rem', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>{score}m</div>}
        </div>
    );
}
