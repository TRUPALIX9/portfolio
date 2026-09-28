'use client';

import { useState } from 'react';
import type { GameType } from '@/data/logicsprint';
import type { BoardEntry, Difficulty } from '@/utils/logicsprint-stats';

/* A game's top 5 from the global board, in the app's Ranks-row look: rank, NAME with its dimmed
   #tag, run time where the app records one, score; #1 in the game's accent. Memory Lane and Quick
   Math keep Easy / Medium / Hard boards; the other two have one board, stored as medium. */

const SHOWN = 5;
const LEVELS: { id: Difficulty; label: string }[] = [
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' },
];
/** Games with difficulty boards; they also record how long a run took. */
const HAS_LEVELS: ReadonlySet<GameType> = new Set(['memoryLane', 'quickMath']);

const formatScore = new Intl.NumberFormat('en-US').format;
const pad2 = (n: number) => String(n).padStart(2, '0');

function formatTime(ms: number) {
    const total = Math.round(ms / 1000);
    return `${Math.floor(total / 60)}:${pad2(total % 60)}`;
}

function splitName(name: string) {
    const i = name.lastIndexOf('#');
    return i > 0 ? { base: name.slice(0, i), tag: name.slice(i) } : { base: name, tag: '' };
}

export default function HighScores({
    type,
    name,
    boards,
    modes,
}: {
    type: GameType;
    name: string;
    boards: Partial<Record<Difficulty, BoardEntry[]>>;
    modes?: { level: string; detail: string }[];
}) {
    const [level, setLevel] = useState<Difficulty>('medium');
    const hasLevels = HAS_LEVELS.has(type);
    const rows = (boards[hasLevels ? level : 'medium'] ?? []).slice(0, SHOWN);
    const empty = Array.from({ length: SHOWN - rows.length }, (_, i) => rows.length + i + 1);

    return (
        <div className="lsg-hs">
            <div className="lsg-hs-head">
                <h4 className="ls-label">High scores</h4>
                {hasLevels && (
                    <div className="lsg-hs-tabs" role="group" aria-label={`${name} difficulty`}>
                        {LEVELS.map((l) => (
                            <button key={l.id} type="button" aria-pressed={l.id === level} onClick={() => setLevel(l.id)}>
                                {l.label}
                                <span className="lsg-hs-detail"> {modes?.find((m) => m.level.toLowerCase() === l.id)?.detail}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <ol className="lsg-rows">
                {rows.map((entry) => {
                    const { base, tag } = splitName(entry.name);
                    return (
                        <li key={`${entry.rank}-${entry.name}`} className="lsg-row" data-rank={entry.rank}>
                            <span className="ls-num lsg-row-rank">{pad2(entry.rank)}</span>
                            <span className="lsg-row-name">
                                {base}
                                {tag && <span className="lsg-row-tag">{tag}</span>}
                            </span>
                            {hasLevels && entry.durationMs != null && <span className="ls-num lsg-row-time">{formatTime(entry.durationMs)}</span>}
                            <span className="ls-num lsg-row-score">{formatScore(entry.score)}</span>
                        </li>
                    );
                })}
                {empty.map((rank) => (
                    <li key={`empty-${rank}`} className="lsg-row" data-empty>
                        <span className="ls-num lsg-row-rank">{pad2(rank)}</span>
                        <span className="lsg-row-name">Your name here</span>
                    </li>
                ))}
            </ol>
        </div>
    );
}
