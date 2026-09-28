'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { GAMES, type GameType } from '@/data/logicsprint';
import { DEMOS, SHORT_NAME } from './demos';
import PhoneFrame from './PhoneFrame';
import { useReducedMotion } from './useDemoRuntime';

/* Scrollytelling for "Four ways to sprint". On wide screens the game sections scroll on the left
   while one sticky phone on the right plays whichever game is in the middle of the viewport; a
   change of game slides the screen over like switching apps. Below 960px the rail is hidden and
   each section shows its own phone (GamePhone). */

const pad = (n: number) => String(n).padStart(2, '0');
const SWITCH_MS = 420;

export default function GamesStage({ children }: { children: ReactNode }) {
    const listRef = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const [active, setActive] = useState<GameType>(GAMES[0].type);
    // The screen being shown and, for one transition, the one sliding away.
    const [shown, setShown] = useState<{ current: GameType; prev: GameType | null; n: number }>({
        current: GAMES[0].type,
        prev: null,
        n: 0,
    });
    if (shown.current !== active) setShown({ current: active, prev: shown.current, n: shown.n + 1 });

    useEffect(() => {
        if (!shown.prev) return;
        const id = window.setTimeout(() => setShown((s) => ({ ...s, prev: null })), SWITCH_MS);
        return () => window.clearTimeout(id);
    }, [shown.prev, shown.n]);

    // The game whose section crosses the middle band of the viewport is the one on the phone.
    useEffect(() => {
        const list = listRef.current;
        if (!list || typeof IntersectionObserver === 'undefined') return;
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const type = (entry.target as HTMLElement).dataset.game as GameType | undefined;
                    if (entry.isIntersecting && type) setActive(type);
                }
            },
            { rootMargin: '-45% 0px -45% 0px' },
        );
        list.querySelectorAll('[data-game]').forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    const go = (type: GameType) =>
        document.getElementById(`game-${type}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });

    const accent = GAMES.find((g) => g.type === active)?.accent;
    const Current = DEMOS[shown.current];
    const Prev = shown.prev ? DEMOS[shown.prev] : null;

    return (
        <div className="lsg-stage" style={{ '--lsg-accent': accent } as CSSProperties}>
            <div ref={listRef} className="lsg-games">
                {children}
            </div>
            <div className="lsg-rail">
                <div className="lsg-sticky">
                    <PhoneFrame className="lsg-phone-hero">
                        {Prev && (
                            <div key={`${shown.prev}-${shown.n - 1}`} className="lsg-layer" data-leave>
                                <Prev />
                            </div>
                        )}
                        <div key={`${shown.current}-${shown.n}`} className="lsg-layer" data-enter={shown.n > 0 || undefined}>
                            <Current />
                        </div>
                    </PhoneFrame>
                    <nav className="lsg-dots" aria-label="Games">
                        <ol>
                            {GAMES.map((g, i) => (
                                <li key={g.type}>
                                    <button
                                        type="button"
                                        aria-current={g.type === active ? 'true' : undefined}
                                        style={{ '--lsg-dot': g.accent } as CSSProperties}
                                        onClick={() => go(g.type)}
                                    >
                                        <span className="ls-num">{pad(i + 1)}</span> {SHORT_NAME[g.type]}
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    );
}

/** A section's own phone, shown below 960px only (the sticky rail takes over above that). */
export function GamePhone({ type }: { type: GameType }) {
    const Demo = DEMOS[type];
    return (
        <div className="lsg-slot">
            <PhoneFrame>
                <div className="lsg-layer">
                    <Demo />
                </div>
            </PhoneFrame>
        </div>
    );
}
