"use client";
import { useEffect, useRef, useState } from 'react';
import { getSavedArcadePlayerName, saveArcadePlayerName, submitArcadeScore } from '@/utils/arcade-player';

type Ball = { x: number; y: number; dx: number; dy: number; r: number; power: number };
type Paddle = { x: number; w: number; h: number; targetW: number };
type Brick = { x: number; y: number; w: number; h: number; active: boolean; color: string; isMystery: boolean; hits: number; maxHits: number };
type PowerUpType = 'multi' | 'wide' | 'big';
type PowerUp = { x: number; y: number; type: PowerUpType; active: boolean };
type AbilityTimers = Record<'wide' | 'big', number>;

function getBrickHits(level: number, row: number, col: number) {
    if (level < 4) return 1;
    if (level < 8) return (row + col + level) % 4 === 0 ? 2 : 1;
    if (level < 12) {
        if ((row + col + level) % 6 === 0) return 3;
        if ((row + col) % 3 === 0) return 2;
        return 1;
    }
    if ((row * 2 + col + level) % 5 === 0) return 3;
    return (row + col + level) % 2 === 0 ? 2 : 1;
}

function getBallVisualTier(level: number, power: number) {
    if (power > 1 || level >= 10) return 'plasma';
    if (level >= 5) return 'comet';
    return 'classic';
}

function getBasePaddleWidth(level: number) {
    return Math.max(64, 100 - Math.floor((level - 1) / 2) * 5);
}

