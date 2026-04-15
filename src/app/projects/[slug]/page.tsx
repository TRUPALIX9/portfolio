import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CircleDot, ExternalLink, Target, TrendingUp } from 'lucide-react';
import ProjectMediaShowcase from '../../../components/ProjectMediaShowcase';
import { projects } from '../../../data/projects';

function hasRealLink(url: string) {
    return Boolean(url) && url !== "#";
}

function milestoneTone(state: "done" | "in-progress" | "planned") {
    if (state === "done") {
        return {
            label: "Done",
            background: "rgba(74, 222, 128, 0.12)",
            color: "#86efac",
            border: "rgba(74, 222, 128, 0.28)",
        };
    }

    if (state === "in-progress") {
        return {
            label: "In Progress",
            background: "rgba(6, 182, 212, 0.12)",
            color: "#67e8f9",
            border: "rgba(6, 182, 212, 0.28)",
        };
    }

    return {
        label: "Planned",
        background: "rgba(250, 204, 21, 0.12)",
        color: "#fde68a",
        border: "rgba(250, 204, 21, 0.28)",
    };
}

export async function generateStaticParams() {
    return projects.map((project) => ({
        slug: project.slug,
    }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = projects.find((entry) => entry.slug === slug);

    if (!project) {
        notFound();
    }

    const showGithub = hasRealLink(project.links.github);
    const showLive = hasRealLink(project.links.live);

    return (
        <main
            className="container"
            style={{
                paddingTop: 'calc(var(--nav-height) + 4rem)',
                paddingBottom: '4rem',
                minHeight: '100vh',
            }}
        >
            <Link href="/projects" style={{ display: 'inline-block', marginBottom: '2rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                &larr; Back to Projects
            </Link>

            <div
                className="glass-card"
                style={{
                    padding: 'clamp(1.4rem, 3vw, 3rem)',
                    borderRadius: '28px',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                }}
            >
                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem',
                        alignItems: 'center',
                        marginBottom: '3rem',
                    }}
                >
                    <div>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.55rem',
                                padding: '0.45rem 0.9rem',
                                borderRadius: '999px',
                                border: `1px solid ${project.status === "In Progress" ? 'rgba(6, 182, 212, 0.3)' : 'rgba(74, 222, 128, 0.25)'}`,
                                background: project.status === "In Progress" ? 'rgba(6, 182, 212, 0.12)' : 'rgba(74, 222, 128, 0.12)',
                                color: project.status === "In Progress" ? '#67e8f9' : '#86efac',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                marginBottom: '1.2rem',
                            }}
                        >
                            <CircleDot size={14} />
                            {project.status}
                        </div>

                        <h1 className="heading-lg" style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{project.title}</h1>
                        <p style={{ fontSize: '1.2rem', lineHeight: 1.7, color: '#d4d4d8', maxWidth: '58ch', marginBottom: '1.25rem' }}>
                            {project.tagline}
                        </p>
                        <p className="text-body" style={{ maxWidth: '62ch', marginBottom: '1.75rem' }}>
                            {project.description}
                        </p>

                        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
                            {showGithub && (
                                <a href={project.links.github} target="_blank" rel="noreferrer" className="btn-outline" style={{ gap: '0.55rem' }}>
                                    GitHub Repository
                                </a>
                            )}
                            {showLive && (
                                <a href={project.links.live} target="_blank" rel="noreferrer" className="btn-primary" style={{ gap: '0.55rem' }}>
                                    Live Demo <ExternalLink size={16} />
                                </a>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                            {project.tech.map((entry) => (
                                <span
                                    key={entry.name}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(255,255,255,0.04)',
                                        borderRadius: '999px',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.95rem',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                >
                                    {entry.icon && <i className={entry.icon} style={{ fontSize: '1.15rem' }} />}
                                    {entry.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div
                        style={{
                            minHeight: '360px',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: '#050505',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
                        }}
                    >
                        <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </section>

                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '1.25rem',
                        marginBottom: '3rem',
                    }}
                >
                    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.8rem', color: 'var(--accent-secondary)' }}>
                            <Target size={18} />
                            <p style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 800 }}>Scenario</p>
                        </div>
                        <p className="text-body">{project.scenario}</p>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.8rem', color: 'var(--accent-primary)' }}>
                            <TrendingUp size={18} />
                            <p style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 800 }}>What It Solved</p>
                        </div>
                        <p className="text-body">{project.problemSolved}</p>
                    </div>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'end', marginBottom: '1.35rem' }}>
                        <div>
                            <p style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent-primary)', fontWeight: 800, marginBottom: '0.4rem' }}>
                                Media Demo
                            </p>
                            <h2 className="heading-md" style={{ color: '#fff' }}>How it works visually</h2>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '42ch', lineHeight: 1.7 }}>
                            Each project can now choose its own media layout and include as many screenshots or walkthrough clips as you want.
                        </p>
                    </div>

                    <ProjectMediaShowcase media={project.media} display={project.mediaDisplay} projectTitle={project.title} />
                </section>

                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.4rem',
                        marginBottom: '3rem',
                    }}
                >
                    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                        <p style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent-secondary)', fontWeight: 800, marginBottom: '0.5rem' }}>
                            How To Use
                        </p>
                        <h2 style={{ color: '#fff', fontSize: '1.45rem', marginBottom: '1rem' }}>Walkthrough</h2>
                        <div style={{ display: 'grid', gap: '0.95rem' }}>
                            {project.howToUse.map((step, index) => (
                                <div key={step} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.85rem', alignItems: 'start' }}>
                                    <div
                                        style={{
                                            width: '2rem',
                                            height: '2rem',
                                            borderRadius: '999px',
                                            display: 'grid',
                                            placeItems: 'center',
                                            background: 'rgba(6, 182, 212, 0.14)',
                                            color: '#67e8f9',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {index + 1}
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                        <p style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent-primary)', fontWeight: 800, marginBottom: '0.5rem' }}>
                            Outcomes
                        </p>
                        <h2 style={{ color: '#fff', fontSize: '1.45rem', marginBottom: '1rem' }}>Why it matters</h2>
                        <div style={{ display: 'grid', gap: '0.8rem' }}>
                            {project.outcomes.map((item) => (
                                <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                                    <ArrowRight size={18} style={{ color: 'var(--accent-primary)', marginTop: '0.2rem', flexShrink: 0 }} />
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '1.4rem',
                    }}
                >
                    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                        <p style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent-primary)', fontWeight: 800, marginBottom: '0.5rem' }}>
                            Progress
                        </p>
                        <h2 style={{ color: '#fff', fontSize: '1.45rem', marginBottom: '1rem' }}>Current build status</h2>
                        <div style={{ display: 'grid', gap: '0.95rem' }}>
                            {project.progress.map((entry) => {
                                const tone = milestoneTone(entry.state);

                                return (
                                    <div
                                        key={entry.title}
                                        style={{
                                            padding: '1rem 1rem 1.05rem',
                                            borderRadius: '16px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '0.55rem' }}>
                                            <h3 style={{ color: '#fff', fontSize: '1rem' }}>{entry.title}</h3>
                                            <span
                                                style={{
                                                    padding: '0.35rem 0.7rem',
                                                    borderRadius: '999px',
                                                    background: tone.background,
                                                    border: `1px solid ${tone.border}`,
                                                    color: tone.color,
                                                    fontSize: '0.76rem',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.08em',
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                {tone.label}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>{entry.detail}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                        <p style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent-secondary)', fontWeight: 800, marginBottom: '0.5rem' }}>
                            Future Goals
                        </p>
                        <h2 style={{ color: '#fff', fontSize: '1.45rem', marginBottom: '1rem' }}>What comes next</h2>
                        <div style={{ display: 'grid', gap: '0.9rem' }}>
                            {project.futureGoals.map((goal) => (
                                <div
                                    key={goal}
                                    style={{
                                        padding: '0.95rem 1rem',
                                        borderRadius: '16px',
                                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.09), rgba(74, 222, 128, 0.06))',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <p style={{ color: '#e4e4e7', lineHeight: 1.7 }}>{goal}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
