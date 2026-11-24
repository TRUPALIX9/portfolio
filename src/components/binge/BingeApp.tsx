"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SearchHit } from '@/utils/binge';
import Modal from './Modal';
import SuggestForm from './SuggestForm';
import MarvelComic, { Badge, EMPTY_MARVEL_FILTERS, marvelStatus, type MarvelFilters, type MarvelStatus } from './MarvelComic';
import MultiSelect from './MultiSelect';
import { baseTitle } from './marvelTitle';
import { MARVEL, type MarvelTitle } from '@/data/marvel';
import Poster from './Poster';
import { isAllowedImage, useArtwork } from './artwork';
import {
    filterItems, loadItems, normalize, progress, searchItems, statusLabel, STATUS_NAMES,
    type Item, type SortKey,
} from './data';
import type { BingeStatus } from '@/utils/binge';

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
type Mode = 'tv' | 'movies' | 'marvel';
const MODES: { id: Mode; label: string }[] = [{ id: 'tv', label: 'TV' }, { id: 'movies', label: 'Movies' }, { id: 'marvel', label: 'Marvel' }];
const parseMode = (v: string | null): Mode => (v === 'movies' || v === 'marvel' ? v : 'tv');

// ── Cards ───────────────────────────────────────────────────────────────────

function Card({ item, onOpen }: { item: Item; onOpen: (item: Item) => void }) {
    const p = progress(item);
    return (
        <button
            type="button"
            className="bx-card"
            data-status={item.status}
            onClick={() => onOpen(item)}
            aria-label={`${item.title}, ${statusLabel(item)}${item.recommended ? ', recommended' : ''}`}
        >
            <span className="bx-poster">
                <Poster kind={item.kind} title={item.title} year={item.year} image={item.image} />
                {item.status === 'seen' && <span className="bx-state bx-state--seen" aria-hidden="true">✓</span>}
                {item.status === 'watchlist' && <span className="bx-state bx-state--list" aria-hidden="true">On the list</span>}
                {item.status === 'left' && <span className="bx-state bx-state--left" aria-hidden="true"><i>❚❚</i> Left</span>}
                {item.recommended && <span className="bx-rec" title="Recommended" aria-hidden="true">★</span>}
            </span>
            <span className="bx-card__title">{item.title}</span>
            <span className="bx-card__meta" data-status={item.status}>{statusLabel(item)}</span>
            {(item.status === 'watching' || item.status === 'left') && p && p.done > 0 && <span className="bx-bar" aria-hidden="true"><span style={{ width: `${p.pct}%` }} /></span>}
        </button>
    );
}

// ── Rendering a bit at a time ───────────────────────────────────────────────
// The list runs to hundreds of titles and posters fetch their own artwork, so nothing renders
// all at once: rows grow as you scroll them, grids page with a button, and lower sections only
// mount when they come near the screen.

const PAGE = 24;

/** The first `size` items, with more on request; starts over whenever the list itself changes. */
function usePaged<T>(items: T[], size = PAGE) {
    const [state, setState] = useState({ src: items, n: size });
    if (state.src !== items) setState({ src: items, n: size });
    const n = state.src === items ? state.n : size;
    return { shown: items.slice(0, n), left: Math.max(0, items.length - n), more: () => setState((s) => ({ ...s, n: s.n + size })) };
}

function MoreButton({ left, step = PAGE, onClick, what = 'titles' }: { left: number; step?: number; onClick: () => void; what?: string }) {
    if (left <= 0) return null;
    return <button type="button" className="bx-more" onClick={onClick}>Show {Math.min(step, left)} more <span>· {left} {what} left</span></button>;
}

/** Mounts its children only once they're within a screen of the viewport. */
function Lazy({ children, minHeight = 320 }: { children: React.ReactNode; minHeight?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [on, setOn] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (on || !el) return;
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: '700px 0px' });
        io.observe(el);
        return () => io.disconnect();
    }, [on]);
    return <div ref={ref} style={on ? undefined : { minHeight }}>{on ? children : null}</div>;
}

