"use client";
import { useEffect, useRef, useState } from 'react';

export default function ShooterGame({ onFinished }: { onFinished: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [name, setName] = useState("Player");

    const startGame = () => {
        setPlaying(true); setGameOver(false); setScore(0);
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        let targets: any[] = [];
        let animationId: number;
        let curScore = 0;
        let timeLeft = 3000; // 30 seconds

        const loop = () => {
            timeLeft--;
            if (timeLeft <= 0) { setGameOver(true); setPlaying(false); cancelAnimationFrame(animationId); return; }
            if (Math.random() < 0.03) {
                targets.push({ x: Math.random() * (canvas.width - 30), y: Math.random() * (canvas.height - 30), r: 15, life: 60 });
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let t of targets) {
                t.life--;
                ctx.fillStyle = `rgba(245, 158, 11, ${t.life / 60})`;
                ctx.beginPath(); ctx.arc(t.x + 15, t.y + 15, t.r, 0, Math.PI * 2); ctx.fill();
            }
            targets = targets.filter(t => t.life > 0);
            ctx.fillStyle = '#fff'; ctx.fillText(`Time: ${Math.ceil(timeLeft / 60)}s`, 10, 20);
            animationId = requestAnimationFrame(loop);
        };
        loop();

        const click = (e: any) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = ((e.clientX || e.touches?.[0].clientX) - rect.left) * (canvas.width / rect.width);
            const mouseY = ((e.clientY || e.touches?.[0].clientY) - rect.top) * (canvas.height / rect.height);
            targets.forEach(t => {
                const dist = Math.hypot(mouseX - (t.x + 15), mouseY - (t.y + 15));
                if (dist < t.r) {
                    curScore += 50; setScore(curScore);
                    t.life = 0;
                }
            });
        };
        canvas.addEventListener('mousedown', click); canvas.addEventListener('touchstart', click);
        return () => { cancelAnimationFrame(animationId); canvas.removeEventListener('mousedown', click); canvas.removeEventListener('touchstart', click); };
    };

    const submit = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score: score, game: 'shooter' }) });
        onFinished();
    };

    return (
        <div style={{ textAlign: 'center', background: '#000', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
            <canvas ref={canvasRef} width={400} height={500} style={{ width: '100%', maxWidth: '400px', height: 'auto', background: '#050505' }} />
            {!playing && !gameOver && <button onClick={startGame} className="btn-primary" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>Start Shooter</button>}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <h2 style={{ color: '#f59e0b' }}>TIME UP</h2>
                    <p>Final Score: {score}</p>
                    <input value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', background: '#222', color: '#fff', border: '1px solid #444' }} />
                    <button onClick={submit} className="btn-primary" style={{ background: '#f59e0b' }}>Save Score</button>
                    <button onClick={startGame} className="btn-outline">Retry</button>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 10, left: 10, color: '#f59e0b' }}>Score: {score}</div>}
        </div>
    );
}
