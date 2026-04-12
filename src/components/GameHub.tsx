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

    const handleGameFinished = () => {
        fetchLeaderboard();
        setSelectedGame(null);
    };

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
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '4rem'
                        }} className="game-grid-3x2">
                            {games.map(game => (
                                <motion.div
                                    key={game.id}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="glass-card"
                                    style={{ padding: '1.25rem', cursor: 'pointer', border: `1px solid ${game.color}22`, overflow: 'hidden' }}
                                    onClick={() => setSelectedGame(game.id as GameType)}
                                >
                                    <GamePreview type={game.id as any} />
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
                                    Navigate between iconic arcade genres rebuilt for the modern web. Every module features <b>Progressive Difficulty</b>—survive the initial burst to face the high-speed system overload.
                                </p>
                            </div>
                            <div className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-secondary)' }}>
                                <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>🏆 Global Data Sync</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Your scores are processed in real-time. Only the top tactical operators in each category earn a permanent slot in the <b>Hall of Fame</b>.
                                </p>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '3rem 2rem', background: 'rgba(255,255,255,0.01)' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>HALL OF <span className="gradient-text">FAME</span></h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '3rem'
                            }}>
                                {games.map(game => (
                                    <div key={game.id}>
                                        <h3 style={{ fontSize: '0.8rem', color: game.color, textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.15em', fontWeight: 800 }}>
                                            {game.title}
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {leaderboard
                                                .filter(e => e.game === game.id)
                                                .sort((a, b) => b.score - a.score)
                                                .slice(0, 5)
                                                .map((entry, i) => (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                        <span style={{ color: i === 0 ? '#fff' : 'var(--text-secondary)', fontWeight: i === 0 ? 700 : 400 }}>{entry.name}</span>
                                                        <span style={{ fontWeight: 800, color: i === 0 ? game.color : '#fff' }}>{entry.score}</span>
                                                    </div>
                                                ))}
                                            {leaderboard.filter(e => e.game === game.id).length === 0 && (
                                                <span style={{ fontSize: '0.75rem', opacity: 0.2 }}>PENDING DATA...</span>
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
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        style={{ width: '100%' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                            <button
                                onClick={() => setSelectedGame(null)}
                                style={{
                                    color: '#fff', background: 'rgba(255,255,255,0.05)',
                                    padding: '0.75rem 1.5rem', borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    fontWeight: 700, fontSize: '0.9rem'
                                }}
                                className="hover-scale"
                            >
                                <span>&larr;</span> TERMINATE SESSION
                            </button>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase' }}>{games.find(g => g.id === selectedGame)?.title}</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PERSONAL RECORD: <span style={{ color: '#fff' }}>{getHighScore(selectedGame)}</span></p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem', alignItems: 'start' }} className="game-stage-container">
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
                                {selectedGame === 'gravity' && <GravityJump onFinished={handleGameFinished} />}
                                {selectedGame === 'runner' && <RunnerGame onFinished={handleGameFinished} />}
                                {selectedGame === 'shooter' && <ShooterGame onFinished={handleGameFinished} />}
                                {selectedGame === 'pattern' && <PatternGame onFinished={handleGameFinished} />}
                                {selectedGame === 'crawler' && <CyberCrawler onFinished={handleGameFinished} />}
                                {selectedGame === 'breakout' && <NeonBreakout onFinished={handleGameFinished} />}
                            </div>

                            <div className="glass-card" style={{ padding: '2rem', height: '100%', minHeight: '500px' }}>
                                <h3 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary)' }}>Sector Ranking</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {filteredLeaderboard
                                        .sort((a, b) => b.score - a.score)
                                        .slice(0, 10).map((entry, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <span style={{ opacity: i < 3 ? 1 : 0.6, fontWeight: i < 3 ? 700 : 400 }}>{i + 1}. {entry.name}</span>
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
