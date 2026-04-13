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
    desc: string;
    color: string;
    previewType: 'gravity' | 'runner' | 'shooter' | 'pattern' | 'crawler' | 'breakout';
};

const games: GameDefinition[] = [
    { id: 'rocket', title: 'Rocket', icon: '🚀', desc: 'High-speed evasion', color: '#ef4444', previewType: 'gravity' },
    { id: 'runner', title: 'Runner', icon: '🏃', desc: 'Endless dash', color: '#f59e0b', previewType: 'runner' },
    { id: 'shooter', title: 'Reflex', icon: '🎯', desc: 'Focus trainer', color: '#ef4444', previewType: 'shooter' },
    { id: 'pattern', title: 'Memory', icon: '🧠', desc: 'Logic matrix', color: '#ec4899', previewType: 'pattern' },
    { id: 'snake', title: 'Snake', icon: '🐍', desc: 'Core logic', color: '#22c55e', previewType: 'crawler' },
    { id: 'breakout', title: 'Breakout', icon: '🧱', desc: 'Kinetic energy', color: '#10b981', previewType: 'breakout' },
];

export default function GameHub() {
    const [selectedGame, setSelectedGame] = useState<SelectedGame>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = () => {
        fetch('/api/leaderboard')
            .then((res) => res.json())
            .then((data) => setLeaderboard(Array.isArray(data) ? data : []))
            .catch(() => setLeaderboard([]));
    };

    const getHighScore = (gameId: GameId) => {
        const scores = leaderboard.filter((entry) => entry.game === gameId);
        if (scores.length === 0) return 0;
        return Math.max(...scores.map((entry) => entry.score));
    };

    const handleGameFinished = () => {
        fetchLeaderboard();
        setSelectedGame(null);
    };

    const filteredLeaderboard = selectedGame
        ? leaderboard.filter((entry) => entry.game === selectedGame)
        : leaderboard;

    return (
        <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>
            <AnimatePresence mode="wait">
                {!selectedGame ? (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                    >
                        <h1 className="heading-lg" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            The <span className="gradient-text">Arcade.</span>
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
                                    onClick={() => setSelectedGame(game.id)}
                                >
                                    <GamePreview type={game.previewType as never} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{game.icon} {game.title}</h3>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{game.desc}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 900, color: game.color }}>{getHighScore(game.id)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
                                <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>🎮 Mission Briefing</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Navigate between iconic arcade genres rebuilt for the modern web. Every module features <b>Progressive Difficulty</b> and a shared live leaderboard.
                                </p>
                            </div>
                            <div className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-secondary)' }}>
                                <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>🏆 Global Data Sync</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Scores are grouped by game, so each cabinet now tracks its own hall of fame instead of mixing Rocket, Snake, and Reflex into one stream.
                                </p>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '3rem 2rem', background: 'rgba(255,255,255,0.01)' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>HALL OF <span className="gradient-text">FAME</span></h2>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '3rem',
                                }}
                            >
                                {games.map((game) => {
                                    const gameEntries = leaderboard
                                        .filter((entry) => entry.game === game.id)
                                        .sort((a, b) => b.score - a.score)
                                        .slice(0, 5);

                                    return (
                                        <div key={game.id}>
                                            <h3 style={{ fontSize: '0.8rem', color: game.color, textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.15em', fontWeight: 800 }}>
                                                {game.title}
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {gameEntries.map((entry, index) => (
                                                    <div key={entry.id ?? `${game.id}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                        <span style={{ color: index === 0 ? '#fff' : 'var(--text-secondary)', fontWeight: index === 0 ? 700 : 400 }}>{entry.name}</span>
                                                        <span style={{ fontWeight: 800, color: index === 0 ? game.color : '#fff' }}>{entry.score}</span>
                                                    </div>
                                                ))}
                                                {gameEntries.length === 0 && (
                                                    <span style={{ fontSize: '0.75rem', opacity: 0.2 }}>PENDING DATA...</span>
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
                                <span>&larr;</span> TERMINATE SESSION
                            </button>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase' }}>{games.find((game) => game.id === selectedGame)?.title}</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PERSONAL RECORD: <span style={{ color: '#fff' }}>{getHighScore(selectedGame)}</span></p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem', alignItems: 'start' }} className="game-stage-container">
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
                                {selectedGame === 'rocket' && <RocketGame onFinished={handleGameFinished} />}
                                {selectedGame === 'runner' && <RunnerGame onFinished={handleGameFinished} />}
                                {selectedGame === 'shooter' && <ReflexGame onFinished={handleGameFinished} />}
                                {selectedGame === 'pattern' && <MemoryGame onFinished={handleGameFinished} />}
                                {selectedGame === 'snake' && <SnakeGame onFinished={handleGameFinished} />}
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
                                                <span style={{ opacity: index < 3 ? 1 : 0.6, fontWeight: index < 3 ? 700 : 400 }}>{index + 1}. {entry.name}</span>
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
