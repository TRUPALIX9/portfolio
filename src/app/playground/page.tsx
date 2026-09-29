"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AcquisitionTab, ActivityTab, ContentTab, IntentTab, OverviewTab, PageViewsTab } from "@/components/admin/playground/AnalyticsTabs";
import { DataTab } from "@/components/admin/playground/DataTab";
import { InboxTab } from "@/components/admin/playground/InboxTab";
import { VisitorsTab } from "@/components/admin/playground/VisitorsTab";
import {
    Segmented,
    buttonStyle,
    colors,
    inputStyle,
    primaryButtonStyle,
    type DeviceFilter,
    type RangeKey,
    type ReportFilters,
    type TrafficFilter,
} from "@/components/admin/playground/ui";

// Each tab answers one question; `filters` says which of the global filters apply to it.
const TABS = [
    { id: "overview", label: "Overview", question: "How is the site doing? Headline numbers vs. the previous period, the trend, and who the audience is.", filters: true },
    { id: "activity", label: "Activity", question: "What did each visitor do? One card per device visit, with every page and click in order.", filters: true },
    { id: "pageviews", label: "Page views", question: "What was viewed, and by whom? Every page view, newest first.", filters: true },
    { id: "visitors", label: "Visitors", question: "Who are they? One row per device, with a full profile and history.", filters: true },
    { id: "sources", label: "Sources", question: "Where do visitors come from, and which sources bring engaged ones?", filters: true },
    { id: "content", label: "Content", question: "What do they read? Time, scroll and exits per page, and how far down the home page they get.", filters: true },
    { id: "intent", label: "Intent", question: "Who is interested? The path from visit to message, and the most promising visits.", filters: true },
    { id: "inbox", label: "Inbox", question: "Messages sent through the contact form.", filters: false },
    { id: "settings", label: "Settings", question: "Keep your own devices out of the numbers, block bots, share tagged links, and reset data.", filters: false },
] as const;

type TabId = (typeof TABS)[number]["id"];

const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
    { value: "24h", label: "Last 24 hours" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "all", label: "All time" },
];

const TRAFFIC_OPTIONS: { value: TrafficFilter; label: string }[] = [
    { value: "human", label: "Real visitors" },
    { value: "bots", label: "Bots" },
    { value: "owner", label: "Only me" },
    { value: "all", label: "Everything" },
];

const DEVICE_OPTIONS: { value: DeviceFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "mobile", label: "📱 Mobile" },
    { value: "desktop", label: "💻 Desktop" },
    { value: "tablet", label: "Tablet" },
];

const PREFS_KEY = "playground_prefs";

function loadPrefs(): { tab?: TabId; range?: RangeKey } {
    try {
        return JSON.parse(window.localStorage.getItem(PREFS_KEY) || "{}");
    } catch {
        return {};
    }
}

function savePrefs(prefs: { tab: TabId; range: RangeKey }) {
    try {
        window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
        // Remembering the tab is a convenience only.
    }
}

