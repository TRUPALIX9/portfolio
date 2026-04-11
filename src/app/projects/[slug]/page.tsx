import { projects } from '../../../data/projects';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

export async function generateStaticParams() {
    return projects.map((project) => ({
        slug: project.slug,
    }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = projects.find((p) => p.slug === slug);

    if (!project) {
        notFound();
    }

    return (
        <main className="container" style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '4rem', minHeight: '100vh' }}>
            <Link href="/projects" style={{ display: 'inline-block', marginBottom: '2rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                &larr; Back to Projects
            </Link>

            <div className="glass-card" style={{ padding: '3rem', borderRadius: '24px' }}>
                <h1 className="heading-lg" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{project.title}</h1>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                    <a href={project.links.github} target="_blank" rel="noreferrer" className="btn-outline">
                        GitHub Repository
                    </a>
                    <a href={project.links.live} target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Live Demo <ExternalLink size={16} />
                    </a>
                </div>

                <div style={{ width: '100%', height: '400px', overflow: 'hidden', borderRadius: '16px', marginBottom: '3rem' }}>
                    <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ marginBottom: '3rem' }}>
                    <h2 className="heading-md" style={{ marginBottom: '1rem' }}>Overview</h2>
                    <p className="text-body" style={{ fontSize: '1.25rem', lineHeight: 1.8 }}>
                        {project.description}
                    </p>
                </div>

                <div>
                    <h2 className="heading-md" style={{ marginBottom: '1.5rem' }}>Technologies Used</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {project.tech.map(t => (
                            <span key={t.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500 }}>
                                {t.icon && <i className={t.icon} style={{ fontSize: '1.5rem' }} />}
                                {t.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
