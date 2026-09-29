"use client";

import { useEffect, useState } from "react";
import { AdminRequestError, EmptyState, Panel, Pill, adminFetch, buttonStyle, colors, fmtDateTime, primaryButtonStyle } from "./ui";

type ContactSubmission = {
    id: string;
    name: string;
    email: string;
    message: string;
    status?: string | null;
    created_at: string;
    source?: string | null;
};

export function InboxTab({ refreshKey, onUnauthorized }: { refreshKey: number; onUnauthorized: () => void }) {
    const [messages, setMessages] = useState<ContactSubmission[] | null>(null);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState("");
    const [filter, setFilter] = useState<"new" | "all">("new");
    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        adminFetch<ContactSubmission[]>("/api/contact-submissions")
            .then((data) => {
                if (cancelled) return;
                setMessages(Array.isArray(data) ? data : []);
                setError("");
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                if (err instanceof AdminRequestError && err.unauthorized) onUnauthorized();
                setError(err instanceof Error ? err.message : "Failed to load messages.");
            });
        return () => {
            cancelled = true;
        };
    }, [refreshKey, tick, onUnauthorized]);

    const setStatus = async (id: string, status: string) => {
        setBusyId(id);
        try {
            await adminFetch("/api/contact-submissions", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            setTick((t) => t + 1);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Status update failed.");
        } finally {
            setBusyId("");
        }
    };

    const all = messages ?? [];
    const newCount = all.filter((m) => (m.status ?? "new") === "new").length;
    const shown = filter === "new" ? all.filter((m) => (m.status ?? "new") === "new") : all;

    return (
        <Panel
            title={`Messages (${newCount} new of ${all.length})`}
            description="Everything sent through the contact form."
            actions={(
                <div role="group" aria-label="Filter messages" style={{ display: "flex", gap: "0.4rem" }}>
                    {(["new", "all"] as const).map((f) => (
                        <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} style={filter === f ? primaryButtonStyle : buttonStyle}>
                            {f === "new" ? "New" : "All"}
                        </button>
                    ))}
                </div>
            )}
        >
            {error && <p role="alert" style={{ margin: "0 0 1rem", color: "#fecaca", fontWeight: 700 }}>{error}</p>}
            {!messages && !error && <p style={{ margin: 0, color: colors.ink3 }}>Loading…</p>}
            {messages && shown.length === 0 && <EmptyState label={filter === "new" ? "No new messages." : "No messages yet."} />}
            <div style={{ display: "grid", gap: "0.8rem" }}>
                {shown.map((m) => {
                    const status = m.status ?? "new";
                    return (
                        <article key={m.id} style={{ padding: "1rem", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${colors.line}`, display: "grid", gap: "0.6rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                                <div style={{ minWidth: 0 }}>
                                    <strong style={{ color: colors.ink1, overflowWrap: "anywhere" }}>{m.name}</strong>
                                    <div style={{ color: colors.ink3, fontSize: "0.85rem", overflowWrap: "anywhere" }}>{m.email}</div>
                                </div>
                                <Pill label={status.toUpperCase()} tone={status === "new" ? "accent" : "neutral"} />
                            </div>
                            <p style={{ margin: 0, color: colors.ink2, lineHeight: 1.65, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{m.message}</p>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{ color: colors.ink3, fontSize: "0.8rem" }}>{fmtDateTime(m.created_at)}</span>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    {m.email.includes("@") && (
                                        <a href={`mailto:${m.email}`} style={{ ...buttonStyle, textDecoration: "none" }}>Reply</a>
                                    )}
                                    <button type="button" disabled={busyId === m.id} onClick={() => void setStatus(m.id, status === "reviewed" ? "new" : "reviewed")} style={primaryButtonStyle}>
                                        {busyId === m.id ? "Updating…" : status === "reviewed" ? "Mark new" : "Mark reviewed"}
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </Panel>
    );
}