export default function Playground() {
    const [key, setKey] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [sessionChecked, setSessionChecked] = useState(false);
    const [authError, setAuthError] = useState("");
    const [loading, setLoading] = useState(false);

    const [tab, setTab] = useState<TabId>("overview");
    const [filters, setFilters] = useState<ReportFilters>({ range: "7d", traffic: "human", device: "all" });
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedVisitor, setSelectedVisitor] = useState<string | null>(null);

    useEffect(() => {
        const prefs = loadPrefs();
        if (prefs.tab && TABS.some((t) => t.id === prefs.tab)) setTab(prefs.tab);
        if (prefs.range && RANGE_OPTIONS.some((r) => r.value === prefs.range)) setFilters((f) => ({ ...f, range: prefs.range as RangeKey }));
    }, []);

    useEffect(() => {
        savePrefs({ tab, range: filters.range });
    }, [tab, filters.range]);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/playground/session", { cache: "no-store" })
            .then((response) => response.json())
            .then((data: { authenticated?: boolean }) => {
                if (!cancelled) setAuthenticated(Boolean(data.authenticated));
            })
            .catch(() => undefined)
            .finally(() => {
                if (!cancelled) setSessionChecked(true);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Any report that gets a 401 drops back to the login form.
    const handleUnauthorized = useCallback(() => {
        setAuthenticated(false);
        setAuthError("Admin session expired. Enter your KEY again.");
    }, []);

    const openVisitor = useCallback((visitorId: string) => {
        setSelectedVisitor(visitorId);
        setTab("visitors");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const attemptLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setAuthError("");
        try {
            const response = await fetch("/api/playground/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: key.trim() }),
            });
            if (!response.ok) {
                throw new Error(response.status === 401 ? "Invalid KEY. Access denied." : "Unable to create admin session.");
            }
            setKey("");
            setAuthenticated(true);
        } catch (error) {
            setAuthenticated(false);
            setAuthError(error instanceof Error ? error.message : "Unable to authenticate.");
        } finally {
            setLoading(false);
        }
    };

    const lock = async () => {
        try {
            await fetch("/api/playground/session", { method: "DELETE" });
        } catch {
            // Best-effort session cleanup.
        }
        setAuthenticated(false);
        setAuthError("");
        setSelectedVisitor(null);
    };

    if (!sessionChecked) {
        return (
            <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: "2rem", background: "radial-gradient(circle at top, #1f2937 0%, #020617 45%, #000 100%)", color: "#fff" }}>
                <p style={{ margin: 0, letterSpacing: "0.18em", textTransform: "uppercase", color: colors.ink3, fontWeight: 800 }}>Checking admin session…</p>
            </div>
        );
    }

    if (!authenticated) {
        return (
            <div className="playground-admin" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "6.5rem 1rem 2rem", background: "radial-gradient(circle at top, #1f2937 0%, #020617 45%, #000 100%)" }}>
                <style>{focusVisibleCss}</style>
                <TopBar authenticated={false} onLock={() => undefined} />
                <form
                    onSubmit={attemptLogin}
                    data-testid="playground-login-form"
                    style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", gap: "1.25rem", padding: "2rem", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "24px", background: "rgba(15, 23, 42, 0.9)", color: "#fff", boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }}
                >
                    <div>
                        <p style={{ margin: 0, fontSize: "0.75rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "#fca5a5" }}>Secure Admin</p>
                        <h1 style={{ margin: "0.5rem 0 0", fontSize: "2rem", fontWeight: 900 }}>Playground</h1>
                    </div>
                    <p style={{ margin: 0, color: colors.ink2, lineHeight: 1.6 }}>
                        Sign in with your management key to see who visits the site, where they come from, and what they do. Signing in also marks this browser as yours, so your own visits stay out of the numbers.
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
                        <p data-testid="playground-auth-error" role="alert" style={{ margin: 0, color: "#fca5a5", fontSize: "0.9rem" }}>{authError}</p>
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

    const tabProps = { filters, refreshKey, onUnauthorized: handleUnauthorized, openVisitor };
    const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];

    return (
        <div className="playground-admin" style={{ minHeight: "100vh", background: "radial-gradient(circle at top, rgba(14,165,233,0.14) 0%, rgba(2,6,23,0.96) 24%, #020617 56%, #000 100%)", padding: "6rem 1rem 4rem" }}>
            <style>{focusVisibleCss}</style>
            <TopBar authenticated onLock={() => void lock()} />
            <div style={{ maxWidth: "1340px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem", minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                        <p style={{ margin: 0, fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent, fontWeight: 800 }}>Admin dashboard</p>
                        <h1 style={{ margin: "0.3rem 0 0", fontSize: "clamp(1.5rem, 5vw, 2.1rem)", fontWeight: 900, color: colors.ink1 }}>Site analytics</h1>
                    </div>
                    <button type="button" onClick={() => setRefreshKey((k) => k + 1)} style={primaryButtonStyle}>Refresh</button>
                </div>

                <nav aria-label="Dashboard sections" style={{ display: "flex", gap: "0.35rem", overflowX: "auto", paddingBottom: "0.25rem", borderBottom: `1px solid ${colors.line}` }}>
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            aria-current={tab === t.id ? "page" : undefined}
                            onClick={() => {
                                setTab(t.id);
                                if (t.id !== "visitors") setSelectedVisitor(null);
                            }}
                            style={{
                                padding: "0.65rem 0.95rem",
                                border: "none",
                                borderBottom: `2px solid ${tab === t.id ? colors.accent : "transparent"}`,
                                background: "transparent",
                                color: tab === t.id ? colors.ink1 : colors.ink3,
                                fontWeight: 800,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </nav>

                <p style={{ margin: 0, color: colors.ink2, lineHeight: 1.55 }}>{activeTab.question}</p>

                {activeTab.filters && (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <select
                            aria-label="Date range"
                            value={filters.range}
                            onChange={(e) => setFilters((f) => ({ ...f, range: e.target.value as RangeKey }))}
                            style={inputStyle}
                        >
                            {RANGE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <Segmented label="Traffic" value={filters.traffic} options={TRAFFIC_OPTIONS} onChange={(traffic) => setFilters((f) => ({ ...f, traffic }))} />
                        <Segmented label="Device" value={filters.device} options={DEVICE_OPTIONS} onChange={(device) => setFilters((f) => ({ ...f, device }))} />
                    </div>
                )}

                {tab === "overview" && <OverviewTab {...tabProps} />}
                {tab === "activity" && <ActivityTab {...tabProps} />}
                {tab === "pageviews" && <PageViewsTab {...tabProps} />}
                {tab === "sources" && <AcquisitionTab {...tabProps} />}
                {tab === "content" && <ContentTab {...tabProps} />}
                {tab === "intent" && <IntentTab {...tabProps} />}
                {tab === "visitors" && <VisitorsTab {...tabProps} selectedVisitor={selectedVisitor} setSelectedVisitor={setSelectedVisitor} />}
                {tab === "inbox" && <InboxTab refreshKey={refreshKey} onUnauthorized={handleUnauthorized} />}
                {tab === "settings" && (
                    <DataTab
                        refreshKey={refreshKey}
                        onUnauthorized={handleUnauthorized}
                        onDataChanged={() => setRefreshKey((k) => k + 1)}
                        openVisitor={openVisitor}
                    />
                )}
            </div>
        </div>
    );
}

function TopBar({ authenticated, onLock }: { authenticated: boolean; onLock: () => void }) {
    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 160, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", background: "linear-gradient(180deg, rgba(2, 6, 23, 0.92), rgba(2, 6, 23, 0.8))", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ maxWidth: "1340px", margin: "0 auto", padding: "0.85rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <strong style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 900 }}>Trupal&apos;s Playground</strong>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Link href="/" style={{ ...buttonStyle, textDecoration: "none" }}>Back to website</Link>
                    <button
                        type="button"
                        onClick={onLock}
                        disabled={!authenticated}
                        aria-label={authenticated ? "Lock admin session" : "Admin session locked"}
                        style={{ ...buttonStyle, background: authenticated ? "#b91c1c" : "rgba(255,255,255,0.04)", color: "#fff", cursor: authenticated ? "pointer" : "default" }}
                    >
                        {authenticated ? "Lock" : "Locked"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Inline styles can't express :focus-visible, so scope a small rule to the dashboard root.
const focusVisibleCss = `
.playground-admin :is(button, a, input, select, textarea, summary, tr[tabindex]):focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
}
.playground-admin button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}
.playground-admin tbody tr:nth-child(even) {
    background: rgba(255,255,255,0.015);
}
.playground-admin tbody tr[tabindex]:hover {
    background: rgba(56,189,248,0.06);
}
`;
