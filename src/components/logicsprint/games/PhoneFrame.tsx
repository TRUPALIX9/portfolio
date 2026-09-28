'use client';

import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode, type Ref } from 'react';

/* A slim Android phone. The screen is laid out at the app's real logical size (392×872 dp, the
   1080×2400 screenshots at 2.75×) and the whole device is scaled with a transform to fit the box
   the CSS gives .lsg-phone, so the game UI keeps real phone proportions and stays crisp. */

export const SCREEN_W = 392;
export const SCREEN_H = 872;
const BEZEL = 10;
const DEVICE_W = SCREEN_W + BEZEL * 2;

/** Status bar 24 + game bar 57 (44 button + 2×6 padding + 1 border) + gesture bar 16. */
export const FIELD_H = SCREEN_H - 24 - 57 - 16;

export default function PhoneFrame({ children, className }: { children?: ReactNode; className?: string }) {
    const outerRef = useRef<HTMLDivElement>(null);
    const deviceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const outer = outerRef.current;
        const device = deviceRef.current;
        if (!outer || !device) return;
        const apply = () => {
            const w = outer.clientWidth;
            if (w < 1) return;
            device.style.transform = `scale(${w / DEVICE_W})`;
            outer.dataset.ready = 'true';
        };
        const ro = new ResizeObserver(apply);
        ro.observe(outer);
        apply();
        return () => ro.disconnect();
    }, []);

    return (
        <div ref={outerRef} className={className ? `lsg-phone ${className}` : 'lsg-phone'} aria-hidden="true">
            <div ref={deviceRef} className="lsg-device">
                <div className="lsg-screen">
                    <StatusBar />
                    <div className="lsg-apps">{children}</div>
                    <div className="lsg-gesture">
                        <i />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBar() {
    return (
        <div className="lsg-status">
            <span>12:30</span>
            <i className="lsg-cam" />
            <span className="lsg-status-icons">
                {/* signal */}
                <svg viewBox="0 0 16 16" width="13" height="13">
                    <path d="M2 14h2v-3H2zM6 14h2V8H6zM10 14h2V5h-2zM14 14h1.5V2H14z" fill="currentColor" />
                </svg>
                {/* wifi */}
                <svg viewBox="0 0 16 16" width="13" height="13">
                    <path d="M8 13.5 1 6.2a10 10 0 0 1 14 0z" fill="currentColor" />
                </svg>
                {/* battery */}
                <svg viewBox="0 0 12 18" width="8" height="13">
                    <rect x="3.5" y="0.5" width="5" height="2" rx="0.5" fill="currentColor" />
                    <rect x="1" y="2" width="10" height="15.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="2.6" y="6" width="6.8" height="10" rx="0.6" fill="currentColor" />
                </svg>
                <span>82%</span>
            </span>
        </div>
    );
}

/**
 * The app's one-row game bar (lib/ui/game_bar.dart): chamfered teal-outlined pause button, the
 * (empty) ad banner slot, and SCORE over the score in the game's accent.
 */
export function GameBar({ accent, score, scoreRef }: { accent: string; score: number; scoreRef?: Ref<HTMLElement> }) {
    return (
        <div className="lsg-bar">
            <span className="lsg-ch lsg-pause">
                <i />
                <i />
            </span>
            <span className="lsg-bar-ad" />
            <span className="lsg-bar-score">
                <small>Score</small>
                <b ref={scoreRef} style={{ color: accent }}>
                    {score}
                </b>
            </span>
        </div>
    );
}

/** Android's "show taps" dot: where the simulated finger lands. Re-key it to replay. */
export function TouchDot({ x = 0, y = 0 }: { x?: number; y?: number }) {
    return <span className="lsg-touch" style={{ '--tx': `${x}px`, '--ty': `${y}px` } as CSSProperties} />;
}

/** Like Flutter's FittedBox(scaleDown): shrinks the text to fit its box's width, never grows it. */
export function FitText({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
    const boxRef = useRef<HTMLSpanElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        const box = boxRef.current;
        const text = textRef.current;
        if (!box || !text) return;
        const fit = () => {
            text.style.transform = '';
            const room = box.clientWidth;
            const need = text.offsetWidth;
            if (room > 0 && need > room) text.style.transform = `scale(${room / need})`;
        };
        fit();
        let alive = true;
        document.fonts?.ready.then(() => alive && fit());
        return () => {
            alive = false;
        };
    }, [children]);

    return (
        <span ref={boxRef} className="lsg-fit">
            <span ref={textRef} className={className} style={style}>
                {children}
            </span>
        </span>
    );
}
