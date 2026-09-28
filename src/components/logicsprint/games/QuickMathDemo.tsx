'use client';

import { useRef } from 'react';
import { FitText, GameBar, TouchDot } from './PhoneFrame';
import { mulberry32, useDemoActive, useScript, type Beat } from './useDemoRuntime';

/* Quick Math, as played on the phone (lib/games/quick_math): the problem card, "= ?", four answers.
   A scripted Medium run: the finger taps the right answer, it flashes teal for 280 ms, +10 (and +20
   every 5 in a row), next problem. Every 10 problems the numbers grow; from level 2 ÷ joins. */

const ACCENT = '#34C29A';
type Op = '+' | '−' | '×' | '÷';
type Problem = { a: number; op: Op; b: number; answer: number; options: number[] };
type Tap = { slot: number; n: number; x: number; y: number };
type QM = { problem: Problem; picked: number | null; score: number; tap: Tap | null; fade: boolean };

/** The screenshot's opening problem. */
const FIRST: Problem = { a: 8, op: '×', b: 5, answer: 40, options: [45, 40, 37, 38] };
const PROBLEMS_PER_LEVEL = 10;
const FEEDBACK_MS = 280;
const RUN_LENGTH = 26;

/** QuickMathEngine.generate for Medium, driven by a seeded random. */
function generate(rand: () => number, level: number): Problem {
    const between = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
    const ops: Op[] = ['+', '−', '×', ...(level >= 2 ? (['÷'] as Op[]) : [])];
    const op = ops[Math.floor(rand() * ops.length)];
    const [lo, hi] = [5, 50];
    const top = Math.round(hi * (1 + 0.5 * Math.min(level, 4)));
    const step = Math.min(level, 6);
    let a: number, b: number, answer: number;
    if (op === '+') {
        a = between(lo, top);
        b = between(lo, top);
        answer = a + b;
    } else if (op === '−') {
        const x = between(lo, top);
        const y = between(lo, top);
        [a, b, answer] = [Math.max(x, y), Math.min(x, y), Math.abs(x - y)];
    } else if (op === '×') {
        a = between(2, 12 + step * 2);
        b = between(2, 9 + step);
        answer = a * b;
    } else {
        b = between(2, 12 + step);
        answer = between(2, 12 + step);
        a = b * answer;
    }
    return { a, op, b, answer, options: options(answer, rand) };
}

function shuffle<T>(list: T[], rand: () => number): T[] {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

function options(answer: number, rand: () => number) {
    const choices = new Set([answer]);
    for (const offset of shuffle([1, 2, 3, 5, 10, -1, -2, -3, -5, -10], rand)) {
        if (choices.size === 4) break;
        if (answer + offset >= 0) choices.add(answer + offset);
    }
    return shuffle([...choices], rand);
}

/** How long a quick player looks at a problem before tapping. */
function thinkTime(p: Problem, rand: () => number) {
    const hard = p.op === '÷' || p.op === '×' ? 250 : 0;
    const big = p.a > 60 || p.b > 60 ? 250 : 0;
    return 650 + hard + big + rand() * 550;
}

function* quickMathScript(): Generator<Beat<QM>, never> {
    let taps = 0;
    for (let run = 0; ; run++) {
        const rand = mulberry32(2718 + (run % 3) * 131);
        let problem = FIRST;
        let score = 0;
        yield [{ problem, picked: null, score, tap: null, fade: false }, 900];
        for (let number = 1; number <= RUN_LENGTH; number++) {
            const slot = problem.options.indexOf(problem.answer);
            yield [{ tap: { slot, n: ++taps, x: (rand() - 0.5) * 50, y: (rand() - 0.5) * 36 } }, 110];
            score += 10 + (number % 5 === 0 ? 20 : 0);
            yield [{ picked: problem.answer, score }, FEEDBACK_MS];
            // Next problem: the level comes from the new problem number, like the engine.
            problem = generate(rand, Math.floor(number / PROBLEMS_PER_LEVEL));
            yield [{ problem, picked: null }, thinkTime(problem, rand)];
        }
        yield [{ fade: true }, 500];
    }
}

const INITIAL: QM = { problem: FIRST, picked: null, score: 0, tap: null, fade: false };

export default function QuickMathDemo() {
    const rootRef = useRef<HTMLDivElement>(null);
    const { active, reduced } = useDemoActive(rootRef);
    const { problem, picked, score, tap, fade } = useScript(active, reduced, INITIAL, INITIAL, quickMathScript);

    return (
        <div ref={rootRef} className="lsg-app lsg-qm" data-fade={fade || undefined}>
            <GameBar accent={ACCENT} score={score} />
            <div className="lsg-field lsg-qm-field">
                <div className="lsg-ch lsg-qm-card">
                    <FitText className="lsg-qm-problem">{`${problem.a} ${problem.op} ${problem.b}`}</FitText>
                    <span className="lsg-qm-eq">= ?</span>
                </div>
                <div className="lsg-qm-answers">
                    {problem.options.map((value, slot) => {
                        const right = picked !== null && value === problem.answer;
                        return (
                            <span key={slot} className="lsg-ch lsg-qm-btn" data-right={right || undefined}>
                                <FitText className="lsg-qm-value">{value}</FitText>
                                {tap?.slot === slot && <TouchDot key={tap.n} x={tap.x} y={tap.y} />}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
