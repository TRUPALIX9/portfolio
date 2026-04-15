"use client";

const DEVICE_STORAGE_KEY = "portfolio_device_id";
const SESSION_STORAGE_KEY = "portfolio_session_id";

function createId(prefix: string) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getVisitorDeviceId() {
    if (typeof window === "undefined") return "";

    const existing = window.localStorage.getItem(DEVICE_STORAGE_KEY);
    if (existing) return existing;

    const next = createId("device");
    window.localStorage.setItem(DEVICE_STORAGE_KEY, next);
    return next;
}

export function getVisitorSessionId() {
    if (typeof window === "undefined") return "";

    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;

    const next = createId("session");
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, next);
    return next;
}

type VisitorEventPayload = {
    route: string;
    source?: string;
    shareToken?: string;
    event:
        | "page_view"
        | "link_open"
        | "resume_open"
        | "resume_download"
        | "contact_submit"
        | "game_open"
        | "run_complete";
    linkName?: string;
    linkUrl?: string;
    game?: string;
    score?: number;
};

export async function trackVisitorEvent(payload: VisitorEventPayload) {
    try {
        const deviceId = getVisitorDeviceId();
        const sessionId = getVisitorSessionId();

        await fetch("/api/visitor-analytics", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...payload,
                deviceId,
                sessionId,
            }),
            keepalive: true,
        });
    } catch {
        // Analytics should stay silent and never break UX.
    }
}
