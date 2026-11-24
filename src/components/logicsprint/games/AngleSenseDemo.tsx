'use client';

import { useRef, type CSSProperties } from 'react';
import { GameBar, TouchDot } from './PhoneFrame';
import { useDemoActive, useScript, type Beat } from './useDemoRuntime';

/* Angle Sense, as played on the phone (lib/games/angle_sense): the READ | DRAW switch, "MEDIUM · Q01"
   and the window, the angle card with two shields, the degree readout, the degree tape and
   −1 / LOCK / +1. A scripted Medium READ run: flat angles for Q1–3, then upright ones (the base arm
   points up). The finger drags the tape, taps LOCK, the answer shows as a dashed teal arm next to
   the gold true arm, and the verdict chip reads BULLSEYE (≤1°, shown as PERFECT), SHARP (≤3°),
   HIT (inside the ±8° window) or MISS, which breaks a shield. 10 a hit, +5 Sharp, +10 Bullseye. */

const ACCENT = '#F5C542';
const TEAL = '#34C29A';
const CORAL = '#FF5A6E';
/** The app's Sharp tint: halfway between teal and gold. */
const SHARP = '#94C46E';
const WINDOW = 8;
const PX_PER_DEG = 5;

type Kind = 'flat' | 'upright';
type Question = { n: number; kind: Kind; answer: number; dir: 1 | -1 };
type Grade = 'perfect' | 'sharp' | 'hit' | 'miss';
type Reveal = { guess: number; grade: Grade; chip: string };
type AS = { q: Question; value: number; score: number; shields: number; reveal: Reveal | null; tap: { at: 'tape' | 'lock'; n: number } | null; fade: boolean };

/** The run: each question with where the player locks in. */
const RUN: { q: Question; guess: number }[] = [
    { q: { n: 1, kind: 'flat', answer: 62, dir: 1 }, guess: 64 },
    { q: { n: 2, kind: 'flat', answer: 135, dir: 1 }, guess: 135 },
    { q: { n: 3, kind: 'flat', answer: 28, dir: 1 }, guess: 33 },
    { q: { n: 4, kind: 'upright', answer: 110, dir: 1 }, guess: 98 },
    { q: { n: 5, kind: 'upright', answer: 45, dir: -1 }, guess: 47 },
    { q: { n: 6, kind: 'upright', answer: 150, dir: -1 }, guess: 146 },
];

function grade(guess: number, answer: number): Reveal {
    const e = guess - answer;
    const a = Math.abs(e);
    const signed = `${e > 0 ? '+' : e < 0 ? '−' : ''}${a}°`;
    if (a <= 1) return { guess, grade: 'perfect', chip: `PERFECT ${signed}` };
    if (a <= 3) return { guess, grade: 'sharp', chip: `SHARP ${signed}` };
    if (a <= WINDOW) return { guess, grade: 'hit', chip: `HIT ${signed}` };
    return { guess, grade: 'miss', chip: a <= WINDOW + 3 ? `SO CLOSE ${signed}` : `MISS ${signed}` };
}

const POINTS: Record<Grade, number> = { perfect: 20, sharp: 15, hit: 10, miss: 0 };
const CHIP_COLOR: Record<Grade, string> = { perfect: ACCENT, sharp: SHARP, hit: TEAL, miss: CORAL };

function* angleSenseScript(): Generator<Beat<AS>, never> {
    let taps = 0;
    for (;;) {
        let value = 90;
        let score = 0;
        let shields = 2;
        yield [{ q: RUN[0].q, value, score, shields, reveal: null, tap: null, fade: false }, 900];
        for (const { q, guess } of RUN) {
            yield [{ q, reveal: null, tap: null }, 700];
            // Drag the tape: a quick ease-out towards the guess.
            yield [{ tap: { at: 'tape', n: ++taps } }, 120];
            const from = value;
            const steps = 7;
            for (let i = 1; i <= steps; i++) {
                const t = 1 - (1 - i / steps) ** 3;
                value = Math.round(from + (guess - from) * t);
                yield [{ value }, 75];
            }
            yield [{}, 380];
            yield [{ tap: { at: 'lock', n: ++taps } }, 140];
            const reveal = grade(guess, q.answer);
            score += POINTS[reveal.grade];
            if (reveal.grade === 'miss') shields -= 1;
            yield [{ reveal, score, shields }, reveal.grade === 'miss' ? 1300 : 1000];
        }
        yield [{ fade: true }, 500];
    }
}

const INITIAL: AS = { q: RUN[0].q, value: 90, score: 0, shields: 2, reveal: null, tap: null, fade: false };
const STILL: AS = { ...INITIAL, value: 64, score: 0, reveal: grade(64, 62) };

/* The card, in SVG units. */
const W = 320;
const H = 300;

