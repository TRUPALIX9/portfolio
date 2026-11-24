"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import './binge.css';

/**
 * The home page's "Binge" play button. Clicking it closes the page into a TV screen,
 * switches the set off and on again, shows the true TV ident, then opens /binge.
 */
export default function BingeButton({ className = '' }: { className?: string }) {
    const router = useRouter();
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        router.prefetch('/binge');
    }, [router]);

    const start = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            router.push('/binge');
            return;
        }
        setPlaying(true);
        window.setTimeout(() => router.push('/binge'), 2000);
    };

    return (
        <>
            <button type="button" className={`bx-tvbtn ${className}`} onClick={start} aria-label="Binge: open Trupal's watch list">
                <span className="bx-tvbtn__play" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor" /></svg>
                </span>
                <span className="bx-tvbtn__label">
                    <b>Start watching</b>
                    <small>open the watch log</small>
                </span>
                <span className="bx-tvbtn__arrow" aria-hidden="true">→</span>
            </button>
            {playing && createPortal(
                <div className="bx-tvfx" aria-hidden="true">
                    <span className="bx-tvfx__frame" />
                    <span className="bx-tvfx__line" />
                    <span className="bx-tvfx__ident">
                        <span className="bx-logo bx-logo--xl"><span className="bx-logo__play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor" /></svg></span>true<small>TV</small></span>
                        <span className="bx-tvfx__tag">Now streaming: the watch list</span>
                    </span>
                </div>,
                document.body,
            )}
        </>
    );
}
