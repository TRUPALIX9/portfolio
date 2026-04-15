"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RocketGame from './games/RocketGame';
import RunnerGame from './games/RunnerGame';
import ReflexGame from './games/ReflexGame';
import MemoryGame from './games/MemoryGame';
import SnakeGame from './games/SnakeGame';
import BreakoutGame from './games/BreakoutGame';
import GamePreview from './GamePreview';

type GameId = 'rocket' | 'runner' | 'shooter' | 'pattern' | 'snake' | 'breakout';
type SelectedGame = GameId | null;
type GameFinishPayload = {
    game: GameId;
    score: number;
    closeGame?: boolean;
};

type LeaderboardEntry = {
    id: number;
    name: string;
    score: number;
    game: string;
    date: string;
};

type GameDefinition = {
    id: GameId;
    title: string;
    icon: string;
    color: string;
    previewType: 'gravity' | 'runner' | 'shooter' | 'pattern' | 'crawler' | 'breakout';
    viewport: 'portrait' | 'square' | 'landscape';
};

const games: GameDefinition[] = [
    { id: 'rocket', title: 'Rocket', icon: '🚀', color: '#ef4444', previewType: 'gravity', viewport: 'portrait' },
    { id: 'runner', title: 'Runner', icon: '🏃', color: '#f59e0b', previewType: 'runner', viewport: 'landscape' },
    { id: 'shooter', title: 'Reflex', icon: '🎯', color: '#ef4444', previewType: 'shooter', viewport: 'portrait' },
    { id: 'pattern', title: 'Memory', icon: '🧠', color: '#ec4899', previewType: 'pattern', viewport: 'portrait' },
    { id: 'snake', title: 'Snake', icon: '🐍', color: '#22c55e', previewType: 'crawler', viewport: 'square' },
    { id: 'breakout', title: 'Breakout', icon: '🧱', color: '#10b981', previewType: 'breakout', viewport: 'portrait' },
];

