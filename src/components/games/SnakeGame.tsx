"use client";
import { useEffect, useRef, useState } from 'react';
import { getSavedArcadePlayerName, submitArcadeScore } from '@/utils/arcade-player';

type Direction = { x: number; y: number };

const UP = { x: 0, y: -1 };
const DOWN = { x: 0, y: 1 };
const LEFT = { x: -1, y: 0 };
const RIGHT = { x: 1, y: 0 };

export default function SnakeGame({ onFinished }: { onFinished: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const activeDirectionRef = useRef<Direction>(RIGHT);
    const queuedDirectionRef = useRef<Direction>(RIGHT);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [name, setName] = useState("");
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        setIsTouch(window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);
        const savedName = getSavedArcadePlayerName();
        if (savedName) setName(savedName);

        return () => {
            cleanupRef.current?.();
        };
    }, []);

    const updateName = (val: string) => {
        setName(val);
    };

    const queueDirection = (next: Direction) => {
        const current = activeDirectionRef.current;
        if ((next.x !== 0 && current.x !== 0) || (next.y !== 0 && current.y !== 0)) return;
        queuedDirectionRef.current = next;
    };

    const submit = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'snake');
        onFinished();
    };

    const retry = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'snake');
        startGame();
    };

    const trimmedName = name.trim();

    const startGame = () => {
        cleanupRef.current?.();
        setPlaying(true);
        setGameOver(false);
        setScore(0);
        activeDirectionRef.current = RIGHT;
        queuedDirectionRef.current = RIGHT;

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        const gridSize = 20;
        let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
        let food = { x: 15, y: 10 };
        let curScore = 0;
        let animationId: number;
        let frames = 0;

        const loop = () => {
            frames++;
            const speed = Math.max(3, 8 - Math.floor(curScore / 100));

            if (frames % speed === 0) {
                activeDirectionRef.current = queuedDirectionRef.current;
                const dir = activeDirectionRef.current;
                const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
                if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
                    setGameOver(true);
                    setPlaying(false);
                    cancelAnimationFrame(animationId);
                    return;
                }
                snake.unshift(head);
                if (head.x === food.x && head.y === food.y) {
                    curScore += 10;
                    setScore(curScore);
                    food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
                } else {
                    snake.pop();
                }
            }

            ctx.fillStyle = '#fcfaf8';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            const scroll = frames * 0.2;
            for (let i = 0; i <= canvas.width; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i + (Math.sin(i + scroll * 0.1) * 2), canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i <= canvas.height; i += 40) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i + (Math.cos(i + scroll * 0.1) * 2));
                ctx.stroke();
            }

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();

            snake.forEach((segment, index) => {
                ctx.fillStyle = index === 0 ? '#10b981' : '#34d399';
                ctx.strokeStyle = '#064e3b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4, 4);
                ctx.fill();
                ctx.stroke();
            });

            animationId = requestAnimationFrame(loop);
        };
        loop();

        const handleKeys = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') queueDirection(UP);
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') queueDirection(DOWN);
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') queueDirection(LEFT);
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') queueDirection(RIGHT);
        };

        let touchStartX = 0;
        let touchStartY = 0;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStartX || !touchStartY) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 30) queueDirection(RIGHT);
                else if (dx < -30) queueDirection(LEFT);
            } else {
                if (dy > 30) queueDirection(DOWN);
                else if (dy < -30) queueDirection(UP);
            }
            touchStartX = 0;
            touchStartY = 0;
        };

        const preventScroll = (e: TouchEvent) => {
            if (playing && e.cancelable) e.preventDefault();
        };

        window.addEventListener('keydown', handleKeys);
        canvas.addEventListener('touchstart', handleTouchStart as EventListener, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd as EventListener, { passive: false });
        canvas.addEventListener('touchmove', preventScroll as EventListener, { passive: false });

        cleanupRef.current = () => {
            window.removeEventListener('keydown', handleKeys);
            canvas.removeEventListener('touchstart', handleTouchStart as EventListener);
            canvas.removeEventListener('touchend', handleTouchEnd as EventListener);
            canvas.removeEventListener('touchmove', preventScroll as EventListener);
            cancelAnimationFrame(animationId);
        };
    };

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}
            className="game-console game-console--square"
        >
            <canvas ref={canvasRef} width={400} height={400} className="game-canvas game-canvas-square" />
            {!playing && !gameOver && (
                <div className="game-overlay">
                    <div style={{ background: '#000', color: '#fff', padding: '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>SNAKE</h2>
                    </div>

                    <div className="game-panel">
                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc', margin: 0 }}>MISSION: SURVIVE</p>
                        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '0.5rem 0 1rem 0' }}>Synthesize data nodes without collision.</p>

                        {!isTouch ? (
                            <div style={{ display: 'grid', gap: '0.9rem', justifyItems: 'center', padding: '1rem', background: 'rgba(15, 23, 42, 0.88)', borderRadius: '18px', border: '1px solid rgba(148, 163, 184, 0.35)' }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Keyboard Controls</div>
                                <div className="game-touch-grid">
                                    <div className="spacer" />
                                    <div className="game-touch-button">W</div>
                                    <div className="spacer" />
                                    <div className="game-touch-button">A</div>
                                    <div className="game-touch-button">S</div>
                                    <div className="game-touch-button">D</div>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0 }}>Arrow keys also work.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '0.9rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.88)', borderRadius: '18px', border: '1px solid rgba(148, 163, 184, 0.35)' }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Touch Controls</div>
                                <div className="game-touch-grid">
                                    <div className="spacer" />
                                    <button type="button" className="game-touch-button" onClick={() => queueDirection(UP)}>↑</button>
                                    <div className="spacer" />
                                    <button type="button" className="game-touch-button" onClick={() => queueDirection(LEFT)}>←</button>
                                    <button type="button" className="game-touch-button" onClick={() => queueDirection(DOWN)}>↓</button>
                                    <button type="button" className="game-touch-button" onClick={() => queueDirection(RIGHT)}>→</button>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0 }}>Swipe or tap the arrows to steer.</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={startGame}
                        style={{ background: '#000', color: '#fff', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
                        className="game-start-button hover-scale"
                    >
                        INITIALIZE
                    </button>
                    <p style={{ fontSize: '0.75rem', opacity: 0.85, color: '#cbd5e1' }}>Avoid the perimeter walls at all costs.</p>
                </div>
            )}
            {gameOver && (
                <div className="game-overlay">
                    <h2 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900 }}>SYSTEM CRASH</h2>
                    <p style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 900 }}>SCORE: {score}</p>

                    <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '0.75rem', alignItems: 'stretch' }}>
                            <input value={name} onChange={(e) => updateName(e.target.value)} placeholder="ENTER NAME" style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', color: '#000', border: '3px solid #000', textAlign: 'center', fontSize: '1rem', fontWeight: 900, minWidth: 0 }} />
                            <button onClick={submit} disabled={!trimmedName} style={{ background: trimmedName ? '#e2e8f0' : '#cbd5e1', color: '#000', padding: '0 1rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', border: 'none', cursor: trimmedName ? 'pointer' : 'not-allowed' }}>
                                SAVE
                            </button>
                        </div>

                        <button onClick={retry} disabled={!trimmedName} style={{ background: trimmedName ? '#000' : '#475569', color: '#fff', padding: '1.1rem', borderRadius: '12px', fontWeight: 900, fontSize: '1rem', border: 'none', cursor: trimmedName ? 'pointer' : 'not-allowed' }}>
                            PLAY AGAIN
                        </button>
                        <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0 }}>A name is required before saving or restarting.</p>
                    </div>
                </div>
            )}
            {playing && (
                <>
                    <div style={{ position: 'absolute', top: 16, right: 16, padding: '6px 10px' }} className="game-score-badge">{score}</div>
                    {isTouch && (
                        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', padding: '0.6rem', borderRadius: '20px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.45)' }}>
                            <div className="game-touch-grid">
                                <div className="spacer" />
                                <button type="button" className="game-touch-button" onClick={() => queueDirection(UP)}>↑</button>
                                <div className="spacer" />
                                <button type="button" className="game-touch-button" onClick={() => queueDirection(LEFT)}>←</button>
                                <button type="button" className="game-touch-button" onClick={() => queueDirection(DOWN)}>↓</button>
                                <button type="button" className="game-touch-button" onClick={() => queueDirection(RIGHT)}>→</button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
