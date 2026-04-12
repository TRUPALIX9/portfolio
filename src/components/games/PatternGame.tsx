"use client";
import { useState, useEffect } from 'react';

export default function PatternGame({ onFinished }: { onFinished: () => void }) {
    const [sequence, setSequence] = useState<number[]>([]);
    const [userSequence, setUserSequence] = useState<number[]>([]);
    const [playing, setPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [activeBtn, setActiveBtn] = useState<number | null>(null);
    const [name, setName] = useState("Player");

    const start = () => {
        setGameOver(false); setScore(0); setPlaying(true);
        const next = [Math.floor(Math.random() * 4)];
        setSequence(next);
        playSequence(next);
    };

    const playSequence = (seq: number[]) => {
        seq.forEach((val, i) => {
            setTimeout(() => {
                setActiveBtn(val);
                setTimeout(() => setActiveBtn(null), 400);
            }, (i + 1) * 800);
        });
    };

    const handleClick = (idx: number) => {
        if (!playing || activeBtn !== null) return;
        setActiveBtn(idx); setTimeout(() => setActiveBtn(null), 200);
        const nextUser = [...userSequence, idx];
        setUserSequence(nextUser);

        if (idx !== sequence[nextUser.length - 1]) {
            setGameOver(true); setPlaying(false); return;
        }

        if (nextUser.length === sequence.length) {
            setScore(score + 10);
            setUserSequence([]);
            const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
            setSequence(nextSeq);
            setTimeout(() => playSequence(nextSeq), 1000);
        }
    };

    const submit = async () => {
        await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ name, score, game: 'pattern' }) });
        onFinished();
    };

    const colors = ['#ec4899', '#4ade80', '#06b6d4', '#f59e0b'];

    return (
        <div style={{ textAlign: 'center', padding: '2rem', background: '#0a0a0a', borderRadius: '16px' }}>
            <h2 className="heading-md" style={{ marginBottom: '2rem' }}>Memory Pulse</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '250px', margin: '0 auto' }}>
                {[0, 1, 2, 3].map(i => (
                    <div
                        key={i}
                        onClick={() => handleClick(i)}
                        style={{
                            height: '100px',
                            background: activeBtn === i ? colors[i] : `${colors[i]}22`,
                            border: `2px solid ${colors[i]}`,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.1s'
                        }}
                    />
                ))}
            </div>
            {!playing && !gameOver && <button onClick={start} className="btn-primary" style={{ marginTop: '2rem' }}>Start Puzzle</button>}
            {gameOver && (
                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p>Final Score: {score}</p>
                    <input value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', background: '#222', color: '#fff', border: '1px solid #444' }} />
                    <button onClick={submit} className="btn-primary">Save Score</button>
                    <button onClick={start} className="btn-outline">Retry</button>
                </div>
            )}
            {playing && <p style={{ marginTop: '1rem' }}>Current Score: {score}</p>}
        </div>
    );
}
