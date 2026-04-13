const PLAYER_NAME_KEY = 'arcade-player-name';

export function getSavedArcadePlayerName() {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(PLAYER_NAME_KEY) ?? '';
}

export function saveArcadePlayerName(name: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(PLAYER_NAME_KEY, name.trim());
}

export async function submitArcadeScore(name: string, score: number, game: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return false;

    saveArcadePlayerName(trimmedName);
    await fetch('/api/leaderboard', {
        method: 'POST',
        body: JSON.stringify({ name: trimmedName, score, game }),
    });

    return true;
}
