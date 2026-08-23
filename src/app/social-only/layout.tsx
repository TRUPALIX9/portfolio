import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Connect with Trupal | Links & Socials',
    description: 'All the ways to connect with Trupal Patel. Find my GitHub, LinkedIn, and Resume here.',
    robots: { index: false, follow: false },
};

export default function SocialOnlyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
