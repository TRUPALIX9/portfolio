"use client";

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BriefcaseBusiness, Sparkles } from 'lucide-react';
import { socialLinks } from '@/data/site-config';
import { trackVisitorEvent } from '@/utils/visitor-analytics';

type SocialScene = {
    key: string;
    label: string;
    image: string;
    imageAlt: string;
    caption: string;
    links: typeof socialLinks;
};

type SocialPageProps = {
    title?: string;
    showTitle?: boolean;
    standalone?: boolean;
};

export default function SocialPage({
    title = 'Social Hub',
    showTitle = true,
    standalone = false,
}: SocialPageProps = {}) {
    const professionalNames = new Set(['GitHub', 'Email', 'Mobile', 'WhatsApp']);
    const professionalLinks = socialLinks.filter((social) => professionalNames.has(social.name));
    const socialPlatformLinks = socialLinks.filter((social) => !professionalNames.has(social.name));

    const scenes: SocialScene[] = [
        {
            key: 'professional',
            label: 'Work',
            image: '/proffesional.jpeg',
            imageAlt: 'Trupal Patel professional profile',
            caption: 'Work',
            links: professionalLinks,
        },
        {
            key: 'social',
            label: 'Life',
            image: '/social.jpeg',
            imageAlt: 'Trupal Patel social profile',
            caption: 'Life',
            links: socialPlatformLinks,
        },
    ];

    const [activeIndex, setActiveIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        if (hoveredIndex !== null) {
            return;
        }

        const interval = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % scenes.length);
        }, 4200);

        return () => window.clearInterval(interval);
    }, [hoveredIndex, scenes.length]);

    useEffect(() => {
        void trackVisitorEvent({
            event: 'page_view',
            route: standalone ? '/social-only' : '/social',
            source: standalone ? 'share-page' : 'portfolio-page',
        });
    }, [standalone]);

    const displayedIndex = hoveredIndex ?? activeIndex;
    const activeScene = scenes[displayedIndex];

    return (
        <main
            data-social-standalone={standalone ? 'true' : 'false'}
            style={{
                paddingTop: standalone ? '1.5rem' : 'calc(var(--nav-height) + 1.5rem)',
                paddingBottom: standalone ? '1.25rem' : '2rem',
                minHeight: standalone ? '100dvh' : '100vh',
                height: standalone ? '100dvh' : undefined,
                overflow: standalone ? 'hidden' : undefined,
            }}
        >
            <section
                className="social-hero-shell"
                data-social-standalone={standalone ? 'true' : 'false'}
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    padding: 'clamp(1.4rem, 3vw, 2.5rem)',
                    minHeight: standalone ? 'calc(100dvh - 2.75rem)' : 'calc(100vh - var(--nav-height) - 3rem)',
                    height: standalone ? 'calc(100dvh - 2.75rem)' : undefined,
                }}
            >
                <div className="social-hero-glow social-hero-glow--cyan" />
                <div className="social-hero-glow social-hero-glow--green" />
                <div className="social-grid-backdrop" />

                <div className="social-single-stage">
                    {showTitle && (
                        <div className="social-single-stage__intro">
                            <p className="social-single-stage__eyebrow">{title}</p>
                        </div>
                    )}

                    <div className="social-switchboard">
                        {scenes.map((scene, index) => {
                            const isActive = displayedIndex === index;

                            return (
                                <button
                                    key={scene.key}
                                    type="button"
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    onFocus={() => setHoveredIndex(index)}
                                    onBlur={() => setHoveredIndex(null)}
                                    onClick={() => setActiveIndex(index)}
                                    className={`social-switchboard__tab ${isActive ? 'is-active' : ''}`}
                                >
                                    <span className="social-switchboard__tab-label">{scene.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="social-single-stage__scene">
                        <div className="social-single-stage__scene-inner">
                            <div className={`social-stage social-stage--single social-stage--${activeScene.key}`}>
                                <div className={`social-stage__label social-stage__label--${activeScene.key}`}>
                                    {activeScene.key === 'professional' ? <BriefcaseBusiness size={15} /> : <Sparkles size={15} />}
                                    <span>{activeScene.label}</span>
                                </div>

                                <div className={`social-stage__frame social-stage__frame--${activeScene.key}`}>
                                    <AnimatePresence initial={false} mode="sync">
                                        <motion.img
                                            key={activeScene.key}
                                            src={activeScene.image}
                                            alt={activeScene.imageAlt}
                                            className="social-stage__photo"
                                            initial={{
                                                opacity: 0,
                                                rotateY: activeScene.key === 'professional' ? -18 : 18,
                                                scale: 1.015,
                                                x: activeScene.key === 'professional' ? 26 : -26,
                                            }}
                                            animate={{ opacity: 1, rotateY: 0, scale: 1, x: 0 }}
                                            exit={{
                                                opacity: 0,
                                                rotateY: activeScene.key === 'professional' ? 18 : -18,
                                                scale: 0.99,
                                                x: activeScene.key === 'professional' ? -18 : 18,
                                            }}
                                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                transformStyle: 'preserve-3d',
                                                position: 'absolute',
                                                inset: 0,
                                            }}
                                        />
                                    </AnimatePresence>
                                    <div className="social-stage__shine" />
                                </div>

                                <div className={`social-stage__cluster social-stage__cluster--${activeScene.key}`}>
                                    {activeScene.links.map((social, index) => (
                                        <motion.a
                                            key={`${activeScene.key}-${social.name}`}
                                            href={social.url}
                                            target={social.external === false ? undefined : "_blank"}
                                            rel={social.external === false ? undefined : "noreferrer"}
                                            className="social-mini-card"
                                            onClick={() => {
                                                void trackVisitorEvent({
                                                    event: 'link_open',
                                                    route: standalone ? '/social-only' : '/social',
                                                    source: activeScene.key,
                                                    linkName: social.name,
                                                    linkUrl: social.url,
                                                });
                                            }}
                                            initial={{ opacity: 0, y: 14 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + index * 0.06, duration: 0.35 }}
                                            style={{ '--social-color': social.color } as CSSProperties}
                                        >
                                            <span className="social-mini-card__icon" style={{ color: social.color }}>
                                                {social.icon}
                                            </span>
                                            <span>
                                                <span className="social-mini-card__label">{social.name}</span>
                                                <span className="social-mini-card__meta">{social.handle}</span>
                                            </span>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="social-single-stage__switches" aria-label="social image switcher">
                        {scenes.map((scene, index) => (
                            <button
                                key={scene.key}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                className={`social-single-stage__dot ${index === displayedIndex ? 'is-active' : ''}`}
                                aria-label={`Show ${scene.label} scene`}
                            />
                        ))}
                    </div>
                </div>
            </section>

        </main>
    );
}
