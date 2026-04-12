"use client";
import { useEffect, useRef, useState } from 'react';

export default function CyberCrawler({ onFinished }: { onFinished: () => void }) {
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

    const submit = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'snake' }) });
        onFinished();
    };

    const retry = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'snake' }) });
        startGame();
    };

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

            ctx.fillStyle = '#0a0b1e'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(food.x * 20 + 10, food.y * 20 + 10, 7, 0, Math.PI * 2); ctx.fill();

            snake.forEach((s, i) => {
                const isHead = i === 0;
                ctx.fillStyle = isHead ? '#22c55e' : '#16a34a';
                const size = i === snake.length - 1 ? 14 : 18; const offset = (20 - size) / 2;
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

        const handleTouchStart = (e: TouchEvent) => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; if (playing) e.preventDefault(); };
        const handleTouchEnd = (e: TouchEvent) => {
            const dx = e.changedTouches[0].clientX - touchStart.x;
            const dy = e.changedTouches[0].clientY - touchStart.y;
            if (Math.abs(dx) > Math.abs(dy)) { if (Math.abs(dx) > 30) { if (dx > 0 && dir.x === 0) nextDir = { x: 1, y: 0 }; else if (dx < 0 && dir.x === 0) nextDir = { x: -1, y: 0 }; } }
            else { if (Math.abs(dy) > 30) { if (dy > 0 && dir.y === 0) nextDir = { x: 0, y: 1 }; else if (dy < 0 && dir.y === 0) nextDir = { x: 0, y: -1 }; } }
            if (playing) e.preventDefault();
        };

        window.addEventListener('keydown', handleKeys);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
        return () => { cancelAnimationFrame(animationId); window.removeEventListener('keydown', handleKeys); canvas.removeEventListener('touchstart', handleTouchStart); canvas.removeEventListener('touchend', handleTouchEnd); };
    };

    const Key = ({ char }: { char: string }) => (
        <div style={{
            width: '32px', height: '32px', border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '6px', background: 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 900, color: '#fff',
            boxShadow: '0 3px 0 rgba(255,255,255,0.1)'
        }}>{char}</div>
    );

    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0b1e', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '4px solid #22c55e', width: '100%', height: '100%', minHeight: '550px' }} className="game-console">
            <canvas ref={canvasRef} width={400} height={400} style={{ width: 'auto', height: '75vh', maxWidth: '400px', maxHeight: '400px', display: 'block' }} />
            {!playing && !gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', zIndex: 10, padding: '2rem', textAlign: 'center' }}>
                    <div style={{ background: '#22c55e', color: '#000', padding: '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#000' }}>SNAKE</h2>
                    </div>

                    <div style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34, 197, 94, 0.3)', width: '100%', maxWidth: '340px' }}>
                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', margin: 0 }}>MISSION: CONSUME</p>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', margin: '0.5rem 0 2rem 0' }}>Expand the core while avoiding the perimeter.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {!isTouch ? (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                        <Key char="W" />
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <Key char="A" />
                                            <Key char="S" />
                                            <Key char="D" />
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontWeight: 700 }}>WASD</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                        <Key char="↑" />
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <Key char="←" />
                                            <Key char="↓" />
                                            <Key char="→" />
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontWeight: 700 }}>ARROWS</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '1.5rem', background: 'rgba(34, 197, 94, 0.15)', borderRadius: '24px', border: '2px solid rgba(34, 197, 94, 0.4)' }}>
                                    <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                                        <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', position: 'absolute', top: '50%', left: '50%' }} className="animate-ping" />
                                        <div style={{ position: 'absolute', inset: 0, border: '2px dashed #22c55e', borderRadius: '50%' }} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 900, color: '#fff', letterSpacing: '1px' }}>SWIPE TO MOVE</span>
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Direct neural gestures</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={startGame} style={{
                        background: '#22c55e', color: '#000', width: '100%', maxWidth: '340px',
                        padding: '1.25rem', borderRadius: '16px', fontWeight: 900,
                        fontSize: '1.1rem', cursor: 'pointer', border: 'none',
                        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.2)'
                    }} className="hover-scale">CONNECT CORE</button>
                </div>
            )}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', zIndex: 10 }}>
                    <h2 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900 }}>SYSTEM CRASH</h2>
                    <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="ENTER ID" style={{ padding: '1rem', borderRadius: '12px', background: '#111', color: '#fff', border: '2px solid #ef4444', textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 }} />
                    </div>
                    <button onClick={async () => { await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'crawler' }) }); onFinished(); }} style={{ background: '#22c55e', color: '#000', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 800, border: 'none' }}>UPLOAD</button>
                    <button onClick={startGame} style={{ color: '#fff', border: '1px solid #fff', padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'transparent' }}>REBOOT</button>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 20, right: 20, color: '#22c55e', fontWeight: 800, fontSize: '1.5rem' }}>{score}</div>}
        </div>
    );
}
