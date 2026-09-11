import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { APP } from '@/data/logicsprint';
import { LOGICSPRINT_URL } from '@/data/site';
import PolicyMarkdown from '@/components/logicsprint/PolicyMarkdown';

// Google Play links here: keep this URL stable. Rendered once at build time from a
// verbatim copy of assets/brand/docs/privacy_policy.md in the logic-sprint repo.
export const dynamic = 'force-static';

export const metadata: Metadata = {
    title: `Privacy Policy · ${APP.title}`,
    description: `How ${APP.title} handles information.`,
    alternates: { canonical: `${LOGICSPRINT_URL}/privacy` },
    openGraph: {
        title: `Privacy Policy · ${APP.title}`,
        description: `How ${APP.title} handles information.`,
        url: `${LOGICSPRINT_URL}/privacy`,
        siteName: APP.title,
        type: 'website',
    },
};

export default function LogicSprintPrivacyPage() {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/content/logicsprint/privacy_policy.md'), 'utf8');

    return (
        <main className="ls-container" style={{ paddingBlock: 'clamp(2.5rem, 7vw, 4.5rem) 5rem' }}>
            <Link href="/logicsprint" className="ls-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', minHeight: 44 }}>
                <ArrowLeft size={16} aria-hidden="true" />
                {APP.name}
            </Link>
            <PolicyMarkdown source={source} />
        </main>
    );
}
