"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const SECTION_COLORS: Record<string, string> = {
    hero:       'rgba(74,222,128,0.12)',
    about:      'rgba(56,189,248,0.12)',
    projects:   'rgba(129,140,248,0.12)',
    experience: 'rgba(251,191,36,0.10)',
    resume:     'rgba(34,211,238,0.10)',
    contact:    'rgba(249,115,22,0.10)',
};

const SECTION_ICONS: Record<string, string> = {
    hero:       '✦',
    about:      '◎',
    projects:   '⬡',
    experience: '◈',
    resume:     '▤',
    contact:    '◉',
};

interface ZoomScrollPadProps {
    sections: string[];
    activeSection: number;
}

export default function ZoomScrollPad({ sections, activeSection }: ZoomScrollPadProps) {
    const trackRef    = useRef<HTMLDivElement>(null);
    const thumbY      = useMotionValue(0);
    const isDragging  = useRef(false);
    const [trackH, setTrackH] = useState(0);

    // Measure track height after mount
    useEffect(() => {
        const measure = () => {
            if (trackRef.current) setTrackH(trackRef.current.offsetHeight);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    // Sync thumb position to active section
    useEffect(() => {
        if (isDragging.current || trackH === 0) return;
        const target = (activeSection / (sections.length - 1)) * Math.max(0, trackH - 32);
        animate(thumbY, target, { type: 'spring', stiffness: 260, damping: 28 });
    }, [activeSection, sections.length, trackH, thumbY]);

    // Scroll to a section by index
    const scrollToSection = useCallback((index: number) => {
        const id = sections[index];
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [sections]);

    // Thumb drag → scroll page
    const handleDrag = useCallback((_: unknown, info: { point: { y: number } }) => {
        if (!trackRef.current) return;
        isDragging.current = true;
        const rect = trackRef.current.getBoundingClientRect();
        const clampedY = Math.max(0, Math.min(info.point.y - rect.top, trackH - 32));
        const progress = clampedY / Math.max(1, trackH - 32);
        const totalH   = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: progress * totalH });
    }, [trackH]);

    const handleDragEnd = useCallback(() => {
        setTimeout(() => { isDragging.current = false; }, 50);
    }, []);

    // Track click → jump
    const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const progress = Math.max(0, Math.min((e.clientY - rect.top) / trackH, 1));
        const totalH   = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: progress * totalH, behavior: 'smooth' });
    }, [trackH]);

    // Thumb height = proportional to 1/N sections
    const thumbHeight = Math.max(20, trackH / sections.length);

    return (
        <div className="zoom-scroll-pad" role="navigation" aria-label="Section navigator">
            {/* Thumbnail cards */}
            <div className="zoom-pad-thumbnails">
                {sections.map((id, i) => (
                    <motion.button
                        key={id}
                        type="button"
                        onClick={() => scrollToSection(i)}
                        className={`zoom-pad-thumbnail${activeSection === i ? ' is-active' : ''}`}
                        aria-label={`Go to ${id} section`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <div
                            className="zoom-pad-thumb-preview"
                            style={{ background: SECTION_COLORS[id] ?? 'rgba(255,255,255,0.04)' }}
                        >
                            <span style={{
                                fontSize: '1.1rem',
                                color: activeSection === i ? 'var(--accent-secondary)' : 'var(--text-muted)',
                                transition: 'color 0.2s',
                            }}>
                                {SECTION_ICONS[id] ?? '○'}
                            </span>
                        </div>
                        <span className="zoom-pad-thumb-label">{id}</span>
                    </motion.button>
                ))}
            </div>

            {/* Track + draggable thumb */}
            <div className="zoom-pad-track-col">
                <div
                    ref={trackRef}
                    className="zoom-pad-track"
                    onClick={handleTrackClick}
                    style={{ cursor: 'pointer' }}
                >
                    <motion.div
                        className="zoom-pad-thumb"
                        drag="y"
                        dragConstraints={trackRef}
                        dragElastic={0}
                        dragMomentum={false}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                        style={{
                            y: thumbY,
                            height: thumbHeight,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
