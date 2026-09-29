"use client";

import { useEffect, useMemo, useState } from "react";
import {
    BarList,
    ColumnChart,
    DataTable,
    Grid,
    IntentPill,
    KindPill,
    LoadState,
    Panel,
    StatCard,
    buttonStyle,
    colors,
    countryName,
    deviceIcon,
    fmtAgo,
    fmtDateTime,
    fmtDuration,
    fmtNumber,
    fmtPct,
    fmtPlace,
    inputStyle,
    useReport,
    type ReportFilters,
} from "./ui";

export type TabProps = {
    filters: ReportFilters;
    refreshKey: number;
    onUnauthorized: () => void;
    openVisitor: (visitorId: string) => void;
};

type Summary = {
    visitors: number;
    newVisitors: number;
    returningVisitors: number;
    sessions: number;
    pageViews: number;
    pagesPerSession: number;
    avgEngagedMs: number;
    bounceRate: number;
    intentClicks: number;
    intentSessions: number;
    contactStarts: number;
    contactSubmits: number;
};

type Count = { label: string; count: number };

export type SessionSummary = {
    session_id: string;
    visitor_id: string;
    started_at: string;
    last_at: string;
    landing_path: string;
    exit_path: string | null;
    channel: string;
    referrer_host: string | null;
    geo: { city?: string; region?: string; country?: string };
    device: { class?: string; os?: string; browser?: string; model?: string };
    pages: number;
    paths: string[];
    engaged_ms: number;
    outbound: Record<string, number>;
    contact: number;
    score: number;
    kind: string;
};

// ── Overview ──────────────────────────────────────────────────────────────────

type OverviewData = {
    range: string;
    current: Summary;
    previous: Summary | null;
    series: { label: string; sessions: number; visitors: number; intent: number }[];
    audience: { devices: Count[]; countries: Count[]; browsers: Count[]; os: Count[] };
    health: {
        excluded: { owner: number; bot: number; datacenter: number };
        jsErrors: number;
        rageClicks: number;
        vitals: { LCP: number | null; INP: number | null; CLS: number | null };
    };
};

// Core Web Vitals "good" thresholds (CLS is stored x1000).
const VITAL_LIMITS = {
    LCP: { good: 2500, poor: 4000, format: (v: number) => `${(v / 1000).toFixed(2)}s` },
    INP: { good: 200, poor: 500, format: (v: number) => `${Math.round(v)}ms` },
    CLS: { good: 100, poor: 250, format: (v: number) => (v / 1000).toFixed(3) },
} as const;

