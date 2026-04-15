"use client";

import TrackedGameHub from '../../components/TrackedGameHub';

export default function ArcadeOnlyPage() {
    return (
        <main style={{ paddingTop: '2rem', minHeight: '100vh' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <p
                    style={{
                        color: 'var(--accent-primary)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.18em',
                        fontSize: '0.8rem',
                        marginBottom: '0.65rem',
                    }}
                >
                    Trupal&apos;s Arcade
                </p>
            </div>
            <TrackedGameHub standalone route="/arcade-only" source="direct-share-page" />
        </main>
    );
}
