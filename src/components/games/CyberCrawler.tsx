"use client";
import { useEffect, useRef, useState } from 'react';

export default function CyberCrawler({ onFinished }: { onFinished: () => void }) {
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

        let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
        let dir = { x: 1, y: 0 }; let nextDir = { x: 1, y: 0 };
        let food = { x: 15, y: 10 };
        let effects: any[] = [];
        let curScore = 0; let animationId: number; let frames = 0;

        // Swipe Detection State
        let touchStart = { x: 0, y: 0 };

        const loop = () => {
            frames++;
            const speed = Math.max(3, 8 - Math.floor(curScore / 100));

            if (frames % speed === 0) {
                dir = nextDir;
                const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
                if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snake.some(s => s.x === head.x && s.y === head.y)) {
                    setGameOver(true); setPlaying(false); cancelAnimationFrame(animationId); if (document.fullscreenElement) document.exitFullscreen(); return;
                }
                snake.unshift(head);
                if (head.x === food.x && head.y === food.y) {
                    curScore += 10; setScore(curScore);
                    effects.push({ x: food.x * 20 + 10, y: food.y * 20 + 10, text: "+10", life: 30, color: '#4ade80' });
                    food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
                } else { snake.pop(); }
            }

            ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(food.x * 20 + 10, food.y * 20 + 10, 7, 0, Math.PI * 2); ctx.fill();

            snake.forEach((s, i) => {
                const isHead = i === 0; const isTail = i === snake.length - 1;
                ctx.fillStyle = isHead ? '#22c55e' : '#16a34a';
                const size = isTail ? 14 : 18; const offset = (20 - size) / 2;
                ctx.beginPath(); ctx.roundRect(s.x * 20 + offset, s.y * 20 + offset, size, size, isHead ? 8 : 4); ctx.fill();
            });

            for (let e of effects) {
                e.life--; e.y -= 1; ctx.fillStyle = `${e.color}${Math.floor((e.life / 30) * 255).toString(16).padStart(2, '0')}`; ctx.fillText(e.text, e.x, e.y);
            }
            effects = effects.filter(e => e.life > 0);
            animationId = requestAnimationFrame(loop);
        };
        loop();

        const handleKeys = (e: any) => {
            const k = e.key;
            if ((k === 'ArrowUp' || k === 'w') && dir.y === 0) nextDir = { x: 0, y: -1 };
            if ((k === 'ArrowDown' || k === 's') && dir.y === 0) nextDir = { x: 0, y: 1 };
            if ((k === 'ArrowLeft' || k === 'a') && dir.x === 0) nextDir = { x: -1, y: 0 };
            if ((k === 'ArrowRight' || k === 'd') && dir.x === 0) nextDir = { x: 1, y: 0 };
        };

        const handleTouchStart = (e: TouchEvent) => {
            touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            if (playing) e.preventDefault();
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const dx = e.changedTouches[0].clientX - touchStart.x;
            const dy = e.changedTouches[0].clientY - touchStart.y;
            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > 30) {
                    if (dx > 0 && dir.x === 0) nextDir = { x: 1, y: 0 };
                    else if (dx < 0 && dir.x === 0) nextDir = { x: -1, y: 0 };
                }
            } else {
                if (Math.abs(dy) > 30) {
                    if (dy > 0 && dir.y === 0) nextDir = { x: 0, y: 1 };
                    else if (dy < 0 && dir.y === 0) nextDir = { x: 0, y: -1 };
                }
            }
            if (playing) e.preventDefault();
        };

        window.addEventListener('keydown', handleKeys);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleKeys);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    };

    const submit = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'crawler' }) });
        onFinished();
    };

    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0b1e', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '4px solid #22c55e', width: '100%', height: '100%', minHeight: '500px' }} className="game-console">
            <canvas ref={canvasRef} width={400} height={400} style={{ width: 'auto', height: '80vh', maxWidth: '400px', maxHeight: '400px', display: 'block' }} />
            {!playing && !gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', zIndex: 10, padding: '2rem', textAlign: 'center' }}>
                    <h2 style={{ color: '#22c55e', fontSize: '2rem' }}>SNAKE</h2>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', width: '100%' }}>
                        <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>MISSION: CONSUME</p>
                        <p style={{ fontSize: '0.85rem', opacity: 0.8, color: '#fff' }}>Expand the core while avoiding the perimeter.</p>
                        <hr style={{ margin: '1rem 0', opacity: 0.1 }} />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', color: '#fff' }}>
                            <div style={{ fontSize: '0.70rem' }}>⌨️<br />WASD</div>
                            <div style={{ fontSize: '0.70rem' }}>👆<br />SWIPE TO MOVE</div>
                        </div>
                    </div>
                    <button onClick={startGame} className="btn-primary" style={{ background: '#22c55e', color: '#000', width: '100%' }}>CONNECT</button>
                </div>
            )}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', zIndex: 10 }}>
                    <h2 style={{ color: '#ef4444' }}>SYSTEM CRASH</h2>
                    <input value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', background: '#111', color: '#fff', border: '1px solid #333', textAlign: 'center' }} />
                    <button onClick={submit} className="btn-primary" style={{ background: '#22c55e' }}>UPLOAD</button>
                    <button onClick={startGame} className="btn-outline">REBOOT</button>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 20, right: 20, color: '#22c55e', fontWeight: 800 }}>{score}</div>}
        </div>
    );
}