function Row({ title, items, onOpen, sub }: { title: string; items: Item[]; onOpen: (item: Item) => void; sub?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    // Posters are added 14 at a time as the row is scrolled towards its end.
    const paged = usePaged(items, 14);
    if (items.length === 0) return null;
    const onScroll = () => {
        const el = ref.current;
        if (el && paged.left > 0 && el.scrollLeft + el.clientWidth * 2 >= el.scrollWidth) paged.more();
    };
    const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: reduceMotion() ? 'auto' : 'smooth' });
    return (
        <section className="bx-row" aria-label={title}>
            <div className="bx-row__head">
                <h2>{title} <span>{sub ?? items.length}</span></h2>
                <div className="bx-row__nav">
                    <button type="button" aria-label={`Scroll ${title} left`} onClick={() => scroll(-1)}>‹</button>
                    <button type="button" aria-label={`Scroll ${title} right`} onClick={() => scroll(1)}>›</button>
                </div>
            </div>
            <div className="bx-row__track" ref={ref} onScroll={onScroll}>
                {paged.shown.map((it) => <Card key={it.id} item={it} onOpen={onOpen} />)}
                {paged.left > 0 && <button type="button" className="bx-row__more" onClick={paged.more}>+{paged.left}<small>more</small></button>}
            </div>
        </section>
    );
}

function Details({ item }: { item: Item }) {
    const p = progress(item);
    const { art } = useArtwork<HTMLDivElement>(item.kind, item.title, item.year, { eager: true });
    const genres = item.genres.length ? item.genres : art?.genres ?? [];
    const year = item.year ?? art?.year;
    return (
        <div className="bx-details">
            <div className="bx-details__poster">
                <span className="bx-poster"><Poster kind={item.kind} title={item.title} year={item.year} image={item.image} large sizes="200px" eager /></span>
            </div>
            <div className="bx-details__body">
                <p className="bx-details__kicker">{item.kind === 'series' ? 'Series' : 'Film'}{item.shelf ? ` · ${item.shelf}` : ''}{year ? ` · ${year}` : ''}</p>
                <h2 className="bx-details__title">{item.title}</h2>
                <p className="bx-details__status">
                    <span data-status={item.status}>{statusLabel(item)}</span>
                    {item.recommended && <span className="bx-details__rec">★ Recommended</span>}
                </p>
                {p && <span className="bx-bar bx-bar--lg" aria-hidden="true"><span style={{ width: `${p.pct}%` }} /></span>}
                {item.kind === 'series' && item.seasons.length > 0 && (
                    <ul className="bx-seasons" aria-label="Seasons">
                        {item.seasons.map((s) => (
                            <li key={s.number} data-done={s.complete}>
                                <span className="bx-tick" aria-hidden="true">{s.complete ? '✓' : ''}</span>
                                Season {s.number}
                                <small>
                                    {s.episodes ? `${s.complete ? s.episodes : s.seenEpisodes.length}/${s.episodes} episodes` : s.complete ? 'watched' : 'not yet'}
                                </small>
                            </li>
                        ))}
                    </ul>
                )}
                {item.note && <p className="bx-details__note">{item.note}</p>}
                {genres.length > 0 && <p className="bx-details__genres">{genres.join(' · ')}</p>}
            </div>
        </div>
    );
}

// ── Hero: rotating featured titles ──────────────────────────────────────────

function HeroSlide({ item, active, first, onOpen }: { item: Item; active: boolean; first: boolean; onOpen: (item: Item) => void }) {
    const { art } = useArtwork<HTMLDivElement>(item.kind, item.title, item.year, { eager: true });
    const backdrop = isAllowedImage(art?.backdrop) ? art.backdrop : null;
    const poster = isAllowedImage(art?.posterLarge) ? art.posterLarge : isAllowedImage(item.image) ? item.image : null;
    const genres = (item.genres.length ? item.genres : art?.genres ?? []).slice(0, 3);
    const year = item.year ?? art?.year;

    return (
        <div className="bx-slide" data-active={active} aria-hidden={!active}>
            <div className="bx-slide__art" aria-hidden="true">
                {backdrop ? (
                    <Image src={backdrop} alt="" fill sizes="100vw" quality={70} priority={first} className="bx-slide__backdrop" />
                ) : poster ? (
                    <>
                        <Image src={poster} alt="" fill sizes="50vw" quality={40} className="bx-slide__blur" />
                        <span className="bx-slide__poster"><Image src={poster} alt="" fill sizes="(max-width: 720px) 40vw, 260px" quality={75} /></span>
                    </>
                ) : null}
            </div>
            <div className="bx-slide__copy">
                <p className="bx-hero__kicker">{item.recommended ? 'Recommended' : 'Finished'} · {item.kind === 'series' ? 'Series' : 'Film'}</p>
                <h1 className="bx-hero__title">{item.title}</h1>
                <p className="bx-hero__meta">
                    {[year, statusLabel(item), ...genres].filter(Boolean).join(' · ')}
                </p>
                <div className="bx-hero__cta">
                    <button type="button" className="bx-btn bx-btn--primary" tabIndex={active ? 0 : -1} onClick={() => onOpen(item)}>Details</button>
                </div>
            </div>
        </div>
    );
}

