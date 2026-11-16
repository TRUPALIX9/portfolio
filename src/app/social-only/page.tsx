import type { Metadata } from 'next';
import SocialFlow from '@/components/social/SocialFlow';

export const metadata: Metadata = {
    title: 'Trupal Patel · Links',
    description: 'Every way to reach Trupal Patel, on one page.',
    alternates: { canonical: '/social' },
};

/** Link-in-bio version of /social, without the site bar. */
export default function SocialOnlyPage() {
    return <SocialFlow standalone />;
}
