'use client';

import './hearts.css';
import { useEffect, useRef, useState } from 'react';
import { collectHeart, useCollectedHearts, type HeartId } from './store';

/** The app's red heart (Play tab top bar). */
export function HeartGlyph({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
                fill="currentColor"
                d="M12 21.2 10.6 20C5.4 15.3 2 12.2 2 8.4 2 5.3 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.3 22 8.4c0 3.8-3.4 6.9-8.6 11.6L12 21.2Z"
            />
        </svg>
    );
}

const BURST = Array.from({ length: 8 }, (_, i) => i);

/**
 * A small, easy-to-miss heart. Clicking it collects it (see ./store for the storage key and the
 * `ls:hearts` event). Usage: `<HiddenHeart id="hero" />`, `"footer"`, `"privacy"`.
 */
export default function HiddenHeart({ id, className = '' }: { id: HeartId; className?: string }) {
    const collected = useCollectedHearts().includes(id);
    const [burst, setBurst] = useState(0);
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const onClick = () => {
        if (!collectHeart(id)) return;
        setBurst((n) => n + 1);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setBurst(0), 800);
    };

    return (
        <button
            type="button"
            className={`lsh-heart ${className}`}
            data-collected={collected || undefined}
            aria-label={collected ? 'Hidden heart (found)' : 'Hidden heart'}
            aria-pressed={collected}
            onClick={onClick}
        >
            <HeartGlyph />
            {burst > 0 && (
                <span key={burst} className="lsh-burst" aria-hidden="true">
                    {BURST.map((i) => (
                        <span key={i} style={{ '--lsh-a': `${i * 45}deg` } as React.CSSProperties} />
                    ))}
                </span>
            )}
        </button>
    );
}
