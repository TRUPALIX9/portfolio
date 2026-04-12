"use client";
import { useEffect, useRef, useState } from 'react';

export default function CollectorGame({ onFinished }: { onFinished: () => void }) {
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
        let items: any[] = [];
        let pX = canvas.width / 2;
        let animationId: number;
        let frames = 0;
        let curScore = 0;

        const loop = () => {
            frames++;
            if (frames % 40 === 0) {
                const type = Math.random() > 0.2 ? 'gem' : 'bomb';
                items.push({ x: Math.random() * (canvas.width - 20), y: -20, type, s: 2 + (curScore / 100) });
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Player basket
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(pX - 25, canvas.height - 30, 50, 15);

            for (let item of items) {
                item.y += item.s;
                ctx.fillStyle = item.type === 'gem' ? '#06b6d4' : '#ef4444';
                ctx.beginPath(); ctx.arc(item.x + 10, item.y + 10, 10, 0, Math.PI * 2); ctx.fill();

                if (item.y > canvas.height - 40 && item.x > pX - 35 && item.x < pX + 25) {
                    if (item.type === 'gem') {
                        curScore += 10; setScore(curScore);
                        item.y = -100; // mark for removal
                    } else {
                        setGameOver(true); setPlaying(false); cancelAnimationFrame(animationId);
                        if (document.fullscreenElement) document.exitFullscreen();
                        return;
                    }
                }
            }
            items = items.filter(i => i.y < canvas.height && i.y !== -100);
            animationId = requestAnimationFrame(loop);
        };
        loop();
        const move = (e: any) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
            pX = Math.max(25, Math.min(canvas.width - 25, x * (canvas.width / rect.width)));
        };
        window.addEventListener('mousemove', move); window.addEventListener('touchmove', move);
        return () => { cancelAnimationFrame(animationId); window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); };
    };

    const submit = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score: score, game: 'collector' }) });
        onFinished();
    };

    return (
        <div ref={containerRef} style={{ textAlign: 'center', background: '#000', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
            <canvas ref={canvasRef} width={400} height={500} style={{ width: '100%', maxWidth: '400px', height: 'auto', display: 'block', margin: '0 auto' }} />
            {!playing && !gameOver && <button onClick={startGame} className="btn-primary" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>Start Crystal Catch</button>}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <h2 style={{ color: '#ef4444' }}>GAME OVER</h2>
                    <p>Score: {score}</p>
                    <input value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', background: '#222', color: '#fff', border: '1px solid #444' }} />
                    <button onClick={submit} className="btn-primary">Save Score</button>
                    <button onClick={startGame} className="btn-outline">Retry</button>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 10, left: 10, color: '#06b6d4' }}>Score: {score}</div>}
        </div>
    );
}
