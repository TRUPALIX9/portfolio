"use client";

import { useCallback } from 'react';
import dynamic from 'next/dynamic';

import VerticalNav       from './VerticalNav';
import HeroSection       from './HeroSection';
import AboutSection      from './AboutSection';
import ProductShowcase   from './ProductShowcase';
import ProjectShowcase   from './ProjectShowcase';

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

                <section id="about" data-track-section="about" className="w-full relative">
                    <AboutSection />
                </section>

                <section id="products" data-track-section="products" className="w-full relative">
                    <ProductShowcase />
                </section>

                <section id="projects" data-track-section="projects" className="w-full relative">
                    <ProjectShowcase />
                </section>

                {/* The id lives here (not inside the lazily-loaded ContactSection) so nav
                    observers and "#contact" links find it before the chunk loads. */}
                <section id="contact" data-track-section="contact" className="w-full relative">
                    <ContactSection />
                </section>
            </div>

            {/* Fixed right vertical navigation */}
            <VerticalNav />
        </>
    );
}
