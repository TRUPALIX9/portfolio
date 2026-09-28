'use client';

import './hearts.css';
import { useEffect, useRef, useState } from 'react';
import { HeartGlyph } from './HiddenHeart';
import { HEARTS_EVENT, HEART_TOTAL, getCollected, type HeartsDetail } from './store';

type Toast = { key: number; count: number };

/**
 * App-style toasts for the hidden hearts: "+1 ♥ 1/3" per heart, and an unlock message at 3/3.
 * Mounted once in the LogicSprint layout; listens for `ls:hearts`.
 */
export default function HeartsToaster() {
    const [toast, setToast] = useState<Toast | null>(null);
    const last = useRef(0);
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => {
        last.current = getCollected().length;
        const onHearts = (e: Event) => {
            const { count } = (e as CustomEvent<HeartsDetail>).detail;
            if (count > last.current) {
                setToast({ key: Date.now(), count });
                window.clearTimeout(timer.current);
                timer.current = window.setTimeout(() => setToast(null), count >= HEART_TOTAL ? 5200 : 2600);
            }
            last.current = count;
        };
        window.addEventListener(HEARTS_EVENT, onHearts);
        return () => {
            window.removeEventListener(HEARTS_EVENT, onHearts);
            window.clearTimeout(timer.current);
        };
    }, []);

    const done = toast !== null && toast.count >= HEART_TOTAL;

    return (
        <div className="lsh-toaster" role="status" aria-live="polite">
            {toast && (
                <div key={toast.key} className="lsh-toast" data-done={done || undefined}>
                    <span className="lsh-toast-icon"><HeartGlyph size={18} /></span>
                    <span className="lsh-toast-text">
                        <span className="ls-heading lsh-toast-title">
                            +1 <span aria-hidden="true">♥</span><span className="lsh-sr"> heart</span>{' '}
                            <span className="ls-num">{toast.count}/{HEART_TOTAL}</span>
                        </span>
                        {done && (
                            <span className="ls-label lsh-toast-sub">All hearts found — secret ship colour unlocked in the hero</span>
                        )}
                    </span>
                </div>
            )}
        </div>
    );
}