export function OverviewTab({ filters, refreshKey, onUnauthorized }: TabProps) {
    const { data, error, loading } = useReport<OverviewData>("overview", filters, refreshKey, "", onUnauthorized);
    const cur = data?.current;
    const prev = data?.previous;

    return (
        <LoadState loading={loading} error={error} empty={!data}>
            {data && cur && (
                <div style={{ display: "grid", gap: "1rem" }}>
                    <Grid min={190}>
                        <StatCard title="Visitors" value={fmtNumber(cur.visitors)} current={cur.visitors} previous={prev?.visitors} hint={`${fmtNumber(cur.newVisitors)} new · ${fmtNumber(cur.returningVisitors)} returning`} />
                        <StatCard title="Visits" value={fmtNumber(cur.sessions)} current={cur.sessions} previous={prev?.sessions} hint={`${fmtNumber(cur.pageViews)} page views`} />
                        <StatCard title="Avg. engaged time" value={fmtDuration(cur.avgEngagedMs)} current={cur.avgEngagedMs} previous={prev?.avgEngagedMs} hint="Active, visible time per visit" />
                        <StatCard title="Pages / visit" value={fmtNumber(cur.pagesPerSession, 1)} current={cur.pagesPerSession} previous={prev?.pagesPerSession} hint={`${fmtPct(cur.bounceRate)} bounced`} />
                        <StatCard title="Profile & email clicks" value={fmtNumber(cur.intentClicks)} current={cur.intentClicks} previous={prev?.intentClicks} hint={`${fmtNumber(cur.intentSessions)} visits showed intent`} />
                        <StatCard title="Messages sent" value={fmtNumber(cur.contactSubmits)} current={cur.contactSubmits} previous={prev?.contactSubmits} hint={`${fmtNumber(cur.contactStarts)} started the form`} />
                    </Grid>

                    <Panel title={filters.range === "24h" ? "Visits by hour" : "Visits by day"} description="Hover a column for visitors and high-intent visits.">
                        <ColumnChart
                            valueLabel="Visits"
                            data={data.series.map((d) => ({ label: d.label, value: d.sessions, sub: `${d.visitors} visitors · ${d.intent} with intent` }))}
                        />
                    </Panel>

                    <Grid min={260}>
                        <Panel title="Devices">
                            <BarList items={data.audience.devices.map((d) => ({ label: d.label, value: d.count }))} />
                        </Panel>
                        <Panel title="Countries">
                            <BarList items={data.audience.countries.map((d) => ({ label: countryName(d.label), value: d.count }))} />
                        </Panel>
                        <Panel title="Browsers & OS">
                            <BarList items={[...data.audience.browsers, ...data.audience.os.map((o) => ({ ...o, label: `${o.label} (OS)` }))].map((d) => ({ label: d.label, value: d.count }))} />
                        </Panel>
                    </Grid>

                    <Panel title="Data quality" description="Visits in this period that the Traffic filter can hide, and how fast the site feels (75th percentile).">
                        <Grid min={170}>
                            <StatCard title="Your own visits" value={fmtNumber(data.health.excluded.owner)} hint={filters.traffic === "human" ? "Hidden from these numbers" : "Included by the Traffic filter"} />
                            <StatCard title="Bots" value={fmtNumber(data.health.excluded.bot)} hint="User agent, automation, or blocked IP" />
                            <StatCard title="Datacenter, no engagement" value={fmtNumber(data.health.excluded.datacenter)} hint="Cloud/VPN IPs with under 5s of activity" />
                            <StatCard title="JS errors" value={fmtNumber(data.health.jsErrors)} hint={`${fmtNumber(data.health.rageClicks)} rage clicks`} />
                            {(Object.keys(VITAL_LIMITS) as (keyof typeof VITAL_LIMITS)[]).map((name) => {
                                const value = data.health.vitals[name];
                                const limit = VITAL_LIMITS[name];
                                const rating = value === null ? "No data yet" : value <= limit.good ? "Good" : value <= limit.poor ? "Needs work" : "Poor";
                                return <StatCard key={name} title={`${name} (p75)`} value={value === null ? "—" : limit.format(value)} hint={rating} />;
                            })}
                        </Grid>
                    </Panel>
                </div>
            )}
        </LoadState>
    );
}

// ── Acquisition ───────────────────────────────────────────────────────────────

type AcquisitionData = {
    channels: {
        channel: string;
        sessions: number;
        visitors: number;
        avgEngagedMs: number;
        pagesPerSession: number;
        bounceRate: number;
        intentRate: number;
        contacts: number;
    }[];
    referrers: Count[];
    campaigns: Count[];
    landingPages: Count[];
    cities: Count[];
};

export function AcquisitionTab({ filters, refreshKey, onUnauthorized }: TabProps) {
    const { data, error, loading } = useReport<AcquisitionData>("acquisition", filters, refreshKey, "", onUnauthorized);
    const toItems = (list: Count[]) => list.map((d) => ({ label: d.label, value: d.count }));

    return (
        <LoadState loading={loading} error={error} empty={!data}>
            {data && (
                <div style={{ display: "grid", gap: "1rem" }}>
                    <Panel title="Channels" description="Where visits came from, and which sources bring engaged, high-intent visitors.">
                        <DataTable
                            rows={data.channels}
                            rowKey={(r) => r.channel}
                            empty="No visits in this period yet."
                            columns={[
                                { label: "Channel", render: (r) => <strong>{r.channel}</strong> },
                                { label: "Visits", align: "right", render: (r) => fmtNumber(r.sessions) },
                                { label: "Visitors", align: "right", render: (r) => fmtNumber(r.visitors) },
                                { label: "Engaged", align: "right", render: (r) => fmtDuration(r.avgEngagedMs) },
                                { label: "Pages", align: "right", render: (r) => fmtNumber(r.pagesPerSession, 1) },
                                { label: "Bounce", align: "right", render: (r) => fmtPct(r.bounceRate) },
                                { label: "Intent", align: "right", render: (r) => fmtPct(r.intentRate) },
                                { label: "Messages", align: "right", render: (r) => fmtNumber(r.contacts) },
                            ]}
                        />
                    </Panel>
                    <Grid min={300}>
                        <Panel title="Referring sites">
                            <BarList items={toItems(data.referrers)} empty="No external referrers yet." />
                        </Panel>
                        <Panel title="Tagged links" description="Visits from links with ?ref= or utm_ tags. Add ?ref=resume or ?ref=linkedin to the links you share so they stop showing up as Direct.">
                            <BarList items={toItems(data.campaigns)} empty="No tagged links used yet." />
                        </Panel>
                        <Panel title="Landing pages">
                            <BarList items={toItems(data.landingPages)} />
                        </Panel>
                        <Panel title="Cities">
                            <BarList items={toItems(data.cities)} empty="No city data (only available on the live site)." />
                        </Panel>
                    </Grid>
                </div>
            )}
        </LoadState>
    );
}

