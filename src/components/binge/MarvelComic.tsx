"use client";

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MARVEL, MARVEL_TV_LEGACY, byChrono, byRelease, type MarvelTitle } from '@/data/marvel';
import { FAVOURITE_MARVEL } from '@/data/watchlog';
import Poster from './Poster';
import { baseTitle } from './marvelTitle';

const released = MARVEL.filter((m) => !m.upcoming);
export const MARVEL_SEEN = released.filter((m) => m.seen).length;
export const MARVEL_TOTAL = released.length;
const pct = Math.round((MARVEL_SEEN / MARVEL_TOTAL) * 100);
/** The newest release he has seen: where "you are here" sits. */
export const MARVEL_HERE = byRelease().filter((m) => m.seen).at(-1)?.id;

const PHASE_COLORS: Record<number, string> = { 1: '#c4161c', 2: '#1f5fbf', 3: '#7a2bd9', 4: '#0f8a6a', 5: '#d9711f', 6: '#2b2b2b' };
const PHASE_NAMES: Record<number, string> = {
    1: 'Avengers assemble', 2: 'Bigger worlds', 3: 'The Infinity Saga ends', 4: 'After the snap', 5: 'Multiverse rising', 6: 'Toward Secret Wars',
};

export type MarvelStatus = 'seen' | 'notyet' | 'upcoming';
export type MarvelFilters = { kinds: MarvelTitle['kind'][]; statuses: MarvelStatus[]; phases: string[]; order: 'release' | 'story' };
export const EMPTY_MARVEL_FILTERS: MarvelFilters = { kinds: [], statuses: [], phases: [], order: 'release' };

export function marvelStatus(m: { seen: boolean; upcoming?: boolean }): MarvelStatus {
    return m.upcoming ? 'upcoming' : m.seen ? 'seen' : 'notyet';
}

function passes(m: MarvelTitle, f: MarvelFilters) {
    return (f.kinds.length === 0 || f.kinds.includes(m.kind)) &&
        (f.statuses.length === 0 || f.statuses.includes(marvelStatus(m))) &&
        (f.phases.length === 0 || f.phases.includes(String(m.phase)));
}

const artKind = (m: MarvelTitle) => (m.kind === 'series' ? 'series' : 'film') as 'series' | 'film';

export function Badge({ m }: { m: { seen: boolean; upcoming?: boolean } }) {
    if (m.upcoming) return <span className="bx-cbadge bx-cbadge--soon">Coming soon</span>;
    return m.seen ? <span className="bx-cbadge bx-cbadge--seen">✓ Watched</span> : <span className="bx-cbadge">Not yet</span>;
}

export function Tile({ m }: { m: MarvelTitle }) {
    const fav = baseTitle(m.title) === FAVOURITE_MARVEL;
    return (
        <div className="bx-ctile" data-seen={m.seen} data-upcoming={!!m.upcoming}>
            {m.id === MARVEL_HERE && <span className="bx-burst bx-here">You are here!</span>}
            {fav && <span className="bx-fav">Favourite</span>}
            <span className="bx-ctile__poster">
                <Poster kind={artKind(m)} title={baseTitle(m.title)} year={Number(m.released.slice(0, 4))} sizes="(max-width: 720px) 45vw, 170px" label={m.kind} />
            </span>
            <span className="bx-ctile__title">{m.title}</span>
            <span className="bx-ctile__meta">
                <span>{m.kind} · {m.released.slice(0, 4)}</span>
                <Badge m={m} />
            </span>
        </div>
    );
}

/** One node on a vertical strand: poster, name, in-story year and state. */
function Node({ m, side, here }: { m: MarvelTitle; side: 'l' | 'r'; here: boolean }) {
    return (
        <motion.li
            className="bx-vnode"
            data-side={side}
            data-seen={m.seen}
            data-upcoming={!!m.upcoming}
            initial={{ opacity: 0, x: side === 'l' ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, ease: [0.2, 0.9, 0.3, 1] }}
        >
            <span className="bx-vnode__dot" aria-hidden="true" />
            <div className="bx-vnode__card">
                {here && <span className="bx-burst bx-here">You are here!</span>}
                <span className="bx-vnode__poster">
                    <Poster kind={artKind(m)} title={baseTitle(m.title)} year={Number(m.released.slice(0, 4))} sizes="96px" label={m.kind} />
                </span>
                <span className="bx-vnode__body">
                    <span className="bx-vnode__year">{m.storyYear}</span>
                    <span className="bx-vnode__title">{m.title}</span>
                    <span className="bx-vnode__meta">{m.kind} · out {m.released.slice(0, 4)}{m.universe ? ` · ${m.universe}` : ''}</span>
                    <Badge m={m} />
                </span>
            </div>
        </motion.li>
    );
}

