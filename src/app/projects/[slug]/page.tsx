import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, CircleDashed, Clock, ExternalLink, Lightbulb, Target, Workflow, Zap } from 'lucide-react';
import { projects } from '@/data/projects';
import MermaidChart from '@/components/MermaidChart';

const GithubIcon = ({ size = 18 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.18-.35 6.5-1.56 6.5-7.16 0-1.49-.5-2.7-1.35-3.68.14-.33.6-1.74-.15-3.63 0 0-1.12-.36-3.7 1.38a12.8 12.8 0 0 0-6.7 0c-2.58-1.74-3.7-1.38-3.7-1.38-.75 1.89-.29 3.3-.15 3.63-.85.98-1.35 2.19-1.35 3.68 0 5.6 3.32 6.81 6.5 7.16A4.8 4.8 0 0 0 3 18.28V22" />
    </svg>
);

const stateStyle: Record<string, { icon: React.ReactNode; badge: string; color: string }> = {
    done:        { icon: <CheckCircle2 size={18} style={{ color: '#4ade80', flexShrink: 0 }} />, badge: 'Shipped',      color: '#4ade80' },
    'in-progress': { icon: <Clock size={18}        style={{ color: '#38bdf8', flexShrink: 0 }} />, badge: 'In Progress',  color: '#38bdf8' },
    planned:     { icon: <CircleDashed size={18}   style={{ color: '#94a3b8', flexShrink: 0 }} />, badge: 'Planned',      color: '#94a3b8' },
};

export function generateStaticParams() {
    return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = projects.find(p => p.slug === slug);

    if (!project) {
        notFound();
    }

    return (
        <main className="container" style={{ paddingTop: 'calc(var(--nav-height) + 2.5rem)', paddingBottom: '6rem', minHeight: '100vh' }}>

            {/* Back Button */}
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/projects" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                    <ArrowLeft size={15} /> Back to Projects
                </Link>
            </div>

            <div style={{ display: 'grid', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>

                {/* ── 1. HERO HEADER ─────────────────────────────────────── */}
                <header style={{ padding: '2.5rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {/* Logo + Title row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', marginBottom: '0.85rem' }}>
                        {project.logoIcon && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={project.logoIcon}
                                alt={`${project.title} logo`}
                                style={{ height: '44px', width: 'auto', objectFit: 'contain', borderRadius: '10px', flexShrink: 0 }}
                            />
                        )}
                        <h1 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 800, margin: 0, lineHeight: 1.15 }}>{project.title}</h1>
                    </div>

                    {/* Tagline */}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '700px', margin: '0 0 1.75rem 0' }}>
                        {project.tagline}
                    </p>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                        {project.links?.live && project.links.live !== '#' && (
                            <a href={project.links.live} target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                                View Live <ExternalLink size={15} />
                            </a>
                        )}
                        {project.links?.github && project.links.github !== '#' && (
                            <a href={project.links.github} target="_blank" rel="noreferrer" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                                Source Code <GithubIcon size={15} />
                            </a>
                        )}
                    </div>
                </header>

                {/* ── 2. SUMMARY ─────────────────────────────────────────── */}
                <section style={{ padding: '2rem 2.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.85rem', opacity: 0.45 }}>Overview</h2>
                    <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.08rem', lineHeight: 1.8, margin: 0 }}>{project.description}</p>
                </section>

                {/* ── 3. PROBLEM / SOLUTION (two-column) ─────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {/* Problem */}
                    <div style={{ padding: '2rem', borderRadius: '20px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.14)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                            <Target size={17} style={{ color: '#f87171', flexShrink: 0 }} />
                            <h2 style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>The Problem</h2>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: 0 }}>{project.scenario}</p>
                    </div>

                    {/* Solution */}
                    <div style={{ padding: '2rem', borderRadius: '20px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.14)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                            <Lightbulb size={17} style={{ color: '#4ade80', flexShrink: 0 }} />
                            <h2 style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>The Solution</h2>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: 0 }}>{project.problemSolved}</p>
                    </div>
                </div>

                {/* ── 4. TECH STACK ───────────────────────────────────────── */}
                <section style={{ padding: '2rem 2.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                        <Zap size={17} style={{ color: 'var(--accent-primary)' }} />
                        <h2 style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>Tech Stack</h2>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                        {project.tech.map(t => (
                            <div
                                key={t.name}
                                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.04] transition-all duration-200 hover:bg-white/[0.08] hover:border-white/15 cursor-default"
                            >
                                {t.icon && <i className={t.icon} style={{ fontSize: '1.15rem' }}></i>}
                                <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{t.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 5. ARCHITECTURE DIAGRAM ─────────────────────────────── */}
                {(project.architectureImage || project.mermaidChart) && (
                    <section style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Workflow size={17} style={{ color: 'var(--accent-primary)' }} />
                            <h2 style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>Architecture Diagram</h2>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            {project.architectureImage ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={project.architectureImage}
                                    alt={`${project.title} Architecture Diagram`}
                                    style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '10px' }}
                                />
                            ) : (
                                project.mermaidChart && <MermaidChart chart={project.mermaidChart} />
                            )}
                        </div>
                    </section>
                )}

                {/* ── 6. KEY MODULE HIGHLIGHTS ────────────────────────────── */}
                {project.progress && project.progress.length > 0 && (
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                            <h2 style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0, opacity: 0.5 }}>Key Module Highlights</h2>
                        </div>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {project.progress.map((m, i) => {
                                const s = stateStyle[m.state] ?? stateStyle.planned;
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '1.25rem 1.5rem',
                                            borderRadius: '16px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.055)',
                                            display: 'grid',
                                            gridTemplateColumns: '18px 1fr auto',
                                            alignItems: 'start',
                                            gap: '0.85rem',
                                        }}
                                    >
                                        {s.icon}
                                        <div>
                                            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.97rem', marginBottom: '0.3rem' }}>{m.title}</h4>
                                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontSize: '0.9rem' }}>{m.detail}</p>
                                        </div>
                                        <span style={{
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            letterSpacing: '0.06em',
                                            textTransform: 'uppercase',
                                            color: s.color,
                                            background: `${s.color}18`,
                                            border: `1px solid ${s.color}30`,
                                            borderRadius: '999px',
                                            padding: '0.2rem 0.65rem',
                                            whiteSpace: 'nowrap',
                                            alignSelf: 'center',
                                        }}>
                                            {s.badge}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

            </div>
        </main>
    );
}
