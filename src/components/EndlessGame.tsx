"use client";
import { useEffect, useRef, useState } from 'react';

export default function EndlessGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [name, setName] = useState("Trupal");
    const [submitted, setSubmitted] = useState(false);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboard);
    }, []);

    const startGame = async () => {
        if (gameContainerRef.current && gameContainerRef.current.requestFullscreen) {
            try {
                await gameContainerRef.current.requestFullscreen();
            } catch (err) {
                console.log("Fullscreen request failed", err);
            }
        }

        setPlaying(true);
        setGameOver(false);
        setScore(0);
        setSubmitted(false);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Setup game loop
        let animationId: number;
        let playerX = canvas.width / 2;
        const playerWidth = 30;
        const playerHeight = 30;
        const playerY = canvas.height - 40;

        let obstacles: { x: number, y: number, w: number, h: number, speed: number }[] = [];
        let frames = 0;
        let currentScore = 0;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            let clientX = 0;
            if (e instanceof MouseEvent) {
                clientX = e.clientX;
            } else if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
            } else {
                return;
            }

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            let mappedX = (clientX - rect.left) * scaleX;
            mappedX = Math.max(playerWidth / 2, Math.min(canvas.width - playerWidth / 2, mappedX));
            playerX = mappedX;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const step = 20;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                playerX = Math.max(playerWidth / 2, playerX - step);
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                playerX = Math.min(canvas.width - playerWidth / 2, playerX + step);
            }
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('keydown', handleKeyDown);

        const loop = () => {
            frames++;
            if (frames % 20 === 0) {
                const w = Math.random() * 40 + 20;
                const x = Math.random() * (canvas.width - w);
                const speed = 3 + (currentScore / 250);
                obstacles.push({ x, y: -50, w, h: 20, speed });
            }
            if (frames % 5 === 0) {
                currentScore += 1;
                setScore(currentScore);
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Player Ship with Glow
            ctx.fillStyle = '#4ade80';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#4ade80';
            ctx.fillRect(playerX - playerWidth / 2, playerY, playerWidth, playerHeight);
            ctx.shadowBlur = 0;

            // Draw falling obstacles
            ctx.fillStyle = '#ef4444';
            for (let i = 0; i < obstacles.length; i++) {
                const obs = obstacles[i];
                obs.y += obs.speed;
                ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

                if (
                    playerX - playerWidth / 2 < obs.x + obs.w &&
                    playerX + playerWidth / 2 > obs.x &&
                    playerY < obs.y + obs.h &&
                    playerY + playerHeight > obs.y
                ) {
                    setGameOver(true);
                    setPlaying(false);
                    cancelAnimationFrame(animationId);
                    window.removeEventListener('mousemove', handleMove);
                    window.removeEventListener('touchmove', handleMove);
                    window.removeEventListener('keydown', handleKeyDown);

                    if (document.fullscreenElement) {
                        document.exitFullscreen().catch(() => { });
                    }
                    return;
                }
            }

            obstacles = obstacles.filter(o => o.y < canvas.height);
            animationId = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('keydown', handleKeyDown);
        };
    };

    const submitScore = async () => {
        try {
            const res = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score })
            });
            if (!res.ok) throw new Error("Failed to save to server");
            const data = await res.json();
            setLeaderboard(data);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            // Fallback to local high score for the user if server fails (Vercel limitation)
            const localLeaderboard = JSON.parse(localStorage.getItem('portfolio_leaderboard') || '[]');
            localLeaderboard.push({ name, score, date: new Date().toISOString() });
            localLeaderboard.sort((a: any, b: any) => b.score - a.score);
            const top20 = localLeaderboard.slice(0, 20);
            localStorage.setItem('portfolio_leaderboard', JSON.stringify(top20));
            setLeaderboard(top20);
            setSubmitted(true);
            alert("Note: Global leaderboard is unavailable in this environment. Your high score has been saved locally.");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px', margin: '0 auto', gap: '2rem' }}>
            <div
                ref={gameContainerRef}
                style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', touchAction: 'none' }}
            >
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={500}
                    style={{ width: '100%', height: 'auto', display: 'block', background: '#050505', cursor: 'crosshair', aspectRatio: '4/5' }}
                />

                {!playing && !gameOver && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
                        <button onClick={startGame} className="btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2.5rem' }}>Start Game</button>
                    </div>
                )}

                {gameOver && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', padding: '2rem', gap: '1.5rem', backdropFilter: 'blur(8px)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <h2 className="heading-md" style={{ color: '#ef4444', marginBottom: '0.2rem' }}>GAME OVER</h2>
                            <p style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 600 }}>Score: {score}</p>
                        </div>

                        {!submitted ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    maxLength={20}
                                    placeholder="Enter your name"
                                    style={{ padding: '0.8rem', borderRadius: '8px', border: '2px solid var(--accent-primary)', textAlign: 'center', background: '#000', color: '#fff', fontSize: '1.1rem', outline: 'none' }}
                                />
                                <button onClick={submitScore} className="btn-primary" style={{ width: '100%' }}>Save Record</button>
                            </div>
                        ) : (
                            <button onClick={startGame} className="btn-outline" style={{ marginTop: '1rem', width: '100%' }}>Play Again</button>
                        )}
                    </div>
                )}

                {playing && (
                    <div style={{ position: 'absolute', top: 16, left: 16, color: 'var(--accent-primary)', fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700 }}>
                        {score}
                    </div>
                )}
            </div>

            <div className="glass-card" style={{ width: '100%', padding: '2rem', borderRadius: '16px' }}>
                <h3 className="heading-md" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Global Leaderboard</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {leaderboard.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No scores yet.</p> : null}
                    {leaderboard.map((entry, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', background: i === 0 ? 'rgba(74, 222, 128, 0.05)' : 'transparent', borderLeft: i === 0 ? '4px solid var(--accent-primary)' : '4px solid transparent', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <span style={{ fontWeight: i === 0 ? 600 : 400, color: i === 0 ? 'var(--accent-primary)' : 'var(--text-primary)', fontSize: '1.1rem' }}>
                                #{i + 1} {entry.name}
                            </span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{entry.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
