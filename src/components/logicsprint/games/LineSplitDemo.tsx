'use client';

import { useRef, type CSSProperties } from 'react';
import { GameBar, TouchDot } from './PhoneFrame';
import { useDemoActive, useScript, type Beat } from './useDemoRuntime';

/* Line Split, as played on the phone (lib/games/line_split): "FLAT · Q01" and the window, the
   target fraction "FROM THE 0 END", the card with the 0–1 line and two shields, and the hint under
   it. A scripted run through the Flat stage (½, ⅓, ⅔, ¼, ¾): the finger presses the line, a teal
   tick slides to where it lets go, then your answer stays as a dashed teal tick next to the pink
   true tick, with the gap between them, and the verdict chip: PERFECT (≤1%), SHARP (≤2%), HIT
   (inside the ±5% window), SO CLOSE or MISS, which breaks a shield. 10 a hit, +5 Sharp, +10 Bullseye. */

const ACCENT = '#F472B6';
const TEAL = '#34C29A';
const CORAL = '#FF5A6E';
const GOLD = '#F5C542';
const WINDOW = 5;

type Question = { n: number; num: number; den: number; start: number; guess: number };
type Grade = 'perfect' | 'sharp' | 'hit' | 'miss';
type Reveal = { grade: Grade; chip: string };
type LS = { q: Question; aim: number | null; score: number; shields: number; reveal: Reveal | null; tap: number | null; fade: boolean };

const RUN: Question[] = [
    { n: 1, num: 1, den: 2, start: 0.4, guess: 0.512 },
    { n: 2, num: 1, den: 3, start: 0.42, guess: 0.3 },
    { n: 3, num: 2, den: 3, start: 0.58, guess: 0.67 },
    { n: 4, num: 1, den: 4, start: 0.4, guess: 0.32 },
    { n: 5, num: 3, den: 4, start: 0.64, guess: 0.738 },
];

function grade(q: Question): Reveal {
    const e = (q.guess - q.num / q.den) * 100;
    const a = Math.abs(e);
    const signed = `${e < 0 && a.toFixed(1) !== '0.0' ? '−' : '+'}${a.toFixed(1)}%`;
    if (a <= 1) return { grade: 'perfect', chip: `PERFECT ${signed}` };
    if (a <= 2) return { grade: 'sharp', chip: `SHARP ${signed}` };
    if (a <= WINDOW) return { grade: 'hit', chip: `HIT ${signed}` };
    return { grade: 'miss', chip: a <= WINDOW + 2.5 ? `SO CLOSE ${signed}` : `MISS ${signed}` };
}

const POINTS: Record<Grade, number> = { perfect: 20, sharp: 15, hit: 10, miss: 0 };
const CHIP_COLOR: Record<Grade, string> = { perfect: GOLD, sharp: ACCENT, hit: TEAL, miss: CORAL };

function* lineSplitScript(): Generator<Beat<LS>, never> {
    let taps = 0;
    for (;;) {
        let score = 0;
        let shields = 2;
        yield [{ q: RUN[0], aim: null, score, shields, reveal: null, tap: null, fade: false }, 900];
        for (const q of RUN) {
            yield [{ q, aim: null, reveal: null, tap: null }, 800];
            // Press, then slide along the line to the answer.
            yield [{ aim: q.start, tap: ++taps }, 160];
            const steps = 6;
            for (let i = 1; i <= steps; i++) {
                const t = 1 - (1 - i / steps) ** 2;
                yield [{ aim: q.start + (q.guess - q.start) * t }, 70];
            }
            yield [{}, 260];
            const reveal = grade(q);
            score += POINTS[reveal.grade];
            if (reveal.grade === 'miss') shields -= 1;
            yield [{ reveal, score, shields }, reveal.grade === 'miss' ? 1400 : 1050];
        }
        yield [{ fade: true }, 500];
    }
}

const INITIAL: LS = { q: RUN[0], aim: null, score: 0, shields: 2, reveal: null, tap: null, fade: false };
const STILL: LS = { ...INITIAL, aim: RUN[0].guess, reveal: grade(RUN[0]) };

