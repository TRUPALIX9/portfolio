"use client";
import { useEffect, useRef, useState } from 'react';

export default function DodgeGame({ onFinished }: { onFinished: () => void }) {
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
        let animationId: number;
        let pX = canvas.width / 2;
        let obstacles: any[] = [];
        let frames = 0;
        let curScore = 0;

        const loop = () => {
            frames++;
            if (frames % 20 === 0) {
                obstacles.push({ x: Math.random() * (canvas.width - 30), y: -20, w: 30, h: 20, s: 3 + (curScore / 250) });
            }
            if (frames % 5 === 0) { curScore++; setScore(curScore); }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#4ade80';
            ctx.shadowBlur = 15; ctx.shadowColor = '#4ade80';
            ctx.fillRect(pX - 15, canvas.height - 40, 30, 30);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ef4444';
            for (let obs of obstacles) {
                obs.y += obs.s;
                ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
                if (pX > obs.x && pX < obs.x + obs.w && canvas.height - 40 < obs.y + obs.h) {
                    setGameOver(true); setPlaying(false); cancelAnimationFrame(animationId);
                    if (document.fullscreenElement) document.exitFullscreen();
                    return;
                }
            }
            obstacles = obstacles.filter(o => o.y < canvas.height);
            animationId = requestAnimationFrame(loop);
        };
        loop();
        const move = (e: any) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
            pX = Math.max(15, Math.min(canvas.width - 15, x * (canvas.width / rect.width)));
        };
        const keys = (e: any) => {
            if (e.key === 'ArrowLeft') pX = Math.max(15, pX - 20);
            if (e.key === 'ArrowRight') pX = Math.min(canvas.width - 15, pX + 20);
        };
        window.addEventListener('mousemove', move); window.addEventListener('touchmove', move); window.addEventListener('keydown', keys);
        return () => { cancelAnimationFrame(animationId); window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); window.removeEventListener('keydown', keys); };
    };

    const submit = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score: score, game: 'dodge' }) });
        onFinished();
    };

    return (
        <div ref={containerRef} style={{ textAlign: 'center', background: '#000', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
            <canvas ref={canvasRef} width={400} height={500} style={{ width: '100%', maxWidth: '400px', height: 'auto', display: 'block', margin: '0 auto' }} />
            {!playing && !gameOver && <button onClick={startGame} className="btn-primary" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>Start Space Dodge</button>}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <h2 style={{ color: '#ef4444' }}>GAME OVER</h2>
                    <p>Score: {score}</p>
                    <input value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', background: '#222', color: '#fff', border: '1px solid #444' }} />
                    <button onClick={submit} className="btn-primary">Save Score</button>
                    <button onClick={startGame} className="btn-outline">Retry</button>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 10, left: 10, color: '#4ade80' }}>Score: {score}</div>}
        </div>
    );
}
