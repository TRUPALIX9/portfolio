import type { GameType } from '@/data/logicsprint';

/**
 * Read-only public stats for LogicSprint, fetched server-side and cached for an hour.
 * The publishable key is designed to be public; the database is read-only for it.
 * Every function resolves to null/empty on any failure: the page hides the section, never errors.
 */
const REST_URL = 'https://axucnwnzuhdsiggqyjqf.supabase.co/rest/v1';
const PUBLISHABLE_KEY = 'sb_publishable_dzJkARQ59BSHuvJIlhnoTg_4NI5kWo0';
const GAME_TYPES: GameType[] = ['rocketLaunch', 'memoryLane', 'quickMath', 'guessColor'];

export type GameStat = { players: number; plays: number; topScore: number };
export type LeaderboardEntry = { name: string; score: number };

export type LogicSprintStats = {
    /** Highest per-game player count (players aren't deduplicated across games). */
    players: number;
    /** Sum of runs across all games. */
    plays: number;
    byGame: Partial<Record<GameType, GameStat>>;
};

async function getRows(pathAndQuery: string): Promise<Record<string, unknown>[] | null> {
    try {
        const res = await fetch(`${REST_URL}/${pathAndQuery}`, {
            headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${PUBLISHABLE_KEY}` },
            next: { revalidate: 3600 },
            // Don't let a slow Supabase hold up a build or revalidation.
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return null;
        const data: unknown = await res.json();
        return Array.isArray(data) ? data : null;
    } catch {
        return null;
    }
}

const toCount = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : 0;
};

const isGameType = (value: unknown): value is GameType => GAME_TYPES.includes(value as GameType);

export async function getLogicSprintStats(): Promise<LogicSprintStats | null> {
    const rows = await getRows('game_stats?select=*');
    if (!rows?.length) return null;

    const byGame: LogicSprintStats['byGame'] = {};
    for (const row of rows) {
        if (!isGameType(row.game_type)) continue;
        byGame[row.game_type] = {
            players: toCount(row.players),
            plays: toCount(row.plays),
            topScore: toCount(row.top_score),
        };
    }

    const stats = Object.values(byGame);
    const plays = stats.reduce((sum, s) => sum + s.plays, 0);
    if (!stats.length || plays === 0) return null;
    return { players: Math.max(...stats.map(s => s.players)), plays, byGame };
}

/** Top 3 on medium difficulty for each game; games without entries are omitted. */
export async function getTopThreeByGame(): Promise<Partial<Record<GameType, LeaderboardEntry[]>>> {
    const results = await Promise.all(
        GAME_TYPES.map(async (game) => {
            const rows = await getRows(
                `leaderboard_top?select=player_name,score,game_type,difficulty&game_type=eq.${game}&difficulty=eq.medium&order=score.desc,tie_key.asc&limit=3`,
            );
            const entries = (rows ?? [])
                .filter(r => typeof r.player_name === 'string' && r.player_name.trim())
                .map(r => ({ name: String(r.player_name), score: toCount(r.score) }));
            return [game, entries] as const;
        }),
    );
    return Object.fromEntries(results.filter(([, entries]) => entries.length > 0));
}
