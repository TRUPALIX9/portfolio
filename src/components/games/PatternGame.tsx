"use client";
import { useEffect, useRef, useState } from 'react';

export default function PatternGame({ onFinished }: { onFinished: () => void }) {
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
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'pattern' }) });
        onFinished();
    };
    const retry = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'pattern' }) });
        startGame();
    };

    const startGame = async () => {
        if (containerRef.current?.requestFullscreen) await containerRef.current.requestFullscreen();
        setPlaying(true); setGameOver(false); setScore(0);
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        let sequence: number[] = [];
        let userSequence: number[] = [];
        let showing = false;
        let curScore = 0;
        let flashIndex = 0;
        let flashTime = 0;

        const nextLevel = () => {
            sequence.push(Math.floor(Math.random() * 4));
            userSequence = [];
            showing = true;
            flashIndex = 0;
            flashTime = Math.max(15, 40 - curScore); // Progressive Speed
        };

        const loop = () => {
            ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

            const grid = [
                { id: 0, x: 50, y: 50, color: '#ec4899' }, { id: 1, x: 210, y: 50, color: '#8b5cf6' },
                { id: 2, x: 50, y: 210, color: '#3b82f6' }, { id: 3, x: 210, y: 210, color: '#10b981' }
            ];

            if (showing) {
                flashTime--;
                if (flashTime <= 0) {
                    flashIndex++;
                    flashTime = Math.max(15, 40 - curScore);
                    if (flashIndex >= sequence.length) showing = false;
                }
            }

            grid.forEach(g => {
                const isActive = showing && sequence[flashIndex] === g.id && flashTime > 5;
                ctx.fillStyle = isActive ? g.color : g.color + '33';
                ctx.beginPath(); ctx.roundRect(g.x, g.y, 140, 140, 12); ctx.fill();
                if (isActive) { ctx.shadowBlur = 20; ctx.shadowColor = g.color; ctx.stroke(); ctx.shadowBlur = 0; }
            });

            if (!gameOver && playing) requestAnimationFrame(loop);
        };

        const click = (e: any) => {
            if (showing || !playing) return;
            const rect = canvas.getBoundingClientRect();
            const x = ((e.clientX || e.touches?.[0].clientX) - rect.left) * (canvas.width / rect.width);
            const y = ((e.clientY || e.touches?.[0].clientY) - rect.top) * (canvas.height / rect.height);

            const grid = [{ id: 0, x: 50, y: 50 }, { id: 1, x: 210, y: 50 }, { id: 2, x: 50, y: 210 }, { id: 3, x: 210, y: 210 }];
            grid.forEach(g => {
                if (x > g.x && x < g.x + 140 && y > g.y && y < g.y + 140) {
                    userSequence.push(g.id);
                    if (userSequence[userSequence.length - 1] !== sequence[userSequence.length - 1]) {
                        setGameOver(true); setPlaying(false); if (document.fullscreenElement) document.exitFullscreen(); return;
                    }
                    if (userSequence.length === sequence.length) {
                        curScore++; setScore(curScore);
                        setTimeout(nextLevel, 600);
                    }
                }
            });
        };

        canvas.addEventListener('mousedown', click);
        nextLevel(); loop();
        return () => canvas.removeEventListener('mousedown', click);
    };



    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0b1e', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '4px solid #ec4899', width: '100%', height: '100%', minHeight: '600px' }} className="game-console">
            <canvas ref={canvasRef} width={400} height={400} style={{ width: 'auto', height: '80vh', maxWidth: '400px', maxHeight: '400px', display: 'block' }} />
            {!playing && !gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', zIndex: 10, padding: '2rem', textAlign: 'center' }}>
                    <div style={{ background: '#ec4899', color: '#fff', padding: '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(236, 72, 153, 0.3)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>MEMORY</h2>
                    </div>

                    <div style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(236, 72, 153, 0.3)', width: '100%', maxWidth: '300px' }}>
                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', margin: 0 }}>MISSION: SYNC</p>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', margin: '0.5rem 0 1.5rem 0' }}>Repeat the synaptic sequence precisely.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '20px', border: '2px solid rgba(236, 72, 153, 0.3)' }}>
                            <div style={{ width: '40px', height: '40px', border: '1px solid #ec4899', borderRadius: '4px', position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: 2, background: '#ec4899', opacity: 0.8 }} className="animate-pulse" />
                            </div>
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', letterSpacing: '1px' }}>{!isTouch ? 'MATCH THE SEQUENCE' : 'TAP THE SEQUENCE'}</span>
                        </div>
                    </div>

                    <button onClick={startGame} style={{
                        background: '#ec4899', color: '#fff', width: '100%', maxWidth: '300px',
                        padding: '1.25rem', borderRadius: '16px', fontWeight: 900,
                        fontSize: '1.1rem', cursor: 'pointer', border: 'none',
                        boxShadow: '0 4px 20px rgba(236, 72, 153, 0.3)'
                    }} className="hover-scale">SYNC NEURONS</button>
                    <p style={{ fontSize: '0.7rem', opacity: 0.5, color: '#fff' }}>Synaptic lag results in immediate disconnect.</p>
                </div>
            )}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', zIndex: 10, padding: '2rem' }}>
                    <h2 style={{ color: '#ec4899', fontSize: '2.5rem', fontWeight: 900 }}>SYNC LOST</h2>
                    <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900 }}>SCORE: {score}</p>

                    <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input value={name} onChange={e => updateName(e.target.value)} placeholder="ENTER ID" style={{ padding: '1rem', borderRadius: '12px', background: '#111', color: '#fff', border: '2px solid #ec4899', textAlign: 'center', fontSize: '1.2rem', fontWeight: 900 }} />

                        <button onClick={retry} style={{ background: '#ec4899', color: '#fff', padding: '1.25rem', borderRadius: '12px', fontWeight: 900, fontSize: '1.1rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <span>🔄</span> PLAY AGAIN
                        </button>

                        <button onClick={submit} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                            SAVE & HUB
                        </button>
                    </div>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 20, right: 20, color: '#ec4899', fontWeight: 800 }}>{score}</div>}
        </div>
    );
}
