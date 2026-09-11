import { getVisitorDeviceId, getVisitorSessionId } from './visitor-analytics';

const PLAYER_NAME_KEY = 'arcade-player-name';
const MAX_NAME_LENGTH = 24;
const MAX_SCORE = 100000;

export function getSavedArcadePlayerName() {
    if (typeof window === 'undefined') return '';
    try {
        return window.localStorage.getItem(PLAYER_NAME_KEY) ?? '';
    } catch {
        return '';
    }
}

export function saveArcadePlayerName(name: string) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(PLAYER_NAME_KEY, name.trim());
    } catch {
        // Storage can be unavailable (private mode, blocked site data); the name just won't persist.
    }
}

function safeId(getId: () => string) {
    try {
        return getId();
    } catch {
        return '';
    }
}

export async function submitArcadeScore(name: string, score: number, game: string) {
    const trimmedName = name.trim().slice(0, MAX_NAME_LENGTH);
    if (!trimmedName) return false;
    if (!Number.isFinite(score)) throw new Error('Invalid score');

    saveArcadePlayerName(trimmedName);

    const deviceId = safeId(getVisitorDeviceId);
    const sessionId = safeId(getVisitorSessionId);
    const safeScore = Math.min(MAX_SCORE, Math.max(0, Math.floor(score)));

    const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, score: safeScore, game, deviceId, sessionId }),
    });

    if (!response.ok) {
        throw new Error(`Failed to save score (${response.status})`);
    }

    return true;
}
