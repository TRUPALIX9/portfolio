"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import master from '../data/master.json';
import VoiceAssistant from './VoiceAssistant';

export default function ExperienceTimeline() {
    return (
        <section id="experience" className="section container">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 className="heading-lg">
                        Where I've <span style={{ color: 'var(--accent-primary)' }}>worked.</span>
                    </h2>
                    <VoiceAssistant />
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {master.experiences.map((exp, index) => (
                        <motion.div
                            key={exp.slug}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15, duration: 0.5 }}
                            className="glass-card"
                            style={{ padding: '2.5rem', position: 'relative' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '56px', height: '56px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#fff', padding: '6px' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={exp.logo} alt={exp.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {exp.role} <span style={{ color: 'var(--accent-primary)' }}>@ <a href={exp.url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>{exp.company}</a></span>
                                    </h3>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontFamily: 'monospace' }}>{exp.period}</span>
                                </div>
                            </div>

                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {exp.achievements.map((item, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        <span style={{ color: 'var(--accent-secondary)', marginTop: '0.4rem', fontSize: '0.75rem' }}>▹</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div style={{ marginTop: '2rem', display: 'flex' }}>
                                <Link href={`/experience/${exp.slug}`} className="btn-outline" style={{ display: 'inline-flex', padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}>
                                    View Detailed Experience &rarr;
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
