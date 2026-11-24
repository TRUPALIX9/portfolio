import Link from 'next/link';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import { certifications } from '@/data/certifications';
import CertBadge from './CertBadge';

/** Featured credentials first, then the most recent, as certificate cards; the rest behind a button. */
const SHOWN = 3;
const picks = [...certifications.filter((c) => c.featured), ...certifications.filter((c) => !c.featured)].slice(0, SHOWN);

export default function CertificationsPreview() {
    const rest = certifications.length - picks.length;
    return (
        <>
            <div className="cx-preview">
                {picks.map((c, i) => (
                    <article key={c.title} className="cx-pcard" style={{ ['--d' as string]: `${i * 60}ms` }}>
                        <Link href="/certifications" className="cx-pcard__shot" aria-label={`See the ${c.title} certificate`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {c.image && <img src={c.image} alt="" loading="lazy" decoding="async" />}
                        </Link>
                        <div className="cx-pcard__body">
                            <header>
                                <CertBadge issuer={c.issuer} platform={c.platform} />
                                <div>
                                    <p className="cx-card__issuer">{c.issuer}</p>
                                    <h4>{c.title}</h4>
                                </div>
                            </header>
                            <footer>
                                <span className="cx-date">{c.issued ?? ''}{c.courses ? ` · ${c.courses.length} courses` : ''}</span>
                                {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="cx-verify"><BadgeCheck size={14} aria-hidden="true" /> Verify</a>}
                            </footer>
                        </div>
                    </article>
                ))}
            </div>
            {rest > 0 && (
                <p className="cx-more">
                    {/* A small certificate on a stack of others: the seal carries the count */}
                    <Link href="/certifications" className="cx-more__cert" aria-label={`See all ${certifications.length} certificates`}>
                        <span className="cx-more__seal" aria-hidden="true"><b>+{rest}</b></span>
                        <span className="cx-more__text">
                            <small>Certificate of more</small>
                            <span>{rest} more certificates</span>
                        </span>
                        <ArrowRight size={18} aria-hidden="true" className="cx-more__arrow" />
                    </Link>
                </p>
            )}
        </>
    );
}
