"use client";

import { useEffect, useRef, useState } from 'react';
import { AGE_RANGES, DILEMMAS, REGIONS, ROLES, TRAITS, findOption, type QuizProfile, type Trait } from '@/data/dilemmas';
import './quiz.css';

type Stats = { total: number; options: Record<string, number>; ageGroup?: { age: string; total: number; options: Record<string, number> } };
type Stage = 'intro' | 'about' | 'question' | 'done';
type Saved = { stage: Stage; index: number; answers: Record<string, string>; profile: QuizProfile; sessionId: string };

const KEY = 'qz-progress';

function newSession() {
    try {
        return crypto.randomUUID();
    } catch {
        return '00000000-0000-4000-8000-000000000000'.replace(/0/g, () => Math.floor(Math.random() * 16).toString(16));
    }
}

function load(): Saved | null {
    try {
        const raw = sessionStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as Saved) : null;
    } catch {
        return null;
    }
}

function save(state: Saved) {
    try {
        sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
        // Private mode or blocked storage: progress just won't survive a reload.
    }
}

function pct(n: number, total: number) {
    return total ? Math.round((n / total) * 100) : 0;
}

function Bars({ stats, chosen, optionsOf, label }: { stats: { total: number; options: Record<string, number> }; chosen: string; optionsOf: string; label: string }) {
    const dilemma = DILEMMAS.find((d) => d.id === optionsOf)!;
    return (
        <div className="qz-bars">
            <p className="qz-bars__label">{label} · {stats.total} {stats.total === 1 ? 'answer' : 'answers'}</p>
            {dilemma.options.map((o) => {
                const p = pct(stats.options[o.id] ?? 0, stats.total);
                return (
                    <div key={o.id} className="qz-bar" data-mine={o.id === chosen}>
                        <div className="qz-bar__text">
                            <span>{o.text}</span>
                            <b>{p}%</b>
                        </div>
                        <div className="qz-bar__track" aria-hidden="true"><i style={{ width: `${p}%` }} /></div>
                    </div>
                );
            })}
        </div>
    );
}