// ── Content ───────────────────────────────────────────────────────────────────

type ContentData = {
    pages: {
        path: string;
        kind: string;
        views: number;
        visitors: number;
        avgActiveMs: number;
        avgScroll: number;
        entrances: number;
        exits: number;
        exitRate: number;
    }[];
    homeViews: number;
    sectionReach: { section: string; views: number; rate: number }[];
};

const PAGE_KINDS = ["all", "home", "projects", "products", "experience", "other"] as const;

export function ContentTab({ filters, refreshKey, onUnauthorized }: TabProps) {
    const { data, error, loading } = useReport<ContentData>("content", filters, refreshKey, "", onUnauthorized);
    const [kind, setKind] = useState<(typeof PAGE_KINDS)[number]>("all");
    const pages = useMemo(() => (data?.pages ?? []).filter((p) => {
        if (kind === "all") return true;
        if (kind === "other") return !["home", "projects", "products", "experience"].includes(p.kind);
        return p.kind === kind;
    }), [data, kind]);

    return (
        <LoadState loading={loading} error={error} empty={!data}>
            {data && (
                <div style={{ display: "grid", gap: "1rem" }}>
                    <Panel title="How far down the home page people get" description={`Share of ${fmtNumber(data.homeViews)} home page views that reached each section.`}>
                        <BarList
                            items={data.sectionReach.map((s) => ({ label: s.section[0].toUpperCase() + s.section.slice(1), value: s.rate, hint: `${fmtNumber(s.views)} views` }))}
                            format={fmtPct}
                            empty="No home page views yet."
                        />
                    </Panel>
                    <Panel
                        title="Pages"
                        description="Engaged time and scroll are averaged over views that had any activity. Exit rate is the share of views that ended the visit."
                        actions={(
                            <select aria-label="Filter pages by type" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} style={inputStyle}>
                                {PAGE_KINDS.map((k) => <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</option>)}
                            </select>
                        )}
                    >
                        <DataTable
                            rows={pages}
                            rowKey={(r) => r.path}
                            columns={[
                                { label: "Page", render: (r) => <span style={{ overflowWrap: "anywhere" }}>{r.path}</span> },
                                { label: "Views", align: "right", render: (r) => fmtNumber(r.views) },
                                { label: "Visitors", align: "right", render: (r) => fmtNumber(r.visitors) },
                                { label: "Engaged", align: "right", render: (r) => fmtDuration(r.avgActiveMs) },
                                { label: "Scroll", align: "right", render: (r) => `${Math.round(r.avgScroll)}%` },
                                { label: "Entrances", align: "right", render: (r) => fmtNumber(r.entrances) },
                                { label: "Exit rate", align: "right", render: (r) => fmtPct(r.exitRate) },
                            ]}
                        />
                    </Panel>
                </div>
            )}
        </LoadState>
    );
}

// ── Intent ────────────────────────────────────────────────────────────────────

type IntentData = {
    funnel: { step: string; sessions: number }[];
    targets: { target: string; clicks: number }[];
    placements: Count[];
    links: Count[];
    hot: SessionSummary[];
};

const TARGET_LABELS: Record<string, string> = {
    github: "GitHub", linkedin: "LinkedIn", email: "Email", instagram: "Instagram", x: "X",
    logicsprint: "LogicSprint site", app_store: "App store", live_demo: "Live demos", other: "Other sites",
};

