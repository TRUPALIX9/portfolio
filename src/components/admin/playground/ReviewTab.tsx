"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminRequestError, EmptyState, Panel, Pill, adminFetch, buttonStyle, colors, fmtDateTime, primaryButtonStyle } from "./ui";

type Kind = "travel" | "binge" | "message";
type State = "waiting" | "approved" | "dismissed";

/** One thing waiting for a decision, from any source. */
type Item = { kind: Kind; id: string; title: string; detail: string; who: string; when: string; state: State; raw: string };

type TravelDoc = { id: string; place: string; kind?: string; country?: string; state?: string; city?: string; note?: string; name?: string; status?: string; createdAt: string };
type BingeDoc = { id: string; title: string; note: string; name: string; status: string; createdAt: string };
type MessageDoc = { id: string; name: string; email: string; message: string; status?: string | null; createdAt?: string; submittedAt?: string };

const KIND_LABEL: Record<Kind, string> = { travel: "Travel", binge: "Binge", message: "Message" };

/** How each source spells approve / dismiss / undo. Messages only have "reviewed". */
const STATUS: Record<Kind, { approve: string; dismiss?: string; reset: string; endpoint: string }> = {
    travel: { approve: "approved", dismiss: "dismissed", reset: "new", endpoint: "/api/travel/suggestions" },
    binge: { approve: "added", dismiss: "dismissed", reset: "new", endpoint: "/api/binge/suggestions" },
    message: { approve: "reviewed", reset: "new", endpoint: "/api/contact-submissions" },
};

const toState = (kind: Kind, raw: string): State => {
    if (raw === "new" || !raw) return "waiting";
    if (raw === "dismissed") return "dismissed";
    return kind === "message" && raw === "reviewed" ? "approved" : "approved";
};

const FILTERS: { id: State | "all"; label: string }[] = [
    { id: "waiting", label: "Waiting" },
    { id: "approved", label: "Approved" },
    { id: "dismissed", label: "Dismissed" },
    { id: "all", label: "All" },
];