export default function DilemmaQuiz() {
    const [state, setState] = useState<Saved>({ stage: 'intro', index: 0, answers: {}, profile: {}, sessionId: '' });
    const [stats, setStats] = useState<Record<string, Stats>>({});
    const [statsError, setStatsError] = useState('');
    const [ready, setReady] = useState(false);
    const headRef = useRef<HTMLHeadingElement>(null);

    // Restore progress after mount (sessionStorage is client-only).
    useEffect(() => {
        const saved = load();
        setState(saved?.sessionId ? saved : { stage: 'intro', index: 0, answers: {}, profile: {}, sessionId: newSession() });
        setReady(true);
    }, []);

    useEffect(() => {
        if (ready) save(state);
    }, [state, ready]);

    // Move focus to the new screen's heading so keyboard and screen-reader users follow along.
    useEffect(() => {
        if (ready) headRef.current?.focus();
    }, [state.stage, state.index, ready]);

    const dilemma = DILEMMAS[state.index];
    const chosen = dilemma ? state.answers[dilemma.id] : undefined;

    const choose = async (optionId: string) => {
        if (!dilemma || chosen) return;
        const questionId = dilemma.id;
        setState((s) => ({ ...s, answers: { ...s.answers, [questionId]: optionId } }));
        setStatsError('');
        try {
            const res = await fetch('/api/quiz/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: state.sessionId, questionId, optionId, profile: state.profile }),
            });
            if (!res.ok) throw new Error();
            const data = (await res.json()) as Stats;
            setStats((s) => ({ ...s, [questionId]: data }));
        } catch {
            setStatsError('Your answer is noted here, but the shared results could not load right now.');
        }
    };

    const next = () => setState((s) => (s.index + 1 >= DILEMMAS.length ? { ...s, stage: 'done' } : { ...s, index: s.index + 1 }));
    const restart = () => {
        setStats({});
        setStatsError('');
        setState({ stage: 'intro', index: 0, answers: {}, profile: {}, sessionId: newSession() });
    };

    if (!ready) return <div className="qz-shell" aria-busy="true" />;

    // ── Intro ──
    if (state.stage === 'intro') {
        return (
            <div className="qz-shell">
                <div className="qz-card qz-intro">
                    <p className="qz-kicker">10 situations · about 2 minutes · anonymous</p>
                    <h1 ref={headRef} tabIndex={-1} className="qz-title">What would you do?</h1>
                    <p className="qz-lede">
                        Ten everyday situations, from a found wallet to a friend&apos;s secret. There are no right or
                        wrong answers. After each one you&apos;ll see how other people answered.
                    </p>
                    <ul className="qz-points">
                        <li>No name or email, ever. Answers are stored anonymously.</li>
                        <li>You can share an age range and region to compare with people like you, or skip it.</li>
                        <li>At the end you get a short read on your instincts. It isn&apos;t a score.</li>
                    </ul>
                    <button type="button" className="qz-btn qz-btn--primary" onClick={() => setState((s) => ({ ...s, stage: 'about' }))}>
                        Start
                    </button>
                </div>
            </div>
        );
    }

    // ── About you (optional) ──
    if (state.stage === 'about') {
        const set = (key: keyof QuizProfile, value: string) =>
            setState((s) => ({ ...s, profile: { ...s.profile, [key]: s.profile[key] === value ? undefined : value } }));
        const group = (key: keyof QuizProfile, label: string, values: readonly string[]) => (
            <fieldset className="qz-field">
                <legend>{label}</legend>
                <div className="qz-chips">
                    {values.map((v) => (
                        <button key={v} type="button" className="qz-chip" aria-pressed={state.profile[key] === v} onClick={() => set(key, v)}>
                            {v}
                        </button>
                    ))}
                </div>
            </fieldset>
        );
        return (
            <div className="qz-shell">
                <div className="qz-card">
                    <p className="qz-kicker">Optional</p>
                    <h1 ref={headRef} tabIndex={-1} className="qz-title qz-title--sm">A little about you</h1>
                    <p className="qz-lede">Only used to compare answers across groups. Pick any, all, or none.</p>
                    {group('age', 'Age range', AGE_RANGES)}
                    {group('region', 'Where you grew up', REGIONS)}
                    {group('role', 'Mostly', ROLES)}
                    <div className="qz-actions">
                        <button type="button" className="qz-btn qz-btn--primary" onClick={() => setState((s) => ({ ...s, stage: 'question', index: 0 }))}>
                            Continue
                        </button>
                        <button type="button" className="qz-btn" onClick={() => setState((s) => ({ ...s, profile: {}, stage: 'question', index: 0 }))}>
                            Skip
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── End ──
    if (state.stage === 'done') {
        const counts = new Map<Trait, number>();
        for (const d of DILEMMAS) {
            const o = state.answers[d.id] ? findOption(d.id, state.answers[d.id]) : null;
            if (o) counts.set(o.trait, (counts.get(o.trait) ?? 0) + 1);
        }
        const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t);
        let withMajority = 0;
        let known = 0;
        for (const d of DILEMMAS) {
            const st = stats[d.id];
            const mine = state.answers[d.id];
            if (!st || !mine || !st.total) continue;
            known += 1;
            const max = Math.max(...Object.values(st.options));
            if ((st.options[mine] ?? 0) === max) withMajority += 1;
        }
        return (
            <div className="qz-shell">
                <div className="qz-card">
                    <p className="qz-kicker">Your instincts</p>
                    <h1 ref={headRef} tabIndex={-1} className="qz-title qz-title--sm">
                        {top.length ? top.map((t) => TRAITS[t].label).join(' and ') : 'Thanks for taking part'}
                    </h1>
                    {top.map((t) => <p key={t} className="qz-lede">{TRAITS[t].line}</p>)}
                    {known > 0 && (
                        <p className="qz-summary">
                            {withMajority === known
                                ? <>You went with the most common answer on all <b>{known}</b> situations you answered.</>
                                : withMajority === 0
                                    ? <>You went your own way on all <b>{known}</b> situations you answered.</>
                                    : <>You went with the most common answer on <b>{withMajority} of {known}</b> situations, and your own way on the other {known - withMajority}.</>}
                        </p>
                    )}
                    <ol className="qz-recap">
                        {DILEMMAS.map((d) => {
                            const o = state.answers[d.id] ? findOption(d.id, state.answers[d.id]) : null;
                            return (
                                <li key={d.id}>
                                    <span>{d.title}</span>
                                    <em>{o ? o.text : 'Skipped'}</em>
                                </li>
                            );
                        })}
                    </ol>
                    <button type="button" className="qz-btn qz-btn--primary" onClick={restart}>Start over</button>
                </div>
            </div>
        );
    }

    // ── A dilemma ──
    const st = stats[dilemma.id];
    return (
        <div className="qz-shell">
            <div className="qz-progress" aria-label={`Situation ${state.index + 1} of ${DILEMMAS.length}`}>
                {DILEMMAS.map((d, i) => (
                    <i key={d.id} data-state={i < state.index ? 'done' : i === state.index ? 'now' : 'todo'} />
                ))}
            </div>
            <div className="qz-card">
                <p className="qz-kicker">Situation {state.index + 1} of {DILEMMAS.length} · {dilemma.title}</p>
                <h1 ref={headRef} tabIndex={-1} className="qz-situation">{dilemma.situation}</h1>
                <div className="qz-options" role="radiogroup" aria-label="Your choice">
                    {dilemma.options.map((o) => (
                        <button
                            key={o.id}
                            type="button"
                            role="radio"
                            aria-checked={chosen === o.id}
                            disabled={!!chosen && chosen !== o.id}
                            className="qz-option"
                            onClick={() => void choose(o.id)}
                        >
                            {o.text}
                        </button>
                    ))}
                </div>

                <div aria-live="polite">
                    {chosen && st && (
                        <div className="qz-results">
                            <Bars stats={st} chosen={chosen} optionsOf={dilemma.id} label="Everyone" />
                            {st.ageGroup && st.ageGroup.total > 0 && (
                                <Bars stats={st.ageGroup} chosen={chosen} optionsOf={dilemma.id} label={`People aged ${st.ageGroup.age}`} />
                            )}
                        </div>
                    )}
                    {chosen && !st && statsError && <p className="qz-note">{statsError}</p>}
                    {chosen && !st && !statsError && <p className="qz-note">Loading how others answered…</p>}
                </div>

                <div className="qz-actions">
                    {chosen ? (
                        <button type="button" className="qz-btn qz-btn--primary" onClick={next}>
                            {state.index + 1 >= DILEMMAS.length ? 'See your instincts' : 'Next situation'}
                        </button>
                    ) : (
                        <button type="button" className="qz-btn" onClick={next}>Skip this one</button>
                    )}
                </div>
            </div>
        </div>
    );
}
