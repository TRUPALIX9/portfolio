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

        let rocketY = 118;
        const stars = Array.from({ length: 18 }, (_, index) => ({
            x: (index * 29) % 150,
            y: (index * 37) % 150,
            r: 1 + (index % 3),
            speed: 0.6 + (index % 4) * 0.18,
        }));

        let runnerX = 32;
        let runnerMood = 0;
        const runnerBursts = Array.from({ length: 4 }, (_, index) => ({
            x: 42 + index * 18,
            y: 118 - index * 3,
            width: 10 + index * 4,
        }));

        const memoryTiles = Array.from({ length: 9 }, (_, index) => ({
            row: Math.floor(index / 3),
            col: index % 3,
            hue: [188, 214, 276, 332, 24, 168, 244, 298, 42][index],
        }));

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

            if (type === 'gravity') {
                const space = ctx.createLinearGradient(0, 0, 0, canvas.height);
                space.addColorStop(0, '#020617');
                space.addColorStop(0.55, '#0f172a');
                space.addColorStop(1, '#111827');
                ctx.fillStyle = space;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                for (const star of stars) {
                    star.y += star.speed;
                    if (star.y - star.r > canvas.height) star.y = -6;
                    ctx.fillStyle = `rgba(255,255,255,${0.45 + (star.r / 5)})`;
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                    ctx.fill();
                }

                rocketY -= 1.15;
                if (rocketY < 28) rocketY = 118;

                ctx.save();
                ctx.translate(75, rocketY);
                ctx.fillStyle = '#ef4444';
                ctx.strokeStyle = '#e2e8f0';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(12, 0);
                ctx.lineTo(24, 18);
                ctx.lineTo(20, 50);
                ctx.lineTo(4, 50);
                ctx.lineTo(0, 18);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(12, 20, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#38bdf8';
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#fca5a5';
                ctx.fillRect(-2, 22, 6, 16);
                ctx.fillRect(20, 22, 6, 16);
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath();
                ctx.moveTo(7, 50);
                ctx.lineTo(12, 68 + Math.sin(frame * 0.28) * 5);
                ctx.lineTo(17, 50);
                ctx.closePath();
                ctx.fill();
                ctx.restore();

                ctx.strokeStyle = 'rgba(56,189,248,0.22)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(75, rocketY + 74);
                ctx.bezierCurveTo(64, rocketY + 88, 58, rocketY + 108, 62, 138);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(75, rocketY + 74);
                ctx.bezierCurveTo(86, rocketY + 88, 92, rocketY + 108, 88, 138);
                ctx.stroke();
            } else if (type === 'runner') {
                ctx.fillStyle = '#f8fafc';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawPaperGrid();

                const groundY = 118;
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
                ctx.strokeStyle = '#111827';
                ctx.lineWidth = 2;
                ctx.strokeRect(0, groundY, canvas.width, 1);

                runnerX += 0.85;
                if (runnerX > 96) runnerX = 32;
                runnerMood = Math.min(1, Math.max(0, (runnerX - 32) / 64));

                for (const burst of runnerBursts) {
                    const fade = 0.18 + runnerMood * 0.22;
                    ctx.fillStyle = `rgba(16, 185, 129, ${fade})`;
                    ctx.fillRect(runnerX - burst.width - 6, burst.y, burst.width, 3);
                }

                ctx.save();
                ctx.translate(runnerX, 88);
                ctx.fillStyle = '#f59e0b';
                ctx.strokeStyle = '#111827';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(0, 0, 26, 26, 5);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#111827';
                ctx.beginPath();
                ctx.arc(8, 9, 2, 0, Math.PI * 2);
                ctx.arc(18, 9, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                if (runnerMood < 0.45) {
                    ctx.moveTo(7, 19);
                    ctx.quadraticCurveTo(13, 14, 19, 19);
                } else {
                    ctx.moveTo(7, 16);
                    ctx.quadraticCurveTo(13, 22, 19, 16);
                }
                ctx.stroke();
                ctx.restore();

                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.roundRect(118, 92, 16, 26, 4);
                ctx.fill();
            } else if (type === 'shooter') {
                drawPaperGrid();
                const previewLevel = Math.floor((frame / 70) % 3);
                const previewGrid = previewLevel === 0 ? 2 : previewLevel === 1 ? 3 : 4;
                const activeCell = Math.floor(frame / 24) % (previewGrid * previewGrid);
                const cellSize = previewGrid === 4 ? 24 : previewGrid === 3 ? 30 : 38;
                const gap = previewGrid === 4 ? 7 : 9;
                const totalWidth = previewGrid * cellSize + (previewGrid - 1) * gap;
                const startX = (canvas.width - totalWidth) / 2;
                const startY = (canvas.height - totalWidth) / 2;

                ctx.fillStyle = '#0f172a';
                ctx.fillRect(12, 12, canvas.width - 24, canvas.height - 24);
                ctx.strokeStyle = 'rgba(248, 250, 252, 0.12)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

                    for (let row = 0; row < previewGrid; row += 1) {
                        for (let col = 0; col < previewGrid; col += 1) {
                            const index = row * previewGrid + col;
                            const x = startX + col * (cellSize + gap);
                            const y = startY + row * (cellSize + gap);
                        const active = index === activeCell;

                        ctx.fillStyle = active ? '#ef4444' : '#ffffff';
                        ctx.strokeStyle = active ? '#fee2e2' : '#cbd5e1';
                        ctx.lineWidth = active ? 2 : 1.5;
                        ctx.beginPath();
                        ctx.roundRect(x, y, cellSize, cellSize, 12);
                        ctx.fill();
                        ctx.stroke();
                    }
                }

                ctx.fillStyle = '#f8fafc';
                ctx.font = '800 10px Outfit';
                ctx.fillText(previewGrid === 2 ? '2X2' : previewGrid === 3 ? '3X3' : '4X4', 18, 28);
            } else if (type === 'pattern') {
                const glow = ctx.createLinearGradient(0, 0, 0, canvas.height);
                glow.addColorStop(0, '#12091f');
                glow.addColorStop(0.5, '#1f1337');
                glow.addColorStop(1, '#0b1022');
                ctx.fillStyle = glow;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.strokeStyle = 'rgba(125, 211, 252, 0.08)';
                ctx.lineWidth = 1;
                for (let x = 14; x < canvas.width; x += 20) {
                    ctx.beginPath();
                    ctx.moveTo(x, 10);
                    ctx.lineTo(x, canvas.height - 10);
                    ctx.stroke();
                }
                for (let y = 10; y < canvas.height; y += 20) {
                    ctx.beginPath();
                    ctx.moveTo(14, y);
                    ctx.lineTo(canvas.width - 14, y);
                    ctx.stroke();
                }

                const activeTile = Math.floor(frame / 24) % memoryTiles.length;
                const tileSize = 30;
                const tileGap = 8;
                const boardSize = tileSize * 3 + tileGap * 2;
                const boardX = (canvas.width - boardSize) / 2;
                const boardY = (canvas.height - boardSize) / 2;

                ctx.fillStyle = 'rgba(7, 10, 24, 0.76)';
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(boardX - 10, boardY - 10, boardSize + 20, boardSize + 20, 18);
                ctx.fill();
                ctx.stroke();

                memoryTiles.forEach((tile, index) => {
                    const x = boardX + tile.col * (tileSize + tileGap);
                    const y = boardY + tile.row * (tileSize + tileGap);
                    const active = index === activeTile;

                    ctx.fillStyle = active ? `hsla(${tile.hue}, 92%, 72%, 1)` : 'rgba(229, 236, 246, 0.94)';
                    ctx.strokeStyle = active ? `hsla(${tile.hue}, 100%, 88%, 0.95)` : 'rgba(148, 163, 184, 0.45)';
                    ctx.lineWidth = active ? 2.4 : 1.2;
                    ctx.beginPath();
                    ctx.roundRect(x, y, tileSize, tileSize, 8);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = active ? `hsla(${tile.hue}, 100%, 92%, 0.24)` : 'rgba(255,255,255,0.3)';
                    ctx.beginPath();
                    ctx.roundRect(x + 4, y + 4, tileSize - 8, tileSize * 0.36, 6);
                    ctx.fill();
                });
            } else if (type === 'crawler') {
                drawPaperGrid();
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
                drawPaperGrid();
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