function Hero({ items, onOpen }: { items: Item[]; onOpen: (item: Item) => void }) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused || items.length < 2 || reduceMotion()) return;
        const t = window.setInterval(() => setIndex((i) => (i + 1) % items.length), 7000);
        return () => window.clearInterval(t);
    }, [paused, items.length]);

    if (items.length === 0) return null;
    return (
        <section
            className="bx-hero"
            aria-label="Featured"
            aria-roledescription="carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
        >
            {items.map((it, i) => <HeroSlide key={it.id} item={it} active={i === index} first={i === 0} onOpen={onOpen} />)}
            {items.length > 1 && (
                <div className="bx-hero__dots" role="group" aria-label="Choose featured title">
                    {items.map((it, i) => (
                        <button key={it.id} type="button" aria-label={`Show ${it.title}`} aria-pressed={i === index} onClick={() => setIndex(i)} />
                    ))}
                </div>
            )}
        </section>
    );
}

// ── External search ("Not on his list yet") ────────────────────────────────

function LookupCard({ hit, onSuggest }: { hit: SearchHit; onSuggest: (title: string) => void }) {
    return (
        <div className="bx-card bx-card--lookup">
            <span className="bx-poster">
                <Poster kind={hit.kind} title={hit.title} year={hit.year} image={hit.image} />
            </span>
            <span className="bx-card__title">{hit.title}</span>
            <span className="bx-card__meta">{hit.kind === 'series' ? 'Series' : 'Film'}{hit.year ? ` · ${hit.year}` : ''}</span>
            <button type="button" className="bx-btn bx-btn--ghost bx-btn--sm" onClick={() => onSuggest(hit.year ? `${hit.title} (${hit.year})` : hit.title)}>Suggest this</button>
        </div>
    );
}

