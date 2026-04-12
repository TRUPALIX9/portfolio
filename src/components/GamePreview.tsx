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
        let runnerY = 100, runnerVY = 0;
        let jumpX = 75;
        let targets: any[] = [];
        let rAsteroids: any[] = [];
        let snake = [{ x: 5, y: 7 }, { x: 4, y: 7 }, { x: 3, y: 7 }];
        let snakeDir = { x: 1, y: 0 };

        const render = () => {
            frame++;

            // Background Selection
            if (type === 'breakout' || type === 'gravity') {
                const grad = ctx.createLinearGradient(0, 0, 0, 150);
                grad.addColorStop(0, '#f8fafc'); grad.addColorStop(1, '#e2e8f0');
                ctx.fillStyle = grad;
            } else if (type === 'runner') {
                const grad = ctx.createLinearGradient(0, 0, 0, 150);
                grad.addColorStop(0, '#1e1b4b'); grad.addColorStop(1, '#4c1d95');
                ctx.fillStyle = grad;
            } else {
                ctx.fillStyle = '#0f172a';
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (type === 'gravity') {
                if (frame % 40 === 0) rAsteroids.push({ x: Math.random() * 150, y: -20, vy: 2, r: 12 });
                for (let a of rAsteroids) { a.y += a.vy; ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill(); }
                rAsteroids = rAsteroids.filter(a => a.y < 160);
                ctx.save(); ctx.translate(75 + Math.sin(frame * 0.05) * 20, 110);
                ctx.fillStyle = '#ef4444'; ctx.fillRect(-4, 0, 8, 10);
                ctx.fillStyle = '#f1f5f9'; ctx.fillRect(-4, -10, 8, 10);
                ctx.restore();
            } else if (type === 'breakout') {
                ctx.fillStyle = '#000'; ctx.fillRect(60 + Math.sin(frame * 0.05) * 30, 140, 30, 5);
                ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(75 + Math.sin(frame * 0.05) * 30, 70 + Math.abs(Math.cos(frame * 0.05) * 60), 4, 0, Math.PI * 2); ctx.fill();
            } else if (type === 'runner') {
                ctx.fillStyle = '#111827'; ctx.fillRect(0, 130, 150, 20);
                runnerVY += 0.4; runnerY += runnerVY;
                if (runnerY > 105) { runnerY = 105; if (frame % 60 === 0) runnerVY = -7; }
                ctx.fillStyle = '#f59e0b'; ctx.fillRect(40, runnerY, 25, 25);
            } else if (type === 'shooter') {
                if (frame % 40 === 0) targets.push({ x: Math.random() * 120 + 15, y: Math.random() * 100 + 25, r: 8, life: 30 });
                for (let t of targets) { ctx.strokeStyle = '#ef4444'; ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.stroke(); t.life--; }
                targets = targets.filter(t => t.life > 0);
            } else if (type === 'crawler') {
                if (frame % 15 === 0) {
                    const head = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };
                    if (head.x > 14 || head.x < 0 || head.y > 14 || head.y < 0) snakeDir = { x: -snakeDir.y, y: snakeDir.x };
                    snake.unshift({ x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y });
                    snake.pop();
                }
                snake.forEach((s, i) => { ctx.fillStyle = i === 0 ? '#22c55e' : '#16a34a'; ctx.fillRect(s.x * 10, s.y * 10, 8, 8); });
            } else if (type === 'pattern') {
                ctx.fillStyle = frame % 60 < 30 ? '#ec4899' : '#ec489933'; ctx.fillRect(20, 20, 50, 50);
                ctx.fillStyle = '#8b5cf633'; ctx.fillRect(80, 20, 50, 50);
                ctx.fillStyle = '#3b82f633'; ctx.fillRect(20, 80, 50, 50);
                ctx.fillStyle = '#10b98133'; ctx.fillRect(80, 80, 50, 50);
            }

            animationId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationId);
    }, [type]);

    return (
        <canvas ref={canvasRef} width={150} height={150} style={{ width: '100%', height: '140px', borderRadius: '8px', marginBottom: '1rem', background: '#000' }} />
    );
}
