import type { Metadata } from 'next';

// Private admin dashboard: never indexed (robots.txt also disallows it).
export const metadata: Metadata = {
    title: 'Playground | Trupal Patel',
    robots: { index: false, follow: false },
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
    return children;
}
