"use client";
import { useEffect, useRef } from 'react';

type GameType = 'gravity' | 'collector' | 'shooter' | 'pattern' | 'crawler' | 'breakout' | 'runner';

export default function GamePreview({ type }: { type: GameType }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let frame = 0;

        // Simulation States
        let runnerY = 105, runnerVY = 0;
        let pBall = { x: 75, y: 100, dx: 2, dy: -2 };
        let pBricks = Array(15).fill(true).map((_, i) => ({ x: (i % 5) * 28 + 5, y: Math.floor(i / 5) * 12 + 10, active: true }));
        let pPaddleX = 60;
        let targets: any[] = [];
        let rAsteroids: any[] = [];
        let snake = [{ x: 5, y: 7 }, { x: 4, y: 7 }, { x: 3, y: 7 }];
        let snakeDir = { x: 1, y: 0 };
        let runnerObstacles: any[] = [];

        const render = () => {
            frame++;

            // Background Selection
            if (type === 'breakout' || type === 'gravity') {
                ctx.fillStyle = '#f8fafc';
            } else if (type === 'runner') {
                const grad = ctx.createLinearGradient(0, 0, 0, 150);
                grad.addColorStop(0, '#111827'); grad.addColorStop(1, '#1f2937');
                ctx.fillStyle = grad;
            } else {
                ctx.fillStyle = '#0a0b1e';
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (type === 'gravity') {
                if (frame % 45 === 0) rAsteroids.push({ x: Math.random() * 150, y: -20, vy: 1.5, r: 10 + Math.random() * 10 });
                for (let a of rAsteroids) {
                    a.y += a.vy;
                    ctx.fillStyle = '#94a3b8'; ctx.beginPath();
                    // Simple polygon-ish look
                    ctx.moveTo(a.x + a.r, a.y);
                    for (let i = 1; i < 6; i++) {
                        const angle = (i / 6) * Math.PI * 2;
                        const d = a.r * (0.8 + Math.random() * 0.1); // flicker a bit for energy look
                        ctx.lineTo(a.x + Math.cos(angle) * d, a.y + Math.sin(angle) * d);
                    }
                    ctx.closePath(); ctx.fill();
                }
                rAsteroids = rAsteroids.filter(a => a.y < 170);
                pPaddleX += (75 + Math.sin(frame * 0.04) * 40 - pPaddleX) * 0.1;
                ctx.save(); ctx.translate(pPaddleX, 120);
                ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(-6, 10); ctx.lineTo(0, 0); ctx.lineTo(6, 10); ctx.fill();
                ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(0, 15, 4, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            } else if (type === 'breakout') {
                pBall.x += pBall.dx; pBall.y += pBall.dy;
                if (pBall.x < 5 || pBall.x > 145) pBall.dx *= -1;
                if (pBall.y < 5) pBall.dy *= -1;
                if (pBall.y > 135 && pBall.x > pPaddleX && pBall.x < pPaddleX + 35) { pBall.dy = -Math.abs(pBall.dy); pBall.dx = (pBall.x - (pPaddleX + 17.5)) / 5; }
                if (pBall.y > 150) { pBall.y = 100; pBall.dy = -2; }

                pPaddleX += (pBall.x - 17.5 - pPaddleX) * 0.15;
                ctx.fillStyle = '#000'; ctx.fillRect(pPaddleX, 140, 35, 4);

                pBricks.forEach((b, i) => {
                    if (b.active) {
                        if (pBall.x > b.x && pBall.x < b.x + 25 && pBall.y > b.y && pBall.y < b.y + 10) { b.active = false; pBall.dy *= -1; }
                        ctx.fillStyle = `hsl(${(i * 30 + frame) % 360}, 60%, 50%)`;
                        ctx.fillRect(b.x, b.y, 25, 10);
                    }
                });
                if (pBricks.every(b => !b.active)) pBricks.forEach(b => b.active = true);
                ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(pBall.x, pBall.y, 3, 0, Math.PI * 2); ctx.fill();
            } else if (type === 'runner') {
                if (frame % 60 === 0) runnerObstacles.push({ x: 160, w: 15, h: 25 });
                runnerVY += 0.4; runnerY += runnerVY;
                if (runnerY > 105) { runnerY = 105; runnerVY = 0; }

                for (let o of runnerObstacles) {
                    o.x -= 3;
                    ctx.fillStyle = '#ef4444'; ctx.fillRect(o.x, 115, o.w, o.h);
                    if (o.x < 60 && o.x > 30 && runnerY > 90) runnerVY = -8; // Auto jump
                }
                runnerObstacles = runnerObstacles.filter(o => o.x > -20);
                ctx.fillStyle = '#f59e0b'; ctx.fillRect(40, runnerY, 20, 25);
            } else if (type === 'shooter') {
                if (frame % 35 === 0) targets.push({ x: Math.random() * 120 + 15, y: Math.random() * 100 + 25, r: 2, maxR: 12, life: 40 });
                for (let t of targets) {
                    t.r += (t.maxR - t.r) * 0.1;
                    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.stroke(); t.life--;
                }
                targets = targets.filter(t => t.life > 0);
            } else if (type === 'crawler') {
                if (frame % 12 === 0) {
                    let head = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };
                    if (head.x > 14 || head.x < 0 || head.y > 14 || head.y < 0 || Math.random() < 0.1) {
                        const possible = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
                        snakeDir = possible[Math.floor(Math.random() * 4)];
                        head = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };
                    }
                    snake.unshift(head); snake.pop();
                }
                snake.forEach((s, i) => { ctx.fillStyle = i === 0 ? '#22c55e' : '#16a34a'; ctx.fillRect(s.x * 10, s.y * 10, 9, 9); });
            } else if (type === 'pattern') {
                const active = Math.floor(frame / 40) % 4;
                const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981'];
                [[20, 20], [80, 20], [20, 80], [80, 80]].forEach(([x, y], i) => {
                    ctx.fillStyle = active === i ? colors[i] : colors[i] + '33';
                    ctx.fillRect(x, y, 50, 50);
                });
            }

            animationId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationId);
    }, [type]);

    return (
        <canvas ref={canvasRef} width={150} height={150} style={{ width: '100%', height: '140px', borderRadius: '12px', marginBottom: '1rem', background: '#000', border: '1px solid rgba(255,255,255,0.05)' }} />
    );
}
