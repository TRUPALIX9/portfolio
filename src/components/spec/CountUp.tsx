"use client";

import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

/** A number that counts up once when it scrolls into view. Renders the final value without JS. */
export default function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const reduce = useReducedMotion();

    useEffect(() => {
        const el = ref.current;
        if (!el || !inView || reduce) return;
        const controls = animate(0, to, {
            duration: 0.9,
            ease: 'easeOut',
            onUpdate: (v) => { el.textContent = `${Math.round(v)}${suffix}`; },
        });
        return () => controls.stop();
    }, [inView, reduce, to, suffix]);

    return <span ref={ref}>{to}{suffix}</span>;
}
