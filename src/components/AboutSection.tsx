"use client";
import { motion } from 'framer-motion';
import master from '../data/master.json';

const skills = [
    { name: "React", class: "devicon-react-original colored" },
    { name: "Next.js", class: "devicon-nextjs-plain" },
    { name: "TypeScript", class: "devicon-typescript-plain colored" },
    { name: "Node.js", class: "devicon-nodejs-plain colored" },
    { name: "MongoDB", class: "devicon-mongodb-plain colored" },
    { name: "SQL", class: "devicon-mysql-plain colored" },
    { name: "Tailwind", class: "devicon-tailwindcss-original colored" },
    { name: "Docker", class: "devicon-docker-plain colored" },
    { name: "Python", class: "devicon-python-plain colored" },
    { name: "AWS", class: "devicon-amazonwebservices-original colored" }
];

export default function AboutSection() {
    return (
        <section className="section container" style={{ minHeight: '100vh', paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ textAlign: 'center', marginBottom: '5rem' }}
            >
                <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Behind the Code
                </div>
                <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    Architecting the <br /><span className="gradient-text">digital future.</span>
                </h1>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'flex-start' }}>
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="glass-card"
                    style={{ padding: '3rem', borderRadius: '32px', position: 'sticky', top: '100px', border: '1px solid rgba(74, 222, 128, 0.2)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)' }}
                >
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 10px 30px rgba(74, 222, 128, 0.3)' }}>
                        <span style={{ filter: 'brightness(2)' }}>🚀</span>
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{master.personal.name}</h2>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', marginBottom: '2.5rem', fontWeight: 500 }}>{master.personal.title}</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '1.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '12px' }}>📍</span>
                            <span style={{ fontSize: '1.1rem' }}>{master.personal.location}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '1.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '12px' }}>✉️</span>
                            <span style={{ fontSize: '1.1rem' }}>{master.personal.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '1.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '12px' }}>📱</span>
                            <span style={{ fontSize: '1.1rem', fontFamily: 'monospace' }}>{master.personal.phone}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Technical Arsenal</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {skills.map((skill) => (
                                <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s ease', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74, 222, 128, 0.1)'; e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.3)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}>
                                    <i className={skill.class} style={{ fontSize: '1.25rem' }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="glass-card"
                        style={{ padding: '3.5rem', borderRadius: '32px' }}
                    >
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>The Journey</h3>
                        {master.personal.storyText.split('\n\n').map((paragraph, idx) => (
                            <p key={idx} style={{
                                color: idx === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                fontSize: idx === 0 ? '1.25rem' : '1.1rem',
                                lineHeight: 1.8,
                                marginBottom: idx === 2 ? 0 : '1.5rem',
                                fontWeight: idx === 0 ? 500 : 400
                            }}>
                                {paragraph}
                            </p>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                    >
                        <div className="glass-card" style={{ padding: '3rem', borderRadius: '32px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Education</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(74, 222, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '1.5rem', flexShrink: 0 }}>🎓</div>
                                    <div>
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>M.S. Computer Science</h4>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>California State University, Channel Islands</p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--accent-secondary)', fontFamily: 'monospace' }}>2025 – Present</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontSize: '1.5rem', flexShrink: 0 }}>🎓</div>
                                    <div>
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>B.E. Computer Engineering</h4>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Gujarat Technological University</p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>2019 – 2023</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '3rem', borderRadius: '32px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Certifications</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>🏆</div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Meta Front-End Developer</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Professional Certificate</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