export default function BreakoutGame({ onFinished }: { onFinished: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [name, setName] = useState("");
    const [isTouch, setIsTouch] = useState(false);
    const [abilityTimers, setAbilityTimers] = useState<AbilityTimers>({ wide: 0, big: 0 });

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
        saveArcadePlayerName(val);
    };

    const startGame = () => {
        cleanupRef.current?.();
        setPlaying(true); setGameOver(false); setScore(0); setLevel(1); setAbilityTimers({ wide: 0, big: 0 });
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        // Game State
        let balls: Ball[] = [{ x: canvas.width / 2, y: canvas.height - 50, dx: 4, dy: -4, r: 6, power: 1 }];
        let paddle: Paddle = { x: canvas.width / 2 - 50, w: getBasePaddleWidth(1), h: 10, targetW: getBasePaddleWidth(1) };
        let bricks: Brick[] = [];
        let curLevel = 1;
        let curScore = 0;
        let powerUps: PowerUp[] = [];
        let animationId: number;
        const timeoutIds: number[] = [];
        let abilityEndTimes: AbilityTimers = { wide: 0, big: 0 };

        const generateLevel = (lv: number) => {
            bricks = [];
            paddle.targetW = getBasePaddleWidth(lv);
            const rows = 3 + Math.min(6, Math.floor((lv + 1) / 3));
            const cols = 8;
            const w = (canvas.width - 40) / cols;
            const h = 20;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const skip =
                        (lv <= 2 && false) ||
                        (lv % 2 === 0 && (r + c) % 2 === 0) ||
                        (lv % 3 === 0 && r % 2 === 0) ||
                        (lv >= 6 && c % 3 === 1 && r % 2 === 1) ||
                        (lv >= 10 && (r + c + lv) % 5 === 0);
                    if (!skip) {
                        const isMystery = Math.random() < Math.max(0.08, 0.15 - lv * 0.005);
                        const maxHits = getBrickHits(lv, r, c);
                        bricks.push({
                            x: 20 + c * w,
                            y: 50 + r * (h + 5),
                            w: w - 5,
                            h,
                            active: true,
                            color: `hsl(${(lv * 40 + r * 20) % 360}, 70%, 50%)`,
                            isMystery,
                            hits: maxHits,
                            maxHits,
                        });
                    }
                }
            }
        };

        generateLevel(curLevel);

        const syncAbilityTimers = () => {
            const now = Date.now();
            setAbilityTimers({
                wide: Math.max(0, abilityEndTimes.wide - now),
                big: Math.max(0, abilityEndTimes.big - now),
            });
        };

        const loop = () => {
            // Paper Background
            ctx.fillStyle = '#fcfaf8'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            syncAbilityTimers();

            // Doodle Grid
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
            for (let i = 0; i <= canvas.width; i += 40) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + (Math.sin(i + curScore * 0.1) * 2), canvas.height); ctx.stroke();
            }
            for (let i = 0; i <= canvas.height; i += 40) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i + (Math.cos(i + curScore * 0.1) * 2)); ctx.stroke();
            }

            ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

            // Paddle Smoothing & Rendering (Sketchy)
            paddle.w += (paddle.targetW - paddle.w) * 0.1;
            ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(paddle.x, canvas.height - 30, paddle.w, paddle.h, 4); ctx.fill(); ctx.stroke();

            // PowerUps (Ink Blobs)
            for (let p of powerUps) {
                p.y += 3 + Math.min(2, curLevel * 0.08);
                ctx.fillStyle = p.type === 'multi' ? '#3b82f6' : p.type === 'wide' ? '#10b981' : '#f59e0b';
                ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
                ctx.fillText(p.type === 'multi' ? '3' : p.type === 'wide' ? 'W' : 'B', p.x, p.y + 4);

                if (p.y > canvas.height - 35 && p.x > paddle.x && p.x < paddle.x + paddle.w) {
                    p.active = false;
                    if (p.type === 'multi') {
                        const b = balls[0];
                        balls.push({ ...b, dx: -b.dx, dy: b.dy * 0.9, r: 6, power: 1 });
                        balls.push({ ...b, dx: b.dx * 0.5, dy: -Math.abs(b.dy), r: 6, power: 1 });
                    } else if (p.type === 'wide') {
                        paddle.targetW = Math.min(160, getBasePaddleWidth(curLevel) + 48);
                        abilityEndTimes.wide = Date.now() + 8000;
                        syncAbilityTimers();
                        timeoutIds.push(window.setTimeout(() => {
                            paddle.targetW = getBasePaddleWidth(curLevel);
                            abilityEndTimes.wide = 0;
                            syncAbilityTimers();
                        }, 8000));
                    } else if (p.type === 'big') {
                        balls.forEach(b => { b.r = 12; b.power = 2; });
                        abilityEndTimes.big = Date.now() + 8000;
                        syncAbilityTimers();
                        timeoutIds.push(window.setTimeout(() => {
                            balls.forEach(b => { b.r = 6; b.power = 1; });
                            abilityEndTimes.big = 0;
                            syncAbilityTimers();
                        }, 8000));
                    }
                }
            }
            powerUps = powerUps.filter(p => p.active && p.y < canvas.height);

            // Balls (Ink Drops)
            for (let b of balls) {
                b.x += b.dx;
                b.y += b.dy;
                if (b.x - b.r <= 0 || b.x + b.r >= canvas.width) {
                    b.dx *= -1;
                    b.x = Math.max(b.r, Math.min(canvas.width - b.r, b.x));
                }
                if (b.y - b.r <= 0) {
                    b.dy = Math.abs(b.dy);
                    b.y = b.r;
                }

                const paddleTop = canvas.height - 30;
                if (b.dy > 0 && b.y + b.r >= paddleTop && b.y - b.r <= paddleTop + paddle.h && b.x >= paddle.x && b.x <= paddle.x + paddle.w) {
                    const hitOffset = (b.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
                    const launchAngle = hitOffset * 1.1;
                    const speed = Math.max(4.9, Math.min(10.8, Math.hypot(b.dx, b.dy) + 0.14 + curLevel * 0.08));
                    b.dx = Math.sin(launchAngle) * speed;
                    b.dy = -Math.max(3.8, Math.cos(launchAngle) * speed);
                    b.y = paddleTop - b.r - 1;
                }

                for (let br of bricks) {
                    if (br.active && b.x + b.r > br.x && b.x - b.r < br.x + br.w && b.y + b.r > br.y && b.y - b.r < br.y + br.h) {
                        const overlapLeft = Math.abs((b.x + b.r) - br.x);
                        const overlapRight = Math.abs((br.x + br.w) - (b.x - b.r));
                        const overlapTop = Math.abs((b.y + b.r) - br.y);
                        const overlapBottom = Math.abs((br.y + br.h) - (b.y - b.r));
                        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                        br.hits -= b.power;
                        if (minOverlap === overlapLeft || minOverlap === overlapRight) b.dx *= -1;
                        else b.dy *= -1;
                        if (br.hits <= 0) {
                            br.active = false;
                            curScore += br.maxHits * 10;
                            setScore(curScore);
                            if (br.isMystery) {
                                const types: PowerUpType[] = ['multi', 'wide', 'big'];
                                powerUps.push({ x: br.x + br.w / 2, y: br.y, type: types[Math.floor(Math.random() * 3)], active: true });
                            }
                        } else {
                            curScore += 4;
                            setScore(curScore);
                        }
                        break;
                    }
                }
                const ballTier = getBallVisualTier(curLevel, b.power);
                if (ballTier === 'classic') {
                    ctx.fillStyle = '#111827';
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                    ctx.fill();
                } else if (ballTier === 'comet') {
                    const tail = ctx.createLinearGradient(b.x - b.dx * 4, b.y - b.dy * 4, b.x, b.y);
                    tail.addColorStop(0, 'rgba(59, 130, 246, 0.05)');
                    tail.addColorStop(1, 'rgba(59, 130, 246, 0.45)');
                    ctx.strokeStyle = tail;
                    ctx.lineWidth = 6;
                    ctx.beginPath();
                    ctx.moveTo(b.x - b.dx * 3.5, b.y - b.dy * 3.5);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                    ctx.fillStyle = '#2563eb';
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.r + 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#dbeafe';
                    ctx.beginPath();
                    ctx.arc(b.x - 1.5, b.y - 1.5, b.r * 0.42, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    const glow = ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.r * 2.4);
                    glow.addColorStop(0, 'rgba(255,255,255,0.95)');
                    glow.addColorStop(0.3, 'rgba(248,113,113,0.95)');
                    glow.addColorStop(0.65, 'rgba(236,72,153,0.68)');
                    glow.addColorStop(1, 'rgba(236,72,153,0)');
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.r * 2.3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.r + 1, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.r + 0.5, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            balls = balls.filter(b => b.y < canvas.height);
            if (balls.length === 0) {
                setGameOver(true); setPlaying(false); cancelAnimationFrame(animationId); return;
            }

            // Bricks (Sketchy tiles)
            for (let br of bricks) {
                if (br.active) {
                    const damageRatio = br.hits / br.maxHits;
                    ctx.fillStyle = br.color;
                    ctx.globalAlpha = 0.72 + (damageRatio * 0.28);
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.roundRect(br.x, br.y, br.w, br.h, 3); ctx.fill(); ctx.stroke();
                    ctx.globalAlpha = 1;
                    if (br.maxHits > 1) {
                        ctx.fillStyle = '#111827';
                        ctx.font = 'bold 11px Inter';
                        ctx.textAlign = 'left';
                        ctx.fillText(`${br.hits}`, br.x + 6, br.y + 14);
                    }
                    if (br.hits < br.maxHits) {
                        ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
                        ctx.lineWidth = 1.2;
                        ctx.beginPath();
                        ctx.moveTo(br.x + 6, br.y + 4);
                        ctx.lineTo(br.x + br.w * 0.45, br.y + br.h - 4);
                        ctx.moveTo(br.x + br.w * 0.62, br.y + 3);
                        ctx.lineTo(br.x + br.w - 6, br.y + br.h - 5);
                        if (br.maxHits >= 3 && br.hits === 1) {
                            ctx.moveTo(br.x + 8, br.y + br.h * 0.6);
                            ctx.lineTo(br.x + br.w - 10, br.y + 6);
                        }
                        ctx.stroke();
                    }
                    if (br.isMystery) {
                        ctx.fillStyle = '#000'; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
                        ctx.fillText('?', br.x + br.w / 2, br.y + br.h - 5);
                    }
                }
            }

            if (bricks.every(b => !b.active)) {
                curLevel++; setLevel(curLevel);
                generateLevel(curLevel);
                const baseSpeed = Math.min(8.8, 4.2 + curLevel * 0.28);
                balls = [{ x: canvas.width / 2, y: canvas.height - 50, dx: baseSpeed, dy: -baseSpeed, r: 6, power: 1 }];
            }

            animationId = requestAnimationFrame(loop);
        };
        loop();

        const move = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const point = 'touches' in e ? e.touches[0] : e;
            if (!point) return;
            const x = (point.clientX - rect.left) * (canvas.width / rect.width);
            paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, x - paddle.w / 2));
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('touchmove', move);
        cleanupRef.current = () => {
            cancelAnimationFrame(animationId);
            timeoutIds.forEach((id) => window.clearTimeout(id));
            window.removeEventListener('mousemove', move);
            window.removeEventListener('touchmove', move);
        };
    };

    const submit = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'breakout');
        onFinished();
    };

    const retry = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        await submitArcadeScore(trimmedName, score, 'breakout');
        startGame();
    };

    const trimmedName = name.trim();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }} className="game-console game-console--portrait">
            <canvas ref={canvasRef} width={400} height={600} className="game-canvas game-canvas-portrait" />
            {!playing && !gameOver && (
                <div className="game-overlay" style={{ zIndex: 20 }}>
                    <div style={{ background: '#000', color: '#fff', padding: '0.75rem 2rem', borderRadius: '12px', transform: 'skewX(-15deg)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>BREAKOUT</h2>
                    </div>

                    <div className="game-panel">
                        <p style={{ fontWeight: 900, fontSize: '1.2rem', color: '#f8fafc', margin: 0 }}>MISSION: SYSTEM CLEANSE</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {!isTouch ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ width: '44px', height: '44px', border: '1px solid rgba(148, 163, 184, 0.45)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 900, background: 'rgba(15, 23, 42, 0.95)', color: '#f8fafc' }}>M</div>
                                        <div style={{ width: '44px', height: '44px', border: '1px solid rgba(148, 163, 184, 0.45)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 900, background: 'rgba(15, 23, 42, 0.95)', color: '#f8fafc' }}>↔</div>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e2e8f0' }}>MOUSE MOVE</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem', background: 'rgba(15, 23, 42, 0.88)', borderRadius: '24px', border: '1px solid rgba(148, 163, 184, 0.35)' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#f8fafc', borderRadius: '50%' }} className="animate-ping" />
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 900, color: '#f8fafc' }}>TOUCH & DRAG</span>
                                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Move paddle across width</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={startGame} style={{
                        background: '#000', color: '#fff', fontWeight: 900,
                        fontSize: '1.2rem', cursor: 'pointer', border: 'none',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }} className="game-start-button hover-scale">
                        INITIALIZE BRAIN
                    </button>
                </div>
            )}
            {gameOver && (
                <div className="game-overlay" style={{ zIndex: 20 }}>
                    <h2 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase' }}>SYSTEM OVERFLOW</h2>
                    <p style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 900 }}>SCORE: {score}</p>

                    <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '0.75rem', alignItems: 'stretch' }}>
                            <input value={name.toUpperCase()} onChange={e => updateName(e.target.value.toUpperCase())} placeholder="ENTER NAME" style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', color: '#000', border: '3px solid #000', textAlign: 'center', fontSize: '1rem', fontWeight: 900, minWidth: 0, textTransform: 'uppercase' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
                            <button onClick={submit} disabled={!trimmedName} style={{ background: trimmedName ? '#e2e8f0' : '#cbd5e1', color: '#000', padding: '1.1rem 0.75rem', borderRadius: '12px', fontWeight: 900, fontSize: '0.95rem', border: 'none', cursor: trimmedName ? 'pointer' : 'not-allowed' }}>
                                EXIT
                            </button>
                            <button onClick={retry} disabled={!trimmedName} style={{ background: trimmedName ? '#000' : '#475569', color: '#fff', padding: '1.1rem 0.75rem', borderRadius: '12px', fontWeight: 900, fontSize: '0.95rem', border: 'none', cursor: trimmedName ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <span>🔄</span> PLAY AGAIN
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: trimmedName ? '#94a3b8' : '#fca5a5', margin: 0 }}>{trimmedName ? 'Both actions will save this score with the entered name.' : 'Enter a name to enable both EXIT and PLAY AGAIN.'}</p>
                    </div>
                </div>
            )}
            {playing && (
                <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ padding: '4px 12px', fontSize: '0.8rem' }} className="game-score-badge">LEVEL {level}</span>
                        <span style={{ padding: '4px 12px', fontSize: '0.8rem' }} className="game-score-badge">{score}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                        {(['wide', 'big'] as const).map((type) => {
                            const remaining = abilityTimers[type];
                            if (remaining <= 0) return null;
                            const progress = remaining / 8000;
                            const color = type === 'wide' ? '#10b981' : '#f59e0b';
                            const label = type === 'wide' ? 'W' : 'B';
                            return (
                                <div
                                    key={type}
                                    className="game-score-badge"
                                    style={{ width: '34px', height: '34px', padding: 0, display: 'grid', placeItems: 'center', borderRadius: '999px', position: 'relative' }}
                                >
                                    <svg width="34" height="34" viewBox="0 0 34 34" style={{ position: 'absolute', inset: 0 }}>
                                        <circle cx="17" cy="17" r="13" fill="none" stroke="rgba(148,163,184,0.24)" strokeWidth="3" />
                                        <circle
                                            cx="17"
                                            cy="17"
                                            r="13"
                                            fill="none"
                                            stroke={color}
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeDasharray={81.68}
                                            strokeDashoffset={81.68 * (1 - progress)}
                                            transform="rotate(-90 17 17)"
                                        />
                                    </svg>
                                    <span style={{ position: 'relative', zIndex: 1, fontSize: '0.72rem', fontWeight: 900, color: '#f8fafc' }}>{label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
