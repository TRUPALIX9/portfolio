"use client";

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Screenshot = { src: string; label: string; alt: string };

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Phone-framed screenshot strip: native scroll-snap (swipe, trackpad, arrow keys once the
 * track is focused) plus prev/next buttons and a "01–04 / 09" range of what's in view.
 */
export default function ScreenshotCarousel({ shots, labelledBy }: { shots: Screenshot[]; labelledBy: string }) {
    const trackRef = useRef<HTMLOListElement>(null);
    const count = shots.length;
    const [range, setRange] = useState({ first: 0, last: 0 });
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(count > 1);

    const step = useCallback(() => {
        const track = trackRef.current;
        const first = track?.firstElementChild as HTMLElement | null;
        if (!track || !first) return 0;
        return first.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
    }, []);

    const sync = useCallback(() => {
        const track = trackRef.current;
        const size = step();
        if (!track || !size) return;
        const maxScroll = track.scrollWidth - track.clientWidth;
        const visible = Math.max(1, Math.floor((track.clientWidth + 1) / size));
        const atEnd = track.scrollLeft >= maxScroll - 4;
        const first = atEnd ? Math.max(0, count - visible) : Math.round(track.scrollLeft / size);
        setRange({ first, last: Math.min(count - 1, first + visible - 1) });
        setCanPrev(track.scrollLeft > 4);
        setCanNext(!atEnd);
    }, [count, step]);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        sync();
        track.addEventListener('scroll', sync, { passive: true });
        window.addEventListener('resize', sync);
        return () => {
            track.removeEventListener('scroll', sync);
            window.removeEventListener('resize', sync);
        };
    }, [sync]);

    const scrollBySlide = (direction: 1 | -1) => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        trackRef.current?.scrollBy({ left: direction * step(), behavior: reduceMotion ? 'instant' : 'smooth' });
    };

    const rangeText = range.first === range.last ? pad(range.first + 1) : `${pad(range.first + 1)}–${pad(range.last + 1)}`;

    return (
        <div role="region" aria-roledescription="carousel" aria-labelledby={labelledBy}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                <p className="ls-label">
                    <span className="ls-num" style={{ color: 'var(--ls-text)' }}>{rangeText}</span> / {pad(count)}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="ls-btn ls-btn-ghost ls-icon-btn" onClick={() => scrollBySlide(-1)} disabled={!canPrev} aria-label="Previous screenshot">
                        <ChevronLeft size={20} aria-hidden="true" />
                    </button>
                    <button type="button" className="ls-btn ls-btn-ghost ls-icon-btn" onClick={() => scrollBySlide(1)} disabled={!canNext} aria-label="Next screenshot">
                        <ChevronRight size={20} aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* Focusable so keyboard users can scroll it with the arrow keys. */}
            <ol ref={trackRef} className="ls-carousel-track" tabIndex={0} aria-label="Screenshots, scrollable">
                {shots.map((shot, i) => (
                    <li key={shot.src} aria-roledescription="slide" aria-label={`${i + 1} of ${count}: ${shot.label}`}>
                        <figure>
                            <div className="ls-phone">
                                <Image src={shot.src} alt={shot.alt} width={1080} height={2400} sizes="(min-width: 400px) 240px, 62vw" />
                            </div>
                            <figcaption className="ls-label" style={{ marginTop: '0.75rem' }}>
                                <span className="ls-num" style={{ color: 'var(--ls-teal)', marginRight: '0.6rem' }}>{pad(i + 1)}</span>
                                {shot.label}
                            </figcaption>
                        </figure>
                    </li>
                ))}
            </ol>
        </div>
    );
}
