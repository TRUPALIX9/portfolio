"use client";
import { useEffect, useRef, useState } from 'react';

export default function RunnerGame({ onFinished }: { onFinished: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [isTouch, setIsTouch] = useState(false);
    const [name, setName] = useState("Player");

    useEffect(() => {
        setIsTouch(window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);
        const savedName = localStorage.getItem('arcade-player-name');
        if (savedName) setName(savedName);
    }, []);

    const updateName = (val: string) => {
        setName(val);
        localStorage.setItem('arcade-player-name', val);
    };

    const submit = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'runner' }) });
        onFinished();
    };

    const retry = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'runner' }) });
        startGame();
    };

    const startGame = async () => {
        if (containerRef.current?.requestFullscreen) await containerRef.current.requestFullscreen();
        setPlaying(true); setGameOver(false); setScore(0);
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        const pSize = 35;
        let player = { x: 80, y: canvas.height - 60, w: pSize, h: pSize, vy: 0, jumps: 0, rot: 0 };
        let gravity = 0.65;
        let groundY = canvas.height - 30;
        let obstacles: any[] = [];
        let curScore = 0;
        let animationId: number;
        let baseSpeed = 5.5;
        let frames = 0;
        let effects: any[] = [];

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
                    setGameOver(true); setPlaying(false); cancelAnimationFrame(animationId); if (document.fullscreenElement) document.exitFullscreen(); return;
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
        (window as any).requestJump = jump;
        return () => { cancelAnimationFrame(animationId); window.removeEventListener('keydown', handleKey); };
    };

    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '4px solid #000', width: '100%', height: '100%', minHeight: '500px' }} className="game-console">
            <canvas ref={canvasRef} width={600} height={400} style={{ width: '100%', height: 'auto', maxWidth: '600px', display: 'block' }} />
            {!playing && !gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', zIndex: 10, padding: '2rem', textAlign: 'center' }}>
                    <div style={{ background: '#000', color: '#fff', padding: '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>RUNNER</h2>
                    </div>

                    <div style={{ padding: '2rem', borderRadius: '24px', background: '#fff', border: '2px solid #000', width: '100%', maxWidth: '340px' }}>
                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#000', margin: 0 }}>MISSION: SURVIVE</p>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0.5rem 0 2rem 0' }}>Clear the neural firewall obstacles.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {!isTouch ? (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                        <div style={{ width: '44px', height: '44px', border: '2px solid #000', borderRadius: '8px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: '#000' }}>↑</div>
                                        <span style={{ fontSize: '10px', color: '#000', fontWeight: 700 }}>SPACE / UP</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '24px', border: '2px solid #000' }}>
                                    <div style={{ width: '20px', height: '20px', background: '#f59e0b', borderRadius: '50%' }} className="animate-bounce" />
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 900, color: '#000' }}>TAP TO JUMP</span>
                                        <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>Clear the neural firewall</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={startGame} style={{ background: '#000', color: '#fff', width: '100%', maxWidth: '340px', padding: '1.25rem', borderRadius: '16px', fontWeight: 900, fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>INITIALIZE</button>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', bottom: 40, right: 40, zIndex: 20 }}><button onPointerDown={(e) => { e.preventDefault(); (window as any).requestJump(); }} style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 0, 0, 0.1)', border: '3px solid #000', color: '#000', fontWeight: 900, backdropFilter: 'blur(5px)' }}>JUMP</button></div>}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', zIndex: 10, padding: '2rem' }}>
                    <h2 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900 }}>FIREWALL BREACH</h2>
                    <p style={{ color: '#000', fontSize: '1.5rem', fontWeight: 900 }}>SCORE: {score}</p>

                    <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input value={name} onChange={e => updateName(e.target.value)} placeholder="ENTER ID" style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', color: '#000', border: '3px solid #000', textAlign: 'center', fontSize: '1.2rem', fontWeight: 900 }} />

                        <button onClick={retry} style={{ background: '#000', color: '#fff', padding: '1.25rem', borderRadius: '12px', fontWeight: 900, fontSize: '1.1rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <span>🔄</span> PLAY AGAIN
                        </button>

                        <button onClick={submit} style={{ background: '#e2e8f0', color: '#000', padding: '1rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}>
                            SAVE & HUB
                        </button>
                    </div>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 20, right: 20, color: '#000', fontWeight: 800, background: '#fff', padding: '4px 8px', border: '2px solid #000', borderRadius: '4px' }}>{score}m</div>}
        </div>
    );
}
