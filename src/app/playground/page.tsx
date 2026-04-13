"use client";
import { useState, useEffect } from "react";

export default function Playground() {
    const [key, setKey] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [scores, setScores] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (authenticated) {
            fetchScores();
        }
    }, [authenticated]);

    const fetchScores = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/leaderboard");
            const data = await res.json();
            setScores(data || []);
        } finally {
            setLoading(false);
        }
    };

    const attemptLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (key.trim()) {
            // We set authenticated just to visually load the table. 
            // Real validation happens per-delete, testing the key natively against the server env block.
            setAuthenticated(true); 
        }
    };

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm(`Permanently delete entry ID ${id}?`);
        if (!confirmDelete) return;

        try {
            const res = await fetch("/api/leaderboard", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, key }),
            });

            if (res.ok) {
                setScores(scores.filter((s) => s.id !== id));
            } else {
                alert("Unauthorized or failed deletion. Validate your KEY.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!authenticated) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000', color: '#fff' }}>
                <form onSubmit={attemptLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', border: '1px solid #333', borderRadius: '12px', background: '#111' }}>
                    <h2>Playground Admin Block</h2>
                    <input 
                        type="password" 
                        placeholder="AUTHENTICATION KEY" 
                        value={key} 
                        onChange={(e) => setKey(e.target.value)} 
                        style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #555', background: '#222', color: '#fff' }}
                    />
                    <button type="submit" style={{ padding: '0.75rem', background: '#ef4444', color: '#fff', fontWeight: 900, border: 'none', borderRadius: '6px', cursor: 'pointer' }}>ACCESS ARCHIVES</button>
                </form>
            </div>
        );
    }

    const uniqueGames = Array.from(new Set(scores.map(s => s.game)));
    const totalEntries = scores.length;
    const insights = uniqueGames.map(game => ({
        game,
        count: scores.filter(s => s.game === game).length,
        highest: Math.max(...scores.filter(s => s.game === game).map(s => s.score), 0),
    }));

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>Arcade Insights</h1>
                <button 
                    onClick={() => setAuthenticated(false)} 
                    style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                >
                    Lock Terminal
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                <div style={{ padding: '1.5rem', background: '#f8fafc', border: '2px solid #000', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase' }}>Total Packets</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 900 }}>{totalEntries}</p>
                </div>
                {insights.map(i => (
                    <div key={i.game} style={{ padding: '1.5rem', background: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>{i.game}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                            <span>Records: {i.count}</span>
                            <span style={{ fontWeight: 800, color: '#ef4444' }}>Max: {i.highest}</span>
                        </div>
                    </div>
                ))}
            </div>

            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 800 }}>Raw Data Matrix</h2>
            <div style={{ overflowX: 'auto', border: '2px solid #000', borderRadius: '12px', background: '#fff' }}>
                {loading ? <p style={{ padding: '2rem' }}>Loading streams...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #000' }}>
                                <th style={{ padding: '1rem' }}>ID</th>
                                <th style={{ padding: '1rem' }}>Player Name</th>
                                <th style={{ padding: '1rem' }}>Score</th>
                                <th style={{ padding: '1rem' }}>Module</th>
                                <th style={{ padding: '1rem' }}>Timestamp</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.map((score) => (
                                <tr key={score.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1rem', color: '#64748b' }}>{score.id}</td>
                                    <td style={{ padding: '1rem', fontWeight: 700 }}>{score.name}</td>
                                    <td style={{ padding: '1rem', fontWeight: 800, color: '#0ea5e9' }}>{score.score}</td>
                                    <td style={{ padding: '1rem' }}>{score.game}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.8rem' }}>{new Date(score.date).toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <button 
                                            onClick={() => handleDelete(score.id)}
                                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
