'use client';

import { Play } from 'lucide-react';
import { playMotionAnyway, useReducedMotion } from './useDemoRuntime';

/** Shown only when the device asks for reduced motion and the demos are frozen on a still frame. */
export default function MotionNotice() {
    const reduced = useReducedMotion();
    if (!reduced) return null;
    return (
        <div className="lsg-motion">
            <p className="ls-muted">Your device has reduced motion on, so the game demos are paused.</p>
            <button type="button" className="ls-btn ls-btn-ghost" onClick={playMotionAnyway}>
                <Play size={18} aria-hidden="true" />
                Play the game demos
            </button>
        </div>
    );
}
