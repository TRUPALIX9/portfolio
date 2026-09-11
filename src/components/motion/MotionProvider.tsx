"use client";

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';
import { EASE_OUT } from './Reveal';

/**
 * Site-wide motion defaults. `reducedMotion="user"` makes every framer-motion animation
 * skip transform/layout movement when the OS "reduce motion" setting is on, so individual
 * components don't each need to check it.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
    return (
        <MotionConfig reducedMotion="user" transition={{ ease: EASE_OUT }}>
            {children}
        </MotionConfig>
    );
}