/** Every visitor submission in one queue: approve, dismiss or undo, one at a time or in bulk. */
export function ReviewTab({ refreshKey, onUnauthorized, onCount }: { refreshKey: number; onUnauthorized: () => void; onCount?: (n: number) => void }) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<State | "all">("waiting");
    const [kinds, setKinds] = useState<Record<Kind, boolean>>({ travel: true, binge: true, message: true });
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [busy, setBusy] = useState(false);
    const [cursor, setCursor] = useState(0);

    const load = useCallback(async () => {
        setLoading(true);
        const safe = <T,>(p: Promise<T[]>) => p.catch((err: unknown) => {
            if (err instanceof AdminRequestError && err.unauthorized) onUnauthorized();
            return [] as T[];
        });
        const [travel, binge, messages] = await Promise.all([
            safe(adminFetch<TravelDoc[]>("/api/travel/suggestions")),
            safe(adminFetch<BingeDoc[]>("/api/binge/suggestions")),
            safe(adminFetch<MessageDoc[]>("/api/contact-submissions")),
        ]);
        const next: Item[] = [
            ...travel.map((t) => ({ kind: "travel" as const, id: t.id, title: [t.city, t.state, t.country].filter(Boolean).join(", ") || t.place, detail: t.note ?? "", who: t.name ?? "", when: t.createdAt, raw: t.status ?? "new", state: toState("travel", t.status ?? "new") })),
            ...binge.map((b) => ({ kind: "binge" as const, id: b.id, title: b.title, detail: b.note, who: b.name, when: b.createdAt, raw: b.status, state: toState("binge", b.status) })),
            ...messages.map((m) => ({ kind: "message" as const, id: m.id, title: `${m.name} · ${m.email}`, detail: m.message, who: "", when: m.createdAt ?? m.submittedAt ?? "", raw: m.status ?? "new", state: toState("message", m.status ?? "new") })),
        ].sort((a, b) => (b.when || "").localeCompare(a.when || ""));
        setItems(next);
        setError("");
        setLoading(false);
    }, [onUnauthorized]);

    useEffect(() => { void load(); }, [load, refreshKey]);

    const waiting = items.filter((i) => i.state === "waiting").length;
    useEffect(() => { onCount?.(waiting); }, [waiting, onCount]);

    const shown = useMemo(() => items.filter((i) => kinds[i.kind] && (filter === "all" || i.state === filter)), [items, kinds, filter]);
    const key = (i: Item) => `${i.kind}:${i.id}`;

    const act = useCallback(async (targets: Item[], action: "approve" | "dismiss" | "reset") => {
        setBusy(true);
        try {
            await Promise.all(targets.map((i) => {
                const s = STATUS[i.kind];
                const status = action === "approve" ? s.approve : action === "dismiss" ? s.dismiss : s.reset;
                if (!status) return Promise.resolve();
                return adminFetch(s.endpoint, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: i.id, status }) });
            }));
            setSelected(new Set());
            await load();
        } catch (err) {
            if (err instanceof AdminRequestError && err.unauthorized) onUnauthorized();
            setError(err instanceof Error ? err.message : "That did not go through.");
        } finally {
            setBusy(false);
        }
    }, [load, onUnauthorized]);

    // Keyboard: J/K to move, A approve, D dismiss, U undo, X select.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement;
            if (t.closest("input, textarea, select") || e.metaKey || e.ctrlKey || busy) return;
            const item = shown[cursor];
            if (e.key === "j") setCursor((c) => Math.min(shown.length - 1, c + 1));
            else if (e.key === "k") setCursor((c) => Math.max(0, c - 1));
            else if (!item) return;
            else if (e.key === "a") void act([item], "approve");
            else if (e.key === "d" && STATUS[item.kind].dismiss) void act([item], "dismiss");
            else if (e.key === "u") void act([item], "reset");
            else if (e.key === "x") setSelected((s) => { const n = new Set(s); if (n.has(key(item))) n.delete(key(item)); else n.add(key(item)); return n; });
            else return;
            e.preventDefault();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [shown, cursor, act, busy]);

    const chosen = shown.filter((i) => selected.has(key(i)));

    return (
        <Panel
            title={`Review queue · ${waiting} waiting`}
            description="Travel ideas, Binge suggestions and contact messages in one list. Approved travel ideas appear on /travel as the visitors’ wishlist."
            actions={<button type="button" style={buttonStyle} onClick={() => void load()}>Reload</button>}
        >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", marginBottom: "0.9rem" }}>
                <div role="radiogroup" aria-label="Status" style={{ display: "inline-flex", border: `1px solid ${colors.ink1}` }}>
                    {FILTERS.map((f) => {
                        const n = f.id === "all" ? items.length : items.filter((i) => i.state === f.id).length;
                        return (
                            <button key={f.id} type="button" role="radio" aria-checked={filter === f.id} onClick={() => { setFilter(f.id); setCursor(0); }}
                                style={{ ...buttonStyle, border: "none", borderRight: `1px solid ${colors.line}`, background: filter === f.id ? colors.ink1 : "#fff", color: filter === f.id ? "#fafaf7" : colors.ink1 }}>
                                {f.label} <span style={{ opacity: 0.6 }}>{n}</span>
                            </button>
                        );
                    })}
                </div>
                {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                    <label key={k} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem", padding: "0.4rem 0.6rem", border: `1px solid ${colors.line}`, background: "#fff", cursor: "pointer" }}>
                        <input type="checkbox" checked={kinds[k]} onChange={(e) => setKinds((s) => ({ ...s, [k]: e.target.checked }))} />
                        {KIND_LABEL[k]}
                    </label>
                ))}
                <span style={{ marginLeft: "auto", fontFamily: "var(--sp-mono, monospace)", fontSize: "0.7rem", color: colors.ink3 }}>J/K move · A approve · D dismiss · U undo · X select</span>
            </div>

            {chosen.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.6rem 0.75rem", marginBottom: "0.8rem", background: colors.ink1, color: "#fafaf7" }}>
                    <b style={{ fontWeight: 600 }}>{chosen.length} selected</b>
                    <button type="button" disabled={busy} style={{ ...primaryButtonStyle, background: colors.accent, border: "none" }} onClick={() => void act(chosen, "approve")}>Approve all</button>
                    <button type="button" disabled={busy} style={buttonStyle} onClick={() => void act(chosen.filter((i) => STATUS[i.kind].dismiss), "dismiss")}>Dismiss all</button>
                    <button type="button" style={{ ...buttonStyle, marginLeft: "auto" }} onClick={() => setSelected(new Set())}>Clear</button>
                </div>
            )}

            {error && <p role="alert" style={{ color: colors.bad, margin: "0 0 0.8rem" }}>{error}</p>}
            {loading && items.length === 0 ? <p style={{ color: colors.ink3 }}>Loading…</p> : shown.length === 0 ? (
                <EmptyState label={filter === "waiting" ? "Nothing waiting. All caught up." : "Nothing here."} />
            ) : (
                <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
                    {shown.map((i, idx) => {
                        const k = key(i);
                        const s = STATUS[i.kind];
                        return (
                            <li key={k} onClick={() => setCursor(idx)}
                                style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: "0.8rem", alignItems: "start", padding: "0.8rem 0.9rem", background: "#fff", border: `1px solid ${idx === cursor ? colors.accent : colors.line}`, boxShadow: idx === cursor ? `3px 3px 0 ${colors.accent}` : "none" }}>
                                <input type="checkbox" aria-label={`Select ${i.title}`} checked={selected.has(k)} onChange={() => setSelected((sel) => { const n = new Set(sel); if (n.has(k)) n.delete(k); else n.add(k); return n; })} style={{ marginTop: "0.3rem" }} />
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                                        <Pill label={KIND_LABEL[i.kind].toUpperCase()} tone={i.kind === "travel" ? "accent" : "neutral"} />
                                        <b style={{ fontWeight: 600 }}>{i.title}</b>
                                        {i.state !== "waiting" && <Pill label={i.raw.toUpperCase()} tone={i.state === "approved" ? "good" : "neutral"} />}
                                    </div>
                                    {i.detail && <p style={{ margin: "0.35rem 0 0", color: colors.ink2, lineHeight: 1.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{i.detail}</p>}
                                    <p style={{ margin: "0.35rem 0 0", color: colors.ink3, fontSize: "0.78rem", fontFamily: "var(--sp-mono, monospace)" }}>{[i.who && `from ${i.who}`, i.when && fmtDateTime(i.when)].filter(Boolean).join(" · ")}</p>
                                </div>
                                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                    {i.state === "waiting" ? (
                                        <>
                                            <button type="button" disabled={busy} style={{ ...primaryButtonStyle, background: colors.good, border: "none" }} onClick={() => void act([i], "approve")}>
                                                {i.kind === "message" ? "Mark read" : i.kind === "binge" ? "Add" : "Approve"}
                                            </button>
                                            {s.dismiss && <button type="button" disabled={busy} style={buttonStyle} onClick={() => void act([i], "dismiss")}>Dismiss</button>}
                                        </>
                                    ) : (
                                        <button type="button" disabled={busy} style={buttonStyle} onClick={() => void act([i], "reset")}>Undo</button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </Panel>
    );
}
