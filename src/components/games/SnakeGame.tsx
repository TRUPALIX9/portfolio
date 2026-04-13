"use client";
import { useEffect, useRef, useState } from 'react';
import { getSavedArcadePlayerName, submitArcadeScore } from '@/utils/arcade-player';

type Direction = { x: number; y: number };
type PortalSide = 'top' | 'right' | 'bottom' | 'left';
type PortalState = {
    entrySide: PortalSide;
    exitSide: PortalSide;
    start: number;
    length: number;
    expiresAt: number;
};
type SnakeFinishPayload = {
    game: 'snake';
    score: number;
    closeGame?: boolean;
};

const UP = { x: 0, y: -1 };
const DOWN = { x: 0, y: 1 };
const LEFT = { x: -1, y: 0 };
const RIGHT = { x: 1, y: 0 };
const GRID_COUNT = 20;
const PORTAL_DURATION_MS = 10000;
const PORTAL_LENGTH = 4;

export default function SnakeGame({ onFinished, highScore = 0 }: { onFinished: (payload?: SnakeFinishPayload) => void; highScore?: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const activeDirectionRef = useRef<Direction>(RIGHT);
    const queuedDirectionRef = useRef<Direction>(RIGHT);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [name, setName] = useState("");
    const [isTouch, setIsTouch] = useState(false);
    const [createdHighScore, setCreatedHighScore] = useState(false);

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
        const isNewHighScore = score > highScore;
        setCreatedHighScore(isNewHighScore);
        await submitArcadeScore(trimmedName, score, 'snake');
        onFinished({ game: 'snake', score, closeGame: true });
    };

    const retry = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        const isNewHighScore = score > highScore;
        setCreatedHighScore(isNewHighScore);
        await submitArcadeScore(trimmedName, score, 'snake');
        onFinished({ game: 'snake', score, closeGame: false });
        startGame();
    };

    const trimmedName = name.trim();

    const startGame = () => {
        cleanupRef.current?.();
        setPlaying(true);
        setGameOver(false);
        setScore(0);
        setCreatedHighScore(false);
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
        let portal: PortalState = createPortal();

        function createPortal(): PortalState {
            const sides: PortalSide[] = ['top', 'right', 'bottom', 'left'];
            const entrySide = sides[Math.floor(Math.random() * sides.length)];
            const exitSide =
                entrySide === 'top' ? 'bottom' :
                    entrySide === 'bottom' ? 'top' :
                        entrySide === 'left' ? 'right' : 'left';
            return {
                entrySide,
                exitSide,
                start: 2 + Math.floor(Math.random() * (GRID_COUNT - PORTAL_LENGTH - 4)),
                length: PORTAL_LENGTH,
                expiresAt: Date.now() + PORTAL_DURATION_MS,
            };
        }

        function isPortalCellOnSide(x: number, y: number, side: PortalSide, activePortal: PortalState) {
            if (side === 'top') return y === 0 && x >= activePortal.start && x < activePortal.start + activePortal.length;
            if (side === 'bottom') return y === GRID_COUNT - 1 && x >= activePortal.start && x < activePortal.start + activePortal.length;
            if (side === 'left') return x === 0 && y >= activePortal.start && y < activePortal.start + activePortal.length;
            return x === GRID_COUNT - 1 && y >= activePortal.start && y < activePortal.start + activePortal.length;
        }

        function portalContainsSnake(activePortal: PortalState) {
            return snake.some((segment) =>
                isPortalCellOnSide(segment.x, segment.y, activePortal.entrySide, activePortal) ||
                isPortalCellOnSide(segment.x, segment.y, activePortal.exitSide, activePortal)
            );
        }

        function tryWrapThroughPortal(headX: number, headY: number, activePortal: PortalState) {
            if (activePortal.entrySide === 'top' && headY < 0 && headX >= activePortal.start && headX < activePortal.start + activePortal.length) {
                return { x: headX, y: GRID_COUNT - 1 };
            }
            if (activePortal.entrySide === 'bottom' && headY >= GRID_COUNT && headX >= activePortal.start && headX < activePortal.start + activePortal.length) {
                return { x: headX, y: 0 };
            }
            if (activePortal.entrySide === 'left' && headX < 0 && headY >= activePortal.start && headY < activePortal.start + activePortal.length) {
                return { x: GRID_COUNT - 1, y: headY };
            }
            if (activePortal.entrySide === 'right' && headX >= GRID_COUNT && headY >= activePortal.start && headY < activePortal.start + activePortal.length) {
                return { x: 0, y: headY };
            }
            if (activePortal.exitSide === 'top' && headY < 0 && headX >= activePortal.start && headX < activePortal.start + activePortal.length) {
                return { x: headX, y: GRID_COUNT - 1 };
            }
            if (activePortal.exitSide === 'bottom' && headY >= GRID_COUNT && headX >= activePortal.start && headX < activePortal.start + activePortal.length) {
                return { x: headX, y: 0 };
            }
            if (activePortal.exitSide === 'left' && headX < 0 && headY >= activePortal.start && headY < activePortal.start + activePortal.length) {
                return { x: GRID_COUNT - 1, y: headY };
            }
            if (activePortal.exitSide === 'right' && headX >= GRID_COUNT && headY >= activePortal.start && headY < activePortal.start + activePortal.length) {
                return { x: 0, y: headY };
            }
            return null;
        }

        const loop = () => {
            frames++;
            const speed = Math.max(4, 10 - Math.floor(curScore / 120));

            if (Date.now() >= portal.expiresAt) {
                if (portalContainsSnake(portal)) {
                    portal.expiresAt = Date.now() + 250;
                } else {
                    portal = createPortal();
                }
            }

            if (frames % speed === 0) {
                activeDirectionRef.current = queuedDirectionRef.current;
                const dir = activeDirectionRef.current;
                const rawHead = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
                const wrappedHead = tryWrapThroughPortal(rawHead.x, rawHead.y, portal);
                const head = wrappedHead ?? rawHead;
                if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
                    setGameOver(true);
                    setPlaying(false);
                    cancelAnimationFrame(animationId);
                    return;
                }
                if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
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

            ctx.fillStyle = 'rgba(15, 23, 42, 0.035)';
            for (let row = 0; row < 20; row++) {
                for (let col = 0; col < 20; col++) {
                    if ((row + col) % 2 === 0) {
                        ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
                    }
                }
            }

            ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= canvas.width; i += gridSize) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i <= canvas.height; i += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }

            const portalPulse = 0.72 + Math.sin(frames * 0.16) * 0.22;
            const drawPortalSide = (side: PortalSide, isEntry: boolean) => {
                ctx.save();
                ctx.strokeStyle = isEntry ? '#22d3ee' : '#a78bfa';
                ctx.fillStyle = isEntry ? `rgba(34, 211, 238, ${0.24 + portalPulse * 0.18})` : `rgba(167, 139, 250, ${0.2 + portalPulse * 0.16})`;
                ctx.lineWidth = 5;
                ctx.shadowColor = isEntry ? 'rgba(34, 211, 238, 0.95)' : 'rgba(167, 139, 250, 0.9)';
                ctx.shadowBlur = 16;

                if (side === 'top' || side === 'bottom') {
                    const y = side === 'top' ? 0 : canvas.height - 8;
                    const strokeY = side === 'top' ? 2.5 : canvas.height - 2.5;
                    const startX = portal.start * gridSize + 2;
                    const width = portal.length * gridSize - 4;
                    ctx.fillRect(startX, y, width, 8);
                    ctx.beginPath();
                    ctx.moveTo(startX, strokeY);
                    ctx.lineTo(startX + width, strokeY);
                    ctx.stroke();
                    ctx.fillStyle = 'rgba(255,255,255,0.75)';
                    for (let i = 0; i < portal.length; i++) {
                        const markerX = startX + i * gridSize + 6;
                        ctx.fillRect(markerX, y + 2, 8, 4);
                    }
                } else {
                    const x = side === 'left' ? 0 : canvas.width - 8;
                    const strokeX = side === 'left' ? 2.5 : canvas.width - 2.5;
                    const startY = portal.start * gridSize + 2;
                    const height = portal.length * gridSize - 4;
                    ctx.fillRect(x, startY, 8, height);
                    ctx.beginPath();
                    ctx.moveTo(strokeX, startY);
                    ctx.lineTo(strokeX, startY + height);
                    ctx.stroke();
                    ctx.fillStyle = 'rgba(255,255,255,0.75)';
                    for (let i = 0; i < portal.length; i++) {
                        const markerY = startY + i * gridSize + 6;
                        ctx.fillRect(x + 2, markerY, 4, 8);
                    }
                }
                ctx.restore();
            };

            drawPortalSide(portal.entrySide, true);
            drawPortalSide(portal.exitSide, false);

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
                const px = segment.x * gridSize;
                const py = segment.y * gridSize;
                const isHead = index === 0;
                const isTail = index === snake.length - 1;

                if (isHead) {
                    const dir = activeDirectionRef.current;
                    ctx.fillStyle = '#10b981';
                    ctx.strokeStyle = '#064e3b';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.roundRect(px + 1.5, py + 2, gridSize - 3, gridSize - 4, 7);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = '#dcfce7';
                    ctx.beginPath();
                    ctx.arc(px + gridSize / 2, py + gridSize / 2, 4.8, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#052e16';
                    if (dir.x !== 0) {
                        const eyeX = dir.x > 0 ? px + 14.5 : px + 5.5;
                        ctx.beginPath();
                        ctx.arc(eyeX, py + 6.2, 1.2, 0, Math.PI * 2);
                        ctx.arc(eyeX, py + 13.8, 1.2, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.strokeStyle = '#ef4444';
                        ctx.lineWidth = 1.2;
                        ctx.beginPath();
                        const tongueBaseX = dir.x > 0 ? px + 17.2 : px + 2.8;
                        const tongueTipX = dir.x > 0 ? px + 21 : px - 1;
                        ctx.moveTo(tongueBaseX, py + 10);
                        ctx.lineTo(tongueTipX, py + 8.4);
                        ctx.moveTo(tongueBaseX, py + 10);
                        ctx.lineTo(tongueTipX, py + 11.6);
                        ctx.stroke();
                    } else {
                        const eyeY = dir.y > 0 ? py + 14.5 : py + 5.5;
                        ctx.beginPath();
                        ctx.arc(px + 6.2, eyeY, 1.2, 0, Math.PI * 2);
                        ctx.arc(px + 13.8, eyeY, 1.2, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.strokeStyle = '#ef4444';
                        ctx.lineWidth = 1.2;
                        ctx.beginPath();
                        const tongueBaseY = dir.y > 0 ? py + 17.2 : py + 2.8;
                        const tongueTipY = dir.y > 0 ? py + 21 : py - 1;
                        ctx.moveTo(px + 10, tongueBaseY);
                        ctx.lineTo(px + 8.4, tongueTipY);
                        ctx.moveTo(px + 10, tongueBaseY);
                        ctx.lineTo(px + 11.6, tongueTipY);
                        ctx.stroke();
                    }
                    return;
                }

                if (isTail) {
                    const prev = snake[index - 1] ?? segment;
                    const dx = segment.x - prev.x;
                    const dy = segment.y - prev.y;
                    ctx.fillStyle = '#6ee7b7';
                    ctx.strokeStyle = '#065f46';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    if (dx < 0) {
                        ctx.moveTo(px + 3, py + 3);
                        ctx.lineTo(px + 16, py + 4);
                        ctx.lineTo(px + 18, py + 10);
                        ctx.lineTo(px + 16, py + 16);
                        ctx.lineTo(px + 3, py + 17);
                    } else if (dx > 0) {
                        ctx.moveTo(px + 17, py + 3);
                        ctx.lineTo(px + 4, py + 4);
                        ctx.lineTo(px + 2, py + 10);
                        ctx.lineTo(px + 4, py + 16);
                        ctx.lineTo(px + 17, py + 17);
                    } else if (dy < 0) {
                        ctx.moveTo(px + 3, py + 3);
                        ctx.lineTo(px + 17, py + 3);
                        ctx.lineTo(px + 16, py + 16);
                        ctx.lineTo(px + 10, py + 18);
                        ctx.lineTo(px + 4, py + 16);
                    } else {
                        ctx.moveTo(px + 3, py + 17);
                        ctx.lineTo(px + 17, py + 17);
                        ctx.lineTo(px + 16, py + 4);
                        ctx.lineTo(px + 10, py + 2);
                        ctx.lineTo(px + 4, py + 4);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    return;
                }

                ctx.fillStyle = '#34d399';
                ctx.strokeStyle = '#064e3b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(px + 2, py + 2, gridSize - 4, gridSize - 4, 6);
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
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isTouch && playing ? '0.85rem' : 0 }}>
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
                    <p style={{ fontSize: '0.75rem', opacity: 0.85, color: '#cbd5e1' }}>Use the paired glowing wall gates before they rotate away.</p>
                    </div>
                )}
                {gameOver && (
                    <div className="game-overlay">
                    <h2 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900 }}>SYSTEM CRASH</h2>
                    <p style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 900 }}>SCORE: {score}</p>
                    {createdHighScore && (
                        <div style={{ padding: '0.6rem 0.9rem', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(132, 204, 22, 0.9))', color: '#052e16', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', boxShadow: '0 12px 24px rgba(34, 197, 94, 0.22)' }}>
                            New high score locked
                        </div>
                    )}

                    <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '0.75rem', alignItems: 'stretch' }}>
                            <input value={name.toUpperCase()} onChange={(e) => updateName(e.target.value.toUpperCase())} placeholder="ENTER NAME" style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', color: '#000', border: '3px solid #000', textAlign: 'center', fontSize: '1rem', fontWeight: 900, minWidth: 0, textTransform: 'uppercase' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
                            <button onClick={submit} disabled={!trimmedName} style={{ background: trimmedName ? '#e2e8f0' : '#cbd5e1', color: '#000', padding: '1.1rem 0.75rem', borderRadius: '12px', fontWeight: 900, fontSize: '0.95rem', border: 'none', cursor: trimmedName ? 'pointer' : 'not-allowed' }}>
                                EXIT
                            </button>
                            <button onClick={retry} disabled={!trimmedName} style={{ background: trimmedName ? '#000' : '#475569', color: '#fff', padding: '1.1rem 0.75rem', borderRadius: '12px', fontWeight: 900, fontSize: '0.95rem', border: 'none', cursor: trimmedName ? 'pointer' : 'not-allowed' }}>
                                PLAY AGAIN
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: trimmedName ? '#94a3b8' : '#fca5a5', margin: 0, lineHeight: 1.4 }}>
                            {trimmedName ? 'Both actions will save this score with the entered name.' : 'Enter a name to enable both EXIT and PLAY AGAIN.'}
                        </p>
                    </div>
                    </div>
                )}
                {playing && (
                    <div style={{ position: 'absolute', top: 16, right: 16, padding: '6px 10px' }} className="game-score-badge">{score}</div>
                )}
            </div>

            {playing && isTouch && (
                <div className="game-mobile-controls">
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
        </div>
    );
}
