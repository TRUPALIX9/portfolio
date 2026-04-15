"use client";

import { useState } from 'react';
import type { ProjectMediaDisplay, ProjectMediaItem } from '../data/projects';

type ProjectMediaShowcaseProps = {
    media: ProjectMediaItem[];
    display: ProjectMediaDisplay;
    projectTitle: string;
};

function MediaFrame({ item, priority = false }: { item: ProjectMediaItem; priority?: boolean }) {
    return (
        <div style={{ width: '100%', height: '100%', background: '#030712' }}>
            {item.type === "video" ? (
                <video
                    controls
                    preload={priority ? "auto" : "metadata"}
                    poster={item.poster}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                >
                    <source src={item.src} />
                </video>
            ) : (
                <img
                    src={item.src}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            )}
        </div>
    );
}

export default function ProjectMediaShowcase({ media, display, projectTitle }: ProjectMediaShowcaseProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeItem = media[activeIndex] ?? media[0];

    if (!media.length) {
        return null;
    }

    if (display === "grid") {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
                {media.map((item) => (
                    <article
                        key={`${projectTitle}-${item.title}`}
                        className="glass-card"
                        style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}
                    >
                        <div style={{ aspectRatio: '16 / 10' }}>
                            <MediaFrame item={item} />
                        </div>
                        <div style={{ padding: '1.15rem 1.15rem 1.3rem' }}>
                            <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.05rem' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.caption}</p>
                        </div>
                    </article>
                ))}
            </div>
        );
    }

    if (display === "storyboard") {
        return (
            <div style={{ display: 'grid', gap: '1rem' }}>
                {media.map((item, index) => (
                    <article
                        key={`${projectTitle}-${item.title}`}
                        className="glass-card"
                        style={{
                            overflow: 'hidden',
                            background: 'rgba(255,255,255,0.03)',
                            display: 'grid',
                            gap: '0',
                        }}
                        data-project-storyboard-card="true"
                    >
                        <div style={{ minHeight: '280px' }}>
                            <MediaFrame item={item} priority={index === 0} />
                        </div>
                        <div
                            style={{
                                padding: '1.35rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                            }}
                        >
                            <p style={{ color: 'var(--accent-primary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 800, marginBottom: '0.65rem' }}>
                                Step {index + 1}
                            </p>
                            <h3 style={{ color: '#fff', marginBottom: '0.65rem', fontSize: '1.15rem' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>{item.caption}</p>
                        </div>
                    </article>
                ))}
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <article
                className="glass-card"
                style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}
            >
                <div style={{ aspectRatio: '16 / 9', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <MediaFrame item={activeItem} priority />
                </div>
                <div style={{ padding: '1.2rem 1.2rem 1.35rem' }}>
                    <h3 style={{ color: '#fff', marginBottom: '0.55rem', fontSize: '1.1rem' }}>{activeItem.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>{activeItem.caption}</p>
                </div>
            </article>

            {media.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.9rem' }}>
                    {media.map((item, index) => (
                        <button
                            key={`${projectTitle}-thumb-${item.title}`}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className="glass-card"
                            style={{
                                overflow: 'hidden',
                                textAlign: 'left',
                                background: index === activeIndex ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                                border: index === activeIndex ? '1px solid rgba(6, 182, 212, 0.28)' : '1px solid rgba(255,255,255,0.05)',
                            }}
                        >
                            <div style={{ aspectRatio: '16 / 10' }}>
                                <MediaFrame item={item} />
                            </div>
                            <div style={{ padding: '0.9rem' }}>
                                <p style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.3rem' }}>{item.title}</p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55 }}>
                                    {item.type === "video" ? 'Video demo' : 'Image demo'}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
