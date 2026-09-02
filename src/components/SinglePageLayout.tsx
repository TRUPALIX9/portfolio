"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

import VerticalNav       from './VerticalNav';
import HeroSection       from './HeroSection';
import AboutSection      from './AboutSection';
import ProjectShowcase   from './ProjectShowcase';

const ExperienceTimeline = dynamic(() => import('./ExperienceTimeline'), { ssr: false });
const ContactSection = dynamic(() => import('./ContactSection'), { ssr: false });
const SpaceScene = dynamic(() => import('./space/SpaceScene'), { ssr: false });

const SECTIONS = [
    { id: 'hero',       label: 'Hero'       },
    { id: 'about',      label: 'About'      },
    { id: 'projects',   label: 'Work'       },
    { id: 'experience', label: 'Experience' },
    { id: 'contact',    label: 'Contact'    },
];

const SECTION_IDS = SECTIONS.map(s => s.id);

export default function SinglePageLayout() {
    const [activeSection, setActiveSection] = useState(0);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Intersection observer — whichever section is most in view becomes active
    useEffect(() => {
        const entries: Record<string, number> = {};

        observerRef.current = new IntersectionObserver(
            (observed) => {
                observed.forEach(entry => {
                    entries[entry.target.id] = entry.intersectionRatio;
                });
                // Pick the section with the highest intersection ratio
                let maxRatio = 0;
                let maxId    = SECTION_IDS[0];
                for (const [id, ratio] of Object.entries(entries)) {
                    if (ratio > maxRatio) { maxRatio = ratio; maxId = id; }
                }
                const idx = SECTION_IDS.indexOf(maxId);
                if (idx !== -1) setActiveSection(idx);
            },
            { threshold: [0, 0.25, 0.5, 0.75, 1] }
        );

        SECTION_IDS.forEach(id => {
            const el = document.getElementById(id);
            if (el) observerRef.current?.observe(el);
        });

        return () => observerRef.current?.disconnect();
    }, []);

    const scrollToSection = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    return (
        <>
            {/* Main vertical scroll stage */}
            <div className="flex flex-col w-full relative z-10">

                <HeroSection onScrollNext={() => scrollToSection('about')} />

                <section id="about" className="w-full relative">
                    <AboutSection />
                </section>

                <section id="projects" className="w-full relative">
                    <ProjectShowcase />
                </section>


                <section id="contact" className="w-full relative">
                    <ContactSection />
                </section>

                {/* Gateway section: satellite pages */}
                <motion.div
                    className="gateway-section mt-32 mb-12"
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7 }}
                >
                    <Link href="/game" className="gateway-tile">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '1.25rem', flexWrap: 'wrap' }}>
                            <div className="gateway-tile-label" style={{ margin: 0 }}>Can You Remember?</div>
                            <span className="gateway-btn" style={{ alignSelf: 'auto' }}>Prove it &rarr;</span>
                        </div>
                        <div className="gateway-tile-sub">
                            Test your speed and memory under pressure. Beat the global leaderboard, or prove you actually need a break.
                        </div>
                    </Link>
                </motion.div>
            </div>

            {/* Fixed right vertical navigation */}
            <VerticalNav />
        </>
    );
}