export function IntentTab({ filters, refreshKey, onUnauthorized, openVisitor }: TabProps) {
    const { data, error, loading } = useReport<IntentData>("intent", filters, refreshKey, "", onUnauthorized);
    const top = data?.funnel[0]?.sessions || 0;

    return (
        <LoadState loading={loading} error={error} empty={!data}>
            {data && (
                <div style={{ display: "grid", gap: "1rem" }}>
                    <Panel title="Visitor journey" description="How many visits reached each step. Percentages are of all visits.">
                        <BarList
                            items={data.funnel.map((f) => ({ label: f.step, value: f.sessions, hint: top ? fmtPct(f.sessions / top) : undefined }))}
                        />
                    </Panel>
                    <Panel title="Highest-intent visits" description="Scored by messages (8), GitHub/LinkedIn/email clicks (3 each), case-study views (1 each) and a minute or more of engagement (2). Click a row for the visitor's full history.">
                        <DataTable
                            rows={data.hot}
                            rowKey={(r) => r.session_id}
                            onRowClick={(r) => openVisitor(r.visitor_id)}
                            empty="No high-intent visits in this period yet."
                            columns={[
                                { label: "When", render: (r) => fmtDateTime(r.started_at) },
                                { label: "Score", render: (r) => <IntentPill score={r.score} /> },
                                { label: "From", render: (r) => <>{r.channel}<div style={{ color: colors.ink3, fontSize: "0.78rem" }}>{fmtPlace(r.geo)}</div></> },
                                { label: "Did", render: (r) => <IntentActions session={r} /> },
                                { label: "Pages", render: (r) => <span style={{ color: colors.ink2, fontSize: "0.8rem" }}>{r.paths.join(" → ")}</span> },
                                { label: "Engaged", align: "right", render: (r) => fmtDuration(r.engaged_ms) },
                            ]}
                        />
                    </Panel>
                    <Grid min={300}>
                        <Panel title="Outbound clicks by destination">
                            <BarList items={data.targets.map((t) => ({ label: TARGET_LABELS[t.target] ?? t.target, value: t.clicks }))} empty="No outbound clicks yet." />
                        </Panel>
                        <Panel title="Where on the page they clicked">
                            <BarList items={data.placements.map((p) => ({ label: p.label, value: p.count }))} empty="No outbound clicks yet." />
                        </Panel>
                        <Panel title="Top links">
                            <BarList items={data.links.map((p) => ({ label: p.label, value: p.count }))} empty="No outbound clicks yet." />
                        </Panel>
                    </Grid>
                </div>
            )}
        </LoadState>
    );
}

export function IntentActions({ session }: { session: SessionSummary }) {
    const parts = Object.entries(session.outbound)
        .filter(([, n]) => n > 0)
        .map(([target, n]) => `${TARGET_LABELS[target] ?? target}${n > 1 ? ` ×${n}` : ""}`);
    if (session.contact) parts.unshift("Sent a message");
    return <span style={{ fontSize: "0.82rem" }}>{parts.join(", ") || "Read case studies"}</span>;
}

// ── Activity (device-wise journeys) ────────────────────────────────────────────

type JourneyStep = { at: string; type: string; path: string; props?: Record<string, unknown>; active_ms?: number; max_scroll?: number };
type Journey = SessionSummary & { visitor_name: string | null; steps: JourneyStep[] };
type ActivityData = { active: SessionSummary[]; journeys: Journey[] };

export function describeEvent(event: { type: string; path: string; props?: Record<string, unknown> }) {
    const p = event.props ?? {};
    switch (event.type) {
        case "page_view": return `Viewed ${event.path}`;
        case "section_view": return `Reached the ${String(p.section)} section`;
        case "outbound_click": return `Clicked ${TARGET_LABELS[String(p.target)] ?? String(p.target)}${p.placement ? ` (${String(p.placement)})` : ""}${p.url && p.url !== "mailto" ? ` → ${String(p.url)}` : ""}`;
        case "contact_start": return "Started the contact form";
        case "contact_submit": return "Sent a message";
        case "contact_error": return `Contact form failed (${String(p.reason)})`;
        case "rage_click": return `Rage-clicked ${String(p.element)} on ${event.path}`;
        case "js_error": return `JS error on ${event.path}: ${String(p.message)}`;
        case "web_vital": return `${String(p.name)} ${String(p.value)}`;
        default: return `${event.type} on ${event.path}`;
    }
}

const STEP_TONE: Record<string, string> = {
    page_view: colors.ink1,
    section_view: colors.ink3,
    outbound_click: colors.accent,
    contact_start: colors.good,
    contact_submit: colors.good,
    contact_error: colors.bad,
    rage_click: colors.warn,
    js_error: colors.bad,
};

