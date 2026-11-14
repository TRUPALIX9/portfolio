"use client";

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const SECTIONS = [
    { id: 'overview', no: 1, label: 'Overview' },
    { id: 'pinout', no: 2, label: 'Pinout' },
    { id: 'applications', no: 3, label: 'Applications' },
    { id: 'revisions', no: 4, label: 'Revision history' },
    { id: 'documents', no: 5, label: 'Related documents' },
    { id: 'ordering', no: 6, label: 'Ordering information' },
];

/** Sticky contents list that highlights the section in view. */
export function PageIndex() {
    const [current, setCurrent] = useState(SECTIONS[0].id);

    useEffect(() => {
        const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
        const io = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) setCurrent(visible[0].target.id);
            },
            { rootMargin: '-30% 0px -60% 0px' },
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <nav className="sp-index" aria-label="Datasheet contents">
            <p className="sp-index__title">Contents</p>
            <ol>
                {SECTIONS.map((s) => (
                    <li key={s.id}>
                        <a href={`#${s.id}`} aria-current={current === s.id ? 'true' : undefined}>
                            <span>{s.no}</span>
                            <span>{s.label}</span>
                        </a>
                    </li>
                ))}
            </ol>
            <p className="sp-index__meta">TP-SDE-2026<br />Rev 4 · Oct 2026<br />Atlanta, GA</p>
        </nav>
    );
}

/** A ruler under the top bar that fills as you read. */
export function ScrollRuler() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
    return (
        <div className="sp-ruler" aria-hidden="true">
            <motion.div className="sp-ruler__fill" style={{ scaleX }} />
        </div>
    );
}
