"use client";
import { useEffect, useRef, useState } from 'react';

export default function ShooterGame({ onFinished }: { onFinished: () => void }) {
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
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'shooter' }) });
        onFinished();
    };

    const retry = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'shooter' }) });
        startGame();
    };

    const startGame = async () => {
        if (containerRef.current?.requestFullscreen) await containerRef.current.requestFullscreen();
        setPlaying(true); setGameOver(false); setScore(0);
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        let targets: any[] = [];
        let effects: any[] = [];
        let animationId: number;
        let curScore = 0;
        let frames = 0;

        const loop = () => {
            frames++;
            // Progressive Difficulty
            const spawnRate = Math.max(15, 45 - Math.floor(curScore / 100)); // More targets
            if (frames % spawnRate === 0) {
                const r = Math.max(15, 22 - (curScore / 500)); // Smaller targets
                targets.push({ x: 50 + Math.random() * (canvas.width - 100), y: 50 + Math.random() * (canvas.height - 100), r, life: Math.max(30, 65 - Math.min(40, curScore / 25)) });
            }

            // Paper Background
            ctx.fillStyle = '#fcfaf8'; ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Doodle Grid
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
            for (let i = 0; i <= canvas.width; i += 40) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + (Math.sin(i + frames * 0.01) * 2), canvas.height); ctx.stroke();
            }
            for (let i = 0; i <= canvas.height; i += 40) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i + (Math.cos(i + frames * 0.01) * 2)); ctx.stroke();
            }

            ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

            for (let t of targets) {
                t.life--;
                if (t.life <= 0) { setGameOver(true); setPlaying(false); cancelAnimationFrame(animationId); if (document.fullscreenElement) document.exitFullscreen(); return; }

                // Sketchy Target
                ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
                ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3; ctx.stroke();

                ctx.beginPath(); ctx.arc(t.x, t.y, t.r * (t.life / 60), 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'; ctx.fill();

                // Inner ring
                ctx.beginPath(); ctx.arc(t.x, t.y, t.r * 0.4, 0, Math.PI * 2);
                ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1; ctx.stroke();
            }

            for (let e of effects) {
                e.life--; e.y += (e.vy || 0);
                if (e.type === 'text') {
                    ctx.fillStyle = `${e.color}${Math.floor((e.life / 30) * 255).toString(16).padStart(2, '0')}`;
                    ctx.font = 'bold 16px Inter'; ctx.textAlign = 'center'; ctx.fillText(e.text, e.x, e.y);
                } else {
                    e.r += 3; ctx.strokeStyle = `${e.color}${Math.floor((e.life / 30) * 255).toString(16).padStart(2, '0')}`;
                    ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.stroke();
                }
            }
            effects = effects.filter(e => e.life > 0); targets = targets.filter(t => t.life > 0);
            animationId = requestAnimationFrame(loop);
        };
        loop();

        const click = (e: any) => {
            if (!playing) return;
            const rect = canvas.getBoundingClientRect();
            const x = ((e.clientX || e.touches?.[0].clientX) - rect.left) * (canvas.width / rect.width);
            const y = ((e.clientY || e.touches?.[0].clientY) - rect.top) * (canvas.height / rect.height);
            let hit = false;
            targets.forEach(t => {
                if (Math.hypot(t.x - x, t.y - y) < t.r) {
                    t.life = -1; curScore += 25; setScore(curScore);
                    effects.push({ x: t.x, y: t.y, text: "+25", color: "#16a34a", type: 'text', life: 30, vy: -1.5 });
                    effects.push({ x: t.x, y: t.y, text: "", color: "#ef4444", type: 'pop', life: 30, r: 10 });
                    hit = true;
                }
            });
            if (!hit) { curScore = Math.max(0, curScore - 5); setScore(curScore); effects.push({ x, y, text: "-5", color: "#dc2626", type: 'text', life: 30, vy: -1.5 }); }
        };
        canvas.addEventListener('mousedown', click); canvas.addEventListener('touchstart', click, { passive: false });
        return () => { cancelAnimationFrame(animationId); canvas.removeEventListener('mousedown', click); canvas.removeEventListener('touchstart', click); };
    };



    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '4px solid #000', width: '100%', height: '100%', minHeight: '600px' }} className="game-console">
            <canvas ref={canvasRef} width={400} height={500} style={{ width: 'auto', height: '85vh', maxWidth: '400px', maxHeight: '500px', display: 'block' }} />
            {!playing && !gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', zIndex: 10, padding: '2rem', textAlign: 'center' }}>
                    <div style={{ background: '#000', color: '#fff', padding: '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>REFLEX</h2>
                    </div>

                    <div style={{ padding: '2rem', borderRadius: '24px', background: '#fff', border: '2px solid #000', width: '100%', maxWidth: '300px' }}>
                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#000', margin: 0 }}>MISSION: NEUTRALIZE</p>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0.5rem 0 1.5rem 0' }}>Eliminate nodes before they overcharge.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', border: '2px solid #000' }}>
                            <div style={{ width: '40px', height: '40px', border: '2px solid #ef4444', borderRadius: '50%', position: 'relative' }}>
                                <div style={{ width: '100%', height: '100%', border: '1px solid #ef4444', borderRadius: '50%' }} className="animate-ping" />
                            </div>
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#000', letterSpacing: '1px' }}>{!isTouch ? 'CLICK ACTIVE NODES' : 'TAP ACTIVE NODES'}</span>
                        </div>
                    </div>

                    <button onClick={startGame} style={{
                        background: '#000', color: '#fff', width: '100%', maxWidth: '300px',
                        padding: '1.25rem', borderRadius: '16px', fontWeight: 900,
                        fontSize: '1.1rem', cursor: 'pointer', border: 'none',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }} className="hover-scale">INITIALIZE</button>
                    <p style={{ fontSize: '0.7rem', opacity: 0.5, color: '#000' }}>Penalty for miscalculation (-5 pts)</p>
                </div>
            )}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', zIndex: 10, padding: '2rem' }}>
                    <h2 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900 }}>SYSTEM OVERFLOW</h2>
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
            {playing && <div style={{ position: 'absolute', top: 20, right: 20, color: '#000', fontWeight: 800, background: '#fff', padding: '4px 8px', border: '2px solid #000', borderRadius: '4px' }}>{score}</div>}
        </div>
    );
}
