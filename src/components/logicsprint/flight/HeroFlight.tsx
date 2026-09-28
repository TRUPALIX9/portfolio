'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ChevronDown } from 'lucide-react';
import { APP } from '@/data/logicsprint';
import HiddenHeart from '@/components/logicsprint/hearts/HiddenHeart';
import { SHIPS, type DogfightControls } from './themes';
import './flight.css';

// WebGL only in the browser, and only once the page is interactive.
const DogfightScene = dynamic(() => import('./DogfightScene'), { ssr: false });

const HEARTS_KEY = 'ls-hearts';
/** Spaceship vs UFO (indices into SHIPS). */
const SPACESHIP = 2;
const UFO = 1;
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function heartsFound(): number {
    try {
        const ids: unknown = JSON.parse(localStorage.getItem(HEARTS_KEY) ?? '[]');
        return Array.isArray(ids) ? ids.length : 0;
    } catch {
        return 0;
    }
}

function subscribeReducedMotion(onChange: () => void) {
    const query = window.matchMedia(REDUCED_MOTION);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
}

/**
 * Full-screen hero: the LOGICSPRINT title opens in the centre, then fades away to reveal a
 * full-width dogfight: Spaceship vs UFO.
 */
export default function HeroFlight() {
    const rootRef = useRef<HTMLElement>(null);
    const controls = useRef<DogfightControls>({ left: SPACESHIP, right: UFO, secret: false });
    const [onScreen, setOnScreen] = useState(true);
    const [secret, setSecret] = useState(false);
    const [fonts, setFonts] = useState<{ mono: string; heading: string } | null>(null);
    // Reduced motion: a still frame, and the title stays up (see flight.css).
    const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => false);

    // Resolve the next/font families (for canvas text) and wait for them before the first draw.
    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        const style = getComputedStyle(el);
        const mono = style.getPropertyValue('--ls-font-mono').trim() || 'monospace';
        const heading = style.getPropertyValue('--ls-font-heading').trim() || 'sans-serif';
        let cancelled = false;
        Promise.all([document.fonts.load(`700 64px ${mono}`), document.fonts.load(`700 64px ${heading}`)])
            .catch(() => undefined)
            .finally(() => { if (!cancelled) setFonts({ mono, heading }); });
        return () => { cancelled = true; };
    }, []);

    // Stop rendering while the hero is scrolled away.
    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.02 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // The hidden hearts easter egg: all three found turns the left ship gold.
    useEffect(() => {
        const sync = (count: number) => setSecret(count >= 3);
        sync(heartsFound());
        const onHearts = (e: Event) => sync((e as CustomEvent<{ count: number }>).detail?.count ?? heartsFound());
        window.addEventListener('ls:hearts', onHearts);
        return () => window.removeEventListener('ls:hearts', onHearts);
    }, []);

    useEffect(() => {
        controls.current.secret = secret;
    }, [secret]);

    return (
        <section ref={rootRef} className="lsf-hero" aria-labelledby="ls-title">
            <div
                className="lsf-stage"
                role="img"
                aria-label={`Animation: a ${SHIPS[SPACESHIP].label} and a ${SHIPS[UFO].label} from LogicSprint dogfight in space: the left ship fires bursts of minus signs, the right ship bursts of plus signs.`}
            >
                {fonts && <DogfightScene controls={controls} fonts={fonts} paused={!onScreen || reducedMotion} />}
            </div>

            <div className="lsf-veil" aria-hidden="true" />

            <div className="lsf-title">
                <p className="ls-label">Brain games · Android</p>
                <h1 id="ls-title" className="ls-heading">
                    Logic<span style={{ color: 'var(--ls-teal)' }}>Sprint</span>
                </h1>
                <p className="lsf-tagline">{APP.tagline}</p>
            </div>

            <div className="lsf-bottom">
                <div className="lsf-center">
                    <HiddenHeart id="hero" />
                    <a href="#intro" className="lsf-scroll ls-label">
                        Scroll
                        <ChevronDown size={16} aria-hidden="true" />
                    </a>
                </div>
            </div>
        </section>
    );
}
