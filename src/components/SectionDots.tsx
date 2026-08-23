"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface SectionDotsProps {
    sections: { id: string; label: string }[];
    activeSection: number;
}

export default function SectionDots({ sections, activeSection }: SectionDotsProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <nav className="section-dots-rail" aria-label="Section navigation">
            {sections.map((section, i) => (
                <div key={section.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button
                        type="button"
                        className={`section-dot-btn${activeSection === i ? ' is-active' : ''}`}
                        onClick={() => scrollToSection(section.id)}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        aria-label={`Go to ${section.label}`}
                    />
                    <AnimatePresence>
                        {hoveredIndex === i && (
                            <motion.span
                                className="section-dot-tooltip"
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -4 }}
                                transition={{ duration: 0.15 }}
                                style={{ opacity: 1 }}
                            >
                                {section.label}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </nav>
    );
}
