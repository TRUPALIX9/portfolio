"use client";

import { useEffect, useMemo, useState } from "react";
import { IntentActions, describeEvent, type SessionSummary, type TabProps } from "./AnalyticsTabs";
import {
    DataTable,
    IntentPill,
    KindPill,
    LoadState,
    Panel,
    Pill,
    adminAction,
    adminFetch,
    buttonStyle,
    colors,
    dangerButtonStyle,
    fmtAgo,
    fmtDateTime,
    fmtDuration,
    fmtNumber,
    fmtPlace,
    inputStyle,
    primaryButtonStyle,
    useReport,
} from "./ui";

type Visitor = {
    visitor_id: string;
    custom_name?: string;
    first_seen: string;
    last_seen: string;
    session_count?: number;
    pageviews?: number;
    engaged_ms?: number;
    ip?: string;
    geo?: { city?: string; region?: string; country?: string };
    device?: { class?: string; os?: string; browser?: string; model?: string };
    lang?: string;
    tz?: string;
    isp?: string;
    org?: string;
    hosting?: boolean;
    proxy?: boolean;
    is_owner?: boolean;
    is_bot?: boolean;
    bot_reason?: string;
};

type VisitorDetail = {
    visitor: Visitor;
    sessions: SessionSummary[];
    timeline: { at: string; type: string; path: string; props?: Record<string, unknown>; session_id: string }[];
    sameIpVisitors: number;
};

export function visitorLabel(v: Visitor) {
    if (v.custom_name) return v.custom_name;
    const where = v.geo?.city || v.geo?.country || "Unknown place";
    return `${where} · ${v.device?.os ?? "?"} ${v.device?.class ?? ""}`.trim();
}

function visitorKind(v: Visitor) {
    if (v.is_owner) return "owner";
    if (v.is_bot) return "bot";
    if (v.hosting) return "datacenter";
    return "human";
}

export function VisitorsTab({ filters, refreshKey, onUnauthorized, selectedVisitor, setSelectedVisitor }: TabProps & {
    selectedVisitor: string | null;
    setSelectedVisitor: (id: string | null) => void;
}) {
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");

    // Debounce the search box so typing doesn't fire a request per keystroke.
    useEffect(() => {
        const id = window.setTimeout(() => setQuery(search), 300);
        return () => window.clearTimeout(id);
    }, [search]);

    const extra = useMemo(() => (query ? `&q=${encodeURIComponent(query)}` : ""), [query]);
    const { data, error, loading, reload } = useReport<{ visitors: Visitor[] }>("visitors", filters, refreshKey, extra, onUnauthorized);

    if (selectedVisitor) {
        return (
            <VisitorProfile
                visitorId={selectedVisitor}
                refreshKey={refreshKey}
                onBack={() => setSelectedVisitor(null)}
                onChanged={reload}
                onUnauthorized={onUnauthorized}
            />
        );
    }

    return (
        <Panel
            title="Visitors"
            description="One row per browser (a visitor id kept in a cookie and local storage). Seen in the selected period, newest first."
            actions={(
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, city, IP, network, OS"
                    aria-label="Search visitors"
                    style={{ ...inputStyle, width: "min(100%, 320px)" }}
                />
            )}
        >
            <LoadState loading={loading} error={error} empty={!data}>
                {data && (
                    <DataTable
                        rows={data.visitors}
                        rowKey={(v) => v.visitor_id}
                        onRowClick={(v) => setSelectedVisitor(v.visitor_id)}
                        empty={query ? "No visitors match that search." : "No visitors in this period yet."}
                        columns={[
                            { label: "Visitor", render: (v) => <><strong>{visitorLabel(v)}</strong><div style={{ color: colors.ink3, fontSize: "0.78rem" }}>{v.org || v.isp || v.ip || ""}</div></> },
                            { label: "Location", render: (v) => fmtPlace(v.geo) },
                            { label: "Visits", align: "right", render: (v) => fmtNumber(v.session_count ?? 0) },
                            { label: "Pages", align: "right", render: (v) => fmtNumber(v.pageviews ?? 0) },
                            { label: "Engaged", align: "right", render: (v) => fmtDuration(v.engaged_ms ?? 0) },
                            { label: "First seen", render: (v) => fmtDateTime(v.first_seen) },
                            { label: "Last seen", render: (v) => fmtAgo(v.last_seen) },
                            { label: "", render: (v) => <KindPill kind={visitorKind(v)} /> },
                        ]}
                    />
                )}
            </LoadState>
        </Panel>
    );
}

