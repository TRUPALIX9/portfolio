"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Award, Layers, History, Mail, Cpu } from 'lucide-react';
import { EASE_OUT } from '@/components/motion/Reveal';

const navItems = [
    { id: 'hero', label: 'Hero', icon: Sparkles },
    { id: 'about', label: 'About', icon: User },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'experience', label: 'Experience', icon: History },
    { id: 'tech-stack', label: 'Tech Stack', icon: Cpu },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'contact', label: 'Contact', icon: Mail },
];

export default function VerticalNav() {
    const [activeSection, setActiveSection] = useState('hero');
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.find((entry) => entry.isIntersecting);
                if (visible) {
                    setActiveSection(visible.target.id);
                }
            },
            {
                rootMargin: '-50% 0px -50% 0px', // Trigger when section passes middle of screen
            }
        );

        navItems.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div style={{ position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 100 }}>
            <motion.nav
                aria-label="Section navigation"
                onFocus={() => setIsHovered(true)}
                onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsHovered(false);
                }}
                className="flex flex-col items-start hidden md:flex rounded-l-[28px] rounded-r-none overflow-hidden py-4 bg-surface-2/90 backdrop-blur-xl border border-line-2 border-r-0 shadow-[var(--shadow-raised)]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                initial={{ width: 56 }}
                animate={{ width: isHovered ? 180 : 56 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
            >
                <div className="flex flex-col gap-1 w-full">
                    {navItems.map((item) => {
                        const isActive = activeSection === item.id;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                aria-label={item.label}
                                aria-current={isActive ? 'location' : undefined}
                                onClick={() => scrollToSection(item.id)}
                                className={`relative flex items-center text-left group w-full h-[48px] transition-colors duration-150 focus-visible:bg-white/[0.06] ${isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'}`}
                            >
                                {/* Center Icon Column (always 56px wide to keep icon locked in place) */}
                                <div className="w-[56px] h-full flex-shrink-0 flex items-center justify-center relative">
                                    {/* Active Indicator Line */}
                                    <motion.div
                                        initial={{ opacity: 0, scaleY: 0 }}
                                        animate={{
                                            opacity: isActive ? 1 : 0,
                                            scaleY: isActive ? 1 : 0,
                                        }}
                                        transition={{ duration: 0.2, ease: EASE_OUT }}
                                        className="absolute left-0 w-[3px] h-[18px] bg-[#4ADE80] rounded-r-full origin-left"
                                    />
                                    
                                    <Icon
                                        size={20}
                                        strokeWidth={2}
                                        className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-accent' : 'text-ink-2 group-hover:text-ink-1'}`}
                                    />
                                </div>
                                
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -6 }}
                                            transition={{ duration: 0.18, ease: EASE_OUT }}
                                            className={`whitespace-nowrap text-[15px] tracking-wide pr-4 ${isActive ? 'text-ink-1 font-semibold' : 'text-ink-2 group-hover:text-ink-1 font-medium'}`}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        );
                    })}
                </div>
            </motion.nav>
        </div>
    );
}
