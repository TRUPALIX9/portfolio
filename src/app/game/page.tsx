"use client";
import TrackedGameHub from '../../components/TrackedGameHub';

export default function GamePage() {
    return (
        <main className="container section" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
            <TrackedGameHub route="/game" source="portfolio-arcade" />
        </main>
    );
}
