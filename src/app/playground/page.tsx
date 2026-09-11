"use client";

import type { CSSProperties, FormEvent } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MasterVisitorExplorer from "@/components/admin/MasterVisitorExplorer";

type LeaderboardEntry = {
    id: number;
    name: string;
    score: number;
    game: string;
    date: string;
    deviceId?: string;
};

type AdminResponse = {
    scores: LeaderboardEntry[];
};

type ContactSubmission = {
    id: string;
    name: string;
    email: string;
    message: string;
    status?: string | null;
    created_at: string;
    source?: string | null;
};

type VisitorSession = {
    session_id: string;
    device_id: string;
    route: string;
    share_token?: string | null;
    source?: string | null;
    session_label?: string | null;
    referrer?: string | null;
    browser?: string;
    os?: string;
    deviceType?: string;
    isBot?: boolean;
    city?: string;
    country?: string;
    hardware?: {
        connection: string;
        memory: string | number;
        cores: string | number;
    };
    maxScrollDepth?: number;
    sessionDuration?: number;
    rageClicks?: number;
    started_at: string;
    last_seen_at: string;
    view_count: number;
    link_clicks: number;
    link_targets: string[];
    game_opens: number;
    completed_runs: number;
    total_score: number;
    best_score: number;
    games_played: string[];
    resume_opens: number;
    resume_downloads: number;
    contact_submissions: number;
    recent_events: Array<{
        at: string;
        type: string;
        route: string;
        label?: string | null;
        value?: string | number | null;
    }>;
};

type AnalyticsResponse = {
    sessions: VisitorSession[];
    devices: DeviceSummary[];
};

type DeviceSummary = {
    deviceId: string;
    /** Every session for this device, embedded by the analytics API ($lookup). */
    sessions?: VisitorSession[];
    totalViews: number;
    totalLinkClicks: number;
    totalRuns: number;
    totalResumeDownloads: number;
    totalContacts: number;
    lastSeenAt: string;
    browser?: string;
    os?: string;
    deviceType?: string;
    ip?: string;
    city?: string;
    country?: string;
    isBot?: boolean;
    isSuspicious?: boolean;
    customName?: string;
    hardware?: {
        connection: string;
        memory: string | number;
        cores: string | number;
    };
};

type PlayerGroup = {
    name: string;
    /** Distinct raw names (case/whitespace variants) grouped under `name`. */
    aliases: string[];
    submissions: number;
    totalScore: number;
    bestScore: number;
    averageScore: number;
    gamesPlayed: number;
    lastPlayed: string;
};

type AdminSnapshot = {
    leaderboardData: AdminResponse;
    contactsData: ContactSubmission[];
    analyticsData: AnalyticsResponse;
};

class AdminRequestError extends Error {
    constructor(message: string, readonly unauthorized: boolean) {
        super(message);
    }
}

const pageSize = 12;
const playerGroupsPageSize = 8;

