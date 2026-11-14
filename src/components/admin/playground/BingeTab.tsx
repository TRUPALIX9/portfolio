"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { BingeSeason, BingeStatus, BingeSuggestion, BingeTitle, SearchHit } from "@/utils/binge";
import { AdminRequestError, EmptyState, Grid, Panel, Pill, adminFetch, buttonStyle, colors, dangerButtonStyle, fmtAgo, inputStyle, primaryButtonStyle, Segmented } from "./ui";

type Kind = "series" | "film";
const json = (body: unknown): RequestInit => ({ headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const STATUS_TONE: Record<BingeStatus, "good" | "warn" | "neutral" | "bad"> = { seen: "good", watching: "warn", watchlist: "neutral", left: "bad" };

const chip = (on: boolean): CSSProperties => ({
    minWidth: 30,
    padding: "0.3rem 0.45rem",
    borderRadius: 8,
    border: `1px solid ${on ? "rgba(74,222,128,0.6)" : colors.line}`,
    background: on ? "rgba(74,222,128,0.18)" : "transparent",
    color: on ? colors.good : colors.ink2,
    fontWeight: 800,
    fontSize: "0.75rem",
    cursor: "pointer",
});

function SeasonEditor({ item, onSave }: { item: BingeTitle; onSave: (seasons: BingeSeason[]) => Promise<void> }) {
    const [seasons, setSeasons] = useState(item.seasons);
    const [loading, setLoading] = useState("");
    const dirty = JSON.stringify(seasons) !== JSON.stringify(item.seasons);

    const update = (i: number, next: Partial<BingeSeason>) =>
        setSeasons((prev) => prev.map((s, k) => {
            if (k !== i) return s;
            const merged = { ...s, ...next };
            if (next.complete === true && merged.episodes) merged.seenEpisodes = Array.from({ length: merged.episodes }, (_, n) => n + 1);
            if (next.complete === false) merged.seenEpisodes = [];
            if (next.seenEpisodes && merged.episodes) merged.complete = merged.seenEpisodes.length >= merged.episodes;
            return merged;
        }));

    const loadFromTvmaze = async () => {
        if (!item.sourceId) return;
        setLoading("Loading seasons…");
        try {
            const fresh = await adminFetch<BingeSeason[]>(`/api/binge/search?seasons=${item.sourceId}`);
            setSeasons(fresh.map((f) => {
                const old = seasons.find((s) => s.number === f.number);
                if (!old) return f;
                return { ...f, complete: old.complete, seenEpisodes: old.complete && f.episodes ? Array.from({ length: f.episodes }, (_, n) => n + 1) : old.seenEpisodes };
            }));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Could not load seasons.");
        } finally {
            setLoading("");
        }
    };

    return (
        <div style={{ display: "grid", gap: "0.6rem", padding: "0.8rem", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${colors.line}` }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {item.source === "tvmaze" && (
                    <button type="button" style={buttonStyle} onClick={() => void loadFromTvmaze()}>{loading || "Load seasons & episodes from TVMaze"}</button>
                )}
                <button type="button" style={buttonStyle} onClick={() => setSeasons((p) => [...p, { number: p.length + 1, episodes: null, seenEpisodes: [], complete: false }])}>+ Season</button>
                {seasons.length > 0 && <button type="button" style={buttonStyle} onClick={() => setSeasons((p) => p.slice(0, -1))}>− Season</button>}
                <button type="button" style={buttonStyle} onClick={() => setSeasons((p) => p.map((s) => ({ ...s, complete: true, seenEpisodes: s.episodes ? Array.from({ length: s.episodes }, (_, n) => n + 1) : s.seenEpisodes })))}>Mark all seen</button>
            </div>
            {seasons.length === 0 && <p style={{ margin: 0, color: colors.ink3 }}>No seasons yet.</p>}
            {seasons.map((s, i) => (
                <div key={s.number} style={{ display: "grid", gap: "0.35rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: colors.ink1, fontWeight: 800 }}>
                        <input type="checkbox" checked={s.complete} onChange={(e) => update(i, { complete: e.target.checked })} />
                        Season {s.number}
                        <span style={{ color: colors.ink3, fontWeight: 600 }}>
                            {s.episodes ? `${s.seenEpisodes.length}/${s.episodes} episodes` : "episode count unknown"}
                        </span>
                    </label>
                    {s.episodes && s.episodes <= 60 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", paddingLeft: "1.6rem" }}>
                            {Array.from({ length: s.episodes }, (_, n) => n + 1).map((ep) => {
                                const on = s.seenEpisodes.includes(ep);
                                return (
                                    <button key={ep} type="button" aria-pressed={on} aria-label={`Season ${s.number} episode ${ep}`} style={chip(on)}
                                        onClick={() => update(i, { seenEpisodes: on ? s.seenEpisodes.filter((x) => x !== ep) : [...s.seenEpisodes, ep].sort((a, b) => a - b) })}>
                                        {ep}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
            {dirty && (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="button" style={primaryButtonStyle} onClick={() => void onSave(seasons)}>Save seasons</button>
                    <button type="button" style={buttonStyle} onClick={() => setSeasons(item.seasons)}>Undo</button>
                </div>
            )}
        </div>
    );
}

export function BingeTab({ refreshKey, onUnauthorized }: { refreshKey: number; onUnauthorized: () => void }) {
    const [items, setItems] = useState<BingeTitle[] | null>(null);
    const [suggestions, setSuggestions] = useState<BingeSuggestion[]>([]);
    const [error, setError] = useState("");
    const [tick, setTick] = useState(0);
    const [busy, setBusy] = useState("");

    const [q, setQ] = useState("");
    const [kind, setKind] = useState<Kind>("series");
    const [hits, setHits] = useState<SearchHit[] | null>(null);
    const [searching, setSearching] = useState(false);

    const [statusFilter, setStatusFilter] = useState<"all" | BingeStatus>("all");
    const [kindFilter, setKindFilter] = useState<"all" | Kind>("all");
    const [find, setFind] = useState("");
    const [open, setOpen] = useState("");

    const fail = (err: unknown) => {
        if (err instanceof AdminRequestError && err.unauthorized) onUnauthorized();
        setError(err instanceof Error ? err.message : "Request failed.");
    };

    useEffect(() => {
        let cancelled = false;
        Promise.all([adminFetch<BingeTitle[]>("/api/binge"), adminFetch<BingeSuggestion[]>("/api/binge/suggestions")])
            .then(([list, sugg]) => {
                if (cancelled) return;
                setItems(list);
                setSuggestions(sugg);
                setError("");
            })
            .catch((err) => !cancelled && fail(err));
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey, tick]);

    const run = async (label: string, fn: () => Promise<unknown>) => {
        setBusy(label);
        try {
            await fn();
            setTick((t) => t + 1);
        } catch (err) {
            fail(err);
        } finally {
            setBusy("");
        }
    };

    const search = async () => {
        if (q.trim().length < 2) return;
        setSearching(true);
        try {
            setHits(await adminFetch<SearchHit[]>(`/api/binge/search?kind=${kind}&q=${encodeURIComponent(q.trim())}`));
        } catch (err) {
            fail(err);
        } finally {
            setSearching(false);
        }
    };

    const add = (hit: SearchHit, mode: "watchlist" | "seen" | "recommend") =>
        run(`add-${hit.sourceId}`, async () => {
            let seasons: BingeSeason[] = [];
            if (hit.kind === "series" && hit.source === "tvmaze") {
                seasons = await adminFetch<BingeSeason[]>(`/api/binge/search?seasons=${hit.sourceId}`);
                if (mode !== "watchlist") seasons = seasons.map((s) => ({ ...s, complete: true, seenEpisodes: s.episodes ? Array.from({ length: s.episodes }, (_, n) => n + 1) : [] }));
            }
            // Films from Wikidata come without artwork: look the poster up so the binge page has one.
            let image = hit.image;
            if (!image) {
                const art = await fetch(`/api/binge/poster?kind=${hit.kind}&title=${encodeURIComponent(hit.title)}${hit.year ? `&year=${hit.year}` : ""}`).then((r) => (r.ok ? r.json() : null)).catch(() => null) as { poster?: string | null } | null;
                image = art?.poster ?? null;
            }
            await adminFetch("/api/binge", { method: "POST", ...json({ ...hit, image, seasons, status: hit.kind === "film" ? (mode === "watchlist" ? "watchlist" : "seen") : undefined, recommended: mode === "recommend" }) });
        });

    const patch = (id: string, body: Record<string, unknown>) => run(id, () => adminFetch("/api/binge", { method: "PATCH", ...json({ id, ...body }) }));

    const onList = useMemo(() => new Set((items ?? []).map((i) => `${i.source}|${i.sourceId}`)), [items]);
    const shown = (items ?? []).filter((i) =>
        (statusFilter === "all" || i.status === statusFilter) &&
        (kindFilter === "all" || i.kind === kindFilter) &&
        (!find || i.title.toLowerCase().includes(find.toLowerCase())));
    const newSuggestions = suggestions.filter((s) => s.status === "new");

    return (
        <div style={{ display: "grid", gap: "1rem" }}>
            {error && <p role="alert" style={{ margin: 0, color: "#fecaca", fontWeight: 700 }}>{error}</p>}

            <Grid min={380}>
                <Panel title="Add a title" description="Search TVMaze for series (with seasons and episodes) or Wikidata for films.">
                    <form onSubmit={(e) => { e.preventDefault(); void search(); }} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        <Segmented<Kind> label="Type" value={kind} options={[{ value: "series", label: "Series" }, { value: "film", label: "Film" }]} onChange={(v) => { setKind(v); setHits(null); }} />
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={kind === "series" ? "Moon Knight" : "Gone Girl"} aria-label="Search title" style={{ ...inputStyle, flex: "1 1 180px" }} />
                        <button type="submit" style={primaryButtonStyle} disabled={searching}>{searching ? "Searching…" : "Search"}</button>
                    </form>
                    {hits && hits.length === 0 && <p style={{ color: colors.ink3, margin: "0.8rem 0 0" }}>No matches.</p>}
                    <div style={{ display: "grid", gap: "0.6rem", marginTop: "0.8rem" }}>
                        {hits?.map((h) => {
                            const already = onList.has(`${h.source}|${h.sourceId}`);
                            return (
                                <div key={`${h.source}-${h.sourceId}`} style={{ display: "grid", gridTemplateColumns: h.image ? "52px 1fr" : "1fr", gap: "0.7rem", padding: "0.6rem", borderRadius: 12, border: `1px solid ${colors.line}` }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {h.image && <img src={h.image} alt="" width={52} height={74} style={{ borderRadius: 6, objectFit: "cover" }} />}
                                    <div style={{ minWidth: 0 }}>
                                        <strong style={{ color: colors.ink1 }}>{h.title}</strong> <span style={{ color: colors.ink3 }}>{h.year ?? ""}</span>
                                        <p style={{ margin: "0.2rem 0 0.5rem", color: colors.ink3, fontSize: "0.82rem", lineHeight: 1.45 }}>{h.blurb}</p>
                                        {already ? <Pill label="On your list" tone="good" /> : (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                                                <button type="button" style={buttonStyle} disabled={!!busy} onClick={() => void add(h, "watchlist")}>+ Watchlist</button>
                                                <button type="button" style={buttonStyle} disabled={!!busy} onClick={() => void add(h, "seen")}>Seen it</button>
                                                <button type="button" style={primaryButtonStyle} disabled={!!busy} onClick={() => void add(h, "recommend")}>Seen &amp; recommend ★</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Panel>

                <Panel title={`Visitor suggestions (${newSuggestions.length} new)`} description="What visitors think you should watch next, from the /binge page.">
                    {suggestions.length === 0 && <EmptyState label="No suggestions yet." />}
                    <div style={{ display: "grid", gap: "0.6rem" }}>
                        {suggestions.map((s) => (
                            <article key={s.id} style={{ padding: "0.75rem", borderRadius: 12, border: `1px solid ${colors.line}`, opacity: s.status === "new" ? 1 : 0.6 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                                    <strong style={{ color: colors.ink1 }}>{s.title}</strong>
                                    <Pill label={s.status.toUpperCase()} tone={s.status === "new" ? "accent" : "neutral"} />
                                </div>
                                {s.note && <p style={{ margin: "0.35rem 0", color: colors.ink2, whiteSpace: "pre-wrap" }}>{s.note}</p>}
                                <div style={{ color: colors.ink3, fontSize: "0.8rem" }}>{s.name ? `from ${s.name} · ` : ""}{fmtAgo(s.createdAt)}</div>
                                {s.status === "new" && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.5rem" }}>
                                        <button type="button" style={buttonStyle} onClick={() => { setQ(s.title); setHits(null); }}>Search it</button>
                                        <button type="button" style={buttonStyle} onClick={() => void run(s.id, () => adminFetch("/api/binge/suggestions", { method: "PATCH", ...json({ id: s.id, status: "added" }) }))}>Mark added</button>
                                        <button type="button" style={buttonStyle} onClick={() => void run(s.id, () => adminFetch("/api/binge/suggestions", { method: "PATCH", ...json({ id: s.id, status: "dismissed" }) }))}>Dismiss</button>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </Panel>
            </Grid>

            <Panel
                title={`Your list (${items?.length ?? 0})`}
                description="Tick seasons and episodes, star recommendations, move titles between watchlist, watching and seen."
                actions={items && items.length === 0 ? (
                    <button type="button" style={primaryButtonStyle} disabled={!!busy} onClick={() => void run("import", () => adminFetch("/api/binge/import", { method: "POST" }))}>
                        {busy === "import" ? "Importing…" : "Import my existing list"}
                    </button>
                ) : undefined}
            >
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.9rem" }}>
                    <Segmented<"all" | BingeStatus> label="Status" value={statusFilter} options={[{ value: "all", label: "All" }, { value: "watching", label: "Watching" }, { value: "watchlist", label: "Watchlist" }, { value: "seen", label: "Seen" }, { value: "left", label: "Left" }]} onChange={setStatusFilter} />
                    <Segmented<"all" | Kind> label="Type" value={kindFilter} options={[{ value: "all", label: "All" }, { value: "series", label: "Series" }, { value: "film", label: "Films" }]} onChange={setKindFilter} />
                    <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Filter by title" aria-label="Filter by title" style={{ ...inputStyle, flex: "1 1 160px" }} />
                </div>
                {!items && !error && <p style={{ color: colors.ink3, margin: 0 }}>Loading…</p>}
                {items && shown.length === 0 && <EmptyState label={items.length ? "Nothing matches." : "Your list is empty. Import your existing list or search above."} />}
                <div style={{ display: "grid", gap: "0.5rem" }}>
                    {shown.map((i) => {
                        const seenSeasons = i.seasons.filter((s) => s.complete).length;
                        return (
                            <article key={i.id} style={{ padding: "0.7rem 0.8rem", borderRadius: 12, border: `1px solid ${colors.line}`, display: "grid", gap: "0.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                                    <button type="button" aria-pressed={i.recommended} aria-label={i.recommended ? "Remove recommendation" : "Recommend"} title="Recommend"
                                        onClick={() => void patch(i.id, { recommended: !i.recommended })}
                                        style={{ ...buttonStyle, padding: "0.3rem 0.55rem", color: i.recommended ? colors.warn : colors.ink3 }}>
                                        {i.recommended ? "★" : "☆"}
                                    </button>
                                    <strong style={{ color: colors.ink1, flex: "1 1 160px", minWidth: 0 }}>{i.title} <span style={{ color: colors.ink3, fontWeight: 600 }}>{i.year ?? ""}</span></strong>
                                    <span style={{ color: colors.ink3, fontSize: "0.8rem" }}>{i.kind === "series" ? `${seenSeasons}/${i.seasons.length} seasons` : "film"}{i.shelf ? ` · ${i.shelf}` : ""}</span>
                                    <Pill label={i.status.toUpperCase()} tone={STATUS_TONE[i.status]} />
                                    <select value={i.status} aria-label={`Status of ${i.title}`} onChange={(e) => void patch(i.id, { status: e.target.value })} style={{ ...inputStyle, padding: "0.4rem 0.5rem" }}>
                                        <option value="watchlist">Watchlist</option>
                                        <option value="watching">Watching</option>
                                        <option value="seen">Seen</option>
                                        <option value="left">Left · not planning for now</option>
                                    </select>
                                    {i.kind === "series" && (
                                        <button type="button" style={buttonStyle} aria-expanded={open === i.id} onClick={() => setOpen(open === i.id ? "" : i.id)}>Seasons</button>
                                    )}
                                    <button type="button" style={{ ...dangerButtonStyle, padding: "0.4rem 0.6rem" }} aria-label={`Remove ${i.title}`}
                                        onClick={() => { if (confirm(`Remove ${i.title} from your list?`)) void run(i.id, () => adminFetch(`/api/binge?id=${i.id}`, { method: "DELETE" })); }}>
                                        ✕
                                    </button>
                                </div>
                                {open === i.id && <SeasonEditor item={i} onSave={(seasons) => patch(i.id, { seasons })} />}
                            </article>
                        );
                    })}
                </div>
            </Panel>
        </div>
    );
}
