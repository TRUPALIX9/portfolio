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

export type Difficulty = 'easy' | 'medium' | 'hard';
export type BoardEntry = { rank: number; name: string; score: number; durationMs: number | null };
/** Keyed `${game}:${difficulty}`. Rocket Launch and Guess Color have one board, stored as medium. */
export type Boards = Partial<Record<`${GameType}:${Difficulty}`, BoardEntry[]>>;

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const isDifficulty = (value: unknown): value is Difficulty => DIFFICULTIES.includes(value as Difficulty);

/** Every board's Top 10 in one request, like the app's daily fetch. Empty on any failure. */
export async function getBoards(): Promise<Boards> {
    const rows = await getRows(
        'leaderboard_ranked?select=player_name,game_type,difficulty,score,duration_ms,board_rank&board_rank=lte.10&order=board_rank.asc',
    );
    const boards: Boards = {};
    for (const row of rows ?? []) {
        if (!isGameType(row.game_type) || !isDifficulty(row.difficulty)) continue;
        if (typeof row.player_name !== 'string' || !row.player_name.trim()) continue;
        const key = `${row.game_type}:${row.difficulty}` as const;
        const duration = Number(row.duration_ms);
        (boards[key] ??= []).push({
            rank: toCount(row.board_rank),
            name: row.player_name,
            score: toCount(row.score),
            durationMs: row.duration_ms != null && Number.isFinite(duration) ? duration : null,
        });
    }
    return boards;
}
