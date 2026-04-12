"use client";
import { useEffect, useRef, useState } from 'react';

export default function PatternGame({ onFinished }: { onFinished: () => void }) {
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

    const submit = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'pattern' }) });
        onFinished();
    };

    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0b1e', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '4px solid #ec4899', width: '100%', height: '100%', minHeight: '600px' }} className="game-console">
            <canvas ref={canvasRef} width={400} height={400} style={{ width: 'auto', height: '80vh', maxWidth: '400px', maxHeight: '400px', display: 'block' }} />
            {!playing && !gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', zIndex: 10, padding: '2rem', textAlign: 'center' }}>
                    <h2 style={{ color: '#ec4899', fontSize: '2rem' }}>MEMORY</h2>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', width: '100%' }}>
                        <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>MISSION: SYNC</p>
                        <p style={{ fontSize: '0.85rem', opacity: 0.8, color: '#fff' }}>Repeat the synaptic sequence precisely.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', color: '#fff' }}>
                            <div style={{ fontSize: '0.70rem' }}>👆 🖱️<br />CLICK PATTERN</div>
                        </div>
                    </div>
                    <button onClick={startGame} className="btn-primary" style={{ background: '#ec4899', color: '#fff', width: '100%' }}>SYNC NEURONS</button>
                </div>
            )}
            {gameOver && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', zIndex: 10 }}>
                    <h2 style={{ color: '#ef4444' }}>SYNC LOST</h2>
                    <input value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', background: '#111', color: '#fff', border: '1px solid #333', textAlign: 'center' }} />
                    <button onClick={submit} className="btn-primary" style={{ background: '#ec4899' }}>UPLOAD</button>
                    <button onClick={startGame} className="btn-outline">RETRY</button>
                </div>
            )}
            {playing && <div style={{ position: 'absolute', top: 20, right: 20, color: '#ec4899', fontWeight: 800 }}>{score}</div>}
        </div>
    );
}
