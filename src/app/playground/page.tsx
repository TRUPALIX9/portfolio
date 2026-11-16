"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AcquisitionTab, ActivityTab, ContentTab, IntentTab, OverviewTab, PageViewsTab } from "@/components/admin/playground/AnalyticsTabs";
import { DataTab } from "@/components/admin/playground/DataTab";
import { InboxTab } from "@/components/admin/playground/InboxTab";
import { BingeTab } from "@/components/admin/playground/BingeTab";
import { ReviewTab } from "@/components/admin/playground/ReviewTab";
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
    { id: "review", label: "Review queue", group: "Review", question: "Everything visitors sent in: travel ideas, Binge suggestions and messages. Approve, dismiss or undo, one by one or in bulk.", filters: false },
    { id: "overview", group: "Analytics", label: "Overview", question: "How is the site doing? Headline numbers vs. the previous period, the trend, and who the audience is.", filters: true },
    { id: "activity", group: "Analytics", label: "Activity", question: "What did each visitor do? One card per device visit, with every page and click in order.", filters: true },
    { id: "pageviews", group: "Analytics", label: "Page views", question: "What was viewed, and by whom? Every page view, newest first.", filters: true },
    { id: "visitors", group: "Analytics", label: "Visitors", question: "Who are they? One row per device, with a full profile and history.", filters: true },
    { id: "sources", group: "Analytics", label: "Sources", question: "Where do visitors come from, and which sources bring engaged ones?", filters: true },
    { id: "content", group: "Analytics", label: "Content", question: "What do they read? Time, scroll and exits per page, and how far down the home page they get.", filters: true },
    { id: "intent", group: "Analytics", label: "Intent", question: "Who is interested? The path from visit to message, and the most promising visits.", filters: true },
    { id: "inbox", group: "Review", label: "Inbox", question: "Messages sent through the contact form.", filters: false },
    { id: "binge", group: "Manage", label: "Binge", question: "What you have watched: search series and films, tick seasons and episodes, star recommendations, and read visitor suggestions.", filters: false },
    { id: "settings", group: "Manage", label: "Settings", question: "Keep your own devices out of the numbers, block bots, share tagged links, and reset data.", filters: false },
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

    const [tab, setTab] = useState<TabId>("review");
    const [waiting, setWaiting] = useState(0);
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
            <div className="pg-shell" style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: "2rem" }}>
                <p className="pg-mono" style={{ margin: 0, letterSpacing: "0.18em", textTransform: "uppercase", color: colors.ink3 }}>Checking admin session…</p>
            </div>
        );
    }

    if (!authenticated) {
        return (
            <div className="playground-admin pg-shell pg-login">
                <style>{focusVisibleCss}</style>
                <TopBar authenticated={false} onLock={() => undefined} />
                <form onSubmit={attemptLogin} data-testid="playground-login-form" className="pg-login__card">
                    <div className="pg-login__strip"><span>PLAYGROUND · CONTROL PANEL</span><span>LOCKED</span></div>
                    <h1>Playground</h1>
                    <p>Sign in with your management key to review what visitors sent, see who visits, and manage Binge. Signing in also marks this browser as yours, so your own visits stay out of the numbers.</p>
                    <label>
                        <span className="pg-mono">KEY</span>
                        <input
                            type="password"
                            autoComplete="current-password"
                            autoFocus
                            value={key}
                            onChange={(event) => setKey(event.target.value)}
                            placeholder="Enter admin key"
                            data-testid="playground-key-input"
                        />
                    </label>
                    {authError && <p data-testid="playground-auth-error" role="alert" className="pg-login__err">{authError}</p>}
                    <button type="submit" disabled={loading || !key.trim()}>{loading ? "Checking…" : "Unlock"}</button>
                </form>
            </div>
        );
    }

    const tabProps = { filters, refreshKey, onUnauthorized: handleUnauthorized, openVisitor };
    const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];

    return (
        <div className="playground-admin pg-shell">
            <style>{focusVisibleCss}</style>
            <TopBar authenticated onLock={() => void lock()} />
            <div className="pg-layout">
                <nav aria-label="Dashboard sections" className="pg-side">
                    {(["Review", "Analytics", "Manage"] as const).map((g) => (
                        <div key={g} className="pg-side__group">
                            <p className="pg-mono">{g}</p>
                            {TABS.filter((t) => t.group === g).map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    aria-current={tab === t.id ? "page" : undefined}
                                    onClick={() => {
                                        setTab(t.id);
                                        if (t.id !== "visitors") setSelectedVisitor(null);
                                    }}
                                >
                                    {t.label}
                                    {t.id === "review" && waiting > 0 && <b>{waiting}</b>}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                <main className="pg-main">
                    <header className="pg-head">
                        <div>
                            <p className="pg-mono pg-head__kicker">{activeTab.group} · {activeTab.label}</p>
                            <h1>{activeTab.label}</h1>
                            <p>{activeTab.question}</p>
                        </div>
                        <button type="button" onClick={() => setRefreshKey((k) => k + 1)} style={primaryButtonStyle}>Refresh</button>
                    </header>

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

                {tab === "review" && <ReviewTab refreshKey={refreshKey} onUnauthorized={handleUnauthorized} onCount={setWaiting} />}
                {tab === "overview" && <OverviewTab {...tabProps} />}
                {tab === "activity" && <ActivityTab {...tabProps} />}
                {tab === "pageviews" && <PageViewsTab {...tabProps} />}
                {tab === "sources" && <AcquisitionTab {...tabProps} />}
                {tab === "content" && <ContentTab {...tabProps} />}
                {tab === "intent" && <IntentTab {...tabProps} />}
                {tab === "visitors" && <VisitorsTab {...tabProps} selectedVisitor={selectedVisitor} setSelectedVisitor={setSelectedVisitor} />}
                {tab === "inbox" && <InboxTab refreshKey={refreshKey} onUnauthorized={handleUnauthorized} />}
                {tab === "binge" && <BingeTab refreshKey={refreshKey} onUnauthorized={handleUnauthorized} />}
                {tab === "settings" && (
                    <DataTab
                        refreshKey={refreshKey}
                        onUnauthorized={handleUnauthorized}
                        onDataChanged={() => setRefreshKey((k) => k + 1)}
                        openVisitor={openVisitor}
                    />
                )}
                </main>
            </div>
        </div>
    );
}

function TopBar({ authenticated, onLock }: { authenticated: boolean; onLock: () => void }) {
    return (
        <div className="pg-bar">
            <strong><img src="/logo-penrose.png" alt="" width={22} height={22} /> Trupal&apos;s Playground</strong>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Link href="/" style={{ ...buttonStyle, textDecoration: "none" }}>Back to website</Link>
                <button
                    type="button"
                    onClick={onLock}
                    disabled={!authenticated}
                    aria-label={authenticated ? "Lock admin session" : "Admin session locked"}
                    style={{ ...buttonStyle, background: authenticated ? colors.ink1 : "#fafaf7", color: authenticated ? "#fafaf7" : colors.ink3 }}
                >
                    {authenticated ? "Lock" : "Locked"}
                </button>
            </div>
        </div>
    );
}

// Inline styles can't express :focus-visible, so scope a small rule to the dashboard root.
const focusVisibleCss = `
/* Binge: views, swipe deck, season checklist, updates */
.bs-views { display: inline-flex; border: 1px solid #111; justify-self: start; }
.bs-views button { padding: 0.55rem 1rem; border: 0; border-right: 1px solid #d9d7cf; background: #fff; font: inherit; font-weight: 600; cursor: pointer; }
.bs-views button:last-child { border-right: 0; }
.bs-views button[aria-selected='true'] { background: #111; color: #fafaf7; }
.bs-sources { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 0.9rem; }
.bs-sources button { padding: 0.35rem 0.75rem; border: 1px solid #d9d7cf; background: #fff; font: inherit; font-size: 0.85rem; cursor: pointer; }
.bs-sources button b { font-family: var(--font-plex-mono), monospace; font-size: 0.72rem; margin-left: 0.2rem; color: #ea580c; }
.bs-sources button[aria-checked='true'] { border-color: #111; background: #111; color: #fafaf7; }
.bs-stage { position: relative; height: min(560px, 74vh); display: grid; place-items: center; overflow: hidden; }
.bs-card { position: absolute; width: min(360px, 92%); height: 100%; max-height: 540px; display: flex; flex-direction: column; background: #fff; border: 1px solid #111; box-shadow: 6px 6px 0 #111; touch-action: none; user-select: none; cursor: grab; overflow: hidden; }
.bs-card:active { cursor: grabbing; }
.bs-card--next { transform: scale(0.95) translateY(10px); box-shadow: none; opacity: 0.6; pointer-events: none; }
.bs-card[data-hint='right'] { box-shadow: 6px 6px 0 #ea580c; }
.bs-card[data-hint='left'] { box-shadow: 6px 6px 0 #666; }
.bs-card[data-hint='up'] { box-shadow: 6px 6px 0 #16a34a; }
.bs-art { flex: 1; min-height: 0; background: #f3f2ec; display: grid; place-items: center; overflow: hidden; }
.bs-art img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
.bs-art span { font-size: 4rem; font-weight: 600; color: #bdbab0; }
.bs-info { padding: 0.9rem 1rem 1rem; display: grid; gap: 0.35rem; border-top: 1px solid #111; }
.bs-info h3 { margin: 0; font-size: 1.25rem; font-weight: 600; letter-spacing: -0.01em; }
.bs-info h3 small { font-weight: 400; color: #666; }
.bs-info p { margin: 0; color: #444; font-size: 0.9rem; }
.bs-date { font-family: var(--font-plex-mono), monospace; color: #ea580c !important; }
.bs-genres { font-family: var(--font-plex-mono), monospace; font-size: 0.72rem !important; color: #666 !important; }
.bs-tag { justify-self: start; font-family: var(--font-plex-mono), monospace; font-size: 0.66rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.1rem 0.45rem; background: #111; color: #fafaf7; }
.bs-tag[data-kind='coming_soon'], .bs-tag[data-kind='new_season'] { background: #ea580c; }
.bs-tag[data-kind='watching'] { background: #b45309; }
.bs-bar { height: 6px; background: #eee; }
.bs-bar i { display: block; height: 100%; background: #16a34a; }
.bs-stamp { position: absolute; top: 18px; padding: 0.3rem 0.7rem; border: 3px solid; font-family: var(--font-plex-mono), monospace; font-weight: 700; font-size: 1rem; text-transform: uppercase; background: rgb(255 255 255 / 0.92); opacity: 0; transition: opacity 120ms; pointer-events: none; }
.bs-stamp[data-on='true'] { opacity: 1; }
.bs-stamp--right { left: 16px; color: #ea580c; transform: rotate(-12deg); }
.bs-stamp--left { right: 16px; color: #555; transform: rotate(12deg); }
.bs-stamp--up { left: 50%; top: auto; bottom: 120px; transform: translateX(-50%); color: #16a34a; }
.bs-buttons { display: flex; justify-content: center; gap: 0.6rem; flex-wrap: wrap; margin-top: 1rem; }
.bs-buttons button { min-width: 120px; min-height: 44px; }
.bs-sheet { position: fixed; inset: 0; z-index: 200; display: grid; place-items: end center; background: rgb(17 17 17 / 0.45); }
.bs-sheet__card { width: min(520px, 100%); max-height: 80vh; overflow: auto; background: #fff; border: 1px solid #111; border-bottom: 0; padding: 1.1rem 1.2rem 1.3rem; animation: bs-up 260ms cubic-bezier(.2,.9,.3,1); }
@keyframes bs-up { from { transform: translateY(40px); opacity: 0; } }
.bs-sheet__card h3 { margin: 0 0 0.7rem; font-size: 1.1rem; font-weight: 600; }
.bs-sheet__quick { display: flex; gap: 0.4rem; margin-bottom: 0.6rem; }
.bs-sheet__card ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.bs-sheet__card li label { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.7rem; border: 1px solid #d9d7cf; cursor: pointer; }
.bs-sheet__card li label:has(input:checked) { border-color: #16a34a; background: rgb(22 163 74 / 0.08); }
.bs-sheet__card li small { color: #666; }
.bs-sheet__actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.9rem; }
.bu-group + .bu-group { margin-top: 1rem; }
.bu-group header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.4rem; border-bottom: 1px solid #111; margin-bottom: 0.5rem; }
.bu-group ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.bu-group li { display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; gap: 0.75rem; align-items: center; padding: 0.55rem 0.7rem; border: 1px solid #d9d7cf; background: #fff; }
.bu-group li img, .bu-ph { width: 44px; height: 60px; object-fit: cover; background: #f3f2ec; display: grid; place-items: center; color: #999; }
.bu-group li div:nth-child(2) { display: grid; min-width: 0; }
.bu-group li small { color: #444; }
.bu-actions { display: flex; gap: 0.35rem; }
@media (max-width: 640px) { .bu-group li { grid-template-columns: 44px minmax(0, 1fr); } .bu-actions { grid-column: 1 / -1; } }
@media (prefers-reduced-motion: reduce) { .bs-card { transition: none !important; } .bs-sheet__card { animation: none; } }

.playground-admin :is(button, a, input, select, textarea, summary, tr[tabindex]):focus-visible { outline: 2px solid #ea580c; outline-offset: 2px; }
.playground-admin button:disabled { cursor: not-allowed; opacity: 0.6; }
.playground-admin tbody tr:nth-child(even) { background: rgba(17,17,17,0.025); }
.playground-admin tbody tr[tabindex]:hover { background: rgba(234,88,12,0.06); }
.pg-shell { min-height: 100vh; background: #fafaf7; color: #111; font-family: var(--font-plex), 'IBM Plex Sans', system-ui, sans-serif;
  background-image: linear-gradient(rgb(17 17 17 / 0.045) 1px, transparent 1px), linear-gradient(90deg, rgb(17 17 17 / 0.045) 1px, transparent 1px); background-size: 24px 24px; }
.pg-mono { font-family: var(--font-plex-mono), ui-monospace, monospace; font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: #666; margin: 0; }
.pg-bar { position: sticky; top: 0; z-index: 50; display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.7rem clamp(12px, 3vw, 28px); background: rgb(250 250 247 / 0.94); backdrop-filter: blur(8px); border-bottom: 1px solid #111; }
.pg-bar strong { display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 600; font-family: var(--font-plex-mono), ui-monospace, monospace; }
.pg-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: clamp(12px, 2.4vw, 28px); max-width: 1420px; margin: 0 auto; padding: 1.4rem clamp(12px, 3vw, 28px) 4rem; }
.pg-side { position: sticky; top: 70px; align-self: start; display: grid; gap: 1rem; }
.pg-side__group { display: grid; gap: 2px; }
.pg-side__group .pg-mono { padding: 0 0 0.35rem; border-bottom: 1px solid #111; margin-bottom: 0.25rem; }
.pg-side button { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.65rem; border: 1px solid transparent; background: transparent; color: #444; font: inherit; font-size: 0.92rem; text-align: left; cursor: pointer; }
.pg-side button:hover { background: #fff; border-color: #d9d7cf; color: #111; }
.pg-side button[aria-current='page'] { background: #111; color: #fafaf7; border-color: #111; }
.pg-side button b { font-family: var(--font-plex-mono), ui-monospace, monospace; font-size: 0.7rem; padding: 0 0.4rem; background: #ea580c; color: #fff; }
.pg-main { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
.pg-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; flex-wrap: wrap; padding-bottom: 0.8rem; border-bottom: 1px dotted #bdbab0; }
.pg-head__kicker { color: #ea580c; }
.pg-head h1 { margin: 0.25rem 0 0.3rem; font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 600; letter-spacing: -0.02em; }
.pg-head p:last-child { margin: 0; color: #444; max-width: 70ch; line-height: 1.5; }
.pg-login { display: grid; place-items: center; padding-bottom: 3rem; }
.pg-login .pg-bar { position: fixed; inset: 0 0 auto; }
.pg-login__card { width: min(440px, 92vw); display: flex; flex-direction: column; gap: 1rem; padding: 0 0 1.4rem; background: #fff; border: 1px solid #111; box-shadow: 6px 6px 0 #ea580c; }
.pg-login__strip { display: flex; justify-content: space-between; padding: 0.6rem 1rem; background: #111; color: #fafaf7; font-family: var(--font-plex-mono), ui-monospace, monospace; font-size: 0.7rem; letter-spacing: 0.12em; }
.pg-login__strip span:last-child { color: #ea580c; }
.pg-login__card > :not(.pg-login__strip) { margin-left: 1.3rem; margin-right: 1.3rem; }
.pg-login__card h1 { margin: 0.4rem 1.3rem 0; font-size: 2.2rem; font-weight: 600; letter-spacing: -0.03em; }
.pg-login__card p { margin: 0; color: #444; line-height: 1.6; }
.pg-login__card label { display: grid; gap: 0.4rem; }
.pg-login__card input { padding: 0.75rem 0.9rem; border: 1px solid #bdbab0; background: #fafaf7; font: inherit; }
.pg-login__card input:focus { outline: 2px solid #ea580c; outline-offset: -1px; }
.pg-login__card button { padding: 0.8rem; border: 1px solid #111; background: #111; color: #fafaf7; font-family: var(--font-plex-mono), ui-monospace, monospace; letter-spacing: 0.08em; cursor: pointer; }
.pg-login__card button:hover:not(:disabled) { background: #ea580c; border-color: #ea580c; }
.pg-login__err { color: #b91c1c !important; }
@media (max-width: 860px) {
  .pg-layout { grid-template-columns: minmax(0, 1fr); }
  .pg-side { position: static; display: flex; gap: 0.6rem; overflow-x: auto; }
  .pg-side__group { display: flex; gap: 2px; }
  .pg-side__group .pg-mono { display: none; }
  .pg-side button { white-space: nowrap; }
}
`;
