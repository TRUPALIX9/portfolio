"use client";

import { useEffect, useState } from "react";
import {
    AdminRequestError,
    DataTable,
    Grid,
    Panel,
    StatCard,
    adminAction,
    adminFetch,
    buttonStyle,
    colors,
    dangerButtonStyle,
    fmtAgo,
    fmtNumber,
    fmtPlace,
    inputStyle,
    primaryButtonStyle,
} from "./ui";

type Settings = {
    blockedIps: string[];
    ownerIps: string[];
    envOwnerIps: string[];
    currentIp: string;
    owners: { visitor_id: string; custom_name?: string; device?: { class?: string; os?: string; browser?: string }; geo?: { city?: string; country?: string }; ip?: string; last_seen?: string }[];
    totals: { visitors: number; sessions: number; events: number };
    resetPhrase: string;
};

/** Pages worth sharing directly, each tagged so its visits show up under "Tagged links". */
const SHARE_LINKS = [
    { label: "Portfolio (for your resume)", path: "/?ref=resume" },
    { label: "Portfolio (for LinkedIn)", path: "/?ref=linkedin" },
    { label: "Portfolio (for GitHub)", path: "/?ref=github" },
    { label: "Social links page", path: "/social-only?ref=share" },
];

export function DataTab({ refreshKey, onUnauthorized, onDataChanged, openVisitor }: {
    refreshKey: number;
    onUnauthorized: () => void;
    onDataChanged: () => void;
    openVisitor: (id: string) => void;
}) {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [error, setError] = useState("");
    const [ip, setIp] = useState("");
    const [confirm, setConfirm] = useState("");
    const [busy, setBusy] = useState(false);
    const [copyStatus, setCopyStatus] = useState("");
    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        adminFetch<Settings>("/api/analytics/admin")
            .then((data) => {
                if (!cancelled) setSettings(data);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                if (err instanceof AdminRequestError && err.unauthorized) onUnauthorized();
                setError(err instanceof Error ? err.message : "Failed to load settings.");
            });
        return () => {
            cancelled = true;
        };
    }, [refreshKey, tick, onUnauthorized]);

    const run = async (body: Record<string, unknown>) => {
        setBusy(true);
        try {
            await adminAction(body);
            setTick((t) => t + 1);
            onDataChanged();
            return true;
        } catch (err) {
            alert(err instanceof Error ? err.message : "Action failed.");
            return false;
        } finally {
            setBusy(false);
        }
    };

    const copy = async (path: string, label: string) => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}${path}`);
            setCopyStatus(`${label} link copied.`);
        } catch {
            setCopyStatus("Copy failed. You can still copy the link manually.");
        }
    };

    return (
        <div style={{ display: "grid", gap: "1rem" }}>
            {error && <p role="alert" style={{ margin: 0, color: "#fecaca", fontWeight: 700 }}>{error}</p>}

            {settings && (
                <Grid min={180}>
                    <StatCard title="Visitors stored" value={fmtNumber(settings.totals.visitors)} />
                    <StatCard title="Visits stored" value={fmtNumber(settings.totals.sessions)} />
                    <StatCard title="Events stored" value={fmtNumber(settings.totals.events)} hint="Raw events and page views are kept ~13 months" />
                </Grid>
            )}

            {settings && (
                <Panel
                    title="Keep your own visits out"
                    description="Your visits are hidden from every report (switch Traffic to “Only me” to see them). Three ways a device counts as you: signing in here marks this browser automatically; “This is me” on a visitor profile marks that device; and a network below marks every device on it, such as all browsers on your Mac at home."
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", padding: "0.8rem 1rem", borderRadius: "12px", border: `1px solid ${colors.line}`, marginBottom: "0.8rem" }}>
                        <div>
                            <div style={{ color: colors.ink3, fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your current IP</div>
                            <code style={{ color: colors.ink1 }}>{settings.currentIp || "unknown"}</code>
                            {settings.currentIp.includes(":") && (
                                <div style={{ color: colors.ink3, fontSize: "0.8rem", marginTop: "0.25rem" }}>This is an IPv6 address, which can change every few days. Signing in on each browser is the more reliable option.</div>
                            )}
                        </div>
                        {settings.ownerIps.includes(settings.currentIp) || settings.envOwnerIps.includes(settings.currentIp) ? (
                            <span style={{ color: colors.good, fontWeight: 800 }}>✓ Marked as you</span>
                        ) : (
                            <button type="button" disabled={busy || !settings.currentIp} onClick={() => void run({ action: "add_owner_ip" })} style={primaryButtonStyle}>
                                Mark this network as me
                            </button>
                        )}
                    </div>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.4rem" }}>
                        {settings.ownerIps.map((ownerIp) => (
                            <li key={ownerIp} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.6rem", borderRadius: "8px", border: `1px solid ${colors.line}` }}>
                                <code style={{ color: colors.ink1 }}>{ownerIp}</code>
                                <button type="button" disabled={busy} onClick={() => void run({ action: "remove_owner_ip", ip: ownerIp })} style={buttonStyle}>Remove</button>
                            </li>
                        ))}
                        {settings.envOwnerIps.map((ownerIp) => (
                            <li key={`env-${ownerIp}`} style={{ padding: "0.4rem 0.6rem", borderRadius: "8px", border: `1px solid ${colors.line}`, color: colors.ink2 }}>
                                <code style={{ color: colors.ink1 }}>{ownerIp}</code> · from the OWNER_IPS setting
                            </li>
                        ))}
                    </ul>
                </Panel>
            )}

            <Panel title="Tagged share links" description="Use these instead of the bare URL so each source shows up by name in Sources.">
                <div style={{ display: "grid", gap: "0.6rem" }}>
                    {SHARE_LINKS.map((link) => (
                        <div key={link.path} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "0.75rem", alignItems: "center", padding: "0.7rem 0.9rem", borderRadius: "12px", border: `1px solid ${colors.line}` }}>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ color: colors.ink1, fontWeight: 800 }}>{link.label}</div>
                                <div style={{ color: colors.ink3, fontSize: "0.82rem", wordBreak: "break-all" }}>{link.path}</div>
                            </div>
                            <button type="button" onClick={() => void copy(link.path, link.label)} aria-label={`Copy ${link.label} link`} style={buttonStyle}>Copy</button>
                        </div>
                    ))}
                    <p aria-live="polite" style={{ margin: 0, color: colors.ink3, minHeight: "1.2em" }}>{copyStatus}</p>
                </div>
            </Panel>

            <Grid min={340}>
                <Panel title="Your devices" description="Browsers marked as you. Signing in here marks a browser automatically; set OWNER_IPS in the environment to also cover your home network.">
                    <DataTable
                        rows={settings?.owners ?? []}
                        rowKey={(o) => o.visitor_id}
                        onRowClick={(o) => openVisitor(o.visitor_id)}
                        empty="No devices marked yet."
                        columns={[
                            { label: "Device", render: (o) => o.custom_name || `${o.device?.os ?? "?"} · ${o.device?.browser ?? "?"}` },
                            { label: "Where", render: (o) => fmtPlace(o.geo) },
                            { label: "Last seen", render: (o) => fmtAgo(o.last_seen) },
                        ]}
                    />
                </Panel>

                <Panel title="Blocked IPs" description="Visits from these addresses aren't recorded at all.">
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (ip.trim() && await run({ action: "block_ip", ip: ip.trim() })) setIp("");
                        }}
                        style={{ display: "flex", gap: "0.5rem", marginBottom: "0.8rem", flexWrap: "wrap" }}
                    >
                        <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="IP address" aria-label="IP address to block" style={{ ...inputStyle, flex: "1 1 180px" }} />
                        <button type="submit" disabled={busy || !ip.trim()} style={primaryButtonStyle}>Block</button>
                    </form>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.4rem" }}>
                        {(settings?.blockedIps ?? []).map((blocked) => (
                            <li key={blocked} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.6rem", borderRadius: "8px", border: `1px solid ${colors.line}` }}>
                                <code style={{ color: colors.ink1 }}>{blocked}</code>
                                <button type="button" disabled={busy} onClick={() => void run({ action: "unblock_ip", ip: blocked })} style={buttonStyle}>Unblock</button>
                            </li>
                        ))}
                        {settings && settings.blockedIps.length === 0 && <li style={{ color: colors.ink3 }}>No blocked IPs.</li>}
                    </ul>
                </Panel>
            </Grid>

            {settings && (
                <Panel title="Reset analytics" description={`Permanently deletes every visitor, visit and event. Blocked IPs are kept. Type ${settings.resetPhrase} to enable.`}>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <input
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder={settings.resetPhrase}
                            aria-label={`Type ${settings.resetPhrase} to confirm`}
                            autoComplete="off"
                            spellCheck={false}
                            style={{ ...inputStyle, flex: "1 1 220px" }}
                        />
                        <button
                            type="button"
                            disabled={busy || confirm !== settings.resetPhrase}
                            onClick={async () => {
                                if (!window.confirm("Delete all analytics data? This cannot be undone.")) return;
                                if (await run({ action: "reset_all", confirm })) setConfirm("");
                            }}
                            style={{ ...dangerButtonStyle, opacity: confirm === settings.resetPhrase ? 1 : 0.55 }}
                        >
                            Delete all analytics
                        </button>
                    </div>
                </Panel>
            )}
        </div>
    );
}