/** Marvel mode: issues by phase, the Sacred Timeline and the Multiverse, filtered by the top filters. */
export default function MarvelComic({ filters = EMPTY_MARVEL_FILTERS }: { filters?: MarvelFilters }) {
    const [page, setPage] = useState<'issues' | 'sacred' | 'multi'>('issues');
    const sacred = useMemo(() => byChrono().filter((m) => m.branch === 'sacred' && passes(m, filters)), [filters]);
    const lanes = useMemo(() => {
        const map = new Map<string, MarvelTitle[]>();
        for (const m of byChrono().filter((x) => x.branch === 'multiverse' && passes(x, filters))) {
            const key = m.universe ?? 'Elsewhere';
            map.set(key, [...(map.get(key) ?? []), m]);
        }
        return [...map.entries()];
    }, [filters]);
    const story = useMemo(() => byChrono().filter((m) => passes(m, filters)), [filters]);

    return (
        <div className="bx-comicbook">
            <div className="bx-comicbook__top">
                <h1 className="bx-comicbook__title">The Marvel file</h1>
                <span className="bx-ccaption">Marvel Studios films and series · as of Nov 2026</span>
            </div>

            <div className="bx-comic bx-meter">
                <div>
                    <p className="bx-meter__label">{MARVEL_SEEN}/{MARVEL_TOTAL} watched</p>
                    <div className="bx-meter__bar" role="img" aria-label={`${pct}% watched`}><span style={{ width: `${pct}%` }} /></div>
                </div>
                <span className="bx-meter__n">{pct}%</span>
            </div>

            <div className="bx-cswitch" role="group" aria-label="Comic pages">
                <button type="button" aria-pressed={page === 'issues'} onClick={() => setPage('issues')}>Issues by phase</button>
                <button type="button" aria-pressed={page === 'sacred'} onClick={() => setPage('sacred')}>Sacred Timeline</button>
                <button type="button" aria-pressed={page === 'multi'} onClick={() => setPage('multi')}>Multiverse</button>
            </div>

            {page === 'issues' && filters.order === 'story' && (
                <section className="bx-comic bx-issue" aria-label="In story order">
                    <div className="bx-issue__cover" style={{ background: '#111' }}>
                        <h2>In story order</h2>
                        <span>{story.filter((m) => m.seen && !m.upcoming).length}/{story.filter((m) => !m.upcoming).length} watched</span>
                    </div>
                    <div className="bx-issue__grid bx-dots">
                        {story.map((m) => <Tile key={m.id} m={m} />)}
                    </div>
                    {story.length === 0 && <p className="bx-cnote">Nothing matches these filters.</p>}
                </section>
            )}

            {page === 'issues' && filters.order === 'release' && (
                <div className="bx-issues">
                    {[1, 2, 3, 4, 5, 6].map((p) => {
                        const all = byRelease().filter((m) => m.phase === p);
                        const items = all.filter((m) => passes(m, filters));
                        if (items.length === 0) return null;
                        const out = all.filter((m) => !m.upcoming);
                        const seen = out.filter((m) => m.seen).length;
                        return (
                            <section key={p} className="bx-comic bx-issue" aria-label={`Phase ${p}`}>
                                <div className="bx-issue__cover" style={{ background: PHASE_COLORS[p] }}>
                                    <h2>Phase {p}: {PHASE_NAMES[p]}</h2>
                                    <span>{seen}/{out.length} watched</span>
                                </div>
                                <div className="bx-issue__grid bx-dots">
                                    {items.map((m) => <Tile key={m.id} m={m} />)}
                                </div>
                            </section>
                        );
                    })}
                    {story.length === 0 && <p className="bx-cnote">Nothing matches these filters.</p>}
                </div>
            )}

            {page === 'sacred' && (
                <section className="bx-comic bx-comic--page" aria-label="The Sacred Timeline">
                    <span className="bx-ccaption">The Sacred Timeline · Earth-616 in story order</span>
                    {sacred.length === 0 ? <p className="bx-cnote">Nothing matches these filters.</p> : (
                        <ol className="bx-vline">
                            {sacred.map((m, i) => <Node key={m.id} m={m} side={i % 2 === 0 ? 'l' : 'r'} here={m.id === MARVEL_HERE} />)}
                        </ol>
                    )}
                    <p className="bx-cnote">Lit nodes are watched. The strand runs from the oldest story to the newest.</p>
                </section>
            )}

            {page === 'multi' && (
                <section className="bx-comic bx-comic--page bx-dots" aria-label="The Multiverse">
                    <span className="bx-ccaption">The Multiverse · every branch off the Sacred Timeline</span>
                    <div className="bx-multi">
                        {lanes.map(([universe, items]) => (
                            <div key={universe} className="bx-lane">
                                <div className="bx-lane__head">{universe}<small>{items.filter((m) => m.seen).length}/{items.length} watched</small></div>
                                <ol className="bx-vline bx-vline--lane">
                                    {items.map((m) => <Node key={m.id} m={m} side="r" here={m.id === MARVEL_HERE} />)}
                                </ol>
                            </div>
                        ))}
                        {lanes.length === 0 && <p className="bx-cnote">No branch matches these filters.</p>}
                        {filters.phases.length === 0 && (filters.kinds.length === 0 || filters.kinds.includes('series')) && (
                            <div className="bx-lane bx-lane--legacy">
                                <div className="bx-lane__head">Marvel Television<small>{MARVEL_TV_LEGACY.filter((m) => m.seen).length}/{MARVEL_TV_LEGACY.length} watched · Netflix, ABC and more</small></div>
                                <ol className="bx-vline bx-vline--lane">
                                    {MARVEL_TV_LEGACY.filter((m) => filters.statuses.length === 0 || filters.statuses.includes(marvelStatus(m))).map((m) => (
                                        <motion.li
                                            key={m.title}
                                            className="bx-vnode"
                                            data-side="r"
                                            data-seen={m.seen}
                                            initial={{ opacity: 0, x: 40 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, margin: '-60px' }}
                                            transition={{ duration: 0.45 }}
                                        >
                                            <span className="bx-vnode__dot" aria-hidden="true" />
                                            <div className="bx-vnode__card">
                                                <span className="bx-vnode__poster"><Poster kind="series" title={m.title} year={null} sizes="96px" label="series" /></span>
                                                <span className="bx-vnode__body">
                                                    <span className="bx-vnode__year">{m.network}</span>
                                                    <span className="bx-vnode__title">{m.title}</span>
                                                    <Badge m={m} />
                                                </span>
                                            </div>
                                        </motion.li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
