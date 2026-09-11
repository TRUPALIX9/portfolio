import type { Metadata } from 'next';
import SinglePageLayout from '../components/SinglePageLayout';
import { SITE_URL } from '@/data/site';

export const metadata: Metadata = {
    alternates: { canonical: '/' },
};

// Who this site is about, for search engines (knowledge panel, sitelinks).
const jsonLd = [
    {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Trupal Patel',
        alternateName: 'True Pal',
        url: SITE_URL,
    },
    {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Trupal Patel',
        alternateName: ['True Pal', 'TrupalIX9'],
        jobTitle: 'Software Engineer',
        url: SITE_URL,
        email: 'mailto:trupal.work@gmail.com',
        sameAs: ['https://github.com/TRUPALIX9', 'https://www.linkedin.com/in/trupalix'],
    },
];

export default function Home() {
    return (
        <main>
            {/* Static constants only; "<" escaped so the JSON can never close the script tag. */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
            <SinglePageLayout />
        </main>
    );
}
