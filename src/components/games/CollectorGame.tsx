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
        let effects: any[] = [];
        let pX = canvas.width / 2;
        let animationId: number;
        let frames = 0;
        let curScore = 0;

        const loop = () => {
            frames++;
            if (frames % 40 === 0) items.push({ x: 20 + Math.random() * (canvas.width - 40), y: -20, isBomb: Math.random() < 0.15, s: 2.5 + (curScore / 200), size: 10 + Math.random() * 5 });

            ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

            ctx.fillStyle = '#06b6d4'; ctx.beginPath(); ctx.moveTo(pX - 30, canvas.height - 10); ctx.lineTo(pX + 30, canvas.height - 10); ctx.lineTo(pX + 20, canvas.height - 30); ctx.lineTo(pX - 20, canvas.height - 30); ctx.closePath(); ctx.fill();

            for (let item of items) {
                item.y += item.s;
                ctx.fillStyle = item.isBomb ? '#f87171' : '#06b6d4';
                ctx.beginPath(); ctx.moveTo(item.x, item.y - item.size); ctx.lineTo(item.x + item.size, item.y); ctx.lineTo(item.x, item.y + item.size); ctx.lineTo(item.x - item.size, item.y); ctx.closePath(); ctx.fill();
                if (item.y > canvas.height - 40 && Math.abs(item.x - pX) < 30) {
                    if (!item.isBomb) {
                        curScore += 10; setScore(curScore);
                        effects.push({ x: item.x, y: item.y, text: "+10", life: 30, color: '#4ade80' });
                        item.y = -100;
                    }
                    else { setGameOver(true); setPlaying(false); cancelAnimationFrame(animationId); if (document.fullscreenElement) document.exitFullscreen(); return; }
                }
            }
            // Effects
            ctx.font = 'bold 14px Inter'; ctx.textAlign = 'center';
            for (let e of effects) {
                e.life--; e.y -= 1;
                ctx.fillStyle = `${e.color}${Math.floor((e.life / 30) * 255).toString(16).padStart(2, '0')}`;
                ctx.fillText(e.text, e.x, e.y);
            }
            effects = effects.filter(e => e.life > 0);
            items = items.filter(i => i.y < canvas.height && i.y !== -100);
            animationId = requestAnimationFrame(loop);
        };
        loop();

        const move = (e: any) => {
            const rect = canvas.getBoundingClientRect();
            pX = Math.max(30, Math.min(canvas.width - 30, ((e.clientX || e.touches?.[0].clientX) - rect.left) * (canvas.width / rect.width)));
        };
        window.addEventListener('mousemove', move); window.addEventListener('touchmove', move);
        return () => { cancelAnimationFrame(animationId); window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); };
    };

    const submit = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'collector' }) });
        onFinished();
    };

    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0b1e', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '4px solid #06b6d4', width: '100%', height: '100%', minHeight: '600px' }} className="game-console">
            <canvas ref={canvasRef} width={400} height={500} style={{ width: 'auto', height: '85vh', maxWidth: '400px', maxHeight: '500px', display: 'block' }} />
            {!playing && !gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', zIndex: 5 }}>
                    <h2 className="heading-md" style={{ color: '#06b6d4' }}>Diamonds</h2>
                    <button onClick={startGame} className="btn-primary" style={{ background: '#06b6d4' }}>Start</button>
                </div>
            )}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', zIndex: 10 }}>
                    <h2 style={{ color: '#f87171' }}>BREACH</h2>
                    <input value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', background: '#111', color: '#fff', border: '1px solid #333', textAlign: 'center' }} />
                    <button onClick={submit} className="btn-primary" style={{ background: '#06b6d4' }}>Save</button>
                    <button onClick={startGame} className="btn-outline">Retry</button>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 20, right: 20, color: '#06b6d4', fontWeight: 800 }}>💎 {score}</div>}
        </div>
    );
}
