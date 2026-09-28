'use client';

import { useRef, type CSSProperties } from 'react';
import { FitText, GameBar, TouchDot } from './PhoneFrame';
import { mulberry32, useDemoActive, useScript, type Beat } from './useDemoRuntime';

/* Guess Color, as played on the phone (lib/games/guess_color): the COLOR | TEXT switch, the word
   card, the countdown bar, four coloured buttons. A scripted run from word 21, where the engine's
   rule swaps start (min 2 words per rule, 35% TEXT) on top of shuffled buttons and the per-word
   clock (3 s at word 13, −50 ms a word); from word 31 every label names a different colour. */

const ACCENT = '#8C8CFF';
const INK = { red: '#FF5A6E', blue: '#3B7BF0', green: '#34C29A', yellow: '#F5C542' } as const;
type Ink = keyof typeof INK;
const COLORS: Ink[] = ['red', 'blue', 'green', 'yellow'];
type Rule = 'color' | 'text';

type Button = { fill: Ink; label: Ink };
type Tap = { slot: number; n: number; x: number; y: number };
type GC = {
    n: number;
    word: Ink;
    ink: Ink;
    rule: Rule;
    ruleChanged: boolean;
    buttons: Button[];
    limit: number;
    picked: Ink | null;
    score: number;
    tap: Tap | null;
    fade: boolean;
};

const FIRST_WORD = 21;
const LAST_WORD = 40;
const FEEDBACK_MS = 250;
const MAX_LIMIT = 3000;

/** GuessColorEngine.timeLimitFor (from word 13). */
const limitFor = (n: number) => Math.max(1000, MAX_LIMIT - 50 * (n - 13));
const target = (s: Pick<GC, 'rule' | 'word' | 'ink'>) => (s.rule === 'text' ? s.word : s.ink);

function shuffle<T>(list: readonly T[], rand: () => number): T[] {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/** A shuffle where no colour keeps its own slot (the mislabel trap). */
function derange(fills: Ink[], rand: () => number) {
    for (;;) {
        const out = shuffle(fills, rand);
        if (out.every((c, i) => c !== fills[i])) return out;
    }
}

/** GuessColorEngine.generate for words 21–40. */
function generate(n: number, rand: () => number, prevRule: Rule, ruleRun: number) {
    const wanted: Rule = rand() < 0.35 ? 'text' : 'color';
    const rule = ruleRun < 2 ? prevRule : wanted;
    const ink = COLORS[Math.floor(rand() * 4)];
    const others = COLORS.filter((c) => c !== ink);
    const word = others[Math.floor(rand() * others.length)];
    const fills = shuffle(COLORS, rand);
    const labels = n >= 31 ? derange(fills, rand) : fills;
    return {
        n,
        word,
        ink,
        rule,
        ruleChanged: rule !== prevRule,
        buttons: fills.map((fill, i) => ({ fill, label: labels[i] })),
        limit: limitFor(n),
    };
}

/** The screenshot's word: GREEN painted red, rule COLOR. */
const FIRST = {
    n: FIRST_WORD,
    word: 'green' as Ink,
    ink: 'red' as Ink,
    rule: 'color' as Rule,
    ruleChanged: false,
    buttons: COLORS.map((c) => ({ fill: c, label: c })),
    limit: limitFor(FIRST_WORD),
};
/** 20 right answers so far, with four streak bonuses. */
const START_SCORE = 20 * 10 + 4 * 20;

function* guessScript(): Generator<Beat<GC>, never> {
    let taps = 0;
    for (let run = 0; ; run++) {
        const rand = mulberry32(4242 + (run % 3) * 97);
        let item = FIRST;
        let score = START_SCORE;
        let ruleRun = 2;
        yield [{ ...item, picked: null, score, tap: null, fade: false }, 700 + rand() * 300];
        for (let n = FIRST_WORD; n <= LAST_WORD; n++) {
            const right = target(item);
            const slot = item.buttons.findIndex((b) => b.fill === right);
            yield [{ tap: { slot, n: ++taps, x: (rand() - 0.5) * 60, y: (rand() - 0.5) * 30 } }, 110];
            score += 10 + ((n - FIRST_WORD + 1) % 5 === 0 ? 20 : 0);
            yield [{ picked: right, score }, FEEDBACK_MS];
            const next = generate(n + 1, rand, item.rule, ruleRun);
            ruleRun = next.ruleChanged ? 1 : ruleRun + 1;
            item = next;
            // A beat longer on a rule flip or a mislabel stage: reading takes time.
            const read = 620 + rand() * 520 + (next.ruleChanged ? 260 : 0);
            yield [{ ...item, picked: null }, Math.min(read, item.limit - 250)];
        }
        yield [{ fade: true }, 500];
    }
}

const INITIAL: GC = { ...FIRST, picked: null, score: START_SCORE, tap: null, fade: false };

export default function GuessColorDemo() {
    const rootRef = useRef<HTMLDivElement>(null);
    const { active, reduced } = useDemoActive(rootRef);
    const s = useScript(active, reduced, INITIAL, INITIAL, guessScript);
    const right = target(s);
    const clock = { '--start': s.limit / MAX_LIMIT, '--dur': `${s.limit}ms` } as CSSProperties;

    return (
        <div ref={rootRef} className="lsg-app lsg-gc" data-fade={s.fade || undefined}>
            <GameBar accent={ACCENT} score={s.score} />
            <div className="lsg-field lsg-gc-field">
                <div className="lsg-ch lsg-gc-switch" data-rule={s.rule}>
                    <span className="lsg-gc-thumb">
                        <span key={s.ruleChanged ? s.n : 'steady'} className="lsg-ch" data-flip={s.ruleChanged || undefined} />
                    </span>
                    <span className="lsg-gc-side" data-on={s.rule === 'color' || undefined}>
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                            <path
                                d="M12 3.2 6.9 9.1a7 7 0 1 0 10.2 0z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                            />
                            <path d="M8.6 14.2a3.5 3.5 0 0 0 3.2 3.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        Color
                    </span>
                    <span className="lsg-gc-side" data-on={s.rule === 'text' || undefined}>
                        <em>Aa</em>
                        Text
                    </span>
                </div>
                <div className="lsg-ch lsg-gc-card">
                    <FitText className="lsg-gc-word" style={{ color: INK[s.ink] }}>
                        {s.word}
                    </FitText>
                </div>
                <div className="lsg-gc-clock" style={clock}>
                    <span key={s.n} data-frozen={s.picked !== null || undefined} />
                </div>
                <div className="lsg-gc-answers">
                    {s.buttons.map((b, slot) => {
                        const state = s.picked === null ? undefined : b.fill === right ? 'right' : 'dim';
                        const dark = b.fill === 'red' || b.fill === 'blue';
                        return (
                            <span key={slot} className="lsg-ch lsg-gc-btn" data-state={state}>
                                <span className="lsg-ch lsg-gc-fill" style={{ '--fill': INK[b.fill] } as CSSProperties}>
                                    <FitText className="lsg-gc-label" style={dark ? undefined : { color: '#000', background: 'none' }}>
                                        {b.label}
                                    </FitText>
                                    {state === 'right' && (
                                        <span className="lsg-gc-check">
                                            <svg viewBox="0 0 24 24" width="18" height="18">
                                                <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" />
                                            </svg>
                                        </span>
                                    )}
                                    {s.tap?.slot === slot && <TouchDot key={s.tap.n} x={s.tap.x} y={s.tap.y} />}
                                </span>
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
