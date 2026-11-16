import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { pageMetadata } from '@/utils/seo';
import SectionHead, { PART_NO } from '@/components/spec/SectionHead';
import { projects } from '@/data/projects';

export const metadata: Metadata = pageMetadata({
    title: 'Projects | Trupal Patel',
    description: 'Case studies of web apps, edge POS systems, AI agents and data pipelines built by Trupal Patel.',
    path: '/projects',
});

const real = (url?: string) => !!url && url !== '#';

const GithubIcon = () => (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.18-.35 6.5-1.56 6.5-7.16 0-1.49-.5-2.7-1.35-3.68.14-.33.6-1.74-.15-3.63 0 0-1.12-.36-3.7 1.38a12.8 12.8 0 0 0-6.7 0c-2.58-1.74-3.7-1.38-3.7-1.38-.75 1.89-.29 3.3-.15 3.63-.85.98-1.35 2.19-1.35 3.68 0 5.6 3.32 6.81 6.5 7.16A4.8 4.8 0 0 0 3 18.28V22" />
    </svg>
);

export default function ProjectsPage() {
    return (
        <div className="sp-page">
            <div className="sp-about pj">
                <Link href="/#revisions" className="cx-back"><ArrowLeft size={14} aria-hidden="true" /> Back to the datasheet</Link>
                <section className="sp-section">
                    <SectionHead no={1} title="Project archive" page="Projects" />
                    <p className="sp-part" style={{ marginTop: 22 }}><b>{PART_NO}</b><span>Case studies</span><span>{projects.length} on file</span></p>
                    <h1 className="sp-name">Things I’ve built</h1>
                    <p className="sp-lede" style={{ marginTop: '0.8rem' }}>Each one opens a full case study: the problem, how it’s wired, what got hard, and where it stands.</p>

                    <div className="pj-grid">
                        {projects.map((p, i) => (
                            <article key={p.slug} className="pj-card" style={{ ['--d' as string]: `${i * 50}ms` }}>
                                <Link href={`/projects/${p.slug}`} className="pj-card__shot" aria-label={`Open the ${p.title} case study`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={p.image} alt="" loading="lazy" decoding="async" />
                                    <span className="pj-card__no">PJ-{String(i + 1).padStart(2, '0')}</span>
                                </Link>
                                <div className="pj-card__body">
                                    {p.category && <p className="pj-card__cat">{p.category}</p>}
                                    <h2><Link href={`/projects/${p.slug}`}>{p.title}</Link></h2>
                                    <p className="pj-card__tag">{p.tagline}</p>
                                    <ul className="pj-tech" aria-label="Tech stack">
                                        {p.tech.slice(0, 6).map((t) => <li key={t.name}>{t.icon && <i className={t.icon} aria-hidden="true" />}{t.name}</li>)}
                                        {p.tech.length > 6 && <li className="pj-tech__more">+{p.tech.length - 6}</li>}
                                    </ul>
                                    <footer>
                                        <Link href={`/projects/${p.slug}`} className="pj-read">Case study <ArrowRight size={14} aria-hidden="true" /></Link>
                                        <span className="pj-links">
                                            {real(p.links.github) && <a href={p.links.github} target="_blank" rel="noreferrer" aria-label={`${p.title} source on GitHub`}><GithubIcon /></a>}
                                            {real(p.links.live) && <a href={p.links.live} target="_blank" rel="noreferrer" aria-label={`Open ${p.title}`}><ArrowUpRight size={15} aria-hidden="true" /></a>}
                                        </span>
                                    </footer>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
