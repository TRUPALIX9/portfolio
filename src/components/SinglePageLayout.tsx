"use client";

import { useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import VerticalNav       from './VerticalNav';
import HeroSection       from './HeroSection';
import AboutSection      from './AboutSection';
import ProductShowcase   from './ProductShowcase';
import ProjectShowcase   from './ProjectShowcase';
import Reveal            from '@/components/motion/Reveal';

const ContactSection = dynamic(() => import('./ContactSection'), { ssr: false });

export default function SinglePageLayout() {
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

                <section id="products" className="w-full relative">
                    <ProductShowcase />
                </section>

                <section id="projects" className="w-full relative">
                    <ProjectShowcase />
                </section>

                {/* The id lives here (not inside the lazily-loaded ContactSection) so nav
                    observers and "#contact" links find it before the chunk loads. */}
                <section id="contact" className="w-full relative">
                    <ContactSection />
                </section>

                {/* Gateway section: satellite pages */}
                <Reveal className="gateway-section mt-32 mb-12">
                    <Link href="/game" className="gateway-tile">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '1.25rem', flexWrap: 'wrap' }}>
                            <div className="gateway-tile-label" style={{ margin: 0 }}>Can You Remember?</div>
                            <span className="gateway-btn" style={{ alignSelf: 'auto' }}>Prove it &rarr;</span>
                        </div>
                        <div className="gateway-tile-sub">
                            Test your speed and memory under pressure. Beat the global leaderboard, or prove you actually need a break.
                        </div>
                    </Link>
                </Reveal>
            </div>

            {/* Fixed right vertical navigation */}
            <VerticalNav />
        </>
    );
}
