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
        const gridSize = 20;
        let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
        let dir = { x: 1, y: 0 }; let nextDir = { x: 1, y: 0 };
        let food = { x: 15, y: 10 };
        let curScore = 0; let animationId: number; let frames = 0;

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
                    food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
                } else { snake.pop(); }
            }

            // Paper Background
            ctx.fillStyle = '#fcfaf8'; ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Doodle Grid
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
            const scroll = frames * 0.2;
            for (let i = 0; i <= canvas.width; i += 40) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + (Math.sin(i + scroll * 0.1) * 2), canvas.height); ctx.stroke();
            }
            for (let i = 0; i <= canvas.height; i += 40) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i + (Math.cos(i + scroll * 0.1) * 2)); ctx.stroke();
            }

            ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

            // Food (Sketchy Apple)
            ctx.fillStyle = '#ef4444';
            ctx.beginPath(); ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, 7, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();

            // Snake (Emerald sketch)
            snake.forEach((s, i) => {
                ctx.fillStyle = i === 0 ? '#10b981' : '#34d399';
                ctx.strokeStyle = '#064e3b'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.roundRect(s.x * gridSize + 2, s.y * gridSize + 2, gridSize - 4, gridSize - 4, 4); ctx.fill(); ctx.stroke();
            });

            animationId = requestAnimationFrame(loop);
        };
        loop();

        const handleKeys = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' && dir.y === 0) nextDir = { x: 0, y: -1 };
            if (e.key === 'ArrowDown' && dir.y === 0) nextDir = { x: 0, y: 1 };
            if (e.key === 'ArrowLeft' && dir.x === 0) nextDir = { x: -1, y: 0 };
            if (e.key === 'ArrowRight' && dir.x === 0) nextDir = { x: 1, y: 0 };
        };
        window.addEventListener('keydown', handleKeys);
        return () => { window.removeEventListener('keydown', handleKeys); cancelAnimationFrame(animationId); };
    };

    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '4px solid #000', width: '100%', height: '100%', minHeight: '600px' }} className="game-console">
            <canvas ref={canvasRef} width={400} height={400} style={{ width: 'auto', height: '80vh', maxWidth: '400px', maxHeight: '400px', display: 'block' }} />
            {!playing && !gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', zIndex: 10, padding: '2rem', textAlign: 'center' }}>
                    <div style={{ background: '#000', color: '#fff', padding: '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>SNAKE</h2>
                    </div>

                    <div style={{ padding: '2rem', borderRadius: '24px', background: '#fff', border: '2px solid #000', width: '100%', maxWidth: '300px' }}>
                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#000', margin: 0 }}>MISSION: SURVIVE</p>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0.5rem 0 1.5rem 0' }}>Synthesize data nodes without collision.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', border: '2px solid #000' }}>
                            {!isTouch ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                    <div style={{ width: '36px', height: '36px', border: '2px solid #000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>W</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div style={{ width: '36px', height: '36px', border: '2px solid #000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>A</div>
                                        <div style={{ width: '36px', height: '36px', border: '2px solid #000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>S</div>
                                        <div style={{ width: '36px', height: '36px', border: '2px solid #000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>D</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '2rem' }}>👆</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#000' }}>SWIPE TO MOVE</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={startGame} style={{
                        background: '#000', color: '#fff', width: '100%', maxWidth: '300px',
                        padding: '1.25rem', borderRadius: '16px', fontWeight: 900,
                        fontSize: '1.1rem', cursor: 'pointer', border: 'none',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }} className="hover-scale">INITIALIZE</button>
                    <p style={{ fontSize: '0.7rem', opacity: 0.5, color: '#000' }}>Avoid the perimeter walls at all costs.</p>
                </div>
            )}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', zIndex: 10, padding: '2rem' }}>
                    <h2 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900 }}>SYSTEM CRASH</h2>
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