function useLookup(query: string, onList: Set<string>) {
    const [state, setState] = useState<{ q: string; loading: boolean; error: string; results: SearchHit[] }>({ q: '', loading: false, error: '', results: [] });
    const q = query.trim();

    useEffect(() => {
        if (q.length < 2) return;
        const ctrl = new AbortController();
        const t = window.setTimeout(async () => {
            setState({ q, loading: true, error: '', results: [] });
            try {
                const res = await fetch(`/api/binge/lookup?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
                const data = (await res.json().catch(() => null)) as { results?: SearchHit[]; error?: string } | null;
                if (!res.ok) throw new Error(data?.error ?? 'Search is unavailable right now.');
                setState({ q, loading: false, error: '', results: data?.results ?? [] });
            } catch (err) {
                if (ctrl.signal.aborted) return;
                setState({ q, loading: false, error: err instanceof Error ? err.message : 'Search failed.', results: [] });
            }
        }, 350);
        return () => {
            window.clearTimeout(t);
            ctrl.abort();
        };
    }, [q]);

    if (q.length < 2) return { loading: false, error: '', results: [] as SearchHit[] };
    const pending = state.q !== q;
    return {
        loading: pending || state.loading,
        error: pending ? '' : state.error,
        results: pending ? [] : state.results.filter((h) => !onList.has(`${h.kind}|${normalize(h.title)}`)),
    };
}

// ── Movies mode: a cinema marquee and poster walls ─────────────────────────

function MovieCard({ item, onOpen }: { item: Item; onOpen: (item: Item) => void }) {
    return (
        <button type="button" className="bx-film" data-status={item.status} onClick={() => onOpen(item)} aria-label={`${item.title}, ${statusLabel(item)}${item.recommended ? ", critic's pick" : ''}`}>
            <span className="bx-film__poster">
                <Poster kind="film" title={item.title} year={item.year} image={item.image} sizes="(max-width: 720px) 42vw, 180px" />
                {item.recommended && <span className="bx-pick" aria-hidden="true">Critic&apos;s pick</span>}
                <span className="bx-film__state" data-status={item.status} aria-hidden="true">
                    {item.status === 'seen' ? '✓ Watched' : item.status === 'left' ? '❚❚ Left' : item.status === 'watching' ? 'Watching' : 'On the list'}
                </span>
            </span>
            <span className="bx-film__title">{item.title}</span>
            {item.note && <span className="bx-film__note">{item.note}</span>}
        </button>
    );
}

function Marquee({ films, onOpen }: { films: Item[]; onOpen: (item: Item) => void }) {
    const [i, setI] = useState(0);
    const film = films[i % Math.max(films.length, 1)];
    const { art } = useArtwork<HTMLDivElement>('film', film?.title ?? '', film?.year ?? null, { eager: true, skip: !film });
    if (!film) return null;
    const poster = isAllowedImage(art?.posterLarge) ? art.posterLarge : isAllowedImage(film.image) ? film.image : null;
    return (
        <section className="bx-marquee" aria-label="Now showing">
            <div className="bx-marquee__glow" aria-hidden="true">
                {poster && <Image src={poster} alt="" fill sizes="100vw" quality={40} className="bx-marquee__blur" />}
            </div>
            <div className="bx-marquee__sign">
                <p className="bx-marquee__now">Now showing</p>
                <div className="bx-marquee__board">
                    <span className="bx-marquee__bulbs" aria-hidden="true" />
                    <p className="bx-marquee__kicker">{film.recommended ? "Critic's pick" : 'Watched'}{film.shelf ? ` · ${film.shelf}` : ''}</p>
                    <h1 className="bx-marquee__title">{film.title}</h1>
                    <p className="bx-marquee__meta">{[film.year ?? art?.year, ...(art?.genres ?? []).slice(0, 2)].filter(Boolean).join(' · ') || 'Film'}</p>
                    <div className="bx-marquee__cta">
                        <button type="button" className="bx-btn bx-btn--ticket" onClick={() => onOpen(film)}>Details</button>
                        {films.length > 1 && (
                            <span className="bx-marquee__nav">
                                <button type="button" aria-label="Previous film" onClick={() => setI((n) => (n - 1 + films.length) % films.length)}>‹</button>
                                <span>{(i % films.length) + 1}/{films.length}</span>
                                <button type="button" aria-label="Next film" onClick={() => setI((n) => (n + 1) % films.length)}>›</button>
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="bx-marquee__poster">
                {poster ? <Image src={poster} alt={`${film.title} poster`} fill sizes="(max-width: 720px) 60vw, 300px" quality={75} priority /> : <span className="bx-poster"><Poster kind="film" title={film.title} year={film.year} image={film.image} large sizes="300px" eager /></span>}
            </div>
        </section>
    );
}

/** A grid of cards, a page at a time. */
function PagedGrid<T>({ items, render, what }: { items: T[]; render: (item: T) => React.ReactNode; what?: string }) {
    const paged = usePaged(items);
    return (
        <>
            <div className="bx-grid">{paged.shown.map(render)}</div>
            <MoreButton left={paged.left} onClick={paged.more} what={what} />
        </>
    );
}

/** One movie screen: its wall pages 18 posters at a time. */
function Screen({ n, shelf, list, onOpen }: { n: number; shelf: string; list: Item[]; onOpen: (item: Item) => void }) {
    const paged = usePaged(list, 18);
    return (
        <section className="bx-screen" aria-label={shelf}>
            <h2 className="bx-screen__head"><span>Screen {n + 1}</span>{shelf}<small>{list.filter((f) => f.status === 'seen').length}/{list.length} watched</small></h2>
            <div className="bx-wall">
                {paged.shown.map((f) => <MovieCard key={f.id} item={f} onOpen={onOpen} />)}
            </div>
            <MoreButton left={paged.left} step={18} onClick={paged.more} what="films" />
        </section>
    );
}

function MoviesView({ films, filtered, filtering, onOpen }: { films: Item[]; filtered: Item[]; filtering: boolean; onOpen: (item: Item) => void }) {
    const featured = useMemo(() => {
        const rec = films.filter((f) => f.recommended);
        return (rec.length ? rec : films.filter((f) => f.status === 'seen')).slice(0, 8);
    }, [films]);
    const screens = useMemo(() => {
        const map = new Map<string, Item[]>();
        for (const f of filtered) map.set(f.shelf || 'Other', [...(map.get(f.shelf || 'Other') ?? []), f]);
        return [...map.entries()];
    }, [filtered]);

    return (
        <>
            {!filtering && <Marquee films={featured} onOpen={onOpen} />}
            <div className="bx-screens">
                {filtering && <h2 className="bx-screens__count">{filtered.length} {filtered.length === 1 ? 'film' : 'films'}</h2>}
                {screens.map(([shelf, list], n) => (n === 0
                    ? <Screen key={shelf} n={n} shelf={shelf} list={list} onOpen={onOpen} />
                    : <Lazy key={shelf} minHeight={420}><Screen n={n} shelf={shelf} list={list} onOpen={onOpen} /></Lazy>))}
                {filtered.length === 0 && <p className="bx-empty">No films match these filters.</p>}
            </div>
        </>
    );
}

// ── Global search ───────────────────────────────────────────────────────────

function MarvelHit({ m }: { m: MarvelTitle }) {
    return (
        <div className="bx-card bx-card--marvel" data-status={marvelStatus(m)}>
            <span className="bx-poster">
                <Poster kind={m.kind === 'series' ? 'series' : 'film'} title={baseTitle(m.title)} year={Number(m.released.slice(0, 4))} label={m.kind} />
            </span>
            <span className="bx-card__title">{m.title}</span>
            <span className="bx-card__meta">Phase {m.phase} · {m.released.slice(0, 4)}</span>
            <Badge m={m} />
        </div>
    );
}

function SearchView({ query, items, onList, onOpen, onSuggest }: { query: string; items: Item[]; onList: Set<string>; onOpen: (item: Item) => void; onSuggest: (t: string) => void }) {
    const q = normalize(query);
    const tv = useMemo(() => searchItems(items.filter((i) => i.kind === 'series'), query), [items, query]);
    const movies = useMemo(() => searchItems(items.filter((i) => i.kind === 'film'), query), [items, query]);
    const marvel = useMemo(() => MARVEL.filter((m) => q.split(/\s+/).every((w) => normalize(m.title).includes(w))), [q]);
    // A Marvel title that is also on the list shows once, in the Marvel group.
    const marvelNames = useMemo(() => new Set(marvel.map((m) => normalize(baseTitle(m.title)))), [marvel]);
    const tvOnly = tv.filter((i) => !marvelNames.has(normalize(i.title)));
    const moviesOnly = movies.filter((i) => !marvelNames.has(normalize(i.title)));
    const lookupSkip = useMemo(() => new Set([...onList, ...[...marvelNames].flatMap((n) => [`series|${n}`, `film|${n}`])]), [onList, marvelNames]);
    const lookup = useLookup(query, lookupSkip);
    const total = tvOnly.length + moviesOnly.length + marvel.length;

    return (
        <div className="bx-search-view" aria-live="polite">
            <h2 className="bx-search-view__title">{total} on his list for “{query.trim()}”</h2>
            {tvOnly.length > 0 && (
                <section className="bx-results" aria-label="TV">
                    <h3 className="bx-group">TV <span>{tvOnly.length}</span></h3>
                    <PagedGrid items={tvOnly} what="series" render={(it) => <Card key={it.id} item={it} onOpen={onOpen} />} />
                </section>
            )}
            {moviesOnly.length > 0 && (
                <section className="bx-results" aria-label="Movies">
                    <h3 className="bx-group">Movies <span>{moviesOnly.length}</span></h3>
                    <PagedGrid items={moviesOnly} what="films" render={(it) => <Card key={it.id} item={it} onOpen={onOpen} />} />
                </section>
            )}
            {marvel.length > 0 && (
                <section className="bx-results" aria-label="Marvel">
                    <h3 className="bx-group">Marvel <span>{marvel.length}</span></h3>
                    <PagedGrid items={marvel} render={(m) => <MarvelHit key={m.id} m={m} />} />
                </section>
            )}
            {total === 0 && <p className="bx-empty bx-results">Nothing on his list matches.</p>}
            {query.trim().length >= 2 && (
                <section className="bx-results bx-results--lookup" aria-label="Not on his list yet">
                    <h3 className="bx-group">Not on his list yet</h3>
                    {lookup.loading && <p className="bx-empty">Searching TVMaze and Wikidata…</p>}
                    {lookup.error && <p className="bx-empty bx-empty--err">{lookup.error}</p>}
                    {!lookup.loading && !lookup.error && lookup.results.length === 0 && <p className="bx-empty">No other matches.</p>}
                    <div className="bx-grid">
                        {lookup.results.map((h) => <LookupCard key={`${h.source}-${h.sourceId}`} hit={h} onSuggest={onSuggest} />)}
                    </div>
                </section>
            )}
        </div>
    );
}

// ── App ─────────────────────────────────────────────────────────────────────

type ListFilters = { statuses: BingeStatus[]; shelves: string[]; recOnly: boolean; sort: SortKey };
const EMPTY_LIST: ListFilters = { statuses: [], shelves: [], recOnly: false, sort: 'recent' };
const SORTS: { value: SortKey; label: string }[] = [{ value: 'recent', label: 'Recently updated' }, { value: 'az', label: 'A–Z' }, { value: 'year', label: 'Year' }];
const TV_STATUSES: BingeStatus[] = ['seen', 'watching', 'watchlist', 'left'];
const FILM_STATUSES: BingeStatus[] = ['seen', 'watchlist', 'left'];
const statusOpts = (list: BingeStatus[]) => list.map((v) => ({ value: v, label: v === 'left' ? 'Left' : STATUS_NAMES[v] }));
const MARVEL_STATUS_OPTS: { value: MarvelStatus; label: string }[] = [{ value: 'seen', label: 'Watched' }, { value: 'notyet', label: 'Not yet' }, { value: 'upcoming', label: 'Upcoming' }];
const MARVEL_KIND_OPTS: { value: MarvelTitle['kind']; label: string }[] = [{ value: 'film', label: 'Film' }, { value: 'series', label: 'Series' }, { value: 'special', label: 'Special' }];
const PHASE_OPTS = [1, 2, 3, 4, 5, 6].map((p) => ({ value: String(p), label: `Phase ${p}` }));

const WIPE_LABEL: Record<Mode, string> = { tv: 'TV', movies: 'Movies', marvel: 'Marvel!' };

export default function BingeApp() {
    const router = useRouter();
    const params = useSearchParams();
    const [mode, setMode] = useState<Mode>(() => parseMode(params.get('mode')));
    const [wipe, setWipe] = useState<Mode | ''>('');
    const [items, setItems] = useState<Item[] | null>(null);
    const [live, setLive] = useState(false);
    const [query, setQuery] = useState('');
    const [tvF, setTvF] = useState<ListFilters>(EMPTY_LIST);
    const [movieF, setMovieF] = useState<ListFilters>(EMPTY_LIST);
    const [marvelF, setMarvelF] = useState<MarvelFilters>(EMPTY_MARVEL_FILTERS);
    const [open, setOpen] = useState<Item | null>(null);
    const [suggest, setSuggest] = useState<string | null>(null);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        loadItems().then((r) => {
            if (cancelled) return;
            setItems(r.items);
            setLive(r.live);
        });
        router.prefetch('/');
        return () => { cancelled = true; };
    }, [router]);

    const switchMode = useCallback((next: Mode) => {
        if (next === mode) return;
        const apply = () => {
            setMode(next);
            const url = new URL(window.location.href);
            if (next === 'tv') url.searchParams.delete('mode');
            else url.searchParams.set('mode', next);
            window.history.replaceState(null, '', url.toString());
            window.scrollTo({ top: 0 });
        };
        if (reduceMotion()) return apply();
        setWipe(next);
        window.setTimeout(apply, 420);
        window.setTimeout(() => setWipe(''), 900);
    }, [mode]);

    const exit = () => {
        if (reduceMotion()) return router.push('/');
        setLeaving(true);
        window.setTimeout(() => router.push('/'), 450);
    };

    const all = useMemo(() => items ?? [], [items]);
    const series = useMemo(() => all.filter((i) => i.kind === 'series'), [all]);
    const films = useMemo(() => all.filter((i) => i.kind === 'film'), [all]);
    const tvShelves = useMemo(() => [...new Set(series.map((i) => i.shelf).filter(Boolean))].sort(), [series]);
    const filmShelves = useMemo(() => [...new Set(films.map((i) => i.shelf).filter(Boolean))].sort(), [films]);
    const onList = useMemo(() => new Set(all.map((i) => `${i.kind}|${normalize(i.title)}`)), [all]);
    const searching = query.trim().length > 0;

    const tvFiltering = tvF.statuses.length > 0 || tvF.shelves.length > 0 || tvF.sort !== 'recent';
    const movieFiltering = movieF.statuses.length > 0 || movieF.shelves.length > 0 || movieF.recOnly || movieF.sort !== 'recent';
    const marvelFiltering = marvelF.kinds.length > 0 || marvelF.statuses.length > 0 || marvelF.phases.length > 0 || marvelF.order !== 'release';
    const anyFilter = mode === 'tv' ? tvFiltering : mode === 'movies' ? movieFiltering : marvelFiltering;
    const clearAll = () => {
        if (mode === 'tv') setTvF(EMPTY_LIST);
        else if (mode === 'movies') setMovieF(EMPTY_LIST);
        else setMarvelF(EMPTY_MARVEL_FILTERS);
    };

    const tvResults = useMemo(() => filterItems(all, { kind: 'series', ...tvF }), [all, tvF]);
    const movieResults = useMemo(() => filterItems(all, { kind: 'film', ...movieF }), [all, movieF]);

    const rows = useMemo(() => {
        const byShelf = new Map<string, Item[]>();
        for (const i of series) {
            if (i.status === 'watchlist' || i.status === 'left' || !i.shelf) continue;
            byShelf.set(i.shelf, [...(byShelf.get(i.shelf) ?? []), i]);
        }
        const finished = series.filter((i) => i.status === 'seen').sort((a, b) => b.seasons.length - a.seasons.length);
        const recommended = series.filter((i) => i.recommended);
        const featured = [...recommended, ...finished];
        return {
            featured: [...new Map(featured.map((i) => [i.id, i])).values()].slice(0, 5),
            watching: series.filter((i) => i.status === 'watching'),
            recommended,
            finished,
            watchlist: series.filter((i) => i.status === 'watchlist'),
            left: series.filter((i) => i.status === 'left'),
            shelves: [...byShelf.entries()].filter(([, v]) => v.length >= 3),
        };
    }, [series]);

    return (
        <div className={`bx-app ${leaving ? 'bx-app--leaving' : ''}`} data-mode={mode}>
            <header className="bx-top">
                <div className="bx-top__left">
                    <button type="button" className="bx-exit" onClick={exit}>← Back to portfolio</button>
                    <span className="bx-logo" aria-label={`true TV · ${MODES.find((m) => m.id === mode)?.label}`}>
                        <span className="bx-logo__word">true</span>
                        <small className="bx-logo__badge">{MODES.find((m) => m.id === mode)?.label}</small>
                    </span>
                </div>
                <label className="bx-search">
                    <span className="sr-only">Search everything</span>
                    <svg className="bx-search__icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    <input type="search" value={query} onChange={(e) => { if (!query.trim() && e.target.value.trim()) window.scrollTo({ top: 0 }); setQuery(e.target.value); }} placeholder="Search TV, movies and Marvel…" />
                </label>
                <div className="bx-top__right">
                    <div className="bx-mode" role="group" aria-label="Mode">
                        {MODES.map((m) => (
                            <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => switchMode(m.id)}>{m.label}</button>
                        ))}
                    </div>
                    <button type="button" className="bx-btn bx-btn--ghost" onClick={() => setSuggest('')}>Suggest</button>
                </div>
            </header>

            {!searching && (
                <div className="bx-filters" role="group" aria-label="Filters">
                    {mode === 'tv' && (
                        <>
                            <MultiSelect label="Status" options={statusOpts(TV_STATUSES)} value={tvF.statuses} onChange={(v) => setTvF({ ...tvF, statuses: v })} />
                            <MultiSelect label="Genre" options={tvShelves.map((s) => ({ value: s, label: s }))} value={tvF.shelves} onChange={(v) => setTvF({ ...tvF, shelves: v })} />
                            <MultiSelect single label="Sort" options={SORTS} value={[tvF.sort]} onChange={(v) => setTvF({ ...tvF, sort: v[0] ?? 'recent' })} />
                        </>
                    )}
                    {mode === 'movies' && (
                        <>
                            <MultiSelect label="Status" options={statusOpts(FILM_STATUSES)} value={movieF.statuses} onChange={(v) => setMovieF({ ...movieF, statuses: v })} />
                            <MultiSelect label="Shelf" options={filmShelves.map((s) => ({ value: s, label: s }))} value={movieF.shelves} onChange={(v) => setMovieF({ ...movieF, shelves: v })} />
                            <button type="button" className="bx-toggle" aria-pressed={movieF.recOnly} onClick={() => setMovieF({ ...movieF, recOnly: !movieF.recOnly })}>★ Critic&apos;s picks only</button>
                            <MultiSelect single label="Sort" options={SORTS} value={[movieF.sort]} onChange={(v) => setMovieF({ ...movieF, sort: v[0] ?? 'recent' })} />
                        </>
                    )}
                    {mode === 'marvel' && (
                        <>
                            <MultiSelect label="Kind" options={MARVEL_KIND_OPTS} value={marvelF.kinds} onChange={(v) => setMarvelF({ ...marvelF, kinds: v })} />
                            <MultiSelect label="Status" options={MARVEL_STATUS_OPTS} value={marvelF.statuses} onChange={(v) => setMarvelF({ ...marvelF, statuses: v })} />
                            <MultiSelect label="Phase" options={PHASE_OPTS} value={marvelF.phases} onChange={(v) => setMarvelF({ ...marvelF, phases: v })} />
                            <MultiSelect single label="Order" options={[{ value: 'release', label: 'Release' }, { value: 'story', label: 'Story' }]} value={[marvelF.order]} onChange={(v) => setMarvelF({ ...marvelF, order: (v[0] as 'release' | 'story') ?? 'release' })} />
                        </>
                    )}
                    {anyFilter && <button type="button" className="bx-clear" onClick={clearAll}>Clear all</button>}
                </div>
            )}

            {!items && <p className="bx-loading">Loading the list…</p>}

            {items && searching && (
                <main className="bx-main">
                    <SearchView query={query} items={all} onList={onList} onOpen={setOpen} onSuggest={setSuggest} />
                </main>
            )}

            {items && !searching && mode === 'tv' && (
                <main className="bx-main" key="tv">
                    {tvFiltering ? (
                        <section className="bx-results" aria-label="Results" aria-live="polite">
                            <h2>{tvResults.length} {tvResults.length === 1 ? 'series' : 'series'}</h2>
                            {tvResults.length === 0 && <p className="bx-empty">No series match these filters.</p>}
                            <PagedGrid items={tvResults} what="series" render={(it) => <Card key={it.id} item={it} onOpen={setOpen} />} />
                        </section>
                    ) : (
                        <>
                            <Hero items={rows.featured} onOpen={setOpen} />
                            {!live && <p className="bx-src">Showing the saved list.</p>}
                            <Row title="Continue watching" items={rows.watching} onOpen={setOpen} />
                            <Row title="Trupal recommends" items={rows.recommended} onOpen={setOpen} />
                            {/* Rows further down mount as they come near the screen */}
                            <Lazy><Row title="Finished" items={rows.finished} onOpen={setOpen} /></Lazy>
                            {rows.shelves.map(([name, list]) => <Lazy key={name}><Row title={name} items={list} onOpen={setOpen} /></Lazy>)}
                            <Lazy><Row title="On the list" items={rows.watchlist} onOpen={setOpen} sub={`${rows.watchlist.length} not started`} /></Lazy>
                            <Lazy><Row title="Left for now" items={rows.left} onOpen={setOpen} sub={`${rows.left.length} · not planning for now`} /></Lazy>
                            <section className="bx-cta" aria-label="Suggest a title">
                                <p>Something he should watch next?</p>
                                <button type="button" className="bx-btn bx-btn--primary" onClick={() => setSuggest('')}>Suggest a title</button>
                            </section>
                        </>
                    )}
                </main>
            )}

            {items && !searching && mode === 'movies' && (
                <main className="bx-main bx-main--movies" key="movies">
                    <MoviesView films={films} filtered={movieResults} filtering={movieFiltering} onOpen={setOpen} />
                    <section className="bx-cta" aria-label="Suggest a film">
                        <p>A film he should see next?</p>
                        <button type="button" className="bx-btn bx-btn--ticket" onClick={() => setSuggest('')}>Suggest a film</button>
                    </section>
                </main>
            )}

            {!searching && mode === 'marvel' && (
                <main className="bx-main bx-main--marvel" key="marvel">
                    <MarvelComic filters={marvelF} />
                </main>
            )}

            {wipe && (
                <div className={`bx-wipe bx-wipe--${wipe}`} aria-hidden="true">
                    <span /><span /><span /><span />
                    <b>{WIPE_LABEL[wipe]}</b>
                </div>
            )}

            {open && (
                <Modal label={open.title} onClose={() => setOpen(null)} wide>
                    <Details item={open} />
                </Modal>
            )}
            {suggest !== null && (
                <Modal label="Suggest a title" onClose={() => setSuggest(null)}>
                    <SuggestForm initialTitle={suggest} />
                </Modal>
            )}
        </div>
    );
}
