"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GravityJump from './games/GravityJump';
import RunnerGame from './games/RunnerGame';
import ShooterGame from './games/ShooterGame';
import PatternGame from './games/PatternGame';
import CyberCrawler from './games/CyberCrawler';
import NeonBreakout from './games/NeonBreakout';
import GamePreview from './GamePreview';

type GameType = 'gravity' | 'runner' | 'shooter' | 'pattern' | 'crawler' | 'breakout' | null;

export default function GameHub() {
    const [selectedGame, setSelectedGame] = useState<GameType>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboard);
    }, []);

    const fetchLeaderboard = () => {
        fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboard);
    };

    const getHighScore = (gameId: string) => {
        const scores = leaderboard.filter(e => e.game === gameId);
        if (scores.length === 0) return 0;
        return Math.max(...scores.map(e => e.score));
    };

    const games = [
        { id: 'gravity', title: 'Rocket', icon: '🚀', desc: 'High-speed evasion', color: '#ef4444' }, // Renamed from Rocket Jump
        { id: 'runner', title: 'Runner', icon: '🏃', desc: 'Endless dash', color: '#f59e0b' },
        { id: 'shooter', title: 'Reflex', icon: '🎯', desc: 'Focus trainer', color: '#ef4444' },
        { id: 'pattern', title: 'Memory', icon: '🧠', desc: 'Logic matrix', color: '#ec4899' },
        { id: 'crawler', title: 'Snake', icon: '🐍', desc: 'Core logic', color: '#22c55e' },
        { id: 'breakout', title: 'Breakout', icon: '🧱', desc: 'Kinetic energy', color: '#10b981' }
    ];

    const filteredLeaderboard = selectedGame
        ? leaderboard.filter(e => e.game === selectedGame)
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

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '4rem'
                        }} className="game-grid-3x2">
                            {games.map(game => (
                                <motion.div
                                    key={game.id}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="glass-card"
                                    style={{ padding: '1.5rem', cursor: 'pointer', border: `1px solid ${game.color}33`, position: 'relative' }}
                                    onClick={() => setSelectedGame(game.id as GameType)}
                                >
                                    <GamePreview type={game.id as any} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: game.color }}>{game.icon} {game.title}</h3>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{game.desc}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Record</span>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{getHighScore(game.id)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }} className="game-stage-layout">
                            <div className="glass-card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>🎮 Quick Start Guide</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Navigate between iconic arcade genres transformed for the web. Each game features <b>Progressive Difficulty</b>—the longer you survive, the more intense the system becomes.
                                </p>
                            </div>
                            <div className="glass-card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>🏆 Global Ranking</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Your data is processed in real-time. Only the top 5 legends in each category earn a permanent slot in the Hall of Fame.
                                </p>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '2.5rem' }}>
                            <h2 className="heading-md" style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '1.5rem' }}>Hall of Fame</h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '2.5rem'
                            }}>
                                {games.map(game => (
                                    <div key={game.id} style={{ borderLeft: `2px solid ${game.color}44`, paddingLeft: '1.5rem' }}>
                                        <h3 style={{ fontSize: '0.8rem', color: game.color, textTransform: 'uppercase', marginBottom: '1.25rem', letterSpacing: '0.1em' }}>
                                            {game.title}
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {leaderboard
                                                .filter(e => e.game === game.id)
                                                .slice(0, 5)
                                                .map((entry, i) => (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                        <span style={{ opacity: 0.8 }}>{entry.name}</span>
                                                        <span style={{ fontWeight: 700 }}>{entry.score}</span>
                                                    </div>
                                                ))}
                                            {leaderboard.filter(e => e.game === game.id).length === 0 && (
                                                <span style={{ fontSize: '0.75rem', opacity: 0.3 }}>NO DATA UPLOADED</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <button
                                onClick={() => setSelectedGame(null)}
                                style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                &larr; Return to Hub
                            </button>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{games.find(g => g.id === selectedGame)?.title}</h2>
                                <p style={{ fontSize: '0.9rem', color: 'var(--accent-primary)' }}>Personal Best: {getHighScore(selectedGame)}</p>
                            </div>
                        </div>

                        <div className="game-stage-layout">
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                {selectedGame === 'gravity' && <GravityJump onFinished={fetchLeaderboard} />}
                                {selectedGame === 'runner' && <RunnerGame onFinished={fetchLeaderboard} />}
                                {selectedGame === 'shooter' && <ShooterGame onFinished={fetchLeaderboard} />}
                                {selectedGame === 'pattern' && <PatternGame onFinished={fetchLeaderboard} />}
                                {selectedGame === 'crawler' && <CyberCrawler onFinished={fetchLeaderboard} />}
                                {selectedGame === 'breakout' && <NeonBreakout onFinished={fetchLeaderboard} />}
                            </div>

                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ranking</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {filteredLeaderboard.slice(0, 10).map((entry, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <span>{entry.name}</span>
                                            <span style={{ fontWeight: 700 }}>{entry.score}</span>
                                        </div>
                                    ))}
                                    {filteredLeaderboard.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '1rem', opacity: 0.3, fontSize: '0.8rem' }}>BE THE FIRST TO UPLOAD</div>
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