export default function GameHub({
    standalone = false,
    onGameOpen,
    onTrackedFinish,
}: {
    standalone?: boolean;
    onGameOpen?: (game: GameId) => void;
    onTrackedFinish?: (payload: { game: GameId; score: number }) => void;
}) {
    const [selectedGame, setSelectedGame] = useState<SelectedGame>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [highScoreCelebration, setHighScoreCelebration] = useState<{ game: string; score: number } | null>(null);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    useEffect(() => {
        if (!highScoreCelebration) return;
        const timeoutId = window.setTimeout(() => setHighScoreCelebration(null), 2200);
        return () => window.clearTimeout(timeoutId);
    }, [highScoreCelebration]);

    const fetchLeaderboard = () => {
        return fetch('/api/leaderboard')
            .then((res) => res.json())
            .then((data) => {
                const entries = Array.isArray(data) ? data : [];
                setLeaderboard(entries);
                return entries as LeaderboardEntry[];
            })
            .catch(() => {
                setLeaderboard([]);
                return [] as LeaderboardEntry[];
            });
    };

    const getHighScore = (gameId: GameId) => {
        const scores = leaderboard.filter((entry) => entry.game === gameId);
        if (scores.length === 0) return 0;
        return Math.max(...scores.map((entry) => entry.score));
    };

    const handleGameFinished = async (payload?: GameFinishPayload) => {
        const previousHigh = payload ? getHighScore(payload.game) : 0;
        await fetchLeaderboard();

        if (payload && payload.score > previousHigh) {
            const matchedGame = games.find((game) => game.id === payload.game);
            setHighScoreCelebration({
                game: matchedGame?.title ?? payload.game.toUpperCase(),
                score: payload.score,
            });
        }

        if (payload) {
            onTrackedFinish?.({ game: payload.game, score: payload.score });
        }

        if (!payload || payload.closeGame !== false) {
            setSelectedGame(null);
        }
    };

    const filteredLeaderboard = selectedGame
        ? leaderboard.filter((entry) => entry.game === selectedGame)
        : leaderboard;
    const selectedDefinition = games.find((game) => game.id === selectedGame) ?? null;
    const selectedViewport = selectedDefinition?.viewport ?? 'square';

    return (
        <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>
            <AnimatePresence>
                {highScoreCelebration && (
                    <motion.div
                        initial={{ opacity: 0, y: -18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -14, scale: 0.98 }}
                        style={{
                            position: 'sticky',
                            top: '1rem',
                            zIndex: 40,
                            margin: '0 auto 1rem',
                            width: 'fit-content',
                            padding: '0.9rem 1.2rem',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.92), rgba(34, 197, 94, 0.92))',
                            color: '#03130b',
                            fontWeight: 900,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            boxShadow: '0 16px 30px rgba(22, 163, 74, 0.22)',
                            border: '1px solid rgba(220, 252, 231, 0.55)',
                        }}
                    >
                        NEW HIGH SCORE IN {highScoreCelebration.game}: {highScoreCelebration.score}
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
                {!selectedGame ? (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                    >
                        <h1 className="heading-lg" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            {standalone ? (
                                <>Arcade.</>
                            ) : (
                                <>The <span className="gradient-text">Arcade.</span></>
                            )}
                        </h1>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '1.5rem',
                                marginBottom: '4rem',
                            }}
                            className="game-grid-3x2"
                        >
                            {games.map((game) => (
                                <motion.div
                                    key={game.id}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="glass-card"
                                    data-testid={`game-card-${game.id}`}
                                    style={{ padding: '1.25rem', cursor: 'pointer', border: `1px solid ${game.color}22`, overflow: 'hidden' }}
                                    onClick={() => {
                                        setSelectedGame(game.id);
                                        onGameOpen?.(game.id);
                                    }}
                                >
                                    <GamePreview type={game.previewType as never} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{game.icon} {game.title}</h3>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 900, color: game.color }}>{getHighScore(game.id)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="glass-card" style={{ padding: '3rem 2rem', background: 'rgba(255,255,255,0.01)' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>HALL OF <span className="gradient-text">FAME</span></h2>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                    gap: '1.5rem',
                                }}
                                className="hall-of-fame-grid"
                            >
                                {games.map((game) => {
                                    const gameEntries = leaderboard
                                        .filter((entry) => entry.game === game.id)
                                        .sort((a, b) => b.score - a.score)
                                        .slice(0, 5);

                                    return (
                                        <div key={game.id} style={{ padding: '1.1rem 1rem', borderRadius: '18px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${game.color}22` }}>
                                            <h3 style={{ fontSize: '0.8rem', color: game.color, textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.15em', fontWeight: 800 }}>
                                                {game.title}
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {gameEntries.map((entry, index) => (
                                                    <div key={entry.id ?? `${game.id}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                        <span style={{ color: index === 0 ? '#fff' : 'var(--text-secondary)', fontWeight: index === 0 ? 700 : 400, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{entry.name}</span>
                                                        <span style={{ fontWeight: 800, color: index === 0 ? game.color : '#fff' }}>{entry.score}</span>
                                                    </div>
                                                ))}
                                                {gameEntries.length === 0 && (
                                                    <span style={{ fontSize: '0.75rem', opacity: 0.2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>PENDING DATA...</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        style={{ width: '100%' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                            <button
                                onClick={() => setSelectedGame(null)}
                                style={{
                                    color: '#fff',
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                }}
                                className="hover-scale"
                            >
                                <span>&larr;</span> GO BACK
                            </button>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase' }}>{selectedDefinition?.title}</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PERSONAL RECORD: <span style={{ color: '#fff' }}>{getHighScore(selectedGame)}</span></p>
                            </div>
                        </div>

                        <div
                            style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem', alignItems: 'start' }}
                            className={`game-stage-container game-stage-container--${selectedViewport}`}
                        >
                            <div className="game-stage-shell">
                                {selectedGame === 'rocket' && <RocketGame onFinished={handleGameFinished} />}
                                {selectedGame === 'runner' && <RunnerGame onFinished={handleGameFinished} />}
                                {selectedGame === 'shooter' && <ReflexGame onFinished={handleGameFinished} highScore={getHighScore('shooter')} />}
                                {selectedGame === 'pattern' && <MemoryGame onFinished={handleGameFinished} highScore={getHighScore('pattern')} />}
                                {selectedGame === 'snake' && <SnakeGame onFinished={handleGameFinished} highScore={getHighScore('snake')} />}
                                {selectedGame === 'breakout' && <BreakoutGame onFinished={handleGameFinished} />}
                            </div>

                            <div className="glass-card" style={{ padding: '2rem', height: '100%', minHeight: '500px' }}>
                                <h3 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary)' }}>Sector Ranking</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {filteredLeaderboard
                                        .sort((a, b) => b.score - a.score)
                                        .slice(0, 10)
                                        .map((entry, index) => (
                                            <div key={entry.id ?? `${entry.name}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <span style={{ opacity: index < 3 ? 1 : 0.6, fontWeight: index < 3 ? 700 : 400, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{index + 1}. {entry.name}</span>
                                                <span style={{ fontWeight: 800 }}>{entry.score}</span>
                                            </div>
                                        ))}
                                    {filteredLeaderboard.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.2, fontSize: '0.8rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>BE THE FIRST TO UPLOAD</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
