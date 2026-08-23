"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import master from '../data/master.json';

export default function ExperienceTimeline() {
    return (
        <div id="experience" style={{ width: '100%', paddingTop: '2rem' }}>
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
                </div>

                <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', paddingLeft: '2.5rem', borderLeft: '2px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {master.experiences.map((exp, index) => (
                        <div key={exp.slug} style={{ position: 'relative' }}>
                            {/* TIMELINE DOT */}
                            <div style={{ 
                                position: 'absolute', 
                                width: '16px', 
                                height: '16px', 
                                borderRadius: '50%', 
                                background: '#4ADE80', 
                                left: 'calc(-2.5rem - 9px)', 
                                top: '3rem', 
                                boxShadow: '0 0 12px rgba(74,222,128,0.5)' 
                            }} />
                            {/* TIMELINE YEAR */}
                            <div style={{
                                position: 'absolute',
                                left: 'calc(-2.5rem - 60px)',
                                top: '2.95rem',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: 'rgba(255,255,255,0.4)',
                                fontFamily: 'monospace',
                                letterSpacing: '0.05em'
                            }}>
                                {exp.period.match(/\d{4}/)?.[0]}
                            </div>
                            
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15, duration: 0.5 }}
                                className="glass-card"
                                style={{ padding: '2.5rem', position: 'relative' }}
                            >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Link 
                                        href={`/experience/${exp.slug}`} 
                                        style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '0.35rem', 
                                            fontSize: '0.9rem', 
                                            fontWeight: 500, 
                                            color: 'var(--accent-primary)', 
                                            textDecoration: 'none', 
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = 'var(--text-primary)';
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = 'var(--accent-primary)';
                                            e.currentTarget.style.transform = 'none';
                                        }}
                                    >
                                        Read More &rarr;
                                    </Link>
                                </div>
                            </div>

                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                {exp.achievements.map((item, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        <span style={{ color: 'var(--accent-secondary)', marginTop: '0.4rem', fontSize: '0.75rem' }}>▹</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
