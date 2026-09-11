import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import CertificationsSection from '@/components/CertificationsSection';
import Reveal from '@/components/motion/Reveal';
import { certifications } from '@/data/certifications';

export const metadata: Metadata = {
    title: 'Certifications | Trupal Patel',
    description: 'Verified certifications earned by Trupal Patel — AI Mastery (Cal Poly DXHub & AWS), Meta Front-End Developer, and courses from Google, Duke, Johns Hopkins, and Coursera.',
};

export default function CertificationsPage() {
    const issuers = new Set(certifications.map((c) => c.issuer)).size;

    return (
        <main className="container" style={{ paddingTop: 'calc(var(--nav-height) + 2.5rem)', paddingBottom: '6rem', minHeight: '100vh' }}>
            <div className="mx-auto w-full max-w-[1280px]">
                <div className="mb-8">
                    <Link href="/#certifications" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                        <ArrowLeft size={15} aria-hidden="true" /> Back to Home
                    </Link>
                </div>

                <Reveal>
                    <header className="mb-12">
                        <p className="eyebrow mb-3">Credentials</p>
                        <h1 className="heading-lg m-0 text-ink-1">
                            Certifications<span className="gradient-text">.</span>
                        </h1>
                        <p className="measure mt-4 text-lg leading-[1.7] text-ink-2">
                            {/* explicit {' '}: the compiler was dropping this space ("7issuers") */}
                            {certifications.length} credentials from {issuers}{' '}issuers. Every one with a Verify link opens the issuer&apos;s own record.
                        </p>
                    </header>
                </Reveal>

                <CertificationsSection variant="full" />
            </div>
        </main>
    );
}
