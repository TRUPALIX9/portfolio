import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Play Games | Trupal Patel',
    description: 'Play some retro games built from scratch! An interactive portfolio experience by Trupal Patel.',
};

export default function GameOnlyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
