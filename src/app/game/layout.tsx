import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Arcade Playground | Trupal Patel',
    description: 'Play some retro games built from scratch! An interactive portfolio experience by Trupal Patel.',
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
