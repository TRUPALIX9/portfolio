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

        let animationId = 0;
        let frame = 0;

        let rocketX = 75;
        const asteroids = Array.from({ length: 4 }, (_, index) => ({
            x: 20 + index * 32,
            y: -index * 38,
            r: 11 + (index % 2) * 4,
            speed: 1.8 + index * 0.15,
        }));

        let runnerY = 105;
        let runnerVy = 0;
        const runnerObstacles = Array.from({ length: 3 }, (_, index) => ({
            x: 145 + index * 58,
            w: 14,
            h: 24 + (index % 2) * 10,
        }));

        const reflexTargets = Array.from({ length: 3 }, (_, index) => ({
            x: 35 + index * 38,
            y: 42 + (index % 2) * 36,
            base: 8 + index,
            phase: index * 18,
        }));

        const memoryPads = [
            { x: 18, y: 18, color: '#ec4899' },
            { x: 82, y: 18, color: '#8b5cf6' },
            { x: 18, y: 82, color: '#3b82f6' },
            { x: 82, y: 82, color: '#10b981' },
        ];

        const snakeBody = [
            { x: 7, y: 7 },
            { x: 6, y: 7 },
            { x: 5, y: 7 },
            { x: 4, y: 7 },
        ];
        let snakeDirection = { x: 1, y: 0 };
        let snakeFood = { x: 11, y: 5 };

        let breakoutBall = { x: 72, y: 94, dx: 1.6, dy: -1.9 };
        let breakoutPaddleX = 52;
        const breakoutBricks = Array.from({ length: 12 }, (_, index) => ({
            x: 12 + (index % 4) * 32,
            y: 12 + Math.floor(index / 4) * 15,
            active: true,
            hue: 18 + index * 17,
        }));

        const drawPaperGrid = () => {
            ctx.strokeStyle = '#d9dee7';
            ctx.lineWidth = 1;
            for (let x = 0; x <= canvas.width; x += 30) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x + Math.sin((frame + x) * 0.04) * 2, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y <= canvas.height; y += 30) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y + Math.cos((frame + y) * 0.04) * 2);
                ctx.stroke();
            }
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
        };

        const render = () => {
            frame += 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (type === 'gravity' || type === 'breakout' || type === 'crawler' || type === 'pattern' || type === 'shooter') {
                ctx.fillStyle = '#fcfaf8';
            } else {
                ctx.fillStyle = '#f8fafc';
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawPaperGrid();

            if (type === 'gravity') {
                rocketX = 75 + Math.sin(frame * 0.05) * 34;
                for (const asteroid of asteroids) {
                    asteroid.y += asteroid.speed;
                    if (asteroid.y - asteroid.r > canvas.height) asteroid.y = -22;

                    ctx.save();
                    ctx.translate(asteroid.x, asteroid.y);
                    ctx.rotate(frame * 0.01);
                    ctx.fillStyle = '#94a3b8';
                    ctx.strokeStyle = '#111827';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    for (let i = 0; i < 7; i += 1) {
                        const angle = (i / 7) * Math.PI * 2;
                        const radius = asteroid.r * (0.8 + ((i + frame) % 3) * 0.08);
                        const px = Math.cos(angle) * radius;
                        const py = Math.sin(angle) * radius;
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }

                ctx.save();
                ctx.translate(rocketX, 97);
                ctx.fillStyle = '#ef4444';
                ctx.strokeStyle = '#111827';
                ctx.lineWidth = 2;
                ctx.fillRect(-4, 24, 8, 12);
                ctx.strokeRect(-4, 24, 8, 12);
                ctx.fillRect(20, 24, 8, 12);
                ctx.strokeRect(20, 24, 8, 12);
                ctx.beginPath();
                ctx.roundRect(0, 6, 24, 30, [10, 10, 4, 4]);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(12, 18, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#38bdf8';
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(7, 36);
                ctx.lineTo(12, 49 + Math.sin(frame * 0.3) * 4);
                ctx.lineTo(17, 36);
                ctx.closePath();
                ctx.fillStyle = '#fbbf24';
                ctx.fill();
                ctx.restore();
            } else if (type === 'runner') {
                const groundY = 120;
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
                ctx.strokeStyle = '#111827';
                ctx.lineWidth = 2;
                ctx.strokeRect(0, groundY, canvas.width, 1);

                runnerVy += 0.4;
                runnerY += runnerVy;
                if (runnerY > 95) {
                    runnerY = 95;
                    runnerVy = 0;
                }

                for (const obstacle of runnerObstacles) {
                    obstacle.x -= 3.2;
                    if (obstacle.x + obstacle.w < 0) obstacle.x = 168;
                    if (obstacle.x < 55 && obstacle.x > 48 && runnerY === 95) runnerVy = -7;
                    ctx.fillStyle = '#ef4444';
                    ctx.strokeStyle = '#111827';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.roundRect(obstacle.x, groundY - obstacle.h, obstacle.w, obstacle.h, 4);
                    ctx.fill();
                    ctx.stroke();
                }

                ctx.save();
                ctx.translate(44, runnerY);
                ctx.fillStyle = '#f59e0b';
                ctx.strokeStyle = '#111827';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(0, 0, 20, 25, 4);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            } else if (type === 'shooter') {
                for (const target of reflexTargets) {
                    const pulse = target.base + Math.sin((frame + target.phase) * 0.09) * 4;
                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(target.x, target.y, pulse, 0, Math.PI * 2);
                    ctx.stroke();

                    ctx.strokeStyle = '#fca5a5';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(target.x, target.y, pulse * 0.45, 0, Math.PI * 2);
                    ctx.stroke();
                }
            } else if (type === 'pattern') {
                const activePad = Math.floor(frame / 35) % memoryPads.length;
                memoryPads.forEach((pad, index) => {
                    ctx.fillStyle = index === activePad ? pad.color : `${pad.color}33`;
                    ctx.strokeStyle = '#111827';
                    ctx.lineWidth = index === activePad ? 4 : 2;
                    ctx.beginPath();
                    ctx.roundRect(pad.x, pad.y, 50, 50, 10);
                    ctx.fill();
                    ctx.stroke();
                });
            } else if (type === 'crawler') {
                if (frame % 18 === 0) {
                    const nextHead = {
                        x: snakeBody[0].x + snakeDirection.x,
                        y: snakeBody[0].y + snakeDirection.y,
                    };

                    if (
                        nextHead.x < 0 ||
                        nextHead.x > 14 ||
                        nextHead.y < 0 ||
                        nextHead.y > 14 ||
                        (nextHead.x === snakeFood.x && nextHead.y === snakeFood.y)
                    ) {
                        const directions = [
                            { x: 1, y: 0 },
                            { x: -1, y: 0 },
                            { x: 0, y: 1 },
                            { x: 0, y: -1 },
                        ];
                        snakeDirection = directions[(Math.floor(frame / 18) + 1) % directions.length];
                    }

                    snakeBody.unshift({
                        x: Math.max(0, Math.min(14, snakeBody[0].x + snakeDirection.x)),
                        y: Math.max(0, Math.min(14, snakeBody[0].y + snakeDirection.y)),
                    });

                    while (snakeBody.length > 4) snakeBody.pop();

                    if (snakeBody[0].x === snakeFood.x && snakeBody[0].y === snakeFood.y) {
                        snakeFood = {
                            x: 2 + ((frame / 18) % 10),
                            y: 3 + ((frame / 27) % 8),
                        };
                    }
                }

                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(snakeFood.x * 9 + 10, snakeFood.y * 9 + 10, 4, 0, Math.PI * 2);
                ctx.fill();

                snakeBody.forEach((segment, index) => {
                    ctx.fillStyle = index === 0 ? '#10b981' : '#34d399';
                    ctx.strokeStyle = '#064e3b';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.roundRect(segment.x * 9 + 2, segment.y * 9 + 2, 8, 8, 2);
                    ctx.fill();
                    ctx.stroke();
                });
            } else if (type === 'breakout') {
                breakoutBall.x += breakoutBall.dx;
                breakoutBall.y += breakoutBall.dy;
                if (breakoutBall.x < 6 || breakoutBall.x > 144) breakoutBall.dx *= -1;
                if (breakoutBall.y < 7) breakoutBall.dy *= -1;
                if (breakoutBall.y > 132 && breakoutBall.x > breakoutPaddleX && breakoutBall.x < breakoutPaddleX + 38) {
                    breakoutBall.dy = -Math.abs(breakoutBall.dy);
                }
                if (breakoutBall.y > 150) {
                    breakoutBall = { x: 72, y: 94, dx: 1.6, dy: -1.9 };
                }

                breakoutPaddleX += (breakoutBall.x - 19 - breakoutPaddleX) * 0.12;

                breakoutBricks.forEach((brick) => {
                    if (!brick.active) return;
                    if (
                        breakoutBall.x > brick.x &&
                        breakoutBall.x < brick.x + 26 &&
                        breakoutBall.y > brick.y &&
                        breakoutBall.y < brick.y + 10
                    ) {
                        brick.active = false;
                        breakoutBall.dy *= -1;
                    }

                    ctx.fillStyle = `hsl(${brick.hue}, 70%, 54%)`;
                    ctx.strokeStyle = '#111827';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(brick.x, brick.y, 26, 10, 3);
                    ctx.fill();
                    ctx.stroke();
                });

                if (breakoutBricks.every((brick) => !brick.active)) {
                    breakoutBricks.forEach((brick) => {
                        brick.active = true;
                    });
                }

                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.roundRect(breakoutPaddleX, 138, 38, 6, 4);
                ctx.fill();

                ctx.fillStyle = '#111827';
                ctx.beginPath();
                ctx.arc(breakoutBall.x, breakoutBall.y, 3.6, 0, Math.PI * 2);
                ctx.fill();
            }

            animationId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationId);
    }, [type]);

    return (
        <canvas
            ref={canvasRef}
            width={150}
            height={150}
            style={{
                width: '100%',
                height: '140px',
                borderRadius: '12px',
                marginBottom: '1rem',
                background: '#000',
                border: '1px solid rgba(255,255,255,0.05)',
            }}
        />
    );
}
