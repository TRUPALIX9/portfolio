"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CarouselProps = {
    /** Accessible name for the whole carousel, e.g. "Certifications". */
    label: string;
    /** Singular noun for the prev/next buttons, e.g. "certification" → "Next certification". */
    itemName: string;
    /** Visible title shown left of the counter. */
    title: ReactNode;
    /** Width classes for each slide (the track scrolls; slides don't shrink). */
    slideClassName: string;
    /** Accessible name per slide, same order as children. */
    slideLabels: string[];
    children: ReactNode;
};

/**
 * Horizontal scroll-snap carousel: native swipe/trackpad scrolling, prev/next buttons,
 * arrow keys, and a live "3/13" counter. State updates immediately on button presses and
 * re-syncs on scroll/scrollend, so it stays accurate even when scroll events are throttled.
 */
export default function Carousel({ label, itemName, title, slideClassName, slideLabels, children }: CarouselProps) {
    const slides = Children.toArray(children);
    const count = slides.length;
    const trackRef = useRef<HTMLOListElement>(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(count > 1);
    const [active, setActive] = useState(0);

    const syncState = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;
        const maxScroll = track.scrollWidth - track.clientWidth;
        setCanPrev(track.scrollLeft > 4);
        setCanNext(track.scrollLeft < maxScroll - 4);
        const first = track.firstElementChild as HTMLElement | null;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const step = first ? first.offsetWidth + gap : track.clientWidth;
        // At the far end the last slides can't reach the left edge — report the final one.
        const index = track.scrollLeft >= maxScroll - 4 ? count - 1 : Math.round(track.scrollLeft / step);
        setActive(Math.max(0, Math.min(count - 1, index)));
    }, [count]);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        syncState();
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

    const goTo = (direction: 1 | -1) => {
        const track = trackRef.current;
        if (!track) return;
        const items = Array.from(track.children) as HTMLElement[];
        const nextIndex = Math.max(0, Math.min(items.length - 1, active + direction));
        const target = items[nextIndex];
        if (!target) return;
        // The track is `relative`, so offsetLeft is measured from the track's own edge.
        // Jumping to an exact slide offset never lands between snap points.
        const maxScroll = track.scrollWidth - track.clientWidth;
        const left = Math.min(target.offsetLeft, maxScroll);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        track.scrollTo({ left, behavior: reduceMotion ? 'instant' : 'smooth' });
        setActive(nextIndex);
        setCanPrev(left > 4);
        setCanNext(left < maxScroll - 4);
    };

    const buttonClass =
        'flex h-9 w-9 items-center justify-center rounded-full border border-line-2 bg-surface-3 text-ink-2 transition-colors duration-150 hover:border-white/25 hover:text-ink-1 disabled:opacity-30 disabled:pointer-events-none';

    return (
        <section aria-label={label} aria-roledescription="carousel" className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-baseline gap-2">
                    {title}
                    <span className="font-mono text-xs text-ink-3" aria-live="polite">
                        {active + 1}/{count}
                    </span>
                </div>
                <div className="flex shrink-0 gap-1.5">
                    <button type="button" onClick={() => goTo(-1)} disabled={!canPrev} aria-label={`Previous ${itemName}`} className={buttonClass}>
                        <ChevronLeft size={16} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => goTo(1)} disabled={!canNext} aria-label={`Next ${itemName}`} className={buttonClass}>
                        <ChevronRight size={16} aria-hidden="true" />
                    </button>
                </div>
            </div>

            <ol
                ref={trackRef}
                tabIndex={0}
                aria-label={`${label} — scroll horizontally`}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(1); }
                    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(-1); }
                }}
                // pt-1/pb-1: a scroll container clips vertically, which would cut off the
                // cards' 2px hover lift and focus rings.
                className="relative flex gap-3 overflow-x-auto snap-x snap-mandatory pt-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {slides.map((slide, i) => (
                    <li
                        key={i}
                        aria-roledescription="slide"
                        aria-label={`${i + 1} of ${count}: ${slideLabels[i] ?? ''}`}
                        className={`flex snap-start shrink-0 ${slideClassName}`}
                    >
                        {slide}
                    </li>
                ))}
            </ol>
        </section>
    );
}
