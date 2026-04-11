import master from '../../../data/master.json';
import Link from 'next/link';

export function generateStaticParams() {
    return master.experiences.map((exp) => ({ slug: exp.slug }));
}

export default function ExperienceDetail({ params }: { params: { slug: string } }) {
    const exp = master.experiences.find(e => e.slug === params.slug);

    if (!exp) {
        return (
            <main className="container section" style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', minHeight: '100vh' }}>
                <h1 className="heading-lg">Experience not found</h1>
                <Link href="/experience" className="btn-outline">Back to Experience</Link>
            </main>
        );
    }

    return (
        <main className="container section" style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '4rem', minHeight: '100vh' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/experience" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                    &larr; Back to Timeline
                </Link>
            </div>

            <div className="glass-card" style={{ padding: '3rem', borderRadius: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', padding: '6px', background: '#fff' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={exp.logo} alt={exp.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                        <h1 className="heading-md" style={{ marginBottom: '0.25rem', fontSize: '2rem' }}>{exp.role}</h1>
                        <a href={exp.url} target="_blank" rel="noreferrer" style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>@ {exp.company}</a>
                        <p style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '0.5rem' }}>{exp.period}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 600 }}>System Overview</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>{exp.deepDive.systemOverview}</p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 600 }}>Responsibilities & Contributions</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>{exp.deepDive.responsibilities}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                            <h2 style={{ fontSize: '1.2rem', color: '#ef4444', marginBottom: '1.5rem', fontWeight: 600 }}>Key Engineering Challenges</h2>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {exp.deepDive.challenges.map((c, i) => (
                                    <li key={i} style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                                        <span style={{ color: '#ef4444', marginTop: '0.2rem', fontSize: '1.2rem' }}>⨯</span>
                                        <span>{c}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                            <h2 style={{ fontSize: '1.2rem', color: '#10b981', marginBottom: '1.5rem', fontWeight: 600 }}>Solutions & Innovations</h2>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {exp.deepDive.solutions.map((s, i) => (
                                    <li key={i} style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                                        <span style={{ color: '#10b981', marginTop: '0.2rem', fontSize: '1.2rem' }}>✓</span>
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1.5rem', fontWeight: 600 }}>Impact</h2>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {exp.deepDive.impact.map((impact, i) => (
                                <li key={i} style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.05rem', alignItems: 'center' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(74, 222, 128, 0.1)', color: 'var(--accent-primary)', width: '24px', height: '24px', borderRadius: '50%', fontSize: '0.85rem', flexShrink: 0 }}>✨</span>
                                    <span>{impact}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