function JourneyCard({ journey, onOpen }: { journey: Journey; onOpen: () => void }) {
    const d = journey.device;
    const who = journey.visitor_name || `${d.os ?? "Unknown OS"} · ${d.browser ?? "browser"}`;
    return (
        <article style={{ border: `1px solid ${colors.line}`, borderRadius: "16px", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
            <header style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", padding: "0.85rem 1rem", borderBottom: `1px solid ${colors.line}`, background: "rgba(255,255,255,0.03)" }}>
                <div style={{ display: "flex", gap: "0.7rem", alignItems: "center", minWidth: 0 }}>
                    <span aria-hidden="true" style={{ fontSize: "1.4rem" }}>{deviceIcon(d.class)}</span>
                    <div style={{ minWidth: 0 }}>
                        <strong style={{ color: colors.ink1, overflowWrap: "anywhere" }}>{who}</strong>
                        <div style={{ color: colors.ink3, fontSize: "0.8rem" }}>
                            {d.class ?? "desktop"}{d.model ? ` · ${d.model}` : ""} · {fmtPlace(journey.geo)} · via {journey.channel}{journey.referrer_host ? ` (${journey.referrer_host})` : ""}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ color: colors.ink3, fontSize: "0.8rem", fontVariantNumeric: "tabular-nums" }}>
                        {fmtDateTime(journey.started_at)} · {fmtNumber(journey.pages)} pages · {fmtDuration(journey.engaged_ms)}
                    </span>
                    <KindPill kind={journey.kind} />
                    <IntentPill score={journey.score} />
                    <button type="button" onClick={onOpen} style={{ ...buttonStyle, padding: "0.35rem 0.7rem", fontSize: "0.78rem" }}>Visitor profile</button>
                </div>
            </header>
            <ol style={{ listStyle: "none", margin: 0, padding: "0.6rem 1rem 0.8rem", display: "grid", gap: "0.15rem" }}>
                {journey.steps.map((step, i) => (
                    <li key={`${step.at}-${i}`} style={{ display: "grid", gridTemplateColumns: "4.8rem minmax(0, 1fr)", gap: "0.75rem", fontSize: "0.84rem", paddingLeft: step.type === "page_view" ? 0 : "0.9rem" }}>
                        <span style={{ color: colors.ink3, fontVariantNumeric: "tabular-nums" }}>
                            {new Date(step.at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" })}
                        </span>
                        <span style={{ color: STEP_TONE[step.type] ?? colors.ink2, fontWeight: step.type === "page_view" ? 800 : 500, overflowWrap: "anywhere" }}>
                            {describeEvent(step)}
                            {step.type === "page_view" && (step.active_ms !== undefined || step.max_scroll !== undefined) && (
                                <span style={{ color: colors.ink3, fontWeight: 500 }}> · {fmtDuration(step.active_ms ?? 0)} · {Math.round(step.max_scroll ?? 0)}% scrolled</span>
                            )}
                        </span>
                    </li>
                ))}
                {journey.steps.length === 0 && <li style={{ color: colors.ink3, fontSize: "0.84rem" }}>No individual steps recorded.</li>}
            </ol>
        </article>
    );
}

export function ActivityTab({ filters, refreshKey, onUnauthorized, openVisitor }: TabProps) {
    const { data, error, loading, reload } = useReport<ActivityData>("live", filters, refreshKey, "", onUnauthorized);

    useEffect(() => {
        const id = window.setInterval(reload, 30_000);
        return () => window.clearInterval(id);
    }, [reload]);

    return (
        <LoadState loading={loading} error={error} empty={!data}>
            {data && (
                <div style={{ display: "grid", gap: "1rem" }}>
                    <Panel title={`On the site now (${data.active.length})`} description="Active in the last 30 minutes. Refreshes every 30 seconds.">
                        {data.active.length === 0 ? (
                            <p style={{ margin: 0, color: colors.ink3 }}>Nobody is on the site right now.</p>
                        ) : (
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                {data.active.map((s) => (
                                    <button key={s.session_id} type="button" onClick={() => openVisitor(s.visitor_id)} style={{ ...buttonStyle, display: "inline-flex", gap: "0.45rem", alignItems: "center", fontWeight: 600 }}>
                                        <span aria-hidden="true">{deviceIcon(s.device.class)}</span>
                                        {s.device.os ?? "Unknown"} · {s.device.browser ?? "browser"}{fmtPlace(s.geo) !== "Unknown" ? ` · ${fmtPlace(s.geo)}` : ""} · on {s.exit_path ?? s.landing_path} · {fmtAgo(s.last_at)}
                                        <KindPill kind={s.kind} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </Panel>
                    <Panel title={`Visits (${data.journeys.length})`} description="Newest first, one card per device visit: who it was, where they came from, and every step they took. Page lines show engaged time and scroll depth.">
                        <div style={{ display: "grid", gap: "0.8rem" }}>
                            {data.journeys.length === 0 && <p style={{ margin: 0, color: colors.ink3 }}>No visits match these filters.</p>}
                            {data.journeys.map((j) => <JourneyCard key={j.session_id} journey={j} onOpen={() => openVisitor(j.visitor_id)} />)}
                        </div>
                    </Panel>
                </div>
            )}
        </LoadState>
    );
}

// ── Page views ────────────────────────────────────────────────────────────────

type PageViewsData = {
    total: number;
    page: number;
    pageSize: number;
    paths: string[];
    rows: {
        pv: string;
        at: string;
        path: string;
        title: string;
        prev_path: string | null;
        active_ms: number;
        max_scroll: number;
        visitor_id: string;
        visitor_name: string | null;
        channel: string;
        geo: { city?: string; region?: string; country?: string };
        device: { class?: string; os?: string; browser?: string; model?: string };
        kind: string;
    }[];
};

export function PageViewsTab({ filters, refreshKey, onUnauthorized, openVisitor }: TabProps) {
    const [path, setPath] = useState("");
    // The page number belongs to one filter combination; changing any filter starts back at page 1.
    const signature = `${filters.range}|${filters.traffic}|${filters.device}|${path}`;
    const [paging, setPaging] = useState({ signature, page: 0 });
    const page = paging.signature === signature ? paging.page : 0;
    const setPage = (update: (current: number) => number) => setPaging({ signature, page: update(page) });
    const extra = `&page=${page}${path ? `&path=${encodeURIComponent(path)}` : ""}`;
    const { data, error, loading } = useReport<PageViewsData>("pageviews", filters, refreshKey, extra, onUnauthorized);
    const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

    return (
        <Panel
            title={`Page views${data ? ` (${fmtNumber(data.total)})` : ""}`}
            description="Every page view in the period, newest first. Click a row to see that visitor's full history."
            actions={(
                <select aria-label="Filter by page" value={path} onChange={(e) => setPath(e.target.value)} style={inputStyle}>
                    <option value="">All pages</option>
                    {(data?.paths ?? []).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
            )}
        >
            <LoadState loading={loading} error={error} empty={!data}>
                {data && (
                    <>
                        <DataTable
                            rows={data.rows}
                            rowKey={(r) => r.pv}
                            onRowClick={(r) => openVisitor(r.visitor_id)}
                            empty="No page views match these filters."
                            columns={[
                                { label: "When", render: (r) => <span title={fmtDateTime(r.at)}>{fmtAgo(r.at)}</span> },
                                { label: "Page", render: (r) => <><strong style={{ overflowWrap: "anywhere" }}>{r.path}</strong>{r.prev_path && <div style={{ color: colors.ink3, fontSize: "0.76rem" }}>from {r.prev_path}</div>}</> },
                                { label: "Device", render: (r) => <><span aria-hidden="true">{deviceIcon(r.device.class)} </span>{r.visitor_name || `${r.device.os ?? "?"} · ${r.device.browser ?? "?"}`}</> },
                                { label: "Where", render: (r) => fmtPlace(r.geo) },
                                { label: "Source", render: (r) => r.channel },
                                { label: "Engaged", align: "right", render: (r) => fmtDuration(r.active_ms) },
                                { label: "Scroll", align: "right", render: (r) => `${Math.round(r.max_scroll)}%` },
                                { label: "", render: (r) => <KindPill kind={r.kind} /> },
                            ]}
                        />
                        {pages > 1 && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.8rem", gap: "0.5rem", flexWrap: "wrap" }}>
                                <span style={{ color: colors.ink3, fontSize: "0.85rem" }}>Page {page + 1} of {pages}</span>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} style={buttonStyle}>Newer</button>
                                    <button type="button" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)} style={buttonStyle}>Older</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </LoadState>
        </Panel>
    );
}
