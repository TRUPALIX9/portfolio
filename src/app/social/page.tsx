import type { Metadata } from 'next';
import SocialFlow from '@/components/social/SocialFlow';

export const metadata: Metadata = {
    title: 'Social · Trupal Patel',
    description: 'Every way to reach Trupal Patel: LinkedIn, GitHub, email, WhatsApp, Instagram, Snapchat, BeReal and Discord.',
    alternates: { canonical: '/social' },
};

export default function SocialPage() {
    return <SocialFlow />;
}
