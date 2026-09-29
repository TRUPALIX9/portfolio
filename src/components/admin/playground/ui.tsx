"use client";

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";

// ── Report loading ────────────────────────────────────────────────────────────

export type RangeKey = "24h" | "7d" | "30d" | "90d" | "all";

export type TrafficFilter = "human" | "bots" | "owner" | "all";
export type DeviceFilter = "all" | "mobile" | "desktop" | "tablet";
export type ReportFilters = { range: RangeKey; traffic: TrafficFilter; device: DeviceFilter };

export class AdminRequestError extends Error {
    constructor(message: string, readonly unauthorized: boolean) {
        super(message);
    }
}

export async function adminFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, { cache: "no-store", ...init });
    if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        throw new AdminRequestError(
            response.status === 401 ? "Admin session expired. Enter your KEY again." : data?.error || "Request failed.",
            response.status === 401,
        );
    }
    return response.json() as Promise<T>;
}

export function adminAction(body: Record<string, unknown>) {
    return adminFetch<{ ok: true }>("/api/analytics/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

/** Loads one report view for the current filters; `reload` re-fetches (e.g. after an admin action). */
export function useReport<T>(view: string, filters: ReportFilters, refreshKey: number, extra = "", onUnauthorized?: () => void) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const url = `/api/analytics/report?view=${view}&range=${filters.range}&traffic=${filters.traffic}&device=${filters.device}&tz=${encodeURIComponent(tz)}${extra}`;
        adminFetch<T>(url)
            .then((result) => {
                if (cancelled) return;
                setData(result);
                setError("");
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                if (err instanceof AdminRequestError && err.unauthorized) onUnauthorized?.();
                setError(err instanceof Error ? err.message : "Failed to load.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
        // onUnauthorized is a stable callback from the page; excluding it avoids refetch loops.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, filters.range, filters.traffic, filters.device, refreshKey, extra, tick]);

    const reload = useCallback(() => setTick((t) => t + 1), []);
    return { data, error, loading, reload };
}

// ── Formatting ────────────────────────────────────────────────────────────────

export function fmtNumber(value: number, digits = 0) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(Number.isFinite(value) ? value : 0);
}

export function fmtPct(value: number) {
    return `${Math.round((Number.isFinite(value) ? value : 0) * 100)}%`;
}

export function fmtDuration(ms: number) {
    const seconds = Math.round((ms || 0) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${String(seconds % 60).padStart(2, "0")}s`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function fmtDateTime(value?: string | Date | null) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function fmtAgo(value?: string | Date | null) {
    if (!value) return "—";
    const diff = Date.now() - new Date(value).getTime();
    if (!Number.isFinite(diff)) return "—";
    const minutes = Math.round(diff / 60_000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 48) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
}

const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export function countryName(code?: string | null) {
    if (!code || code === "Unknown") return "Unknown";
    try {
        return regionNames?.of(code) ?? code;
    } catch {
        return code;
    }
}

export function fmtPlace(geo?: { city?: string; region?: string; country?: string } | null) {
    if (!geo) return "Unknown";
    return [geo.city, geo.region, geo.country ? countryName(geo.country) : ""].filter(Boolean).join(", ") || "Unknown";
}

// ── Layout pieces ─────────────────────────────────────────────────────────────

export const colors = {
    ink1: "#f8fafc",
    ink2: "#cbd5e1",
    ink3: "#94a3b8",
    line: "rgba(148,163,184,0.16)",
    accent: "#38bdf8",
    accentSoft: "rgba(56,189,248,0.22)",
    good: "#4ade80",
    bad: "#f87171",
    warn: "#fbbf24",
};

export function Panel({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
    return (
        <section style={{ padding: "1.35rem", borderRadius: "20px", background: "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(2,6,23,0.94))", color: "#e2e8f0", border: `1px solid ${colors.line}`, boxShadow: "0 18px 50px rgba(0,0,0,0.28)", minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                <div style={{ minWidth: 0 }}>
                    <h2 style={{ margin: 0, fontSize: "1.02rem", fontWeight: 900, color: colors.ink1 }}>{title}</h2>
                    {description && <p style={{ margin: "0.35rem 0 0", color: colors.ink3, lineHeight: 1.55, fontSize: "0.9rem" }}>{description}</p>}
                </div>
                {actions}
            </div>
            {children}
        </section>
    );
}

export function Grid({ min = 320, children }: { min?: number; children: ReactNode }) {
    return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: "1rem", alignItems: "start" }}>{children}</div>;
}

/** A KPI tile. `previous` adds a change-vs-previous-period line; `invert` marks metrics where lower is better. */
export function StatCard({ title, value, hint, current, previous, invert = false }: {
    title: string;
    value: string;
    hint?: string;
    current?: number;
    previous?: number | null;
    invert?: boolean;
}) {
    let delta: ReactNode = null;
    if (current !== undefined && previous !== undefined && previous !== null) {
        if (previous === 0) {
            delta = <span style={{ color: colors.ink3 }}>{current === 0 ? "no change" : "new vs. prior period"}</span>;
        } else {
            const change = (current - previous) / previous;
            const up = change >= 0;
            const good = invert ? !up : up;
            delta = (
                <span style={{ color: Math.abs(change) < 0.005 ? colors.ink3 : good ? colors.good : colors.bad }}>
                    <span aria-hidden="true">{up ? "▲" : "▼"}</span> {fmtPct(Math.abs(change))} vs. prior period
                </span>
            );
        }
    }
    return (
        <div style={{ padding: "1.1rem 1.2rem", borderRadius: "18px", background: "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(2,6,23,0.94))", border: `1px solid ${colors.line}`, minWidth: 0 }}>
            <p style={{ margin: 0, color: colors.ink3, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.7rem", fontWeight: 800 }}>{title}</p>
            <p style={{ margin: "0.45rem 0 0", fontSize: "1.75rem", fontWeight: 900, color: colors.ink1, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{value}</p>
            {(hint || delta) && (
                <p style={{ margin: "0.45rem 0 0", color: colors.ink2, fontSize: "0.8rem", lineHeight: 1.5, fontVariantNumeric: "tabular-nums", display: "grid", gap: "0.15rem" }}>
                    {delta}
                    {hint && <span style={{ color: colors.ink3 }}>{hint}</span>}
                </p>
            )}
        </div>
    );
}

export function EmptyState({ label }: { label: string }) {
    return (
        <div style={{ padding: "1.25rem", borderRadius: "14px", border: "1px dashed rgba(148,163,184,0.3)", color: colors.ink3, textAlign: "center", fontSize: "0.9rem" }}>
            {label}
        </div>
    );
}

export function LoadState({ loading, error, empty, emptyLabel, children }: { loading: boolean; error: string; empty?: boolean; emptyLabel?: string; children: ReactNode }) {
    if (error) return <p role="alert" style={{ margin: 0, color: "#fecaca", fontWeight: 700 }}>{error}</p>;
    if (loading && empty) return <p style={{ margin: 0, color: colors.ink3 }}>Loading…</p>;
    if (empty) return <EmptyState label={emptyLabel ?? "No data for this period yet."} />;
    return <div style={{ opacity: loading ? 0.6 : 1, transition: "opacity 150ms" }}>{children}</div>;
}

export function Pill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "good" | "bad" | "warn" | "accent" }) {
    const toneColor = { neutral: colors.ink1, good: colors.good, bad: colors.bad, warn: colors.warn, accent: colors.accent }[tone];
    return (
        <span style={{ display: "inline-flex", alignItems: "center", padding: "0.2rem 0.55rem", borderRadius: "999px", background: "rgba(255,255,255,0.05)", border: `1px solid ${tone === "neutral" ? colors.line : `${toneColor}55`}`, color: toneColor, fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
            {label}
        </span>
    );
}

/** Horizontal bar list: label, bar scaled to the max, value. For ranked categorical counts. */
export function BarList({ items, format = (n: number) => fmtNumber(n), empty = "Nothing recorded yet." }: {
    items: { label: string; value: number; hint?: string }[];
    format?: (n: number) => string;
    empty?: string;
}) {
    if (!items.length) return <EmptyState label={empty} />;
    const max = Math.max(...items.map((i) => i.value), 1);
    return (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.45rem" }}>
            {items.map((item) => (
                <li key={item.label} title={`${item.label}: ${format(item.value)}${item.hint ? ` (${item.hint})` : ""}`} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "0.75rem", alignItems: "center", position: "relative", padding: "0.4rem 0.6rem", borderRadius: "8px", overflow: "hidden" }}>
                    <span aria-hidden="true" style={{ position: "absolute", inset: "0 auto 0 0", width: `${(item.value / max) * 100}%`, background: colors.accentSoft, borderRadius: "0 4px 4px 0" }} />
                    <span style={{ position: "relative", color: colors.ink1, fontSize: "0.86rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.label}
                        {item.hint && <span style={{ color: colors.ink3 }}> · {item.hint}</span>}
                    </span>
                    <span style={{ position: "relative", color: colors.ink2, fontSize: "0.84rem", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{format(item.value)}</span>
                </li>
            ))}
        </ul>
    );
}

/** Single-series column chart with a hover tooltip per column. */
export function ColumnChart({ data, valueLabel }: { data: { label: string; value: number; sub?: string }[]; valueLabel: string }) {
    const [hover, setHover] = useState<number | null>(null);
    if (!data.length) return <EmptyState label="No visits in this period yet." />;
    const max = Math.max(...data.map((d) => d.value), 1);
    const labelEvery = Math.max(1, Math.ceil(data.length / 8));
    const active = hover !== null ? data[hover] : null;

    return (
        <div style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: colors.ink3, fontSize: "0.72rem", marginBottom: "0.4rem", fontVariantNumeric: "tabular-nums" }}>
                <span>{valueLabel}</span>
                <span>max {fmtNumber(max)}</span>
            </div>
            <div
                role="img"
                aria-label={`${valueLabel}: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}
                onMouseLeave={() => setHover(null)}
                style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "160px", borderBottom: `1px solid ${colors.line}` }}
            >
                {data.map((d, i) => (
                    <div
                        key={d.label}
                        onMouseEnter={() => setHover(i)}
                        style={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end", cursor: "default" }}
                    >
                        <div style={{ width: "100%", height: `${Math.max((d.value / max) * 100, d.value ? 2 : 0)}%`, background: hover === i ? "#7dd3fc" : colors.accent, borderRadius: "4px 4px 0 0", transition: "background 120ms" }} />
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", gap: "2px", marginTop: "0.35rem" }}>
                {data.map((d, i) => (
                    <span key={d.label} style={{ flex: 1, color: colors.ink3, fontSize: "0.66rem", textAlign: "center", whiteSpace: "nowrap", overflow: "visible" }}>
                        {i % labelEvery === 0 ? shortLabel(d.label) : ""}
                    </span>
                ))}
            </div>
            {active && hover !== null && (
                <div style={{ position: "absolute", top: "1.2rem", left: `${Math.min(Math.max(((hover + 0.5) / data.length) * 100, 12), 88)}%`, transform: "translateX(-50%)", padding: "0.45rem 0.65rem", borderRadius: "8px", background: "#0b1220", border: `1px solid ${colors.line}`, color: colors.ink1, fontSize: "0.78rem", pointerEvents: "none", whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                    <strong>{active.label}</strong>
                    <div style={{ color: colors.ink2, fontVariantNumeric: "tabular-nums" }}>{fmtNumber(active.value)} {valueLabel.toLowerCase()}</div>
                    {active.sub && <div style={{ color: colors.ink3 }}>{active.sub}</div>}
                </div>
            )}
        </div>
    );
}

function shortLabel(label: string) {
    // YYYY-MM-DD -> "Sep 29"; hour labels pass through.
    if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
        const [y, m, d] = label.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }
    return label;
}

export function DataTable<T>({ rows, columns, rowKey, empty = "Nothing recorded yet.", onRowClick }: {
    rows: T[];
    columns: { label: string; render: (row: T) => ReactNode; align?: "left" | "right" }[];
    rowKey: (row: T) => string;
    empty?: string;
    onRowClick?: (row: T) => void;
}) {
    if (!rows.length) return <EmptyState label={empty} />;
    return (
        <div style={{ overflowX: "auto", border: `1px solid ${colors.line}`, borderRadius: "14px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                    <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                        {columns.map((c) => (
                            <th key={c.label} scope="col" style={{ ...th, textAlign: c.align ?? "left" }}>{c.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={rowKey(row)}
                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                            tabIndex={onRowClick ? 0 : undefined}
                            onKeyDown={onRowClick ? (e) => { if (e.key === "Enter") onRowClick(row); } : undefined}
                            style={{ borderTop: `1px solid ${colors.line}`, cursor: onRowClick ? "pointer" : undefined }}
                        >
                            {columns.map((c) => (
                                <td key={c.label} style={{ ...td, textAlign: c.align ?? "left" }}>{c.render(row)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const th: CSSProperties = {
    padding: "0.65rem 0.8rem",
    fontSize: "0.68rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: colors.ink2,
    whiteSpace: "nowrap",
};

const td: CSSProperties = {
    padding: "0.65rem 0.8rem",
    color: "#e2e8f0",
    verticalAlign: "top",
    fontVariantNumeric: "tabular-nums",
};

export const inputStyle: CSSProperties = {
    padding: "0.7rem 0.9rem",
    borderRadius: "12px",
    border: `1px solid ${colors.line}`,
    background: "rgba(15,23,42,0.92)",
    color: colors.ink1,
    fontWeight: 600,
    minWidth: 0,
};

export const buttonStyle: CSSProperties = {
    padding: "0.6rem 0.9rem",
    borderRadius: "10px",
    border: `1px solid ${colors.line}`,
    background: "rgba(255,255,255,0.04)",
    color: "#e2e8f0",
    fontWeight: 800,
    cursor: "pointer",
};

export const primaryButtonStyle: CSSProperties = {
    ...buttonStyle,
    border: "1px solid rgba(56,189,248,0.3)",
    background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
    color: "#fff",
};

export const dangerButtonStyle: CSSProperties = {
    ...buttonStyle,
    border: "none",
    background: "#b91c1c",
    color: "#fff",
};

/** A row of mutually exclusive buttons (a radio group) for filters. */
export function Segmented<T extends string>({ label, value, options, onChange }: {
    label: string;
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
}) {
    return (
        <div role="radiogroup" aria-label={label} style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", padding: "0.2rem", borderRadius: "12px", border: `1px solid ${colors.line}`, background: "rgba(15,23,42,0.92)", flexWrap: "wrap" }}>
            <span style={{ padding: "0 0.5rem", color: colors.ink3, fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
            {options.map((o) => {
                const selected = o.value === value;
                return (
                    <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(o.value)}
                        style={{ padding: "0.45rem 0.75rem", borderRadius: "9px", border: "none", background: selected ? "#1d4ed8" : "transparent", color: selected ? "#fff" : colors.ink2, fontWeight: 800, fontSize: "0.82rem", cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}

export function deviceIcon(deviceClass?: string) {
    return deviceClass === "mobile" ? "📱" : deviceClass === "tablet" ? "📲" : "💻";
}

export function KindPill({ kind }: { kind: string }) {
    if (kind === "owner") return <Pill label="YOU" tone="accent" />;
    if (kind === "bot") return <Pill label="BOT" tone="bad" />;
    if (kind === "datacenter") return <Pill label="DATACENTER" tone="warn" />;
    return null;
}

export function IntentPill({ score }: { score: number }) {
    if (!score) return null;
    return <Pill label={`INTENT ${score}`} tone={score >= 8 ? "good" : "neutral"} />;
}
