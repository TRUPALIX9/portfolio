"use client";
import { useEffect, useRef, useState } from 'react';

export default function ShooterGame({ onFinished }: { onFinished: () => void }) {
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

            ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

            for (let t of targets) {
                t.life--;
                if (t.life <= 0) { setGameOver(true); setPlaying(false); cancelAnimationFrame(animationId); if (document.fullscreenElement) document.exitFullscreen(); return; }
                ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3; ctx.stroke();
                ctx.beginPath(); ctx.arc(t.x, t.y, t.r * (t.life / 60), 0, Math.PI * 2); ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'; ctx.fill();
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
                    effects.push({ x: t.x, y: t.y, text: "+25", color: "#4ade80", type: 'text', life: 30, vy: -1.5 });
                    effects.push({ x: t.x, y: t.y, text: "", color: "#ef4444", type: 'pop', life: 30, r: 10 });
                    hit = true;
                }
            });
            if (!hit) { curScore = Math.max(0, curScore - 5); setScore(curScore); effects.push({ x, y, text: "-5", color: "#fca5a5", type: 'text', life: 30, vy: -1.5 }); }
        };
        canvas.addEventListener('mousedown', click); canvas.addEventListener('touchstart', click, { passive: false });
        return () => { cancelAnimationFrame(animationId); canvas.removeEventListener('mousedown', click); canvas.removeEventListener('touchstart', click); };
    };

    const submit = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'shooter' }) });
        onFinished();
    };

    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0b1e', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '4px solid #ef4444', width: '100%', height: '100%', minHeight: '600px' }} className="game-console">
            <canvas ref={canvasRef} width={400} height={500} style={{ width: 'auto', height: '85vh', maxWidth: '400px', maxHeight: '500px', display: 'block' }} />
            {!playing && !gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', zIndex: 10, padding: '2rem', textAlign: 'center' }}>
                    <h2 style={{ color: '#ef4444', fontSize: '2rem' }}>REFLEX</h2>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', width: '100%' }}>
                        <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>MISSION: NEUTRALIZE</p>
                        <p style={{ fontSize: '0.85rem', opacity: 0.8, color: '#fff' }}>Eliminate nodes before they overcharge.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', color: '#fff' }}>
                            <div style={{ fontSize: '0.7rem' }}>🖱️ 👆<br />TAP NODES</div>
                        </div>
                    </div>
                    <button onClick={startGame} className="btn-primary" style={{ background: '#ef4444', color: '#fff', width: '100%' }}>INITIALIZE</button>
                    <p style={{ fontSize: '0.65rem', opacity: 0.5, color: '#fff' }}>Penalty for miscalculation (-5 pts)</p>
                </div>
            )}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', zIndex: 10 }}>
                    <h2 style={{ color: '#ef4444' }}>LOCKED</h2>
                    <input value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', background: '#111', color: '#fff', border: '1px solid #333', textAlign: 'center' }} />
                    <button onClick={submit} className="btn-primary" style={{ background: '#ef4444' }}>UPLOAD</button>
                    <button onClick={startGame} className="btn-outline">RETRY</button>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 20, right: 20, color: '#ef4444', fontWeight: 800 }}>{score}</div>}
        </div>
    );
}