function geometry(q: Question) {
    const vertex = q.kind === 'flat' ? { x: 120, y: 200 } : { x: 160, y: 230 };
    const base = q.kind === 'flat' ? 0 : 90;
    const len = q.kind === 'flat' ? 150 : 140;
    const tip = (deg: number, l = len) => {
        const r = (deg * Math.PI) / 180;
        return { x: vertex.x + Math.cos(r) * l, y: vertex.y - Math.sin(r) * l };
    };
    const armAt = (deg: number) => base + q.dir * deg;
    return { vertex, base, tip, armAt };
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
    const p = (deg: number) => {
        const a = (deg * Math.PI) / 180;
        return `${cx + Math.cos(a) * r} ${cy - Math.sin(a) * r}`;
    };
    const sweep = to > from ? 0 : 1;
    const large = Math.abs(to - from) > 180 ? 1 : 0;
    return `M ${p(from)} A ${r} ${r} 0 ${large} ${sweep} ${p(to)}`;
}

function AngleCard({ q, reveal }: { q: Question; reveal: Reveal | null }) {
    const { vertex, base, tip, armAt } = geometry(q);
    const baseTip = tip(base);
    const second = tip(armAt(q.answer));
    const guessTip = reveal ? tip(armAt(reveal.guess), 128) : null;
    return (
        <svg className="lsg-as-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
            <path d={arcPath(vertex.x, vertex.y, 36, base, armAt(q.answer))} fill="none" stroke={ACCENT} strokeWidth="3" />
            <line x1={vertex.x} y1={vertex.y} x2={baseTip.x} y2={baseTip.y} stroke="#EAF2F7" strokeWidth="3" strokeLinecap="round" />
            <line
                x1={vertex.x}
                y1={vertex.y}
                x2={second.x}
                y2={second.y}
                stroke={reveal ? ACCENT : '#EAF2F7'}
                strokeWidth={reveal ? 4 : 3}
                strokeLinecap="round"
            />
            {guessTip && (
                <line x1={vertex.x} y1={vertex.y} x2={guessTip.x} y2={guessTip.y} stroke={TEAL} strokeWidth="3" strokeDasharray="8 6" />
            )}
            <rect x={vertex.x - 5} y={vertex.y - 5} width="10" height="10" fill={ACCENT} />
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

/** The degree tape: 1° ticks, longer every 5°, labelled every 10°, sliding under a gold needle. */
function Tape({ value }: { value: number }) {
    const ticks = [];
    for (let d = 0; d <= 360; d++) {
        const major = d % 10 === 0;
        const mid = d % 5 === 0;
        ticks.push(
            <line key={d} x1={d * PX_PER_DEG} x2={d * PX_PER_DEG} y1={0} y2={major ? 22 : mid ? 15 : 9} stroke={major ? '#8C9DAD' : '#667A8C'} strokeWidth={major ? 2 : 1} />,
        );
        if (major)
            ticks.push(
                <text key={`t${d}`} x={d * PX_PER_DEG} y={38} textAnchor="middle" className="lsg-as-tape-label">
                    {d}
                </text>,
            );
    }
    return (
        <div className="lsg-as-tape">
            <svg
                className="lsg-as-strip"
                width={360 * PX_PER_DEG + 2}
                height="44"
                style={{ '--x': `${-value * PX_PER_DEG}px` } as CSSProperties}
            >
                {ticks}
            </svg>
            <i className="lsg-as-needle" />
        </div>
    );
}

export default function AngleSenseDemo() {
    const rootRef = useRef<HTMLDivElement>(null);
    const { active, reduced } = useDemoActive(rootRef);
    const { q, value, score, shields, reveal, tap, fade } = useScript(active, reduced, INITIAL, STILL, angleSenseScript);

    return (
        <div ref={rootRef} className="lsg-app lsg-as" data-fade={fade || undefined}>
            <GameBar accent={ACCENT} score={score} />
            <div className="lsg-field lsg-as-field">
                <div className="lsg-as-switch">
                    <span className="lsg-ch" data-on>READ</span>
                    <span className="lsg-ch">DRAW</span>
                </div>
                <div className="lsg-meta">
                    <span>MEDIUM · Q{String(q.n).padStart(2, '0')}</span>
                    <span>
                        WINDOW <b style={{ color: ACCENT }}>±{WINDOW}°</b>
                    </span>
                </div>
                <div className="lsg-ch lsg-as-card">
                    <AngleCard q={q} reveal={reveal} />
                    <Shields left={shields} />
                    {reveal && (
                        <span key={`${q.n}-${reveal.chip}`} className="lsg-chip" style={{ '--chip': CHIP_COLOR[reveal.grade] } as CSSProperties}>
                            {reveal.chip}
                        </span>
                    )}
                </div>
                <div className="lsg-as-readout">
                    {value}
                    <small>°</small>
                </div>
                <div className="lsg-as-tape-wrap">
                    <Tape value={value} />
                    {tap?.at === 'tape' && <TouchDot key={tap.n} x={-20} y={0} />}
                </div>
                <div className="lsg-as-buttons">
                    <span className="lsg-ch lsg-as-btn">−1</span>
                    <span className="lsg-ch lsg-as-btn lsg-as-lock">
                        LOCK
                        {tap?.at === 'lock' && <TouchDot key={tap.n} x={6} y={2} />}
                    </span>
                    <span className="lsg-ch lsg-as-btn">+1</span>
                </div>
            </div>
        </div>
    );
}
