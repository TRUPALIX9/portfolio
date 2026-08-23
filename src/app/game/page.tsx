"use client";
import TrackedGameHub from '../../components/TrackedGameHub';

export default function GamePage() {
    return (
        <main className="section" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
            <div className="container">
                <TrackedGameHub route="/game" source="portfolio-arcade" />
            </div>
        </main>
    );
}
