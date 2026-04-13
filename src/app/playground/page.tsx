"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

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

type PlayerGroup = {
    name: string;
    submissions: number;
    totalScore: number;
    bestScore: number;
    averageScore: number;
    gamesPlayed: number;
    lastPlayed: string;
};

const emptyInsights: Insights = {
    totalScores: 0,
    gamesTracked: 0,
    topGames: [],
    topDates: [],
};

const pageSize = 12;

export default function Playground() {
    const deleteAllPhrase = "DELETE ALL DB";
    const [key, setKey] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [scores, setScores] = useState<LeaderboardEntry[]>([]);
    const [insights, setInsights] = useState<Insights>(emptyInsights);
    const [authError, setAuthError] = useState("");
    const [loading, setLoading] = useState(false);
    const [busyAction, setBusyAction] = useState<"delete" | "wipe" | "rename" | "share" | null>(null);
    const [busyTarget, setBusyTarget] = useState<string>("");
    const [shareLink, setShareLink] = useState("");
    const [shareStatus, setShareStatus] = useState("");
    const [wipeConfirmation, setWipeConfirmation] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [gameFilter, setGameFilter] = useState("all");
    const [sortMode, setSortMode] = useState<"newest" | "oldest" | "score_high" | "score_low">("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editingPlayerName, setEditingPlayerName] = useState<string | null>(null);
    const [bulkRenameValue, setBulkRenameValue] = useState("");

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

    const applySnapshot = (data: AdminResponse) => {
        setScores(data.scores ?? []);
        setInsights(data.insights ?? emptyInsights);
    };

    const attemptLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setAuthError("");

        try {
            const data = await fetchAdminSnapshot(key.trim());
            applySnapshot(data);
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
            applySnapshot(data);
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
        setBusyTarget(String(id));

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
            setBusyTarget("");
        }
    };

    const handleWipe = async () => {
        if (wipeConfirmation.trim() !== deleteAllPhrase) {
            alert(`Type "${deleteAllPhrase}" to enable a full reset.`);
            return;
        }

        setBusyAction("wipe");
        setBusyTarget("wipe");
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
            setWipeConfirmation("");
        } catch (error) {
            alert(error instanceof Error ? error.message : "Wipe failed.");
        } finally {
            setBusyAction(null);
            setBusyTarget("");
        }
    };

    const startRowEdit = (entry: LeaderboardEntry) => {
        setEditingId(entry.id);
        setEditingName(entry.name.toUpperCase());
    };

    const saveRowRename = async () => {
        const nextName = editingName.trim();
        if (!editingId || !nextName) return;

        setBusyAction("rename");
        setBusyTarget(`row-${editingId}`);
        try {
            const response = await fetch("/api/leaderboard", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-key": key.trim(),
                },
                body: JSON.stringify({ id: editingId, name: nextName }),
            });

            if (!response.ok) {
                throw new Error(response.status === 401 ? "Invalid KEY. Access denied." : "Rename failed.");
            }

            setEditingId(null);
            setEditingName("");
            await refreshSnapshot();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Rename failed.");
        } finally {
            setBusyAction(null);
            setBusyTarget("");
        }
    };

    const saveBulkRename = async () => {
        const nextName = bulkRenameValue.trim();
        const currentName = editingPlayerName?.trim();
        if (!nextName || !currentName) return;

        setBusyAction("rename");
        setBusyTarget(`group-${currentName}`);
        try {
            const response = await fetch("/api/leaderboard", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-key": key.trim(),
                },
                body: JSON.stringify({ playerName: currentName, name: nextName }),
            });

            if (!response.ok) {
                throw new Error(response.status === 401 ? "Invalid KEY. Access denied." : "Player rename failed.");
            }

            setEditingPlayerName(null);
            setBulkRenameValue("");
            await refreshSnapshot();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Player rename failed.");
        } finally {
            setBusyAction(null);
            setBusyTarget("");
        }
    };

    const generateShareLink = async () => {
        setBusyAction("share");
        setBusyTarget("share");
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
        } finally {
            setBusyAction(null);
            setBusyTarget("");
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
        setSearchTerm("");
        setGameFilter("all");
        setCurrentPage(1);
    };

    const gameOptions = useMemo(() => {
        return Array.from(new Set(scores.map((entry) => entry.game))).sort();
    }, [scores]);

    const totalScore = useMemo(() => scores.reduce((sum, entry) => sum + entry.score, 0), [scores]);
    const uniquePlayers = useMemo(() => new Set(scores.map((entry) => entry.name.trim().toUpperCase())).size, [scores]);
    const averageScore = useMemo(() => (scores.length ? Math.round(totalScore / scores.length) : 0), [scores, totalScore]);

    const gameBreakdown = useMemo(() => {
        return gameOptions.map((game) => {
            const entries = scores.filter((entry) => entry.game === game);
            const total = entries.reduce((sum, entry) => sum + entry.score, 0);
            const average = entries.length ? Math.round(total / entries.length) : 0;
            const best = entries.reduce((max, entry) => Math.max(max, entry.score), 0);
            return {
                game,
                plays: entries.length,
                total,
                average,
                best,
            };
        }).sort((a, b) => b.total - a.total);
    }, [gameOptions, scores]);

    const playerGroups = useMemo<PlayerGroup[]>(() => {
        const buckets = new Map<string, LeaderboardEntry[]>();
        for (const score of scores) {
            const keyName = score.name.trim().toUpperCase();
            const existing = buckets.get(keyName) ?? [];
            existing.push(score);
            buckets.set(keyName, existing);
        }

        return [...buckets.entries()].map(([name, entries]) => {
            const totalScore = entries.reduce((sum, entry) => sum + entry.score, 0);
            const gamesPlayed = new Set(entries.map((entry) => entry.game)).size;
            return {
                name,
                submissions: entries.length,
                totalScore,
                bestScore: Math.max(...entries.map((entry) => entry.score)),
                averageScore: Math.round(totalScore / entries.length),
                gamesPlayed,
                lastPlayed: entries
                    .map((entry) => entry.date)
                    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0],
            };
        }).sort((a, b) => b.totalScore - a.totalScore || b.bestScore - a.bestScore);
    }, [scores]);

    const activityTrend = useMemo(() => {
        const byDay = new Map<string, { plays: number; score: number }>();
        for (const score of scores) {
            const day = new Date(score.date).toISOString().slice(0, 10);
            const current = byDay.get(day) ?? { plays: 0, score: 0 };
            current.plays += 1;
            current.score += score.score;
            byDay.set(day, current);
        }

        return [...byDay.entries()]
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-7);
    }, [scores]);

    const filteredScores = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toUpperCase();

        return scores
            .filter((entry) => gameFilter === "all" || entry.game === gameFilter)
            .filter((entry) => {
                if (!normalizedSearch) return true;
                return (
                    entry.name.toUpperCase().includes(normalizedSearch) ||
                    entry.game.toUpperCase().includes(normalizedSearch) ||
                    String(entry.id).includes(normalizedSearch)
                );
            })
            .sort((a, b) => {
                if (sortMode === "score_high") return b.score - a.score || new Date(b.date).getTime() - new Date(a.date).getTime();
                if (sortMode === "score_low") return a.score - b.score || new Date(b.date).getTime() - new Date(a.date).getTime();
                if (sortMode === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
    }, [scores, gameFilter, searchTerm, sortMode]);

    const totalPages = Math.max(1, Math.ceil(filteredScores.length / pageSize));
    const paginatedScores = useMemo(() => {
        const safePage = Math.min(currentPage, totalPages);
        const start = (safePage - 1) * pageSize;
        return filteredScores.slice(start, start + pageSize);
    }, [currentPage, filteredScores, totalPages]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const topGame = gameBreakdown[0];
    const bestDay = insights.topDates[0];

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
                        Authenticate with your management key to inspect live scores, clean suspicious submissions, and manage the leaderboard with grouped user controls.
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
            <div style={{ maxWidth: "1340px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                        <p style={{ margin: 0, fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#ef4444", fontWeight: 800 }}>Admin Dashboard</p>
                        <h1 style={{ margin: "0.4rem 0 0", fontSize: "2.35rem", fontWeight: 900 }}>Arcade Playground Intelligence</h1>
                        <p style={{ margin: "0.5rem 0 0", color: "#475569", maxWidth: "760px", lineHeight: 1.6 }}>
                            Track total plays, average performance, top games, grouped player behavior, suspicious bursts, and live moderation actions from one surface.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        <button onClick={refreshSnapshot} disabled={loading} style={secondaryButtonStyle}>
                            {loading ? "Refreshing..." : "Refresh Data"}
                        </button>
                        <button onClick={lockTerminal} style={darkButtonStyle}>
                            Lock Terminal
                        </button>
                    </div>
                </section>

                <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                    <StatCard title="Total Games Played" value={String(scores.length)} subtitle="All recorded arcade runs" accent="#ef4444" />
                    <StatCard title="Total Points Gained" value={numberFormat(totalScore)} subtitle="Combined score across every submission" accent="#0ea5e9" />
                    <StatCard title="Average Game Score" value={String(averageScore)} subtitle="Mean score across the full leaderboard" accent="#22c55e" />
                    <StatCard title="Tracked Players" value={String(uniquePlayers)} subtitle="Unique names currently in the leaderboard" accent="#a855f7" />
                    <StatCard title="Best Performing Game" value={topGame?.game.toUpperCase() ?? "NONE"} subtitle={topGame ? `${topGame.average} average score` : "No game data yet"} accent="#f97316" />
                    <StatCard title="Highest Activity Day" value={bestDay?.date ?? "NONE"} subtitle={bestDay ? `${bestDay.totalScore} points generated` : "No daily activity yet"} accent="#14b8a6" />
                </section>

                <section style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "1rem" }}>
                    <Panel
                        title="Game-Wise Insight"
                        description="See which games are actually driving sessions, score volume, and strongest player output."
                    >
                        <div style={{ display: "grid", gap: "0.8rem" }}>
                            {gameBreakdown.length === 0 && <EmptyState label="No game insight available yet." />}
                            {gameBreakdown.map((game) => (
                                <div key={game.game} style={{ padding: "1rem", borderRadius: "18px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "grid", gap: "0.75rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "baseline", flexWrap: "wrap" }}>
                                        <strong style={{ fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{game.game}</strong>
                                        <span style={{ color: "#475569", fontWeight: 700 }}>{game.plays} plays</span>
                                    </div>
                                    <BarMeter value={game.total} max={Math.max(...gameBreakdown.map((entry) => entry.total), 1)} color="#ef4444" label={`${numberFormat(game.total)} total points`} />
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.6rem" }}>
                                        <MetricChip label="Average" value={String(game.average)} />
                                        <MetricChip label="Best" value={String(game.best)} />
                                        <MetricChip label="Volume" value={String(game.plays)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel
                        title="Activity Trend"
                        description="Recent scoring trend to catch burst traffic days, tests, or leaderboard spam windows."
                        dark
                    >
                        <div style={{ display: "grid", gap: "0.9rem" }}>
                            {activityTrend.length === 0 && <EmptyState label="No trend data available yet." dark />}
                            {activityTrend.map((day) => (
                                <div key={day.date} style={{ display: "grid", gap: "0.35rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                                        <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{day.date}</span>
                                        <span style={{ color: "#f8fafc", fontWeight: 900 }}>{day.score} pts</span>
                                    </div>
                                    <BarMeter value={day.score} max={Math.max(...activityTrend.map((entry) => entry.score), 1)} color="#22d3ee" label={`${day.plays} runs`} dark />
                                </div>
                            ))}
                        </div>
                    </Panel>
                </section>

                <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <Panel
                        title="Player Groups"
                        description="Grouped by player name so you can spot heavy users, rename clusters, or suspicious repeat entries."
                    >
                        <div style={{ display: "grid", gap: "0.8rem" }}>
                            {playerGroups.length === 0 && <EmptyState label="No player groups yet." />}
                            {playerGroups.slice(0, 8).map((player) => {
                                const isEditing = editingPlayerName === player.name;
                                return (
                                    <div key={player.name} style={{ padding: "1rem", borderRadius: "18px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "grid", gap: "0.8rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "baseline" }}>
                                            <div>
                                                <strong style={{ fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{player.name}</strong>
                                                <div style={{ marginTop: "0.25rem", color: "#64748b", fontSize: "0.85rem" }}>
                                                    {player.submissions} submissions · {player.gamesPlayed} games · last seen {new Date(player.lastPlayed).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ color: "#0f172a", fontWeight: 900 }}>{numberFormat(player.totalScore)} pts</div>
                                                <div style={{ color: "#64748b", fontSize: "0.8rem" }}>avg {player.averageScore} · best {player.bestScore}</div>
                                            </div>
                                        </div>

                                        {isEditing ? (
                                            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto auto", gap: "0.65rem", alignItems: "stretch" }}>
                                                <input
                                                    value={bulkRenameValue}
                                                    onChange={(event) => setBulkRenameValue(event.target.value.toUpperCase())}
                                                    placeholder="NEW PLAYER NAME"
                                                    style={inputStyle}
                                                />
                                                <button
                                                    onClick={saveBulkRename}
                                                    disabled={!bulkRenameValue.trim() || (busyAction === "rename" && busyTarget === `group-${player.name}`)}
                                                    style={primaryButtonStyle}
                                                >
                                                    SAVE
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingPlayerName(null);
                                                        setBulkRenameValue("");
                                                    }}
                                                    style={secondaryButtonStyle}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingPlayerName(player.name);
                                                    setBulkRenameValue(player.name);
                                                }}
                                                style={secondaryButtonStyle}
                                            >
                                                Rename Player Group
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>

                    <Panel
                        title="Share + Reset Controls"
                        description="Admin utilities for arcade-only sharing and protected full leaderboard reset."
                    >
                        <div style={{ display: "grid", gap: "1rem" }}>
                            <div style={{ padding: "1rem", borderRadius: "18px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "grid", gap: "0.8rem" }}>
                                <div>
                                    <strong style={{ fontSize: "0.95rem" }}>Sharable Arcade-Only Link</strong>
                                    <p style={{ margin: "0.35rem 0 0", color: "#475569", lineHeight: 1.6 }}>
                                        Generate a signed URL that opens the strict arcade-only view. Token edits immediately invalidate the link.
                                    </p>
                                </div>
                                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                                    <button onClick={generateShareLink} style={darkButtonStyle} disabled={busyAction === "share"}>
                                        {busyAction === "share" ? "Generating..." : "Generate Link"}
                                    </button>
                                    <button onClick={copyShareLink} disabled={!shareLink} style={secondaryButtonStyle}>
                                        Copy Link
                                    </button>
                                </div>
                                <div style={{ padding: "0.9rem 1rem", borderRadius: "14px", background: "#fff", border: "1px solid #e2e8f0", color: "#0f172a", wordBreak: "break-all" }}>
                                    {shareLink || "No signed arcade link generated yet."}
                                </div>
                                {shareStatus && <p style={{ margin: 0, color: "#475569" }}>{shareStatus}</p>}
                            </div>

                            <div style={{ padding: "1rem", borderRadius: "18px", background: "#fff7ed", border: "1px solid #fdba74", display: "grid", gap: "0.8rem" }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#c2410c", fontWeight: 800 }}>Danger Zone</p>
                                    <p style={{ margin: "0.4rem 0 0", color: "#7c2d12", lineHeight: 1.6 }}>
                                        Resetting clears the entire leaderboard database view for all games. Type <strong>{deleteAllPhrase}</strong> exactly to enable it.
                                    </p>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "0.75rem", alignItems: "stretch" }}>
                                    <input
                                        type="text"
                                        value={wipeConfirmation}
                                        onChange={(event) => setWipeConfirmation(event.target.value)}
                                        placeholder={deleteAllPhrase}
                                        style={{ ...inputStyle, border: "1px solid #fdba74", color: "#7c2d12" }}
                                    />
                                    <button
                                        onClick={handleWipe}
                                        disabled={busyAction === "wipe" || scores.length === 0 || wipeConfirmation.trim() !== deleteAllPhrase}
                                        style={{
                                            ...dangerButtonStyle,
                                            opacity: scores.length === 0 || wipeConfirmation.trim() !== deleteAllPhrase ? 0.55 : 1,
                                        }}
                                    >
                                        {busyAction === "wipe" ? "Resetting..." : "Reset All Scores"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Panel>
                </section>

                <Panel
                    title="Score Curatorship"
                    description="Filter, sort, rename, and moderate the live leaderboard with paginated table controls."
                >
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.7fr 0.7fr auto", gap: "0.75rem", marginBottom: "1rem" }}>
                        <input
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search player, game, or ID"
                            style={inputStyle}
                        />
                        <select
                            value={gameFilter}
                            onChange={(event) => {
                                setGameFilter(event.target.value);
                                setCurrentPage(1);
                            }}
                            style={inputStyle}
                        >
                            <option value="all">All games</option>
                            {gameOptions.map((game) => (
                                <option key={game} value={game}>
                                    {game.toUpperCase()}
                                </option>
                            ))}
                        </select>
                        <select
                            value={sortMode}
                            onChange={(event) => setSortMode(event.target.value as typeof sortMode)}
                            style={inputStyle}
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="score_high">Highest score</option>
                            <option value="score_low">Lowest score</option>
                        </select>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0.9rem 1rem", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontWeight: 800 }}>
                            {filteredScores.length} rows
                        </div>
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
                                    <th style={tableHeadCell}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedScores.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: "1.5rem", textAlign: "center", color: "#64748b" }}>
                                            No leaderboard entries match the current filters.
                                        </td>
                                    </tr>
                                )}
                                {paginatedScores.map((score) => {
                                    const isEditing = editingId === score.id;
                                    const isBusyRename = busyAction === "rename" && busyTarget === `row-${score.id}`;
                                    const isBusyDelete = busyAction === "delete" && busyTarget === String(score.id);

                                    return (
                                        <tr key={score.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                                            <td style={tableBodyCell}>{score.id}</td>
                                            <td style={tableBodyCell}>
                                                {isEditing ? (
                                                    <div style={{ display: "grid", gap: "0.5rem" }}>
                                                        <input
                                                            value={editingName}
                                                            onChange={(event) => setEditingName(event.target.value.toUpperCase())}
                                                            style={{ ...inputStyle, padding: "0.7rem 0.85rem" }}
                                                        />
                                                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                                            <button onClick={saveRowRename} disabled={!editingName.trim() || isBusyRename} style={compactPrimaryButton}>
                                                                {isBusyRename ? "Saving..." : "Save"}
                                                            </button>
                                                            <button onClick={() => setEditingId(null)} style={compactSecondaryButton}>
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <strong style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>{score.name}</strong>
                                                )}
                                            </td>
                                            <td style={tableBodyCell}><Pill label={score.game.toUpperCase()} /></td>
                                            <td style={tableBodyCell}><strong>{score.score}</strong></td>
                                            <td style={tableBodyCell}>{new Date(score.date).toLocaleString()}</td>
                                            <td style={tableBodyCell}>
                                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                                    {!isEditing && (
                                                        <button onClick={() => startRowEdit(score)} style={compactSecondaryButton}>
                                                            Edit Name
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(score.id)}
                                                        disabled={busyAction === "delete"}
                                                        style={{ ...compactDangerButton, opacity: busyAction === "delete" && !isBusyDelete ? 0.65 : 1 }}
                                                    >
                                                        {isBusyDelete ? "Deleting..." : "Delete"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                        <p style={{ margin: 0, color: "#64748b" }}>
                            Page {Math.min(currentPage, totalPages)} of {totalPages}
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage <= 1} style={secondaryButtonStyle}>
                                Previous
                            </button>
                            <button onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage >= totalPages} style={secondaryButtonStyle}>
                                Next
                            </button>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    );
}

function Panel({
    title,
    description,
    children,
    dark = false,
}: {
    title: string;
    description: string;
    children: import("react").ReactNode;
    dark?: boolean;
}) {
    return (
        <section
            style={{
                padding: "1.5rem",
                borderRadius: "24px",
                background: dark ? "#0f172a" : "#fff",
                color: dark ? "#fff" : "#0f172a",
                border: dark ? "none" : "1px solid #e2e8f0",
                boxShadow: dark ? "0 12px 40px rgba(15, 23, 42, 0.18)" : "0 12px 40px rgba(15, 23, 42, 0.08)",
            }}
        >
            <div style={{ marginBottom: "1rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 900 }}>{title}</h2>
                <p style={{ margin: "0.4rem 0 0", color: dark ? "#cbd5e1" : "#475569", lineHeight: 1.6 }}>{description}</p>
            </div>
            {children}
        </section>
    );
}

function StatCard({ title, value, subtitle, accent }: { title: string; value: string; subtitle: string; accent: string }) {
    return (
        <div style={{ padding: "1.35rem", borderRadius: "24px", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)" }}>
            <p style={{ margin: 0, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.72rem", fontWeight: 800 }}>{title}</p>
            <p style={{ margin: "0.6rem 0 0", fontSize: "2rem", fontWeight: 900, color: accent }}>{value}</p>
            <p style={{ margin: "0.4rem 0 0", color: "#475569", lineHeight: 1.5 }}>{subtitle}</p>
        </div>
    );
}

function MetricChip({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ padding: "0.65rem 0.75rem", borderRadius: "14px", background: "#fff", border: "1px solid #e2e8f0" }}>
            <div style={{ color: "#64748b", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>{label}</div>
            <div style={{ color: "#0f172a", fontSize: "1rem", fontWeight: 900, marginTop: "0.2rem" }}>{value}</div>
        </div>
    );
}

function BarMeter({ value, max, color, label, dark = false }: { value: number; max: number; color: string; label: string; dark?: boolean }) {
    const width = Math.max(6, Math.round((value / Math.max(max, 1)) * 100));
    return (
        <div style={{ display: "grid", gap: "0.45rem" }}>
            <div style={{ width: "100%", height: "12px", borderRadius: "999px", background: dark ? "rgba(255,255,255,0.08)" : "#e2e8f0", overflow: "hidden" }}>
                <div style={{ width: `${width}%`, height: "100%", borderRadius: "999px", background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
            </div>
            <span style={{ fontSize: "0.78rem", color: dark ? "#cbd5e1" : "#475569", fontWeight: 700 }}>{label}</span>
        </div>
    );
}

function EmptyState({ label, dark = false }: { label: string; dark?: boolean }) {
    return (
        <div style={{ padding: "1rem", borderRadius: "16px", border: dark ? "1px dashed rgba(255,255,255,0.16)" : "1px dashed #cbd5e1", color: dark ? "#94a3b8" : "#64748b", textAlign: "center" }}>
            {label}
        </div>
    );
}

function Pill({ label }: { label: string }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", padding: "0.4rem 0.65rem", borderRadius: "999px", background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#0f172a", fontSize: "0.74rem", fontWeight: 800, letterSpacing: "0.06em" }}>
            {label}
        </span>
    );
}

function numberFormat(value: number) {
    return new Intl.NumberFormat("en-US").format(value);
}

const inputStyle: CSSProperties = {
    padding: "0.9rem 1rem",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 700,
    minWidth: 0,
};

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

const secondaryButtonStyle: CSSProperties = {
    padding: "0.8rem 1rem",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontWeight: 800,
    cursor: "pointer",
};

const primaryButtonStyle: CSSProperties = {
    padding: "0.85rem 1rem",
    borderRadius: "12px",
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
};

const darkButtonStyle: CSSProperties = {
    padding: "0.85rem 1rem",
    borderRadius: "12px",
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
};

const dangerButtonStyle: CSSProperties = {
    padding: "0.9rem 1rem",
    borderRadius: "12px",
    border: "none",
    background: "#dc2626",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
};

const compactPrimaryButton: CSSProperties = {
    padding: "0.55rem 0.8rem",
    borderRadius: "10px",
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
};

const compactSecondaryButton: CSSProperties = {
    padding: "0.55rem 0.8rem",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 800,
    cursor: "pointer",
};

const compactDangerButton: CSSProperties = {
    padding: "0.55rem 0.8rem",
    borderRadius: "10px",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
};
