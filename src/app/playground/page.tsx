"use client";
import type { CSSProperties, FormEvent } from "react";
import { useMemo, useState } from "react";

type LeaderboardEntry = {
    id: number;
    name: string;
    score: number;
    game: string;
    date: string;
};

type Insights = {
    totalScores: number;
    gamesTracked: number;
    topGames: Array<{
        game: string;
        submissions: number;
        highestScore: number;
        totalScore: number;
    }>;
    topDates: Array<{
        date: string;
        totalScore: number;
    }>;
};

type AdminResponse = {
    scores: LeaderboardEntry[];
    insights: Insights;
};

const emptyInsights: Insights = {
    totalScores: 0,
    gamesTracked: 0,
    topGames: [],
    topDates: [],
};

export default function Playground() {
    const [key, setKey] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [scores, setScores] = useState<LeaderboardEntry[]>([]);
    const [insights, setInsights] = useState<Insights>(emptyInsights);
    const [authError, setAuthError] = useState("");
    const [loading, setLoading] = useState(false);
    const [busyAction, setBusyAction] = useState<"delete" | "wipe" | null>(null);
    const [shareLink, setShareLink] = useState("");
    const [shareStatus, setShareStatus] = useState("");

    const recentDates = useMemo(() => insights.topDates.slice(0, 3), [insights.topDates]);
    const featuredGames = useMemo(() => insights.topGames.slice(0, 4), [insights.topGames]);

    const fetchAdminSnapshot = async (candidateKey: string) => {
        const response = await fetch("/api/leaderboard?admin=1", {
            headers: {
                "x-admin-key": candidateKey,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error(response.status === 401 ? "Invalid KEY. Access denied." : "Unable to load admin data.");
        }

        return response.json() as Promise<AdminResponse>;
    };

    const attemptLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setAuthError("");

        try {
            const data = await fetchAdminSnapshot(key.trim());
            setScores(data.scores ?? []);
            setInsights(data.insights ?? emptyInsights);
            setAuthenticated(true);
        } catch (error) {
            setAuthenticated(false);
            setScores([]);
            setInsights(emptyInsights);
            setAuthError(error instanceof Error ? error.message : "Unable to authenticate.");
        } finally {
            setLoading(false);
        }
    };

    const refreshSnapshot = async () => {
        setLoading(true);
        try {
            const data = await fetchAdminSnapshot(key.trim());
            setScores(data.scores ?? []);
            setInsights(data.insights ?? emptyInsights);
        } catch (error) {
            setAuthError(error instanceof Error ? error.message : "Refresh failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Permanently delete leaderboard entry ${id}?`)) {
            return;
        }

        setBusyAction("delete");
        try {
            const response = await fetch("/api/leaderboard", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-key": key.trim(),
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error(response.status === 401 ? "Invalid KEY. Access denied." : "Delete failed.");
            }

            await refreshSnapshot();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Delete failed.");
        } finally {
            setBusyAction(null);
        }
    };

    const handleWipe = async () => {
        if (!window.confirm("This will permanently wipe the leaderboard. Continue?")) {
            return;
        }

        setBusyAction("wipe");
        try {
            const response = await fetch("/api/leaderboard", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-key": key.trim(),
                },
                body: JSON.stringify({ deleteAll: true }),
            });

            if (!response.ok) {
                throw new Error(response.status === 401 ? "Invalid KEY. Access denied." : "Wipe failed.");
            }

            await refreshSnapshot();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Wipe failed.");
        } finally {
            setBusyAction(null);
        }
    };

    const generateShareLink = async () => {
        setShareStatus("Generating link...");

        try {
            const response = await fetch("/api/playground/share-link", {
                method: "POST",
                headers: {
                    "x-admin-key": key.trim(),
                },
            });

            if (!response.ok) {
                throw new Error(response.status === 401 ? "Invalid KEY. Could not generate link." : "Share link generation failed.");
            }

            const data = await response.json();
            setShareLink(data.url ?? "");
            setShareStatus("Signed arcade-only link is ready.");
        } catch (error) {
            setShareStatus(error instanceof Error ? error.message : "Share link generation failed.");
        }
    };

    const copyShareLink = async () => {
        if (!shareLink) return;

        try {
            await navigator.clipboard.writeText(shareLink);
            setShareStatus("Share link copied.");
        } catch {
            setShareStatus("Copy failed. You can still copy the link manually.");
        }
    };

    const lockTerminal = () => {
        setAuthenticated(false);
        setScores([]);
        setInsights(emptyInsights);
        setAuthError("");
    };

    if (!authenticated) {
        return (
            <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", background: "radial-gradient(circle at top, #1f2937 0%, #020617 45%, #000 100%)" }}>
                <form
                    onSubmit={attemptLogin}
                    data-testid="playground-login-form"
                    style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", gap: "1.25rem", padding: "2rem", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "24px", background: "rgba(15, 23, 42, 0.9)", color: "#fff", boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }}
                >
                    <div>
                        <p style={{ margin: 0, fontSize: "0.75rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "#fca5a5" }}>Secure Admin</p>
                        <h1 style={{ margin: "0.5rem 0 0", fontSize: "2rem", fontWeight: 900 }}>Arcade Playground</h1>
                    </div>

                    <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.6 }}>
                        Authenticate with your management key to inspect scores, spot suspicious entries, and curate the live leaderboard.
                    </p>

                    <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontWeight: 700 }}>
                        KEY
                        <input
                            type="password"
                            value={key}
                            onChange={(event) => setKey(event.target.value)}
                            placeholder="Enter admin key"
                            data-testid="playground-key-input"
                            style={{ padding: "0.9rem 1rem", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.2)", background: "#020617", color: "#fff" }}
                        />
                    </label>

                    {authError && (
                        <p data-testid="playground-auth-error" style={{ margin: 0, color: "#fca5a5", fontSize: "0.9rem" }}>
                            {authError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !key.trim()}
                        style={{ padding: "1rem", borderRadius: "14px", border: "none", background: loading ? "#475569" : "#ef4444", color: "#fff", fontWeight: 900, cursor: loading ? "wait" : "pointer" }}
                    >
                        {loading ? "VALIDATING..." : "ACCESS PLAYGROUND"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)", padding: "2rem 1rem 4rem" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                        <p style={{ margin: 0, fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#ef4444", fontWeight: 800 }}>Admin Dashboard</p>
                        <h1 style={{ margin: "0.4rem 0 0", fontSize: "2.25rem", fontWeight: 900 }}>Arcade Insights</h1>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        <button onClick={refreshSnapshot} disabled={loading} style={{ padding: "0.8rem 1rem", borderRadius: "12px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 700, cursor: loading ? "wait" : "pointer" }}>
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                        <button onClick={lockTerminal} style={{ padding: "0.8rem 1rem", borderRadius: "12px", border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                            Lock Terminal
                        </button>
                    </div>
                </section>

                <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                    <Card title="Total Scores" value={String(insights.totalScores)} subtitle="All tracked submissions" accent="#ef4444" />
                    <Card title="Games Tracked" value={String(insights.gamesTracked)} subtitle="Distinct leaderboard buckets" accent="#0ea5e9" />
                    <Card title="Top Game" value={featuredGames[0]?.game ?? "None"} subtitle={featuredGames[0] ? `${featuredGames[0].totalScore} total points` : "No submissions yet"} accent="#22c55e" />
                    <Card title="Best Day" value={recentDates[0]?.date ?? "None"} subtitle={recentDates[0] ? `${recentDates[0].totalScore} combined points` : "No submissions yet"} accent="#a855f7" />
                </section>

                <section style={{ padding: "1.5rem", borderRadius: "24px", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900 }}>Sharable Arcade-Only Link</h2>
                            <p style={{ margin: "0.35rem 0 0", color: "#475569" }}>
                                Generate a signed URL that opens a locked-down arcade page. If someone edits the token in the URL, the page stops working.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                            <button onClick={generateShareLink} style={{ padding: "0.85rem 1rem", borderRadius: "12px", border: "none", background: "#0f172a", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
                                Generate Link
                            </button>
                            <button onClick={copyShareLink} disabled={!shareLink} style={{ padding: "0.85rem 1rem", borderRadius: "12px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 800, cursor: shareLink ? "pointer" : "not-allowed" }}>
                                Copy Link
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: "1rem", padding: "1rem", borderRadius: "16px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b", fontWeight: 800 }}>Signed URL</p>
                        <p data-testid="playground-share-link" style={{ margin: "0.6rem 0 0", color: "#0f172a", wordBreak: "break-all" }}>
                            {shareLink || "No share link generated yet."}
                        </p>
                        {shareStatus && <p style={{ margin: "0.6rem 0 0", color: "#475569" }}>{shareStatus}</p>}
                    </div>
                </section>

                <section style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div style={{ padding: "1.5rem", borderRadius: "24px", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900 }}>Top Performing Games</h2>
                                <p style={{ margin: "0.35rem 0 0", color: "#475569" }}>Sorted by cumulative score, with submission volume and peak score.</p>
                            </div>
                        </div>
                        <div style={{ display: "grid", gap: "0.75rem" }}>
                            {featuredGames.length === 0 && <p style={{ margin: 0, color: "#64748b" }}>No game data yet.</p>}
                            {featuredGames.map((game) => (
                                <div key={game.game} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto auto", gap: "1rem", alignItems: "center", padding: "0.9rem 1rem", borderRadius: "16px", background: "#f8fafc" }}>
                                    <strong style={{ textTransform: "capitalize" }}>{game.game}</strong>
                                    <span>{game.submissions} submissions</span>
                                    <span style={{ fontWeight: 800 }}>{game.highestScore} max</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ padding: "1.5rem", borderRadius: "24px", background: "#0f172a", color: "#fff", boxShadow: "0 12px 40px rgba(15, 23, 42, 0.18)" }}>
                        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900 }}>Highest Combined Scoring Dates</h2>
                        <p style={{ margin: "0.5rem 0 1rem", color: "#cbd5e1" }}>Useful for spotting traffic spikes, event days, or suspicious bursts.</p>
                        <div style={{ display: "grid", gap: "0.75rem" }}>
                            {recentDates.length === 0 && <p style={{ margin: 0, color: "#94a3b8" }}>No daily scoring data yet.</p>}
                            {recentDates.map((day) => (
                                <div key={day.date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1rem", borderRadius: "16px", background: "rgba(255,255,255,0.06)" }}>
                                    <span>{day.date}</span>
                                    <strong>{day.totalScore}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section style={{ padding: "1.5rem", borderRadius: "24px", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900 }}>Score Curatorship</h2>
                            <p style={{ margin: "0.35rem 0 0", color: "#475569" }}>Delete individual abusive submissions or wipe the table if you need a hard reset.</p>
                        </div>
                        <button
                            onClick={handleWipe}
                            disabled={busyAction === "wipe" || scores.length === 0}
                            style={{ padding: "0.9rem 1rem", borderRadius: "12px", border: "none", background: busyAction === "wipe" ? "#fca5a5" : "#dc2626", color: "#fff", fontWeight: 800, cursor: busyAction === "wipe" ? "wait" : "pointer" }}
                        >
                            {busyAction === "wipe" ? "Wiping..." : "Wipe Leaderboard"}
                        </button>
                    </div>

                    <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "18px" }}>
                        <table data-testid="playground-score-table" style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                                    <th style={tableHeadCell}>ID</th>
                                    <th style={tableHeadCell}>Player</th>
                                    <th style={tableHeadCell}>Game</th>
                                    <th style={tableHeadCell}>Score</th>
                                    <th style={tableHeadCell}>Timestamp</th>
                                    <th style={tableHeadCell}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scores.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: "1.5rem", textAlign: "center", color: "#64748b" }}>
                                            No leaderboard entries found.
                                        </td>
                                    </tr>
                                )}
                                {scores.map((score) => (
                                    <tr key={score.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                                        <td style={tableBodyCell}>{score.id}</td>
                                        <td style={tableBodyCell}><strong>{score.name}</strong></td>
                                        <td style={tableBodyCell} data-testid={`playground-game-${score.id}`}>{score.game}</td>
                                        <td style={tableBodyCell}>{score.score}</td>
                                        <td style={tableBodyCell}>{new Date(score.date).toLocaleString()}</td>
                                        <td style={tableBodyCell}>
                                            <button
                                                onClick={() => handleDelete(score.id)}
                                                disabled={busyAction === "delete"}
                                                style={{ padding: "0.6rem 0.9rem", borderRadius: "10px", border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: busyAction === "delete" ? "wait" : "pointer" }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}

function Card({ title, value, subtitle, accent }: { title: string; value: string; subtitle: string; accent: string }) {
    return (
        <div style={{ padding: "1.35rem", borderRadius: "24px", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)" }}>
            <p style={{ margin: 0, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.72rem", fontWeight: 800 }}>{title}</p>
            <p style={{ margin: "0.6rem 0 0", fontSize: "2rem", fontWeight: 900, color: accent }}>{value}</p>
            <p style={{ margin: "0.4rem 0 0", color: "#475569" }}>{subtitle}</p>
        </div>
    );
}

const tableHeadCell: CSSProperties = {
    padding: "0.9rem 1rem",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#475569",
};

const tableBodyCell: CSSProperties = {
    padding: "0.95rem 1rem",
    color: "#0f172a",
    verticalAlign: "top",
};
