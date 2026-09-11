"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { CourseCertificate } from '@/data/certifications';

export default function CourseCarousel({ courses, label }: { courses: CourseCertificate[]; label: string }) {
    const trackRef = useRef<HTMLOListElement>(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(true);
    const [active, setActive] = useState(0);

    const syncState = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;
        const maxScroll = track.scrollWidth - track.clientWidth;
        setCanPrev(track.scrollLeft > 4);
        setCanNext(track.scrollLeft < maxScroll - 4);
        const first = track.firstElementChild as HTMLElement | null;
        const step = first ? first.offsetWidth + 12 : track.clientWidth;
        setActive(Math.min(courses.length - 1, Math.round(track.scrollLeft / step)));
    }, [courses.length]);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        syncState();
        // `scroll` can be throttled mid-gesture; `scrollend` (plus a debounce fallback for
        // browsers without it) guarantees a final sync after swipes and keyboard scrolling.
        let settleTimer: number | undefined;
        const onScroll = () => {
            syncState();
            window.clearTimeout(settleTimer);
            settleTimer = window.setTimeout(syncState, 150);
        };
        track.addEventListener('scroll', onScroll, { passive: true });
        track.addEventListener('scrollend', syncState);
        window.addEventListener('resize', syncState);
        return () => {
            window.clearTimeout(settleTimer);
            track.removeEventListener('scroll', onScroll);
            track.removeEventListener('scrollend', syncState);
            window.removeEventListener('resize', syncState);
        };
    }, [syncState]);

    const scrollByCard = (direction: 1 | -1) => {
        const track = trackRef.current;
        if (!track) return;
        const cards = Array.from(track.children) as HTMLElement[];
        const nextIndex = Math.max(0, Math.min(cards.length - 1, active + direction));
        const target = cards[nextIndex];
        if (!target) return;
        // The track is `relative`, so offsetLeft is already measured from the track's edge.
        // Jumping to an exact card offset (not a relative delta) never lands between snap
        // points; reduced-motion users get an instant jump.
        const maxScroll = track.scrollWidth - track.clientWidth;
        const left = Math.min(target.offsetLeft, maxScroll);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        track.scrollTo({ left, behavior: reduceMotion ? 'instant' : 'smooth' });
        // Update immediately instead of waiting for scroll events, which browsers throttle
        // (and pause entirely in background tabs).
        setActive(nextIndex);
        setCanPrev(left > 4);
        setCanNext(left < maxScroll - 4);
    };

    return (
        <section aria-label={label} aria-roledescription="carousel" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-2 m-0">
                    {courses.length} course certificates
                    <span className="ml-2 font-mono normal-case tracking-normal text-ink-3" aria-live="polite">
                        {active + 1}/{courses.length}
                    </span>
                </p>
                <div className="flex gap-1.5">
                    <button
                        type="button"
                        onClick={() => scrollByCard(-1)}
                        disabled={!canPrev}
                        aria-label="Previous course"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line-2 bg-surface-3 text-ink-2 transition-colors duration-150 hover:border-white/25 hover:text-ink-1 disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <ChevronLeft size={16} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollByCard(1)}
                        disabled={!canNext}
                        aria-label="Next course"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line-2 bg-surface-3 text-ink-2 transition-colors duration-150 hover:border-white/25 hover:text-ink-1 disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <ChevronRight size={16} aria-hidden="true" />
                    </button>
                </div>
            </div>

            <ol
                ref={trackRef}
                tabIndex={0}
                aria-label={`${label} — scroll horizontally`}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCard(1); }
                    if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByCard(-1); }
                }}
                className="relative flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {courses.map((course, i) => (
                    <li
                        key={course.url}
                        aria-roledescription="slide"
                        aria-label={`${i + 1} of ${courses.length}: ${course.title}`}
                        className="snap-start shrink-0 w-[78%] sm:w-[220px] flex flex-col justify-between gap-4 rounded-xl border border-line-1 bg-surface-1 p-4 transition-colors duration-200 hover:border-line-2"
                    >
                        <div>
                            <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                            <p className="text-[0.875rem] font-semibold text-ink-1 leading-snug m-0 mt-1">{course.title}</p>
                        </div>
                        <div className="flex items-end justify-between gap-2">
                            <div>
                                <p className="text-[1.15rem] font-extrabold text-accent leading-none m-0">{course.grade}</p>
                                <p className="text-xs text-ink-3 m-0 mt-1">{course.completed}</p>
                            </div>
                            <a
                                href={course.url}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`View ${course.title} certificate`}
                                className="shrink-0 rounded-full border border-line-2 p-2 text-ink-2 transition-colors duration-150 hover:text-accent hover:border-accent/40"
                            >
                                <ExternalLink size={13} aria-hidden="true" />
                            </a>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
