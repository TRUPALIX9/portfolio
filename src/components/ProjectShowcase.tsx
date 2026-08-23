"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { projects } from '../data/projects';
import Image from 'next/image';

export default function ProjectShowcase() {
    return (
        <div className="container mx-auto py-32 w-full border-t border-[rgba(255,255,255,0.05)]">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center flex flex-col items-center"
                >
                    <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                        things i <span className="gradient-text">build.</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                    {projects.slice(0, 4).map((project, index) => (
                        <motion.article
                            key={project.slug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group flex flex-col relative overflow-hidden rounded-xl bg-neutral-900/40 backdrop-blur-md border border-neutral-800/60 shadow-xl hover:bg-neutral-800/50 transition-all duration-300 hover:border-neutral-700/80"
                        >
                            {/* Image */}
                            <Link href={`/projects/${project.slug}`} className="block relative w-full h-[220px] overflow-hidden bg-neutral-950/60 border-b border-neutral-800/30 p-6 flex items-center justify-center">
                                <motion.img
                                    src={project.image}
                                    alt={project.title}
                                    className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                    style={{ width: 'auto', height: 'auto' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/30 to-transparent opacity-40 pointer-events-none" />
                            </Link>

                            {/* Content */}
                            <div className="p-8 pb-7 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold tracking-tight text-[#EDEDED] group-hover:text-white transition-colors">
                                        {project.title}
                                    </h3>
                                    <ArrowUpRight size={18} className="text-neutral-500 group-hover:text-white transition-colors" />
                                </div>
                                
                                <p className="text-[#999999] text-[0.93rem] font-light leading-relaxed mb-5 line-clamp-2">
                                    {project.description}
                                </p>
                                
                                <div className="flex flex-wrap gap-1.5 pt-4 pb-1 border-t border-neutral-800/50">
                                    {project.tech.map(t => (
                                        <span key={t.name} className="px-2.5 py-1 text-[0.72rem] font-medium bg-black/40 border border-neutral-700/40 rounded-full text-neutral-300 flex items-center gap-1.5 transition-colors group-hover:border-neutral-600/50 group-hover:bg-black/60">
                                            {t.icon && <i className={t.icon} style={{ fontSize: '0.8rem' }}></i>}
                                            {t.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Entire card link overlay */}
                            <Link href={`/projects/${project.slug}`} className="absolute inset-0 z-10">
                                <span className="sr-only">View {project.title} details</span>
                            </Link>
                        </motion.article>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex justify-center"
                >
                    <Link
                        href="/projects"
                        className="btn-primary inline-flex items-center gap-2"
                        style={{ padding: '0.7rem 2rem', fontSize: '0.9rem', letterSpacing: '0.02em', backgroundColor: '#fff', color: '#000' }}
                    >
                        View All Projects
                        <ArrowUpRight size={16} />
                    </Link>
                </motion.div>
            </div>
        </div>

    );
}
