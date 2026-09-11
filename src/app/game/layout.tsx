import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Can You Remember?',
    description: 'A memory tile game built from scratch. Watch the pattern, tap it back, and climb the global rankings. An interactive portfolio experience by Trupal Patel.',
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
