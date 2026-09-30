import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { projects } from '@/data/projects';

// Link-preview card for one project case study, so shared links show the project, not the generic site card.
export const alt = 'Project case study by Trupal Patel';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
    return projects.map((project) => ({ slug: project.slug }));
}

async function loadIcon(src?: string) {
    if (!src) return null;
    try {
        const svg = await readFile(path.join(process.cwd(), 'public', src), 'utf8');
        return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    } catch {
        return null;
    }
}

export default async function ProjectOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = projects.find((p) => p.slug === slug);
    const icon = await loadIcon(project?.logoIcon);
    const tech = (project?.tech ?? []).slice(0, 4).map((t) => t.name);

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '72px 88px',
                    background: '#050505',
                    color: '#fafafa',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', fontSize: 26, letterSpacing: 5, textTransform: 'uppercase', color: '#4ADE80' }}>
                    Case study · trupalpatel.com
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {icon && <img src={icon} width={112} height={112} style={{ borderRadius: 26, marginRight: 36 }} alt="" />}
                        <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -2 }}>{project?.title ?? 'Project'}</div>
                    </div>
                    <div style={{ display: 'flex', fontSize: 36, lineHeight: 1.35, color: '#a1a1aa', marginTop: 32, maxWidth: 1000 }}>
                        {project?.tagline ?? ''}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex' }}>
                        {tech.map((name) => (
                            <div
                                key={name}
                                style={{
                                    display: 'flex',
                                    fontSize: 24,
                                    color: '#d4d4d8',
                                    border: '2px solid #27272a',
                                    borderRadius: 999,
                                    padding: '8px 22px',
                                    marginRight: 14,
                                }}
                            >
                                {name}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', fontSize: 26, color: '#71717a' }}>Trupal Patel</div>
                </div>
            </div>
        ),
        size,
    );
}