/* The line, in SVG units. */
const W = 320;
const H = 300;
const X0 = 30;
const X1 = 290;
const Y = 160;
const at = (u: number) => X0 + (X1 - X0) * u;

function LineCard({ q, aim, reveal }: { q: Question; aim: number | null; reveal: Reveal | null }) {
    const truth = q.num / q.den;
    return (
        <svg className="lsg-ls-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
            <line x1={X0} y1={Y} x2={X1} y2={Y} stroke="#EAF2F7" strokeWidth="3" />
            <line x1={X0} y1={Y - 12} x2={X0} y2={Y + 12} stroke="#EAF2F7" strokeWidth="3" />
            <line x1={X1} y1={Y - 12} x2={X1} y2={Y + 12} stroke="#EAF2F7" strokeWidth="3" />
            <text x={X0} y={Y + 34} textAnchor="middle" className="lsg-ls-end">0</text>
            <text x={X1} y={Y + 34} textAnchor="middle" className="lsg-ls-end">1</text>
            {reveal && aim !== null && (
                <>
                    {reveal.grade !== 'perfect' && (
                        <line
                            x1={at(aim)}
                            y1={Y}
                            x2={at(truth)}
                            y2={Y}
                            stroke={reveal.grade === 'sharp' ? ACCENT : CORAL}
                            strokeOpacity="0.55"
                            strokeWidth="8"
                        />
                    )}
                    <line x1={at(truth)} y1={Y - 20} x2={at(truth)} y2={Y + 20} stroke={reveal.grade === 'perfect' ? GOLD : ACCENT} strokeWidth="4" />
                    <line x1={at(aim)} y1={Y - 17} x2={at(aim)} y2={Y + 17} stroke={TEAL} strokeWidth="3" strokeDasharray="5 4" />
                </>
            )}
            {!reveal && aim !== null && <line x1={at(aim)} y1={Y - 22} x2={at(aim)} y2={Y + 22} stroke={TEAL} strokeWidth="3" />}
        </svg>
    );
}

function Shields({ left }: { left: number }) {
    return (
        <span className="lsg-shields">
            {[0, 1].map((i) => (
                <svg key={i} viewBox="0 0 16 18" width="16" height="18" data-broken={i >= left || undefined}>
                    <path d="M8 1 15 3.5V9c0 4-3 6.6-7 8C4 15.6 1 13 1 9V3.5z" />
                </svg>
            ))}
        </span>
    );
}

export default function LineSplitDemo() {
    const rootRef = useRef<HTMLDivElement>(null);
    const { active, reduced } = useDemoActive(rootRef);
    const { q, aim, score, shields, reveal, tap, fade } = useScript(active, reduced, INITIAL, STILL, lineSplitScript);

    // The finger sits on the line: its x in the card, as an offset from the card's centre.
    const fingerX = aim === null ? 0 : ((at(aim) - W / 2) / W) * 100;

    return (
        <div ref={rootRef} className="lsg-app lsg-ls" data-fade={fade || undefined}>
            <GameBar accent={ACCENT} score={score} />
            <div className="lsg-field lsg-ls-field">
                <div className="lsg-meta">
                    <span>FLAT · Q{String(q.n).padStart(2, '0')}</span>
                    <span>
                        WINDOW <b style={{ color: ACCENT }}>±{WINDOW}%</b>
                    </span>
                </div>
                <div className="lsg-ls-target">
                    <span className="lsg-ls-frac">
                        <b>{q.num}</b>
                        <i />
                        <b>{q.den}</b>
                    </span>
                    <small>FROM THE 0 END</small>
                </div>
                <div className="lsg-ch lsg-ls-card">
                    <LineCard q={q} aim={aim} reveal={reveal} />
                    <Shields left={shields} />
                    {reveal && (
                        <span key={`${q.n}-${reveal.chip}`} className="lsg-chip" style={{ '--chip': CHIP_COLOR[reveal.grade] } as CSSProperties}>
                            {reveal.chip}
                        </span>
                    )}
                    {tap !== null && !reveal && <TouchDot key={tap} x={(fingerX / 100) * 352} y={-14} />}
                </div>
                <p className="lsg-ls-hint">PRESS, SLIDE ALONG THE LINE, LET GO</p>
            </div>
        </div>
    );
}
