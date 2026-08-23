import master from '../../../data/master.json';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, Target, Sparkles, BookOpen, ExternalLink } from 'lucide-react';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
    return master.experiences.map((exp) => ({ slug: exp.slug }));
}

export default async function ExperienceDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const exp = master.experiences.find(e => e.slug === slug);

    if (!exp) notFound();

    return (
        <main className="container" style={{ paddingTop: 'calc(var(--nav-height) + 2.5rem)', paddingBottom: '6rem', minHeight: '100vh' }}>

            {/* Back */}
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/experience" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                    <ArrowLeft size={15} /> Back to Timeline
                </Link>
            </div>

            <div style={{ display: 'grid', gap: '1.75rem', maxWidth: '900px', margin: '0 auto' }}>

                {/* ── 1. HEADER ───────────────────────────────────────────── */}
                <header style={{ padding: '2.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#fff', padding: '6px', flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={exp.logo} alt={exp.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h1 style={{ color: '#fff', fontSize: '1.9rem', fontWeight: 800, margin: '0 0 0.3rem 0', lineHeight: 1.15 }}>{exp.role}</h1>
                        <a href={exp.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '1.05rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            {exp.company} <ExternalLink size={14} />
                        </a>
                        <p style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.4rem', letterSpacing: '0.04em' }}>{exp.period}</p>
                    </div>
                </header>

                {/* ── 2. OVERVIEW ─────────────────────────────────────────── */}
                <section style={{ padding: '2rem 2.5rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                        <BookOpen size={15} style={{ color: 'var(--accent-primary)' }} />
                        <h2 style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0, opacity: 0.45 }}>Overview</h2>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', lineHeight: 1.8, margin: 0 }}>{exp.deepDive.systemOverview}</p>
                </section>

                {/* ── 3. RESPONSIBILITIES ─────────────────────────────────── */}
                <section style={{ padding: '2rem 2.5rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.85rem', opacity: 0.45 }}>Responsibilities</h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.02rem', lineHeight: 1.8, margin: 0 }}>{exp.deepDive.responsibilities}</p>
                </section>

                {/* ── 4. CHALLENGES / SOLUTIONS ───────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div style={{ padding: '2rem', borderRadius: '14px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.14)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                            <Target size={15} style={{ color: '#f87171', flexShrink: 0 }} />
                            <h2 style={{ color: '#f87171', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Challenges</h2>
                        </div>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: 0, padding: 0, listStyle: 'none' }}>
                            {exp.deepDive.challenges.map((c, i) => (
                                <li key={i} style={{ display: 'flex', gap: '0.65rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.65, fontSize: '0.93rem' }}>
                                    <span style={{ color: '#f87171', flexShrink: 0, marginTop: '0.15rem' }}>—</span>
                                    <span>{c}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ padding: '2rem', borderRadius: '14px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.14)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                            <Lightbulb size={15} style={{ color: '#4ade80', flexShrink: 0 }} />
                            <h2 style={{ color: '#4ade80', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Solutions</h2>
                        </div>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: 0, padding: 0, listStyle: 'none' }}>
                            {exp.deepDive.solutions.map((s, i) => (
                                <li key={i} style={{ display: 'flex', gap: '0.65rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.65, fontSize: '0.93rem' }}>
                                    <span style={{ color: '#4ade80', flexShrink: 0, marginTop: '0.15rem' }}>—</span>
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ── 5. IMPACT ───────────────────────────────────────────── */}
                <section style={{ padding: '2rem 2.5rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                        <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
                        <h2 style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0, opacity: 0.45 }}>Impact</h2>
                    </div>
                    <ul style={{ display: 'grid', gap: '0.75rem', margin: 0, padding: 0, listStyle: 'none' }}>
                        {exp.deepDive.impact.map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, fontSize: '0.95rem', alignItems: 'flex-start' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', width: '22px', height: '22px', borderRadius: '50%', fontSize: '0.7rem', flexShrink: 0, marginTop: '0.15rem' }}>✓</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

            </div>
        </main>
    );
}
