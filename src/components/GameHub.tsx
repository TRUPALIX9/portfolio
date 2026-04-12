"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DodgeGame from './games/DodgeGame';
import CollectorGame from './games/CollectorGame';
import ShooterGame from './games/ShooterGame';
import PatternGame from './games/PatternGame';

type GameType = 'dodge' | 'collector' | 'shooter' | 'pattern' | null;

export default function GameHub() {
    const [selectedGame, setSelectedGame] = useState<GameType>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboard);
    }, []);

    const games = [
        { id: 'dodge', title: 'Space Dodge', icon: '🚀', desc: 'Avoid incoming asteroids', color: '#4ade80' },
        { id: 'collector', title: 'Crystal Catch', icon: '💎', desc: 'Collect falling gems', color: '#06b6d4' },
        { id: 'shooter', title: 'Reflex Shooter', icon: '🎯', desc: 'Hit targets before they vanish', color: '#f59e0b' },
        { id: 'pattern', title: 'Memory Pulse', icon: '🧠', desc: 'Repeat the light sequence', color: '#ec4899' }
    ];

    return (
        <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
            <AnimatePresence mode="wait">
                {!selectedGame ? (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h1 className="heading-lg" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            Pick Your <span className="gradient-text">Challenge.</span>
                        </h1>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                            {games.map(game => (
                                <motion.div
                                    key={game.id}
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    className="glass-card"
                                    style={{ padding: '2rem', cursor: 'pointer', textAlign: 'center', border: `1px solid ${game.color}33` }}
                                    onClick={() => setSelectedGame(game.id as GameType)}
                                >
                                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{game.icon}</div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{game.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>{game.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="glass-card" style={{ padding: '2.5rem' }}>
                            <h2 className="heading-md" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>Global Hall of Fame</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {leaderboard.map((entry, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ color: i < 3 ? 'var(--accent-primary)' : 'inherit', fontWeight: i < 3 ? 700 : 400 }}>
                                            #{i + 1} {entry.name}
                                        </span>
                                        <span style={{ opacity: 0.8 }}>{entry.score} pts</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                    >
                        <button
                            onClick={() => setSelectedGame(null)}
                            style={{ marginBottom: '2rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            &larr; Back to Arcade
                        </button>

                        {selectedGame === 'dodge' && <DodgeGame onFinished={() => fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboard)} />}
                        {selectedGame === 'collector' && <CollectorGame onFinished={() => fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboard)} />}
                        {selectedGame === 'shooter' && <ShooterGame onFinished={() => fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboard)} />}
                        {selectedGame === 'pattern' && <PatternGame onFinished={() => fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboard)} />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