function VisitorProfile({ visitorId, refreshKey, onBack, onChanged, onUnauthorized }: {
    visitorId: string;
    refreshKey: number;
    onBack: () => void;
    onChanged: () => void;
    onUnauthorized: () => void;
}) {
    const [detail, setDetail] = useState<VisitorDetail | null>(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [name, setName] = useState("");
    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        adminFetch<VisitorDetail>(`/api/analytics/report?view=visitor&id=${encodeURIComponent(visitorId)}`)
            .then((d) => {
                if (cancelled) return;
                setDetail(d);
                setName(d.visitor.custom_name ?? "");
                setError("");
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                if (err instanceof Error && "unauthorized" in err && err.unauthorized) onUnauthorized();
                setError(err instanceof Error ? err.message : "Failed to load visitor.");
            });
        return () => {
            cancelled = true;
        };
    }, [visitorId, refreshKey, tick, onUnauthorized]);

    const run = async (body: Record<string, unknown>, confirmText?: string) => {
        if (confirmText && !window.confirm(confirmText)) return;
        setBusy(true);
        try {
            await adminAction(body);
            onChanged();
            if (body.action === "delete_visitor") onBack();
            else setTick((t) => t + 1);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Action failed.");
        } finally {
            setBusy(false);
        }
    };

    const eventsBySession = useMemo(() => {
        const map = new Map<string, VisitorDetail["timeline"]>();
        for (const e of detail?.timeline ?? []) map.set(e.session_id, [...(map.get(e.session_id) ?? []), e]);
        return map;
    }, [detail]);

    const back = <button type="button" onClick={onBack} style={buttonStyle}>← All visitors</button>;
    if (error) return <Panel title="Visitor" actions={back}><p role="alert" style={{ margin: 0, color: "#fecaca" }}>{error}</p></Panel>;
    if (!detail) return <Panel title="Visitor" actions={back}><p style={{ margin: 0, color: colors.ink3 }}>Loading…</p></Panel>;

    const v = detail.visitor;
    const facts: [string, string][] = [
        ["First seen", fmtDateTime(v.first_seen)],
        ["Last seen", `${fmtDateTime(v.last_seen)} (${fmtAgo(v.last_seen)})`],
        ["Visits · pages", `${fmtNumber(v.session_count ?? 0)} · ${fmtNumber(v.pageviews ?? 0)}`],
        ["Total engaged time", fmtDuration(v.engaged_ms ?? 0)],
        ["Location", fmtPlace(v.geo)],
        ["Device", [v.device?.class, v.device?.model, v.device?.os, v.device?.browser].filter(Boolean).join(" · ") || "Unknown"],
        ["Network", [v.org, v.isp].filter(Boolean).join(" / ") || "Not looked up yet"],
        ["IP", `${v.ip || "—"}${detail.sameIpVisitors ? ` (${detail.sameIpVisitors} other visitor${detail.sameIpVisitors > 1 ? "s" : ""} on this IP)` : ""}`],
        ["Language · time zone", [v.lang, v.tz].filter(Boolean).join(" · ") || "—"],
    ];

    return (
        <div style={{ display: "grid", gap: "1rem" }}>
            <Panel
                title={visitorLabel(v)}
                description={`Visitor ${v.visitor_id}`}
                actions={back}
            >
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                    <KindPill kind={visitorKind(v)} />
                    {v.bot_reason && <Pill label={`reason: ${v.bot_reason}`} />}
                    {v.proxy && <Pill label="VPN / PROXY" tone="warn" />}
                </div>
                <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "0.75rem 1.5rem", margin: 0 }}>
                    {facts.map(([label, value]) => (
                        <div key={label} style={{ minWidth: 0 }}>
                            <dt style={{ color: colors.ink3, fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</dt>
                            <dd style={{ margin: "0.2rem 0 0", color: colors.ink1, overflowWrap: "anywhere" }}>{value}</dd>
                        </div>
                    ))}
                </dl>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        void run({ action: "rename", visitorId: v.visitor_id, name });
                    }}
                    style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1.25rem" }}
                >
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Label this visitor (e.g. Recruiter at Acme)" aria-label="Visitor label" maxLength={60} style={{ ...inputStyle, flex: "1 1 240px" }} />
                    <button type="submit" disabled={busy} style={primaryButtonStyle}>Save label</button>
                </form>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                    <button type="button" disabled={busy} onClick={() => void run({ action: "set_owner", visitorId: v.visitor_id, value: !v.is_owner })} style={buttonStyle}>
                        {v.is_owner ? "Not me" : "This is me"}
                    </button>
                    <button type="button" disabled={busy} onClick={() => void run({ action: "set_bot", visitorId: v.visitor_id, value: !v.is_bot })} style={buttonStyle}>
                        {v.is_bot ? "Not a bot" : "Mark as bot"}
                    </button>
                    {v.ip && (
                        <button type="button" disabled={busy} onClick={() => void run({ action: "block_ip", ip: v.ip }, `Block ${v.ip}? Future visits from it won't be recorded, and existing ones are hidden as bot traffic.`)} style={buttonStyle}>
                            Block IP
                        </button>
                    )}
                    <button type="button" disabled={busy} onClick={() => void run({ action: "delete_visitor", visitorId: v.visitor_id }, "Permanently delete this visitor and all of their visits? This cannot be undone.")} style={dangerButtonStyle}>
                        Delete visitor
                    </button>
                </div>
            </Panel>

            <Panel title={`Visits (${detail.sessions.length})`} description="Newest first, each with what happened in order.">
                <div style={{ display: "grid", gap: "0.75rem" }}>
                    {detail.sessions.length === 0 && <p style={{ margin: 0, color: colors.ink3 }}>No visits recorded.</p>}
                    {detail.sessions.map((s) => {
                        const events = [...(eventsBySession.get(s.session_id) ?? [])].reverse();
                        return (
                            <details key={s.session_id} style={{ border: `1px solid ${colors.line}`, borderRadius: "14px", padding: "0.8rem 1rem", background: "rgba(255,255,255,0.02)" }}>
                                <summary style={{ cursor: "pointer", display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
                                    <strong>{fmtDateTime(s.started_at)}</strong>
                                    <span style={{ color: colors.ink2 }}>{s.channel}{s.referrer_host ? ` (${s.referrer_host})` : ""}</span>
                                    <span style={{ color: colors.ink3 }}>{fmtNumber(s.pages)} pages · {fmtDuration(s.engaged_ms)} engaged</span>
                                    <IntentPill score={s.score} />
                                    <KindPill kind={s.kind} />
                                </summary>
                                <div style={{ marginTop: "0.6rem", color: colors.ink2, fontSize: "0.82rem" }}>
                                    <IntentActions session={s} />
                                </div>
                                <ol style={{ margin: "0.6rem 0 0", paddingLeft: "1.2rem", display: "grid", gap: "0.2rem", fontSize: "0.84rem" }}>
                                    {events.map((e, i) => (
                                        <li key={`${e.at}-${i}`}>
                                            <span style={{ color: colors.ink3, fontVariantNumeric: "tabular-nums" }}>{new Date(e.at).toLocaleTimeString()}</span>{" "}
                                            {describeEvent(e)}
                                        </li>
                                    ))}
                                    {events.length === 0 && <li style={{ color: colors.ink3 }}>No individual events kept for this visit.</li>}
                                </ol>
                            </details>
                        );
                    })}
                </div>
            </Panel>
        </div>
    );
}