export default function Playground() {
    const deleteAllPhrase = "DELETE ALL DB";
    const [key, setKey] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [sessionChecked, setSessionChecked] = useState(false);
    const [scores, setScores] = useState<LeaderboardEntry[]>([]);
    const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
    const [sessions, setSessions] = useState<VisitorSession[]>([]);
    const [devices, setDevices] = useState<DeviceSummary[]>([]);
    const [authError, setAuthError] = useState("");
    const [dataError, setDataError] = useState("");
    const [loading, setLoading] = useState(false);
    const [busyAction, setBusyAction] = useState<"delete" | "wipe" | "rename" | null>(null);
    const [busyTarget, setBusyTarget] = useState<string>("");
    const [shareStatus, setShareStatus] = useState("");
    const [wipeConfirmation, setWipeConfirmation] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [gameFilter, setGameFilter] = useState("all");
    const [sortMode, setSortMode] = useState<"newest" | "oldest" | "score_high" | "score_low">("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [playerGroupsPage, setPlayerGroupsPage] = useState(1);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editingPlayerName, setEditingPlayerName] = useState<string | null>(null);
    const [bulkRenameValue, setBulkRenameValue] = useState("");

    const getAdminHeaders = (includeContentType = false) => {
        const headers: Record<string, string> = {};
        if (includeContentType) {
            headers["Content-Type"] = "application/json";
        }
        if (key.trim()) {
            headers["x-admin-key"] = key.trim();
        }
        return headers;
    };

    const fetchAdminSnapshot = async (candidateKey: string): Promise<AdminSnapshot> => {
        const headers = candidateKey.trim() ? { "x-admin-key": candidateKey.trim() } : undefined;

        const [leaderboardResponse, contactsResponse, analyticsResponse] = await Promise.all([
            fetch("/api/leaderboard?admin=1", { headers, cache: "no-store" }),
            fetch("/api/contact-submissions", { headers, cache: "no-store" }),
            fetch("/api/visitor-analytics", { headers, cache: "no-store" }),
        ]);

        if (!leaderboardResponse.ok || !contactsResponse.ok || !analyticsResponse.ok) {
            const unauthorized = [leaderboardResponse, contactsResponse, analyticsResponse].some((response) => response.status === 401);
            throw new AdminRequestError(unauthorized ? "Invalid KEY. Access denied." : "Unable to load admin data.", unauthorized);
        }

        const [leaderboardData, contactsData, analyticsData] = await Promise.all([
            leaderboardResponse.json() as Promise<AdminResponse>,
            contactsResponse.json() as Promise<ContactSubmission[]>,
            analyticsResponse.json() as Promise<AnalyticsResponse>,
        ]);

        return {
            leaderboardData,
            contactsData,
            analyticsData,
        };
    };

    const applySnapshot = (snapshot: AdminSnapshot) => {
        setScores(Array.isArray(snapshot.leaderboardData?.scores) ? snapshot.leaderboardData.scores : []);
        setContactSubmissions(Array.isArray(snapshot.contactsData) ? snapshot.contactsData : []);
        setSessions(Array.isArray(snapshot.analyticsData?.sessions) ? snapshot.analyticsData.sessions : []);
        setDevices(Array.isArray(snapshot.analyticsData?.devices) ? snapshot.analyticsData.devices : []);
    };

    const clearAdminData = () => {
        setScores([]);
        setContactSubmissions([]);
        setSessions([]);
        setDevices([]);
    };

    useEffect(() => {
        let cancelled = false;

        const restoreSession = async () => {
            try {
                const sessionResponse = await fetch("/api/playground/session", {
                    cache: "no-store",
                });
                const sessionData = await sessionResponse.json();

                if (!sessionResponse.ok || !sessionData.authenticated) {
                    return;
                }

                const data = await fetchAdminSnapshot("");
                if (cancelled) return;
                applySnapshot(data);
                setAuthenticated(true);
            } catch (error) {
                if (cancelled) return;
                setAuthenticated(false);
                setAuthError(error instanceof Error ? error.message : "Unable to restore admin session.");
            } finally {
                if (!cancelled) setSessionChecked(true);
            }
        };

        void restoreSession();
        return () => {
            cancelled = true;
        };
        // Runs once on mount; fetchAdminSnapshot/applySnapshot only touch stable state setters.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const attemptLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setAuthError("");

        try {
            const sessionResponse = await fetch("/api/playground/session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ key: key.trim() }),
            });

            if (!sessionResponse.ok) {
                throw new Error(sessionResponse.status === 401 ? "Invalid KEY. Access denied." : "Unable to create admin session.");
            }

            const data = await fetchAdminSnapshot("");
            applySnapshot(data);
            setDataError("");
            setAuthenticated(true);
        } catch (error) {
            setAuthenticated(false);
            clearAdminData();
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
            setDataError("");
        } catch (error) {
            if (error instanceof AdminRequestError && error.unauthorized) {
                // Cookie expired or was revoked: drop back to the login form instead of showing stale data.
                setAuthenticated(false);
                clearAdminData();
                setAuthError("Admin session expired. Enter your KEY again.");
                return;
            }
            setDataError(error instanceof Error ? error.message : "Refresh failed.");
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
                headers: getAdminHeaders(true),
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
        if (!window.confirm(`Permanently delete all ${scores.length} leaderboard entries? This cannot be undone.`)) {
            return;
        }

        setBusyAction("wipe");
        setBusyTarget("wipe");
        try {
            const response = await fetch("/api/leaderboard", {
                method: "DELETE",
                headers: getAdminHeaders(true),
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
        if (editingId === null || !nextName) return;

        setBusyAction("rename");
        setBusyTarget(`row-${editingId}`);
        try {
            const response = await fetch("/api/leaderboard", {
                method: "PATCH",
                headers: getAdminHeaders(true),
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

        // Groups are keyed by the upper-cased name, but the API matches `playerName` exactly,
        // so rename every raw spelling that was folded into this group.
        const aliases = playerGroups.find((group) => group.name === currentName)?.aliases ?? [currentName];

        setBusyAction("rename");
        setBusyTarget(`group-${currentName}`);
        try {
            for (const alias of aliases) {
                const response = await fetch("/api/leaderboard", {
                    method: "PATCH",
                    headers: getAdminHeaders(true),
                    body: JSON.stringify({ playerName: alias, name: nextName }),
                });

                if (!response.ok) {
                    throw new Error(response.status === 401 ? "Invalid KEY. Access denied." : "Player rename failed.");
                }
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

    const updateContactStatus = async (id: string, status: string) => {
        setBusyAction("rename");
        setBusyTarget(`contact-${id}`);
        try {
            const response = await fetch("/api/contact-submissions", {
                method: "PATCH",
                headers: getAdminHeaders(true),
                body: JSON.stringify({ id, status }),
            });

            if (!response.ok) {
                throw new Error(response.status === 401 ? "Invalid KEY. Access denied." : "Contact status update failed.");
            }

            await refreshSnapshot();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Contact status update failed.");
        } finally {
            setBusyAction(null);
            setBusyTarget("");
        }
    };

    const copyDirectLink = async (path: string, label: string) => {
        try {
            const url = `${window.location.origin}${path}`;
            await navigator.clipboard.writeText(url);
            setShareStatus(`${label} copied.`);
        } catch {
            setShareStatus("Copy failed. You can still copy the link manually.");
        }
    };

    const lockTerminal = async () => {
        try {
            await fetch("/api/playground/session", {
                method: "DELETE",
            });
        } catch {
            // Best-effort session cleanup.
        }

        setAuthenticated(false);
        clearAdminData();
        setAuthError("");
        setDataError("");
        setShareStatus("");
        setWipeConfirmation("");
        setSearchTerm("");
        setGameFilter("all");
        setSortMode("newest");
        setCurrentPage(1);
        setPlayerGroupsPage(1);
        setEditingId(null);
        setEditingName("");
        setEditingPlayerName(null);
        setBulkRenameValue("");
        setKey("");
    };

    const gameOptions = useMemo(() => {
        return Array.from(new Set(scores.map((entry) => entry.game))).sort();
    }, [scores]);

    const uniquePlayers = useMemo(() => new Set(scores.map((entry) => entry.name.trim().toUpperCase())).size, [scores]);

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
                aliases: [...new Set(entries.map((entry) => entry.name.trim()))],
                submissions: entries.length,
                totalScore,
                bestScore: Math.max(...entries.map((entry) => entry.score)),
                averageScore: Math.round(totalScore / entries.length),
                gamesPlayed,
                lastPlayed: entries
                    .map((entry) => entry.date)
                    .sort((a, b) => toTime(b) - toTime(a))[0],
            };
        }).sort((a, b) => b.totalScore - a.totalScore || b.bestScore - a.bestScore);
    }, [scores]);

    const playerGroupsTotalPages = Math.max(1, Math.ceil(playerGroups.length / playerGroupsPageSize));
    const safePlayerGroupsPage = Math.min(playerGroupsPage, playerGroupsTotalPages);

    const deviceStats = useMemo(() => {
        let mobile = 0;
        let pc = 0;
        sessions.forEach(s => {
            if (s.isBot) return; // Exclude bots from human device ratio
            const type = s.deviceType?.toLowerCase() || '';
            if (type.includes('iphone') || type.includes('android') || type.includes('mobile')) {
                mobile++;
            } else {
                pc++;
            }
        });
        const total = mobile + pc;
        const mobilePct = total ? Math.round((mobile / total) * 100) : 0;
        return { mobile, pc, mobilePct };
    }, [sessions]);

    const botStats = useMemo(() => {
        const botsCount = sessions.filter((s) => s.isBot).length;
        const botPercentage = sessions.length ? Math.round((botsCount / sessions.length) * 100) : 0;
        return { botsCount, botPercentage };
    }, [sessions]);

    const resumeStats = useMemo(() => {
        const downloads = sessions.reduce((sum, s) => sum + (s.resume_downloads || 0), 0);
        const opens = sessions.reduce((sum, s) => sum + (s.resume_opens || 0), 0);
        return { downloads, opens };
    }, [sessions]);

    const outreachStats = useMemo(() => {
        const messages = contactSubmissions.length;
        const attempts = sessions.reduce((sum, s) => sum + (s.contact_submissions || 0), 0);
        return { messages, attempts };
    }, [sessions, contactSubmissions]);

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
                if (sortMode === "score_high") return b.score - a.score || toTime(b.date) - toTime(a.date);
                if (sortMode === "score_low") return a.score - b.score || toTime(b.date) - toTime(a.date);
                if (sortMode === "oldest") return toTime(a.date) - toTime(b.date);
                return toTime(b.date) - toTime(a.date);
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

    useEffect(() => {
        if (playerGroupsPage > playerGroupsTotalPages) {
            setPlayerGroupsPage(playerGroupsTotalPages);
        }
    }, [playerGroupsPage, playerGroupsTotalPages]);

    const newContacts = contactSubmissions.filter((submission) => (submission.status ?? "new") === "new").length;
    const totalSessionViews = sessions.reduce((sum, session) => sum + (session.view_count || 0), 0);

    if (!sessionChecked) {
        return (
            <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: "2rem", background: "radial-gradient(circle at top, #1f2937 0%, #020617 45%, #000 100%)", color: "#fff" }}>
                <PlaygroundTopBar authenticated={false} onToggleLock={() => undefined} />
                <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, letterSpacing: "0.18em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 800 }}>Playground</p>
                    <h1 style={{ marginTop: "0.75rem", fontSize: "2rem" }}>Checking admin session...</h1>
                </div>
            </div>
        );
    }

    if (!authenticated) {
        return (
            <div className="playground-admin" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "6.5rem 1rem 2rem", background: "radial-gradient(circle at top, #1f2937 0%, #020617 45%, #000 100%)" }}>
                <style>{focusVisibleCss}</style>
                <PlaygroundTopBar authenticated={false} onToggleLock={() => undefined} />
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
                            autoComplete="current-password"
                            autoFocus
                            value={key}
                            onChange={(event) => setKey(event.target.value)}
                            placeholder="Enter admin key"
                            data-testid="playground-key-input"
                            style={{ padding: "0.9rem 1rem", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.2)", background: "#020617", color: "#fff" }}
                        />
                    </label>

                    {authError && (
                        <p data-testid="playground-auth-error" role="alert" style={{ margin: 0, color: "#fca5a5", fontSize: "0.9rem" }}>
                            {authError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !key.trim()}
                        style={{ padding: "1rem", borderRadius: "14px", border: "none", background: loading ? "#475569" : "#b91c1c", color: "#fff", fontWeight: 900, cursor: loading ? "wait" : "pointer" }}
                    >
                        {loading ? "VALIDATING..." : "ACCESS PLAYGROUND"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div
            className="playground-admin"
            style={{
                minHeight: "100vh",
                background: "radial-gradient(circle at top, rgba(14,165,233,0.18) 0%, rgba(2,6,23,0.96) 24%, #020617 56%, #000 100%)",
                padding: "6.5rem 1rem 4rem",
            }}
        >
            <style>{focusVisibleCss}</style>
            <PlaygroundTopBar authenticated={authenticated} onToggleLock={() => void lockTerminal()} />
            <div style={{ maxWidth: "1340px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: 0 }}>
                <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                    <div style={{ padding: "1.5rem", borderRadius: "24px", border: "1px solid rgba(56,189,248,0.18)", background: "linear-gradient(135deg, rgba(2,6,23,0.92), rgba(15,23,42,0.84), rgba(8,47,73,0.72))", boxShadow: "0 28px 80px rgba(0,0,0,0.34)", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", inset: "-10% auto auto -4%", width: "280px", height: "280px", borderRadius: "999px", background: "radial-gradient(circle, rgba(56,189,248,0.18), transparent 70%)", pointerEvents: "none" }} />
                        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#38bdf8", fontWeight: 800 }}>Admin Dashboard</p>
                                <h1 style={{ margin: "0.4rem 0 0", fontSize: "clamp(1.75rem, 6vw, 2.5rem)", fontWeight: 900, color: "#f8fafc", overflowWrap: "anywhere" }}>Arcade Playground Intelligence</h1>
                                <p style={{ margin: "0.7rem 0 0", color: "#cbd5e1", maxWidth: "860px", lineHeight: 1.7 }}>
                                    A black-room control surface for following how people move through your share pages, where they click, when they play, and when browsing turns into resume interest or direct outreach.
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", zIndex: 10 }}>
                                <button type="button" onClick={() => void refreshSnapshot()} disabled={loading} aria-busy={loading} style={{ ...primaryButtonStyle, opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}>
                                    {loading ? "Refreshing..." : "Refresh Data"}
                                </button>
                                <button type="button" onClick={() => void lockTerminal()} style={secondaryButtonStyle}>
                                    Lock Terminal
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {dataError && (
                    <div
                        role="alert"
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", padding: "0.9rem 1.1rem", borderRadius: "16px", border: "1px solid rgba(248,113,113,0.4)", background: "rgba(127,29,29,0.35)", color: "#fecaca", fontWeight: 700 }}
                    >
                        <span>{dataError} Showing the last loaded data.</span>
                        <button type="button" onClick={() => void refreshSnapshot()} disabled={loading} style={compactSecondaryButton}>
                            {loading ? "Retrying..." : "Retry"}
                        </button>
                    </div>
                )}

                <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "1rem" }}>
                    <StatCard 
                        title="Total Sessions" 
                        value={String(sessions.length)} 
                        subtitle={`${totalSessionViews} page views across all visitors`} 
                        accent="#818cf8"
                    />
                    <StatCard 
                        title="Arcade Momentum" 
                        value={`${scores.length} runs`} 
                        subtitle={`${uniquePlayers} players submitted scores`} 
                        accent="#f87171"
                    />
                    <StatCard 
                        title="Resume Intent" 
                        value={`${resumeStats.downloads} DLs`} 
                        subtitle={`${resumeStats.opens} views on PDF resume`} 
                        accent="#4ade80"
                    />
                    <StatCard 
                        title="Outreach Signals" 
                        value={`${outreachStats.messages} messages`} 
                        subtitle={`${outreachStats.attempts} contact submit attempts`} 
                        accent="#f472b6"
                    />
                    <StatCard 
                        title="Bot Traffic %" 
                        value={`${botStats.botPercentage}%`} 
                        subtitle={`${botStats.botsCount} bot sessions identified`} 
                        accent="#c084fc"
                    />
                    <StatCard 
                        title="Mobile vs PC" 
                        value={`${deviceStats.mobilePct}% Mobile`} 
                        subtitle={`${deviceStats.mobile} mobile / ${deviceStats.pc} desktop`} 
                        accent="#eab308" 
                    />
                </section>

                <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                    <MasterVisitorExplorer
                        devices={devices}
                        sessions={sessions}
                        getAdminHeaders={getAdminHeaders}
                        onRefresh={refreshSnapshot}
                    />
                </section>

                <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "1rem", alignItems: "start" }}>
                    <Panel
                        title="Player Groups"
                        description="Grouped by player name so you can spot heavy users, rename clusters, or suspicious repeat entries."
                    >

                        <div style={{ display: "grid", gap: "0.8rem" }}>
                            {playerGroups.length === 0 && <EmptyState label="No player groups yet." />}
                            {playerGroups.slice((safePlayerGroupsPage - 1) * playerGroupsPageSize, safePlayerGroupsPage * playerGroupsPageSize).map((player) => {
                                const isEditing = editingPlayerName === player.name;
                                const isBusyGroup = busyAction === "rename" && busyTarget === `group-${player.name}`;
                                return (
                                    <div key={player.name} style={{ padding: "1rem", borderRadius: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.14)", display: "grid", gap: "0.8rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "baseline" }}>
                                            <div style={{ minWidth: 0 }}>
                                                <strong style={{ fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.08em", overflowWrap: "anywhere" }}>{player.name}</strong>
                                                <div style={{ marginTop: "0.25rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                                                    {player.submissions} submissions · {player.gamesPlayed} games · last seen {formatDate(player.lastPlayed)}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ color: "#fff", fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{numberFormat(player.totalScore)} pts</div>
                                                <div style={{ color: "#94a3b8", fontSize: "0.8rem", fontVariantNumeric: "tabular-nums" }}>avg {player.averageScore} · best {player.bestScore}</div>
                                            </div>
                                        </div>

                                        {isEditing ? (
                                            <form
                                                onSubmit={(event) => {
                                                    event.preventDefault();
                                                    void saveBulkRename();
                                                }}
                                                style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto auto", gap: "0.65rem", alignItems: "stretch" }}
                                            >
                                                <input
                                                    value={bulkRenameValue}
                                                    onChange={(event) => setBulkRenameValue(event.target.value.toUpperCase())}
                                                    placeholder="NEW PLAYER NAME"
                                                    aria-label={`New name for player group ${player.name}`}
                                                    autoFocus
                                                    style={inputStyle}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!bulkRenameValue.trim() || isBusyGroup}
                                                    style={primaryButtonStyle}
                                                >
                                                    {isBusyGroup ? "SAVING..." : "SAVE"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingPlayerName(null);
                                                        setBulkRenameValue("");
                                                    }}
                                                    style={secondaryButtonStyle}
                                                >
                                                    Cancel
                                                </button>
                                            </form>
                                        ) : (
                                            <button
                                                type="button"
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
                            
                            {playerGroups.length > playerGroupsPageSize && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                                    <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                                        Showing {(safePlayerGroupsPage - 1) * playerGroupsPageSize + 1} - {Math.min(playerGroups.length, safePlayerGroupsPage * playerGroupsPageSize)} of {playerGroups.length}
                                    </span>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button
                                            type="button"
                                            onClick={() => setPlayerGroupsPage(p => Math.max(1, Math.min(p, playerGroupsTotalPages) - 1))}
                                            disabled={safePlayerGroupsPage <= 1}
                                            style={{ ...secondaryButtonStyle, opacity: safePlayerGroupsPage <= 1 ? 0.5 : 1, padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                                        >
                                            Prev
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPlayerGroupsPage(p => Math.min(playerGroupsTotalPages, p + 1))}
                                            disabled={safePlayerGroupsPage >= playerGroupsTotalPages}
                                            style={{ ...secondaryButtonStyle, opacity: safePlayerGroupsPage >= playerGroupsTotalPages ? 0.5 : 1, padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Panel>


                    <Panel
                        title="Share Links + Reset"
                        description="Copy the direct standalone routes you want to share, or clear the leaderboard when you need a full reset."
                    >
                        <div style={{ display: "grid", gap: "1rem" }}>
                            <div style={{ padding: "1rem", borderRadius: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.14)", display: "grid", gap: "0.8rem" }}>
                                <div>
                                    <strong style={{ fontSize: "0.95rem" }}>Direct Share Routes</strong>
                                </div>
                                <div style={{ display: "grid", gap: "0.75rem" }}>
                                    {[
                                        { label: "Social Only", path: "/social-only" },
                                        { label: "Game Only", path: "/game-only" },
                                        { label: "Resume Download", path: "/RESUME.pdf" },
                                    ].map((entry) => (
                                        <div
                                            key={entry.path}
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "minmax(0, 1fr) auto",
                                                gap: "0.75rem",
                                                alignItems: "center",
                                                padding: "0.9rem 1rem",
                                                borderRadius: "14px",
                                                background: "rgba(15,23,42,0.92)",
                                                border: "1px solid rgba(148,163,184,0.16)",
                                            }}
                                        >
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ color: "#fff", fontWeight: 800 }}>{entry.label}</div>
                                                <div style={{ color: "#94a3b8", fontSize: "0.84rem", wordBreak: "break-all" }}>{entry.path}</div>
                                            </div>
                                            <button type="button" onClick={() => void copyDirectLink(entry.path, entry.label)} aria-label={`Copy ${entry.label} link`} style={secondaryButtonStyle}>
                                                Copy
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <p aria-live="polite" style={{ margin: 0, color: "#94a3b8", minHeight: shareStatus ? undefined : 0 }}>{shareStatus}</p>
                            </div>

                            <div style={{ padding: "1rem", borderRadius: "18px", background: "linear-gradient(180deg, rgba(67,20,7,0.58), rgba(35,12,5,0.7))", border: "1px solid rgba(251,146,60,0.34)", display: "grid", gap: "0.8rem" }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#fb923c", fontWeight: 800 }}>Danger Zone</p>
                                    <p style={{ margin: "0.4rem 0 0", color: "#fed7aa", lineHeight: 1.6 }}>
                                        Resetting clears the entire leaderboard database view for all games. Type <strong>{deleteAllPhrase}</strong> exactly to enable it.
                                    </p>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: "0.75rem", alignItems: "stretch" }}>
                                    <input
                                        type="text"
                                        value={wipeConfirmation}
                                        onChange={(event) => setWipeConfirmation(event.target.value)}
                                        placeholder={deleteAllPhrase}
                                        aria-label={`Type ${deleteAllPhrase} to confirm resetting all scores`}
                                        autoComplete="off"
                                        spellCheck={false}
                                        style={{ ...inputStyle, border: "1px solid #fdba74", color: "#fed7aa" }}
                                    />
                                    <button
                                        type="button"
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

                <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                    <Panel
                        title="Contact Inbox"
                        description={`Messages from the contact page land here so you can review them later from the same admin surface.${contactSubmissions.length ? ` ${newContacts} new · showing ${Math.min(8, contactSubmissions.length)} of ${contactSubmissions.length}.` : ""}`}
                    >
                        <div style={{ display: "grid", gap: "0.85rem" }}>
                            {contactSubmissions.length === 0 && <EmptyState label="No contact messages yet." />}
                            {contactSubmissions.slice(0, 8).map((submission) => {
                                const isBusy = busyAction === "rename" && busyTarget === `contact-${submission.id}`;
                                const status = (submission.status ?? "new").toUpperCase();

                                return (
                                    <div key={submission.id} style={{ padding: "1rem", borderRadius: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.14)", display: "grid", gap: "0.75rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "start", flexWrap: "wrap" }}>
                                            <div style={{ display: "grid", gap: "0.25rem", minWidth: 0 }}>
                                                <strong style={{ fontSize: "0.95rem", color: "#fff", overflowWrap: "anywhere" }}>{submission.name}</strong>
                                                <span style={{ color: "#94a3b8", fontSize: "0.85rem", overflowWrap: "anywhere" }}>{submission.email}</span>
                                            </div>
                                            <Pill label={status} />
                                        </div>

                                        <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.7, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                                            {submission.message}
                                        </p>

                                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                                            <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                                                {formatDateTime(submission.created_at)} · {submission.source || "/contact"}
                                            </span>
                                            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                                                <a href={`mailto:${submission.email}`} aria-label={`Reply to ${submission.name || submission.email} by email`} style={{ ...compactSecondaryButton, textDecoration: "none" }}>
                                                    Reply
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => updateContactStatus(submission.id, submission.status === "reviewed" ? "new" : "reviewed")}
                                                    disabled={isBusy}
                                                    style={compactPrimaryButton}
                                                >
                                                    {isBusy ? "Updating..." : submission.status === "reviewed" ? "Mark New" : "Mark Reviewed"}
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                                                    </div>
                    </Panel>

                </section>


                <Panel
                    title="Score Curatorship"
                    description="Filter, sort, rename, and moderate the live leaderboard with paginated table controls."
                >
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search player, game, or ID"
                            aria-label="Search scores by player, game, or ID"
                            style={inputStyle}
                        />
                        <select
                            value={gameFilter}
                            onChange={(event) => {
                                setGameFilter(event.target.value);
                                setCurrentPage(1);
                            }}
                            aria-label="Filter by game"
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
                            onChange={(event) => {
                                setSortMode(event.target.value as typeof sortMode);
                                setCurrentPage(1);
                            }}
                            aria-label="Sort scores"
                            style={inputStyle}
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="score_high">Highest score</option>
                            <option value="score_low">Lowest score</option>
                        </select>
                        <div aria-live="polite" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0.9rem 1rem", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.14)", color: "#cbd5e1", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                            {filteredScores.length} rows
                        </div>
                    </div>

                    <div style={{ overflowX: "auto", border: "1px solid rgba(148,163,184,0.14)", borderRadius: "18px" }}>
                        <table data-testid="playground-score-table" style={{ width: "100%", minWidth: "760px", borderCollapse: "collapse", background: "rgba(2,6,23,0.72)" }}>
                            <thead>
                                <tr style={{ background: "rgba(255,255,255,0.06)", textAlign: "left" }}>
                                    <th scope="col" style={tableHeadCell}>ID</th>
                                    <th scope="col" style={tableHeadCell}>Player</th>
                                    <th scope="col" style={tableHeadCell}>Game</th>
                                    <th scope="col" style={tableHeadCell}>Score</th>
                                    <th scope="col" style={tableHeadCell}>Timestamp</th>
                                    <th scope="col" style={tableHeadCell}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedScores.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: "1.5rem", textAlign: "center", color: "#94a3b8" }}>
                                            {scores.length === 0 ? "No leaderboard entries yet." : "No leaderboard entries match the current filters."}
                                        </td>
                                    </tr>
                                )}
                                {paginatedScores.map((score) => {
                                    const isEditing = editingId === score.id;
                                    const isBusyRename = busyAction === "rename" && busyTarget === `row-${score.id}`;
                                    const isBusyDelete = busyAction === "delete" && busyTarget === String(score.id);

                                    return (
                                        <tr key={score.id} style={{ borderTop: "1px solid rgba(148,163,184,0.14)" }}>
                                            <td style={tableBodyCell}>{score.id}</td>
                                            <td style={tableBodyCell}>
                                                {isEditing ? (
                                                    <form
                                                        onSubmit={(event) => {
                                                            event.preventDefault();
                                                            void saveRowRename();
                                                        }}
                                                        style={{ display: "grid", gap: "0.5rem" }}
                                                    >
                                                        <input
                                                            value={editingName}
                                                            onChange={(event) => setEditingName(event.target.value.toUpperCase())}
                                                            aria-label={`New player name for entry ${score.id}`}
                                                            autoFocus
                                                            style={{ ...inputStyle, padding: "0.7rem 0.85rem" }}
                                                        />
                                                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                                            <button type="submit" disabled={!editingName.trim() || isBusyRename} style={compactPrimaryButton}>
                                                                {isBusyRename ? "Saving..." : "Save"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingId(null);
                                                                    setEditingName("");
                                                                }}
                                                                style={compactSecondaryButton}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <strong style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>{score.name}</strong>
                                                )}
                                            </td>
                                            <td style={tableBodyCell}><Pill label={score.game.toUpperCase()} /></td>
                                            <td style={tableBodyCell}><strong>{score.score}</strong></td>
                                            <td style={tableBodyCell}>{formatDateTime(score.date)}</td>
                                            <td style={tableBodyCell}>
                                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                                    {!isEditing && (
                                                        <button type="button" onClick={() => startRowEdit(score)} aria-label={`Edit name for entry ${score.id} (${score.name})`} style={compactSecondaryButton}>
                                                            Edit Name
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        aria-label={`Delete entry ${score.id} (${score.name})`}
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
                        <p style={{ margin: 0, color: "#94a3b8" }}>
                            Page {Math.min(currentPage, totalPages)} of {totalPages}
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage <= 1} style={{ ...secondaryButtonStyle, opacity: currentPage <= 1 ? 0.5 : 1, cursor: currentPage <= 1 ? "not-allowed" : "pointer" }}>
                                Previous
                            </button>
                            <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage >= totalPages} style={{ ...secondaryButtonStyle, opacity: currentPage >= totalPages ? 0.5 : 1, cursor: currentPage >= totalPages ? "not-allowed" : "pointer" }}>
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
    tone = "default",
}: {
    title: string;
    description: string;
    children: import("react").ReactNode;
    dark?: boolean;
    tone?: "default" | "spotlight";
}) {
    const spotlight = tone === "spotlight";
    return (
        <section
            style={{
                padding: spotlight ? "1.7rem" : "1.5rem",
                borderRadius: "24px",
                background: dark
                    ? "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(2,6,23,0.98))"
                    : spotlight
                        ? "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.9), rgba(49,46,129,0.72))"
                        : "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(2,6,23,0.94))",
                color: "#e2e8f0",
                border: dark ? "1px solid rgba(148,163,184,0.14)" : spotlight ? "1px solid rgba(99,102,241,0.24)" : "1px solid rgba(148,163,184,0.14)",
                boxShadow: dark
                    ? "0 18px 48px rgba(0, 0, 0, 0.34)"
                    : spotlight
                        ? "0 24px 60px rgba(79, 70, 229, 0.2)"
                        : "0 18px 50px rgba(0, 0, 0, 0.28)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {spotlight && (
                <div
                    style={{
                        position: "absolute",
                        inset: "-20% auto auto -10%",
                        width: "240px",
                        height: "240px",
                        borderRadius: "999px",
                        background: "radial-gradient(circle, rgba(99,102,241,0.14), transparent 70%)",
                        pointerEvents: "none",
                    }}
                />
            )}
            <div style={{ marginBottom: "1rem" }}>
                <h2 style={{ margin: 0, fontSize: spotlight ? "1.18rem" : "1.08rem", fontWeight: 900, color: "#f8fafc", letterSpacing: spotlight ? "-0.02em" : undefined }}>{title}</h2>
                <p style={{ margin: "0.4rem 0 0", color: dark ? "#cbd5e1" : "#94a3b8", lineHeight: 1.6 }}>{description}</p>
            </div>
            {children}
        </section>
    );
}

function PlaygroundTopBar({
    authenticated,
    onToggleLock,
}: {
    authenticated: boolean;
    onToggleLock: () => void;
}) {
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 160,
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                background: "linear-gradient(180deg, rgba(2, 6, 23, 0.92), rgba(2, 6, 23, 0.8))",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 12px 28px rgba(2, 6, 23, 0.26)",
            }}
        >
            <div style={{ maxWidth: "1340px", margin: "0 auto", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: "0.2rem" }}>
                    <p style={{ margin: 0, fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 800 }}>
                        Admin Surface
                    </p>
                    <strong style={{ color: "#fff", fontSize: "1.15rem", fontWeight: 900 }}>
                        Trupal&apos;s Playground
                    </strong>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <Link
                        href="/"
                        style={{
                            padding: "0.8rem 1rem",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.14)",
                            color: "#e2e8f0",
                            fontWeight: 800,
                            textDecoration: "none",
                            background: "rgba(255,255,255,0.04)",
                        }}
                    >
                        Back to Website
                    </Link>

                    <button
                        type="button"
                        onClick={onToggleLock}
                        disabled={!authenticated}
                        aria-label={authenticated ? "Lock admin session" : "Admin session locked"}
                        style={{
                            padding: "0.8rem 1rem",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.14)",
                            background: authenticated ? "#b91c1c" : "rgba(255,255,255,0.04)",
                            color: "#fff",
                            fontWeight: 900,
                            cursor: authenticated ? "pointer" : "default",
                            opacity: authenticated ? 1 : 0.95,
                        }}
                    >
                        {authenticated ? "Lock" : "Locked"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, accent }: { title: string; value: string; subtitle: string; accent: string }) {
    return (
        <div style={{ padding: "1.35rem", borderRadius: "20px", background: "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(2,6,23,0.94))", border: "1px solid rgba(148,163,184,0.14)", boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 22px 50px rgba(0, 0, 0, 0.28), inset 0 0 0 1px ${accent}14`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: "-18% -8% auto auto", width: "120px", height: "120px", borderRadius: "999px", background: `radial-gradient(circle, ${accent}18, transparent 70%)`, pointerEvents: "none" }} />
            <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.75rem", fontWeight: 800 }}>
                <span aria-hidden="true" style={{ width: "6px", height: "6px", borderRadius: "999px", background: accent, flexShrink: 0 }} />
                {title}
            </p>
            <p style={{ margin: "0.6rem 0 0", fontSize: "2rem", fontWeight: 900, color: accent, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{value}</p>
            <p style={{ margin: "0.5rem 0 0", color: "#cbd5e1", lineHeight: 1.5, fontVariantNumeric: "tabular-nums" }}>{subtitle}</p>
        </div>
    );
}

function EmptyState({ label, dark = false }: { label: string; dark?: boolean }) {
    return (
        <div style={{ padding: "1rem", borderRadius: "16px", border: dark ? "1px dashed rgba(255,255,255,0.16)" : "1px dashed rgba(148,163,184,0.3)", color: "#94a3b8", textAlign: "center" }}>
            {label}
        </div>
    );
}

function Pill({ label }: { label: string }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", padding: "0.4rem 0.65rem", borderRadius: "999px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(148,163,184,0.16)", color: "#f8fafc", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
            {label}
        </span>
    );
}



function numberFormat(value: number) {
    return new Intl.NumberFormat("en-US").format(Number.isFinite(value) ? value : 0);
}

/** Epoch ms for sorting; invalid/missing dates sort as oldest instead of producing NaN comparisons. */
function toTime(value?: string | null) {
    const time = value ? new Date(value).getTime() : NaN;
    return Number.isNaN(time) ? 0 : time;
}

function formatDate(value?: string | null) {
    const time = toTime(value);
    return time ? new Date(time).toLocaleDateString() : "unknown date";
}

function formatDateTime(value?: string | null) {
    const time = toTime(value);
    return time ? new Date(time).toLocaleString() : "Unknown time";
}

// Inline styles can't express :focus-visible, so scope a small rule to the dashboard root.
const focusVisibleCss = `
.playground-admin :is(button, a, input, select, textarea, summary):focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
}
.playground-admin button:disabled {
    cursor: not-allowed;
}
.playground-admin :is(button, a) {
    transition: filter 150ms cubic-bezier(0.16, 1, 0.3, 1), transform 150ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms cubic-bezier(0.16, 1, 0.3, 1);
}
.playground-admin :is(button:not(:disabled), a):hover {
    filter: brightness(1.12);
    transform: translateY(-1px);
}
.playground-admin tbody tr {
    transition: background-color 150ms cubic-bezier(0.16, 1, 0.3, 1);
}
.playground-admin tbody tr:nth-child(even) {
    background: rgba(255,255,255,0.015);
}
.playground-admin tbody tr:hover {
    background: rgba(56,189,248,0.05);
}
@media (prefers-reduced-motion: reduce) {
    .playground-admin :is(button:not(:disabled), a):hover {
        transform: none;
    }
}
`;

const inputStyle: CSSProperties = {
    padding: "0.9rem 1rem",
    borderRadius: "14px",
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(15,23,42,0.92)",
    color: "#f8fafc",
    fontWeight: 700,
    minWidth: 0,
};

const tableHeadCell: CSSProperties = {
    padding: "0.85rem 1rem",
    fontSize: "0.75rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#cbd5e1",
    whiteSpace: "nowrap",
    borderBottom: "1px solid rgba(148,163,184,0.24)",
};

const tableBodyCell: CSSProperties = {
    padding: "1rem",
    color: "#e2e8f0",
    verticalAlign: "top",
    lineHeight: 1.5,
    fontVariantNumeric: "tabular-nums",
};

const secondaryButtonStyle: CSSProperties = {
    padding: "0.8rem 1rem",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(255,255,255,0.04)",
    color: "#e2e8f0",
    fontWeight: 800,
    cursor: "pointer",
};

const primaryButtonStyle: CSSProperties = {
    padding: "0.85rem 1rem",
    borderRadius: "12px",
    border: "1px solid rgba(56,189,248,0.18)",
    background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
};

const dangerButtonStyle: CSSProperties = {
    padding: "0.9rem 1rem",
    borderRadius: "12px",
    border: "none",
    background: "#b91c1c",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
};

const compactPrimaryButton: CSSProperties = {
    padding: "0.55rem 0.8rem",
    borderRadius: "10px",
    border: "1px solid rgba(56,189,248,0.18)",
    background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
};

const compactSecondaryButton: CSSProperties = {
    padding: "0.55rem 0.8rem",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(255,255,255,0.04)",
    color: "#e2e8f0",
    fontWeight: 800,
    cursor: "pointer",
};

const compactDangerButton: CSSProperties = {
    padding: "0.55rem 0.8rem",
    borderRadius: "10px",
    border: "none",
    background: "#b91c1c",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
};
