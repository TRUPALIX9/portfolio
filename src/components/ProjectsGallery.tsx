"use client";
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { projects } from '../data/projects';
import Reveal, { Stagger, StaggerItem } from './motion/Reveal';

const GithubIcon = ({ size = 20 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.18-.35 6.5-1.56 6.5-7.16 0-1.49-.5-2.7-1.35-3.68.14-.33.6-1.74-.15-3.63 0 0-1.12-.36-3.7 1.38a12.8 12.8 0 0 0-6.7 0c-2.58-1.74-3.7-1.38-3.7-1.38-.75 1.89-.29 3.3-.15 3.63-.85.98-1.35 2.19-1.35 3.68 0 5.6 3.32 6.81 6.5 7.16A4.8 4.8 0 0 0 3 18.28V22" />
    </svg>
);

/** Card images that are logos/wordmarks: shown whole (contain + padding) instead of cropped. */
const LOGO_IMAGES = new Set(['/retailsync_logo.png', '/web_warehouse_card.png']);

const iconLinkClass =
    'inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-3 transition-colors duration-200 hover:bg-surface-3 hover:text-ink-1';

export default function ProjectsGallery() {
    const hasRealLink = (url: string) => Boolean(url) && url !== "#";

    return (
        <section id="work" className="section container">
            <Reveal>
                {/* Back to Home Button */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                        <ArrowLeft size={15} aria-hidden="true" /> Back to Home
                    </Link>
                </div>

                <p className="eyebrow mb-3">Selected work</p>
                <h1 className="heading-lg text-ink-1" style={{ marginBottom: '3.5rem' }}>
                    Some things I&apos;ve <span className="gradient-text">built.</span>
                </h1>
            </Reveal>

            <Stagger
                role="list"
                className="grid gap-6 lg:gap-8"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}
            >
                {projects.map((project) => {
                    const isLogo = LOGO_IMAGES.has(project.image);
                    return (
                        // Motion wrapper stays outside the card: framer's inline transform would
                        // otherwise cancel .card-interactive's hover lift.
                        <StaggerItem key={project.slug} role="listitem" className="h-full">
                            <article className="card card-interactive spotlight group flex h-full flex-col overflow-hidden rounded-2xl">
                                <div className={`relative aspect-[16/10] overflow-hidden border-b border-line-1 ${isLogo ? 'bg-surface-1' : 'bg-surface-3'}`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        loading="lazy"
                                        decoding="async"
                                        className={`h-full w-full transition-transform duration-500 ease-out-expo group-hover:scale-[1.03] ${isLogo ? 'object-contain p-10 sm:p-12' : 'object-cover'}`}
                                    />
                                </div>

                                <div className="flex flex-1 flex-col p-6 sm:p-7">
                                    <h2 className="mb-2.5 text-xl font-bold leading-snug tracking-tight text-ink-1">{project.title}</h2>
                                    <p className="mb-5 line-clamp-3 text-[0.9375rem] leading-[1.7] text-ink-2">{project.description}</p>

                                    <ul className="mb-6 flex flex-wrap gap-1.5" aria-label="Tech stack">
                                        {project.tech.map(t => (
                                            <li key={t.name} className="inline-flex items-center gap-1.5 rounded-md border border-line-1 bg-surface-3 px-2 py-1 text-xs font-medium text-ink-2">
                                                {t.icon && <i className={t.icon} aria-hidden="true" style={{ fontSize: '0.875rem' }} />}
                                                {t.name}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto flex items-center gap-2 border-t border-line-1 pt-5">
                                        <Link
                                            href={`/projects/${project.slug}`}
                                            className="btn-outline"
                                            aria-label={`Read more about ${project.title}`}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1.1rem', fontSize: '0.875rem' }}
                                        >
                                            Read More
                                            <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5" />
                                        </Link>
                                        <div className="ml-auto flex gap-1">
                                            {hasRealLink(project.links.github) && (
                                                <a href={project.links.github} target="_blank" rel="noreferrer" aria-label={`${project.title} source code on GitHub`} className={iconLinkClass}>
                                                    <GithubIcon size={20} />
                                                </a>
                                            )}
                                            {hasRealLink(project.links.live) && (
                                                <a href={project.links.live} target="_blank" rel="noreferrer" aria-label={`Open ${project.title} live site`} className={iconLinkClass}>
                                                    <ExternalLink size={20} aria-hidden="true" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </StaggerItem>
                    );
                })}
            </Stagger>
        </section>
    );
}
