"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { BingeSeason, BingeTitle } from "@/utils/binge";
import type { BingeUpdate } from "@/utils/binge-sync";
import { EmptyState, Panel, adminFetch, buttonStyle, colors, primaryButtonStyle } from "./ui";

type Card =
    | { type: "title"; key: string; t: BingeTitle }
    | { type: "update"; key: string; u: BingeUpdate };
type Dir = "left" | "right" | "up";
/** What one swipe did, so it can be undone. */
type Undo = { card: Card; seasons?: BingeSeason[]; status?: string; updateId?: string };

const json = (body: unknown) => ({ headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const THRESHOLD = 90;

const allSeen = (seasons: BingeSeason[]) => seasons.map((s) => ({ ...s, complete: true, seenEpisodes: s.episodes ? Array.from({ length: s.episodes }, (_, i) => i + 1) : s.seenEpisodes }));

/** What each direction means for this card. */
function actions(card: Card): Partial<Record<Dir, string>> {
    if (card.type === "update") return { left: "Dismiss", right: card.u.kind === "coming_soon" ? "Got it" : "Apply" };
    if (card.t.kind === "film") return { left: "Not seen", right: "Seen", up: "Seen" };
    if (card.t.seasons.length <= 1) return { left: "Skip", right: "Seen", up: "Seen" };
    return { left: "Skip", right: "Pick seasons", up: "All seen" };
}

/**
 * One card at a time. Phone: swipe left / right / up. Desktop: the buttons or ← → ↑.
 * Series: up marks every season seen, right opens the season checklist, left skips.
 * Films: seen or not seen. Sync updates: apply or dismiss. Everything can be undone.
 */
export function BingeSwipe({ items, onChanged, onUnauthorized }: { items: BingeTitle[]; onChanged: () => void; onUnauthorized: () => void }) {
    const [updates, setUpdates] = useState<BingeUpdate[]>([]);
    const [source, setSource] = useState<"all" | "updates" | "list">("all");
    const [done, setDone] = useState<Set<string>>(new Set());
    const [undo, setUndo] = useState<Undo[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
    const [fly, setFly] = useState<Dir | null>(null);
    const [picker, setPicker] = useState<BingeTitle | null>(null);
    const start = useRef({ x: 0, y: 0 });

    const loadUpdates = useCallback(() => {
        adminFetch<BingeUpdate[]>("/api/binge/updates").then(setUpdates).catch(() => setUpdates([]));
    }, []);
    useEffect(() => { loadUpdates(); }, [loadUpdates]);

    const deck: Card[] = useMemo(() => {
        const ups: Card[] = updates.map((u) => ({ type: "update", key: `u:${u.id}`, u }));
        const list: Card[] = items
            .filter((t) => t.status === "watchlist" || t.status === "watching")
            .sort((a, b) => (a.status === b.status ? a.title.localeCompare(b.title) : a.status === "watching" ? -1 : 1))
            .map((t) => ({ type: "title", key: `t:${t.id}`, t }));
        const all = source === "updates" ? ups : source === "list" ? list : [...ups, ...list];
        return all.filter((c) => !done.has(c.key));
    }, [items, updates, source, done]);

    const card = deck[0];
    const next = deck[1];
    const acts = card ? actions(card) : {};

    const fail = (err: unknown) => {
        const e = err as { unauthorized?: boolean; message?: string };
        if (e?.unauthorized) onUnauthorized();
        setError(e?.message ?? "That did not go through.");
    };

    const patchTitle = (id: string, body: Record<string, unknown>) => adminFetch("/api/binge", { method: "PATCH", ...json({ id, ...body }) });

    const finish = (c: Card, u: Undo) => {
        setDone((s) => new Set(s).add(c.key));
        setUndo((s) => [u, ...s].slice(0, 30));
        onChanged();
    };

    const act = useCallback(async (dir: Dir) => {
        if (!card || busy) return;
        const label = actions(card)[dir];
        if (!label) return;
        if (card.type === "title" && label === "Pick seasons") { setPicker(card.t); return; }
        setBusy(true);
        setError("");
        setFly(dir);
        try {
            if (card.type === "update") {
                await adminFetch("/api/binge/updates", { method: "PATCH", ...json({ id: card.u.id, action: dir === "left" ? "dismiss" : "apply" }) });
                finish(card, { card, updateId: card.u.id });
                loadUpdates();
            } else {
                const t = card.t;
                const before: Undo = { card, seasons: t.seasons, status: t.status };
                if (label === "Skip" || label === "Not seen") {
                    // Stays on the watchlist as it is; just move on.
                    setDone((s) => new Set(s).add(card.key));
                    setUndo((s) => [{ card }, ...s].slice(0, 30));
                } else if (t.kind === "film") {
                    await patchTitle(t.id, { status: "seen" });
                    finish(card, before);
                } else {
                    await patchTitle(t.id, { seasons: allSeen(t.seasons), status: "seen" });
                    finish(card, before);
                }
            }
        } catch (err) {
            fail(err);
        } finally {
            setBusy(false);
            setTimeout(() => setFly(null), 220);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [card, busy]);

    const undoLast = async () => {
        const last = undo[0];
        if (!last || busy) return;
        setBusy(true);
        try {
            if (last.updateId) await adminFetch("/api/binge/updates", { method: "PATCH", ...json({ id: last.updateId, action: "reset" }) });
            if (last.card.type === "title" && last.seasons) await patchTitle(last.card.t.id, { seasons: last.seasons, status: last.status });
            setDone((s) => { const n = new Set(s); n.delete(last.card.key); return n; });
            setUndo((s) => s.slice(1));
            onChanged();
            loadUpdates();
        } catch (err) {
            fail(err);
        } finally {
            setBusy(false);
        }
    };

    const saveSeasons = async (t: BingeTitle, picked: Set<number>) => {
        setBusy(true);
        try {
            const seasons = t.seasons.map((s) => picked.has(s.number)
                ? { ...s, complete: true, seenEpisodes: s.episodes ? Array.from({ length: s.episodes }, (_, i) => i + 1) : s.seenEpisodes }
                : { ...s, complete: false, seenEpisodes: s.complete ? [] : s.seenEpisodes });
            await patchTitle(t.id, { seasons });
            finish({ type: "title", key: `t:${t.id}`, t }, { card: { type: "title", key: `t:${t.id}`, t }, seasons: t.seasons, status: t.status });
            setPicker(null);
        } catch (err) {
            fail(err);
        } finally {
            setBusy(false);
        }
    };

    // Keyboard: ← → ↑ and Z for undo.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).closest("input, textarea, select") || picker) return;
            const map: Record<string, Dir> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up" };
            if (map[e.key]) { e.preventDefault(); void act(map[e.key]); }
            else if (e.key === "z") void undoLast();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [act, picker, undo]);

    // The gesture lives in a ref so fast flicks register even before React re-renders.
    const g = useRef({ x: 0, y: 0, active: false });
    const onDown = (e: ReactPointerEvent) => {
        if (busy) return;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        start.current = { x: e.clientX, y: e.clientY };
        g.current = { x: 0, y: 0, active: true };
        setDrag({ x: 0, y: 0, active: true });
    };
    const onMove = (e: ReactPointerEvent) => {
        if (!g.current.active) return;
        g.current = { x: e.clientX - start.current.x, y: e.clientY - start.current.y, active: true };
        setDrag({ ...g.current });
    };
    const onUp = (e: ReactPointerEvent) => {
        if (!g.current.active) return;
        const x = e.clientX - start.current.x, y = e.clientY - start.current.y;
        g.current = { x: 0, y: 0, active: false };
        setDrag({ x: 0, y: 0, active: false });
        if (y < -THRESHOLD && Math.abs(y) > Math.abs(x)) void act("up");
        else if (x > THRESHOLD) void act("right");
        else if (x < -THRESHOLD) void act("left");
    };

    const hint: Dir | null = drag.active ? (drag.y < -THRESHOLD / 2 && Math.abs(drag.y) > Math.abs(drag.x) ? "up" : drag.x > THRESHOLD / 2 ? "right" : drag.x < -THRESHOLD / 2 ? "left" : null) : null;
    const transform = fly
        ? fly === "up" ? "translate(0, -140%) rotate(0deg)" : `translate(${fly === "right" ? 140 : -140}%, 0) rotate(${fly === "right" ? 18 : -18}deg)`
        : `translate(${drag.x}px, ${Math.min(drag.y, 40)}px) rotate(${drag.x / 18}deg)`;

    const counts = { updates: updates.filter((u) => !done.has(`u:${u.id}`)).length, list: items.filter((t) => (t.status === "watchlist" || t.status === "watching") && !done.has(`t:${t.id}`)).length };

    return (
        <Panel
            title="Swipe through"
            description="Phone: swipe left, right or up. Desktop: the buttons or ← → ↑. Z undoes the last one."
            actions={<button type="button" style={buttonStyle} onClick={() => void undoLast()} disabled={!undo.length || busy}>↶ Undo{undo.length ? ` (${undo.length})` : ""}</button>}
        >
            <div className="bs-sources" role="radiogroup" aria-label="Cards">
                {([["all", "Everything", counts.updates + counts.list], ["updates", "Updates", counts.updates], ["list", "My watchlist", counts.list]] as const).map(([id, label, n]) => (
                    <button key={id} type="button" role="radio" aria-checked={source === id} onClick={() => setSource(id)}>{label} <b>{n}</b></button>
                ))}
            </div>
            {error && <p role="alert" style={{ color: colors.bad, margin: "0.5rem 0" }}>{error}</p>}

            {!card ? (
                <EmptyState label="All caught up. Run the sync or add titles to get more cards." />
            ) : (
                <div className="bs-stage">
                    {next && <div className="bs-card bs-card--next" aria-hidden="true"><CardFace card={next} /></div>}
                    <div
                        className="bs-card"
                        data-hint={hint ?? ""}
                        style={{ transform, transition: drag.active ? "none" : "transform 220ms cubic-bezier(.2,.9,.3,1)" }}
                        onPointerDown={onDown}
                        onPointerMove={onMove}
                        onPointerUp={onUp}
                        onPointerCancel={onUp}
                        aria-live="polite"
                    >
                        <CardFace card={card} />
                        {(["left", "right", "up"] as Dir[]).map((d) => acts[d] && <span key={d} className={`bs-stamp bs-stamp--${d}`} data-on={hint === d}>{acts[d]}</span>)}
                    </div>
                </div>
            )}

            {card && (
                <div className="bs-buttons">
                    {acts.left && <button type="button" style={buttonStyle} disabled={busy} onClick={() => void act("left")}>← {acts.left}</button>}
                    {acts.up && acts.up !== acts.right && <button type="button" style={{ ...primaryButtonStyle, background: colors.good, border: "none" }} disabled={busy} onClick={() => void act("up")}>↑ {acts.up}</button>}
                    {acts.right && <button type="button" style={primaryButtonStyle} disabled={busy} onClick={() => void act("right")}>{acts.right} →</button>}
                </div>
            )}

            {picker && <SeasonPicker t={picker} busy={busy} onCancel={() => setPicker(null)} onSave={(picked) => void saveSeasons(picker, picked)} />}
        </Panel>
    );
}

function CardFace({ card }: { card: Card }) {
    if (card.type === "update") {
        const u = card.u;
        const label = { new_season: "New season", coming_soon: "Coming soon", fix: "Data fix", link: "Match to catalogue" }[u.kind];
        return (
            <>
                <div className="bs-art">{u.image ? <img src={u.image} alt="" draggable={false} /> : <span>{u.title.slice(0, 1)}</span>}</div>
                <div className="bs-info">
                    <span className="bs-tag" data-kind={u.kind}>{label}</span>
                    <h3>{u.title}</h3>
                    <p>{u.detail}</p>
                    {u.date && <p className="bs-date">{u.date}</p>}
                </div>
            </>
        );
    }
    const t = card.t;
    const seen = t.seasons.filter((s) => s.complete).length;
    return (
        <>
            <div className="bs-art">{t.image ? <img src={t.image} alt="" draggable={false} /> : <span>{t.title.slice(0, 1)}</span>}</div>
            <div className="bs-info">
                <span className="bs-tag" data-kind={t.status}>{t.status === "watching" ? "Watching" : "Watchlist"} · {t.kind === "film" ? "Film" : "Series"}</span>
                <h3>{t.title}{t.year ? <small> ({t.year})</small> : null}</h3>
                {t.kind === "series" && t.seasons.length > 0 && (
                    <>
                        <p>{seen} of {t.seasons.length} season{t.seasons.length === 1 ? "" : "s"} seen</p>
                        <div className="bs-bar" aria-hidden="true"><i style={{ width: `${(seen / t.seasons.length) * 100}%` }} /></div>
                    </>
                )}
                {t.genres.length > 0 && <p className="bs-genres">{t.genres.slice(0, 3).join(" · ")}</p>}
            </div>
        </>
    );
}

/** Tick the seasons already watched. */
function SeasonPicker({ t, busy, onSave, onCancel }: { t: BingeTitle; busy: boolean; onSave: (picked: Set<number>) => void; onCancel: () => void }) {
    const [picked, setPicked] = useState<Set<number>>(new Set(t.seasons.filter((s) => s.complete).map((s) => s.number)));
    const toggle = (n: number) => setPicked((p) => { const s = new Set(p); if (s.has(n)) s.delete(n); else s.add(n); return s; });
    return (
        <div className="bs-sheet" role="dialog" aria-modal="true" aria-label={`Seasons of ${t.title}`}>
            <div className="bs-sheet__card">
                <h3>{t.title}: which seasons have you seen?</h3>
                <div className="bs-sheet__quick">
                    <button type="button" style={buttonStyle} onClick={() => setPicked(new Set(t.seasons.map((s) => s.number)))}>All</button>
                    <button type="button" style={buttonStyle} onClick={() => setPicked(new Set())}>None</button>
                </div>
                <ul>
                    {t.seasons.map((s) => (
                        <li key={s.number}>
                            <label>
                                <input type="checkbox" checked={picked.has(s.number)} onChange={() => toggle(s.number)} />
                                Season {s.number}{s.episodes ? <small> · {s.episodes} episodes</small> : null}
                            </label>
                        </li>
                    ))}
                </ul>
                <div className="bs-sheet__actions">
                    <button type="button" style={buttonStyle} onClick={onCancel}>Cancel</button>
                    <button type="button" style={primaryButtonStyle} disabled={busy} onClick={() => onSave(picked)}>Save {picked.size} season{picked.size === 1 ? "" : "s"}</button>
                </div>
            </div>
        </div>
    );
}

/** Everything the weekly sync found, with a button to run it now. */
export function BingeUpdates({ onChanged, onUnauthorized }: { onChanged: () => void; onUnauthorized: () => void }) {
    const [items, setItems] = useState<BingeUpdate[]>([]);
    const [busy, setBusy] = useState("");
    const [note, setNote] = useState("");

    const load = useCallback(() => {
        adminFetch<BingeUpdate[]>("/api/binge/updates").then(setItems).catch((e: { unauthorized?: boolean }) => { if (e?.unauthorized) onUnauthorized(); });
    }, [onUnauthorized]);
    useEffect(() => { load(); }, [load]);

    const sync = async () => {
        setBusy("sync");
        setNote("");
        try {
            const r = await adminFetch<{ checked: number; found: number; remaining: number; errors: string[] }>("/api/binge/sync", { method: "POST", ...json({ limit: 40 }) });
            setNote(`Checked ${r.checked} series, found ${r.found} new. ${r.remaining ? `${r.remaining} still due: run again.` : "All checked."}${r.errors.length ? ` ${r.errors.length} failed.` : ""}`);
            load();
        } catch (e) {
            setNote(e instanceof Error ? e.message : "Sync failed.");
        } finally {
            setBusy("");
        }
    };

    const act = async (ids: string[], action: "apply" | "dismiss") => {
        setBusy(ids.join(","));
        try {
            await adminFetch("/api/binge/updates", { method: "PATCH", ...json({ ids, action }) });
            load();
            onChanged();
        } finally {
            setBusy("");
        }
    };

    const groups: [string, BingeUpdate["kind"][]][] = [["Coming soon", ["coming_soon"]], ["New seasons", ["new_season"]], ["Match to catalogue", ["link"]], ["Data fixes", ["fix"]]];

    return (
        <Panel
            title={`Updates · ${items.length}`}
            description="Found by the weekly sync (GitHub Actions, Mondays). Nothing changes on your list until you apply it."
            actions={<button type="button" style={primaryButtonStyle} disabled={busy === "sync"} onClick={() => void sync()}>{busy === "sync" ? "Checking…" : "Run sync now"}</button>}
        >
            {note && <p style={{ margin: "0 0 0.8rem", color: colors.ink2 }}>{note}</p>}
            {items.length === 0 ? <EmptyState label="No updates waiting." /> : groups.map(([label, kinds]) => {
                const list = items.filter((u) => kinds.includes(u.kind));
                if (!list.length) return null;
                return (
                    <section key={label} className="bu-group">
                        <header>
                            <b>{label} · {list.length}</b>
                            {label !== "Coming soon" && <button type="button" style={buttonStyle} disabled={!!busy} onClick={() => void act(list.map((u) => u.id), "apply")}>Apply all</button>}
                        </header>
                        <ul>
                            {list.map((u) => (
                                <li key={u.id}>
                                    {u.image ? <img src={u.image} alt="" /> : <span className="bu-ph">{u.title.slice(0, 1)}</span>}
                                    <div><b>{u.title}</b><small>{u.detail}</small></div>
                                    <div className="bu-actions">
                                        <button type="button" style={primaryButtonStyle} disabled={!!busy} onClick={() => void act([u.id], "apply")}>{u.kind === "coming_soon" ? "Got it" : "Apply"}</button>
                                        <button type="button" style={buttonStyle} disabled={!!busy} onClick={() => void act([u.id], "dismiss")}>Dismiss</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                );
            })}
        </Panel>
    );
}
