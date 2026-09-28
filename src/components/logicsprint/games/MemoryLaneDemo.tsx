'use client';

import { useRef } from 'react';
import { GameBar, TouchDot } from './PhoneFrame';
import { mulberry32, useDemoActive, useScript, type Beat } from './useDemoRuntime';

/* Memory Lane on Medium (4×4), as played on the phone (lib/games/memory_lane): "WATCH · DON'T TAP"
   with red corners while the pattern plays at the engine's pace (lit 450 ms, gap 150 ms, quicker
   each level), then "YOUR TURN · REPEAT IT" with teal corners while the finger taps it back. Each
   clean repeat adds the level bonus, levels up and grows the pattern by one tile. */

const ACCENT = '#2BB3D6';
const SIZE = 4;
const CELLS = Array.from({ length: SIZE * SIZE }, (_, i) => i);
const LEVELS_PER_RUN = 4;

type Tap = { cell: number; n: number; x: number; y: number };
type ML = {
    pattern: number[];
    watching: boolean;
    /** Repeat done, next playback pending: taps wouldn't count (red corners). */
    waiting: boolean;
    level: number;
    lit: number | null;
    correct: number | null;
    steps: number;
    score: number;
    tap: Tap | null;
    fade: boolean;
};

/** MemoryLaneEngine.paceAt: 1 at level 1, easing toward 0.6. */
const paceAt = (level: number) => 1 - 0.4 * (1 - Math.exp(-(level - 1) / 6));
/** MemoryLaneEngine.bonusFor. */
const bonusFor = (level: number) => Math.round(20 * Math.sqrt(level));

function nextTile(rand: () => number, last: number | undefined) {
    let tile = Math.floor(rand() * SIZE * SIZE);
    while (tile === last) tile = Math.floor(rand() * SIZE * SIZE);
    return tile;
}

/** The screenshot's opening pattern starts on the third tile. */
const FIRST_PATTERN = [2, 13, 4, 11];

function* memoryScript(): Generator<Beat<ML>, never> {
    let taps = 0;
    for (let run = 0; ; run++) {
        const rand = mulberry32(911 + (run % 3) * 57);
        let pattern = run === 0 ? FIRST_PATTERN : [];
        while (pattern.length < SIZE) pattern = [...pattern, nextTile(rand, pattern.at(-1))];
        let level = 1;
        let score = 0;
        let streak = 0;
        yield [{ pattern, level, score, watching: true, waiting: false, lit: null, correct: null, steps: 0, tap: null, fade: false }, 600];

        for (let round = 0; round < LEVELS_PER_RUN; round++) {
            const pace = paceAt(level);
            if (round > 0) yield [{ pattern, watching: true, waiting: false, steps: 0, lit: null }, 600];
            for (let i = 0; i < pattern.length; i++) {
                yield [{ lit: pattern[i] }, 450 * pace];
                yield [{ lit: null }, i + 1 < pattern.length ? 150 * pace : 0];
            }
            // Your turn: a beat to react, then the finger replays the pattern.
            yield [{ watching: false }, 620 + rand() * 250];
            for (let i = 0; i < pattern.length; i++) {
                const cell = pattern[i];
                yield [{ tap: { cell, n: ++taps, x: (rand() - 0.5) * 30, y: (rand() - 0.5) * 50 } }, 90];
                streak++;
                score += 10 + (streak % 5 === 0 ? 20 : 0);
                const last = i + 1 === pattern.length;
                if (last) {
                    score += bonusFor(level);
                    level++;
                }
                yield [{ correct: cell, steps: i + 1, score, level, waiting: last }, 250];
                yield [{ correct: null }, last ? 550 : 170 + rand() * 180];
            }
            pattern = [...pattern, nextTile(rand, pattern.at(-1))];
        }
        yield [{ fade: true }, 500];
    }
}

const INITIAL: ML = {
    pattern: FIRST_PATTERN,
    watching: true,
    waiting: false,
    level: 1,
    lit: null,
    correct: null,
    steps: 0,
    score: 0,
    tap: null,
    fade: false,
};
/** The screenshot: level 1, first tile of four lit. */
const STILL: ML = { ...INITIAL, lit: 2 };

export default function MemoryLaneDemo() {
    const rootRef = useRef<HTMLDivElement>(null);
    const { active, reduced } = useDemoActive(rootRef);
    const s = useScript(active, reduced, INITIAL, STILL, memoryScript);
    const canTap = !s.watching && !s.waiting;

    return (
        <div ref={rootRef} className="lsg-app lsg-ml" data-fade={s.fade || undefined}>
            <GameBar accent={ACCENT} score={s.score} />
            <div className="lsg-field lsg-ml-field">
                <div className="lsg-ch lsg-ml-strip" data-watch={s.watching || undefined}>
                    <span className="lsg-ml-strip-text">{s.watching ? 'Watch · don’t tap' : 'Your turn · repeat it'}</span>
                    <b>
                        {s.watching ? 0 : s.steps}/{s.pattern.length}
                    </b>
                </div>
                <p className="lsg-ml-level">Level {s.level}</p>
                <div className="lsg-ml-board" data-turn={canTap || undefined}>
                    <div className="lsg-ch lsg-ml-grid">
                        {CELLS.map((i) => {
                            const lit = s.lit === i;
                            const ok = s.correct === i;
                            return (
                                <span key={i} className="lsg-ml-cell" data-lit={lit || undefined}>
                                    <span className="lsg-ch lsg-ml-tile" data-ok={ok || undefined}>
                                        <i />
                                    </span>
                                    {s.tap?.cell === i && <TouchDot key={s.tap.n} x={s.tap.x} y={s.tap.y} />}
                                </span>
                            );
                        })}
                    </div>
                    <i className="lsg-ml-corner" data-c="tl" />
                    <i className="lsg-ml-corner" data-c="tr" />
                    <i className="lsg-ml-corner" data-c="bl" />
                    <i className="lsg-ml-corner" data-c="br" />
                </div>
            </div>
        </div>
    );
}
