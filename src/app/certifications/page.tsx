import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Award, BadgeCheck, ChevronDown } from 'lucide-react';
import { pageMetadata } from '@/utils/seo';
import SectionHead, { PART_NO } from '@/components/spec/SectionHead';
import { certifications, type Certification, type CourseCertificate } from '@/data/certifications';
import CertBadge from '@/components/spec/CertBadge';

export const metadata: Metadata = pageMetadata({
    title: 'Certifications | Trupal Patel',
    description: 'Verified certifications earned by Trupal Patel: AI Mastery (Cal Poly DXHub & AWS), Meta Front-End Developer, and courses from Google, Duke, Johns Hopkins and Coursera.',
    path: '/certifications',
});

function Verify({ c }: { c: Certification }) {
    if (!c.credentialUrl) return <span className="cx-noverify">No public record</span>;
    return <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="cx-verify"><BadgeCheck size={14} aria-hidden="true" /> Verify<ArrowUpRight size={13} aria-hidden="true" /></a>;
}

/** The certificate itself, opening full size in a new tab. */
function Shot({ src, title, className = '' }: { src: string; title: string; className?: string }) {
    return (
        <a href={src} target="_blank" rel="noreferrer" className={`cx-shot ${className}`} aria-label={`Open the ${title} certificate`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${title} certificate`} loading="lazy" decoding="async" />
        </a>
    );
}

/** Every course certificate inside a specialization, as small cards under it. */
function Courses({ list }: { list: CourseCertificate[] }) {
    return (
        <>
            <h3 className="sp-sub cx-courses__head">{list.length} course certificates in this program</h3>
            <ol className="cx-course-grid">
                {list.map((k, i) => (
                    <li key={k.title} className="cx-course" style={{ ['--d' as string]: `${i * 40}ms` }}>
                        {k.image && <Shot src={k.image} title={k.title} />}
                        <div className="cx-course__body">
                            <span className="cx-course__no">{String(i + 1).padStart(2, '0')}</span>
                            <b>{k.title}</b>
                            <span className="cx-date">{k.completed} · Grade {k.grade}</span>
                            <a href={k.url} target="_blank" rel="noreferrer" className="cx-verify"><BadgeCheck size={14} aria-hidden="true" /> Verify<ArrowUpRight size={13} aria-hidden="true" /></a>
                        </div>
                    </li>
                ))}
            </ol>
        </>
    );
}

export default function CertificationsPage() {
    const featured = certifications.filter((c) => c.featured);
    const rest = certifications.filter((c) => !c.featured);

    return (
        <div className="sp-page">
            <div className="sp-about cx">
                <Link href="/#revisions" className="cx-back"><ArrowLeft size={14} aria-hidden="true" /> Back to the datasheet</Link>

                <section className="sp-section">
                    <SectionHead no={1} title="Certifications" page="Credentials" />
                    <p className="sp-part" style={{ marginTop: 22 }}><b>{PART_NO}</b><span>Credentials</span><span>{certifications.length} on file</span></p>
                    <h1 className="sp-name">Certifications</h1>
                    <p className="sp-lede" style={{ marginTop: '0.8rem' }}>Everything I’ve been certified in. Each Verify link opens the issuer’s own record.</p>

                </section>

                {featured.length > 0 && (
                    <section className="sp-section">
                        <SectionHead no={2} title="Featured" page="Credentials" />
                        {featured.map((c) => (
                            <div key={c.title} className="cx-feature">
                            <article className={`cx-hero ${c.image ? 'cx-hero--shot' : ''}`}>
                                {c.image ? <Shot src={c.image} title={c.title} className="cx-shot--hero" /> : <div className="cx-hero__mark" aria-hidden="true"><Award size={34} /></div>}
                                <div className="cx-hero__body">
                                    <p className="cx-hero__issuer"><CertBadge issuer={c.issuer} platform={c.platform} />{c.issuer}{c.platform ? ` · ${c.platform}` : ''}</p>
                                    <h2>{c.title}</h2>
                                    {c.summary && <p className="cx-hero__summary">{c.summary}</p>}
                                    <ul className="cx-skills cx-skills--dark">{c.skills.map((s) => <li key={s}>{s}</li>)}</ul>
                                    <div className="cx-hero__foot">
                                        {c.issued && <span className="cx-date">Issued {c.issued}</span>}
                                        <Verify c={c} />
                                    </div>
                                </div>
                            </article>
                            {c.courses && c.courses.length > 0 && <Courses list={c.courses} />}
                            </div>
                        ))}
                    </section>
                )}

                <section className="sp-section">
                    <SectionHead no={featured.length ? 3 : 2} title="All credentials" page="Credentials" />
                    <div className="cx-grid">
                        {rest.map((c, i) => (
                            <article key={c.title} className="cx-card" style={{ ['--d' as string]: `${i * 40}ms` }}>
                                {c.image && <Shot src={c.image} title={c.title} />}
                                <header>
                                    <CertBadge issuer={c.issuer} platform={c.platform} />
                                    <div>
                                        <p className="cx-card__issuer">{c.issuer}{c.platform ? ` · ${c.platform}` : ''}</p>
                                        <h3>{c.title}</h3>
                                    </div>
                                </header>
                                {c.summary && <p className="cx-card__summary">{c.summary}</p>}
                                {c.skills.length > 0 && <ul className="cx-skills">{c.skills.slice(0, 6).map((s) => <li key={s}>{s}</li>)}</ul>}
                                {c.courses && c.courses.length > 0 && (
                                    <details className="cx-courses">
                                        <summary>{c.courses.length} course certificates <ChevronDown size={14} aria-hidden="true" /></summary>
                                        <ol>
                                            {c.courses.map((k) => (
                                                <li key={k.title}>
                                                    <a href={k.url} target="_blank" rel="noreferrer">{k.title}<ArrowUpRight size={12} aria-hidden="true" /></a>
                                                    <span>{k.completed} · {k.grade}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </details>
                                )}
                                <footer>
                                    <span className="cx-date">{c.issued ?? ''}{c.credentialId ? ` · ID ${c.credentialId}` : ''}</span>
                                    <Verify c={c} />
                                </footer>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
