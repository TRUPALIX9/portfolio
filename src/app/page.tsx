import type { Metadata } from 'next';
import SpecPage from '@/components/spec/SpecPage';
import { SITE_URL } from '@/data/site';
import { STUDIO, STUDIO_TREE } from '@/data/studio';
import { CURRENT_JOB } from '@/data/career';

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
        jobTitle: CURRENT_JOB.role,
        worksFor: {
            '@type': 'Organization',
            name: CURRENT_JOB.employer,
            url: CURRENT_JOB.url,
            parentOrganization: { '@type': 'Organization', name: CURRENT_JOB.parent },
        },
        memberOf: { '@type': 'Organization', name: STUDIO.name, url: STUDIO.url },
        url: SITE_URL,
        email: 'mailto:trupal.work@gmail.com',
        sameAs: ['https://github.com/TRUPALIX9', 'https://www.linkedin.com/in/trupalix', STUDIO.url],
    },
    {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: STUDIO.name,
        url: STUDIO.url,
        email: STUDIO.email,
        slogan: STUDIO.motto.join(' '),
        owns: STUDIO_TREE.filter((n) => n.group === 'products').map((n) => ({
            '@type': 'SoftwareApplication',
            name: n.name,
            url: n.links[0]?.href,
        })),
    },
];

export default function Home() {
    return (
        <>
            {/* Static constants only; "<" escaped so the JSON can never close the script tag. */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
            <SpecPage />
        </>
    );
}
