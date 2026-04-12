"use client";
import GameHub from '../../components/GameHub';

export default function GamePage() {
    return (
        <main className="container section" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
            <GameHub />
        </main>
    );
}
