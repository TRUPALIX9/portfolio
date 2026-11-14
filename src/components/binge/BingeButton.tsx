"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import './binge.css';

/**
 * The home page's "Binge" button: a tiny TV. Clicking it closes the page into a TV screen,
 * switches the set off and on again, shows the TruePal TV ident, then opens /binge.
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
                <span className="bx-tvbtn__set" aria-hidden="true">
                    <span className="bx-tvbtn__ears" />
                    <span className="bx-tvbtn__screen">
                        <span className="bx-tvbtn__play">▶</span>
                    </span>
                    <span className="bx-tvbtn__knobs"><i /><i /></span>
                </span>
                <span className="bx-tvbtn__label">
                    <b>Binge</b>
                    <small>what he&apos;s watching</small>
                </span>
            </button>
            {playing && createPortal(
                <div className="bx-tvfx" aria-hidden="true">
                    <span className="bx-tvfx__frame" />
                    <span className="bx-tvfx__line" />
                    <span className="bx-tvfx__ident">
                        <span className="bx-logo bx-logo--xl">true<span className="bx-logo__play">▶</span>pal<small>TV</small></span>
                        <span className="bx-tvfx__tag">Now streaming: the watch list</span>
                    </span>
                </div>,
                document.body,
            )}
        </>
    );
}
