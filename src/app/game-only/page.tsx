"use client";
import TrackedGameHub from '../../components/TrackedGameHub';

export default function GameOnlyPage() {
    return (
        <main className="section" style={{ paddingTop: '2rem' }}>
            <div className="container">
                <TrackedGameHub route="/game-only" source="portfolio-arcade-only" standalone />
            </div>
        </main>
    );
}
