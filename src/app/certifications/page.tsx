import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Award, BadgeCheck, ChevronDown } from 'lucide-react';
import { pageMetadata } from '@/utils/seo';
import SectionHead, { PART_NO } from '@/components/spec/SectionHead';
import { certifications, type Certification } from '@/data/certifications';

export const metadata: Metadata = pageMetadata({
    title: 'Certifications | Trupal Patel',
    description: 'Verified certifications earned by Trupal Patel: AI Mastery (Cal Poly DXHub & AWS), Meta Front-End Developer, and courses from Google, Duke, Johns Hopkins and Coursera.',
    path: '/certifications',
});

/** A two-letter badge per issuer, coloured so the grid reads at a glance. */
const ISSUER_TINT: Record<string, string> = {
    Meta: '#0866ff',
    Google: '#34a853',
    Coursera: '#0056d2',
    'Duke University': '#00539b',
    'Johns Hopkins University': '#002d72',
    'Great Learning': '#e2622b',
    'Cal Poly Digital Transformation Hub': '#154734',
};
const initials = (s: string) => s.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('') || s.slice(0, 2);

function Badge({ issuer }: { issuer: string }) {
    return <span className="cx-badge" style={{ background: ISSUER_TINT[issuer] ?? 'var(--sp-ink)' }} aria-hidden="true">{initials(issuer)}</span>;
}

function Verify({ c }: { c: Certification }) {
    if (!c.credentialUrl) return <span className="cx-noverify">No public record</span>;
    return <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="cx-verify"><BadgeCheck size={14} aria-hidden="true" /> Verify<ArrowUpRight size={13} aria-hidden="true" /></a>;
}

export default function CertificationsPage() {
    const featured = certifications.filter((c) => c.featured);
    const rest = certifications.filter((c) => !c.featured);
    const issuers = new Set(certifications.map((c) => c.issuer)).size;
    const courses = certifications.reduce((n, c) => n + (c.courses?.length ?? 0), 0);
    const verified = certifications.filter((c) => c.credentialUrl).length;

    return (
        <div className="sp-page">
            <div className="sp-about cx">
                <Link href="/#revisions" className="cx-back"><ArrowLeft size={14} aria-hidden="true" /> Back to the datasheet</Link>

                <section className="sp-section">
                    <SectionHead no={1} title="Certifications" page="Credentials" />
                    <p className="sp-part" style={{ marginTop: 22 }}><b>{PART_NO}</b><span>Credentials</span><span>{certifications.length} on file</span></p>
                    <h1 className="sp-name">Certifications</h1>
                    <p className="sp-lede" style={{ marginTop: '0.8rem' }}>Everything I’ve been certified in. Each Verify link opens the issuer’s own record.</p>

                    <dl className="sp-ratings cx-ratings">
                        <div><dt>Credentials</dt><dd>{certifications.length}</dd></div>
                        <div><dt>Issuers</dt><dd>{issuers}</dd></div>
                        <div><dt>Course certificates</dt><dd>{courses}</dd></div>
                        <div><dt>Verifiable</dt><dd>{verified}</dd></div>
                    </dl>
                </section>

                {featured.length > 0 && (
                    <section className="sp-section">
                        <SectionHead no={2} title="Featured" page="Credentials" />
                        {featured.map((c) => (
                            <article key={c.title} className="cx-hero">
                                <div className="cx-hero__mark" aria-hidden="true"><Award size={34} /></div>
                                <div className="cx-hero__body">
                                    <p className="cx-hero__issuer">{c.issuer}{c.platform ? ` · ${c.platform}` : ''}</p>
                                    <h2>{c.title}</h2>
                                    {c.summary && <p className="cx-hero__summary">{c.summary}</p>}
                                    <ul className="cx-skills cx-skills--dark">{c.skills.map((s) => <li key={s}>{s}</li>)}</ul>
                                    <div className="cx-hero__foot">
                                        {c.issued && <span className="cx-date">Issued {c.issued}</span>}
                                        <Verify c={c} />
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}

                <section className="sp-section">
                    <SectionHead no={featured.length ? 3 : 2} title="All credentials" page="Credentials" />
                    <div className="cx-grid">
                        {rest.map((c, i) => (
                            <article key={c.title} className="cx-card" style={{ ['--d' as string]: `${i * 40}ms` }}>
                                <header>
                                    <Badge issuer={c.issuer} />
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
