"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { projects } from '../data/projects';
import Reveal, { Stagger, StaggerItem } from '@/components/motion/Reveal';

export default function ProjectShowcase() {
    return (
        <div className="container mx-auto py-32 w-full border-t border-line-1">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
                <Reveal className="text-center flex flex-col items-center">
                    <p className="eyebrow mb-3">Projects</p>
                    <h2
                        className="text-ink-1"
                        style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}
                    >
                        things i <span className="text-accent">build.</span>
                    </h2>
                </Reveal>

                <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 w-full">
                    {projects.slice(0, 4).map((project) => (
                        <StaggerItem key={project.slug} className="h-full">
                            {/* Card classes sit inside the StaggerItem so its inline transform can't cancel the hover lift. */}
                            <article className="card card-interactive spotlight group flex h-full flex-col overflow-hidden rounded-2xl">
                                {/* Image */}
                                <Link href={`/projects/${project.slug}`} tabIndex={-1} aria-hidden="true" className="relative flex h-[220px] w-full items-center justify-center overflow-hidden border-b border-line-1 bg-surface-1 p-6">
                                    <motion.img
                                        src={project.image}
                                        alt={project.title}
                                        className="max-w-full max-h-full object-contain transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
                                        style={{ width: 'auto', height: 'auto' }}
                                    />
                                </Link>

                                {/* Content */}
                                <div className="p-7 md:p-8 pb-7 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <h3 className="text-xl font-semibold tracking-tight text-ink-1">
                                            {project.title}
                                        </h3>
                                        <ArrowUpRight
                                            size={18}
                                            aria-hidden="true"
                                            className="mt-1 shrink-0 text-ink-3 transition-[color,transform] duration-200 ease-out-expo group-hover:text-accent group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                        />
                                    </div>

                                    <p className="text-ink-2 text-[0.95rem] leading-[1.65] mb-5 line-clamp-2">
                                        {project.description}
                                    </p>

                                    <div className="mt-auto flex flex-wrap gap-1.5 pt-4 pb-1 border-t border-line-1">
                                        {project.tech.map(t => (
                                            <span key={t.name} className="px-2.5 py-1 text-xs font-medium bg-surface-3 border border-line-1 rounded-full text-ink-2 flex items-center gap-1.5 transition-colors duration-200 group-hover:border-line-2">
                                                {t.icon && <i className={t.icon} aria-hidden="true" style={{ fontSize: '0.8rem' }}></i>}
                                                {t.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Entire card link overlay */}
                                <Link href={`/projects/${project.slug}`} className="absolute inset-0 z-10 rounded-2xl">
                                    <span className="sr-only">View {project.title} details</span>
                                </Link>
                            </article>
                        </StaggerItem>
                    ))}
                </Stagger>

                <Reveal className="flex justify-center">
                    {/* Utilities instead of .btn-primary, whose hover scales to 1.05 */}
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 rounded-full bg-ink-1 px-8 py-3 text-[0.9rem] font-semibold tracking-[0.02em] text-surface-0 shadow-[var(--shadow-card)] transition-[transform,background-color,box-shadow] duration-200 ease-out-expo hover:-translate-y-0.5 hover:bg-white hover:shadow-[var(--shadow-raised)]"
                    >
                        View All Projects
                        <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                </Reveal>
            </div>
        </div>

    );
}
