"use client";

import Link from 'next/link';
import { ArrowRight, Award, BadgeCheck, ExternalLink } from 'lucide-react';
import { certifications, type Certification } from '@/data/certifications';
import CourseCarousel from './CourseCarousel';

const PREVIEW_COUNT = 4;

function VerifyLink({ cert, compact = false }: { cert: Certification; compact?: boolean }) {
    if (!cert.credentialUrl) return null;
    return (
        <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Verify ${cert.title} credential`}
            className={`inline-flex items-center gap-1.5 shrink-0 rounded-full border border-accent/25 bg-accent/5 text-accent text-xs font-semibold transition-colors duration-150 hover:bg-accent/10 hover:border-accent/50 ${compact ? 'px-2.5 py-1' : 'px-3.5 py-1.5'}`}
        >
            Verify <ExternalLink size={compact ? 11 : 12} aria-hidden="true" />
        </a>
    );
}

function Meta({ cert }: { cert: Certification }) {
    return (
        <p className="text-[0.85rem] text-ink-2 m-0 mt-1">
            {cert.issuer}
            {cert.platform && <span className="text-ink-3"> · {cert.platform}</span>}
            {cert.issued && <span className="text-ink-3 font-mono"> · {cert.issued}</span>}
        </p>
    );
}

function FeaturedCard({ cert }: { cert: Certification }) {
    return (
        // Card level (surface-2) with a faint accent wash so featured credentials read one step "warmer".
        <article className="relative flex min-w-0 flex-col gap-4 p-6 rounded-2xl border border-accent/20 bg-surface-2 bg-gradient-to-br from-accent/[0.06] to-transparent shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <BadgeCheck size={16} className="text-accent shrink-0" aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Featured</span>
                    </div>
                    <h4 className="text-[1.1rem] font-bold text-ink-1 m-0 leading-snug">{cert.title}</h4>
                    <Meta cert={cert} />
                </div>
                <VerifyLink cert={cert} />
            </div>
            {cert.summary && (
                <p className="text-[0.95rem] text-ink-2 leading-[1.7] m-0 max-w-[68ch]">{cert.summary}</p>
            )}
            <ul className="flex flex-wrap gap-1.5" aria-label="Skills">
                {cert.skills.map((skill) => (
                    <li key={skill} className="px-2.5 py-1 text-xs font-medium rounded-full bg-surface-3 border border-line-1 text-ink-2">
                        {skill}
                    </li>
                ))}
            </ul>
            {cert.courses && cert.courses.length > 0 && (
                <CourseCarousel courses={cert.courses} label={`${cert.title} course certificates`} />
            )}
            {cert.credentialId && (
                <p className="text-xs font-mono text-ink-3 m-0 mt-auto">Credential ID {cert.credentialId}</p>
            )}
        </article>
    );
}

/**
 * `preview` (home page): featured credentials plus a few others and a link to the full page.
 * `full` (/certifications): every credential.
 */
export default function CertificationsSection({ variant = 'preview' }: { variant?: 'preview' | 'full' }) {
    const featured = certifications.filter((c) => c.featured);
    const others = certifications.filter((c) => !c.featured);
    const listed = variant === 'full' ? others : others.slice(0, PREVIEW_COUNT);
    const isPreview = variant === 'preview';

    return (
        <div id={isPreview ? 'certifications' : undefined} className="rounded-3xl border border-line-1 bg-surface-1 p-6 sm:p-8 lg:p-10 shadow-[var(--shadow-card)]">
            {isPreview && (
                <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                    <div className="flex items-center gap-3">
                        <Award className="text-accent" size={28} aria-hidden="true" />
                        <h3 className="text-2xl font-bold text-ink-1 uppercase tracking-wider m-0">Certifications</h3>
                    </div>
                    <span className="text-xs font-semibold text-ink-3 uppercase tracking-widest">
                        {certifications.length} credentials
                    </span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-5 mb-6">
                {featured.map((cert) => <FeaturedCard key={cert.title} cert={cert} />)}
            </div>

            {!isPreview && (
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-2 mb-4 mt-10">
                    All credentials
                </h3>
            )}

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {listed.map((cert) => (
                    <li
                        key={cert.title}
                        className="card card-interactive spotlight flex items-center justify-between gap-4 px-5 py-4 rounded-xl"
                    >
                        <div className="min-w-0">
                            <h4 className="text-[0.95rem] font-semibold text-ink-1 m-0 leading-snug">{cert.title}</h4>
                            <Meta cert={cert} />
                            {!isPreview && cert.skills.length > 0 && (
                                <p className="text-xs text-ink-3 m-0 mt-1.5">{cert.skills.join(' · ')}</p>
                            )}
                        </div>
                        <VerifyLink cert={cert} compact />
                    </li>
                ))}
            </ul>

            {isPreview && others.length > PREVIEW_COUNT && (
                <div className="flex justify-center mt-7">
                    <Link
                        href="/certifications"
                        className="btn-outline inline-flex items-center gap-2"
                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem' }}
                    >
                        View all {certifications.length} certifications
                        <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                </div>
            )}
        </div>
    );
}
