"use client";
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { socialLinks } from '@/data/site-config';

export default function SocialPage() {
    return (
        <main className="container" style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '4rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 className="heading-lg" style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Let's <span style={{ color: 'var(--accent-primary)' }}>Connect.</span></h1>
            <p className="text-body" style={{ marginBottom: '4rem', textAlign: 'center', maxWidth: '500px', fontSize: '1.2rem' }}>
                Find me across the web or reach out directly. I'm always open to new connections and exciting opportunities!
            </p>

            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {socialLinks.map((social) => (
                    <a
                        key={social.name}
                        href={social.url}
                        target={social.external === false ? undefined : "_blank"}
                        rel={social.external === false ? undefined : "noreferrer"}
                        className="glass-card social-card"
                        style={{
                            '--social-color': social.color,
                            padding: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            color: 'var(--text-primary)',
                            textDecoration: 'none',
                            borderRadius: '16px',
                            transition: 'all 0.3s ease',
                            border: `1px solid rgba(255,255,255,0.05)`,
                            position: 'relative',
                            overflow: 'hidden'
                        } as CSSProperties}
                    >
                        <span style={{ color: social.color, display: 'flex' }}>{social.icon}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 500 }}>{social.name}</span>
                    </a>
                ))}
            </div>

            <div style={{ marginTop: '4rem' }}>
                <Link href="/" className="btn-outline">
                    &larr; Back Home
                </Link>
            </div>
        </main>
    );
}
