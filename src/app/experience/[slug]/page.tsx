import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import master from '../../../data/master.json';
import { CAREER } from '@/data/career';
import SectionHead, { PART_NO } from '@/components/spec/SectionHead';
import { pageMetadata } from '@/utils/seo';

export function generateStaticParams() {
    return master.experiences.map((exp) => ({ slug: exp.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const exp = master.experiences.find((e) => e.slug === slug);
    if (!exp) return {};
    return pageMetadata({ title: `${exp.role} @ ${exp.company} | Trupal Patel`, description: exp.deepDive.systemOverview, path: `/experience/${exp.slug}` });
}

/** One job, as a datasheet revision note. */
export default async function ExperienceDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const index = master.experiences.findIndex((e) => e.slug === slug);
    const exp = master.experiences[index];
    if (!exp) notFound();

    const career = CAREER.find((c) => c.href === `/experience/${exp.slug}`);
    const rev = CAREER.length - CAREER.findIndex((c) => c.href === `/experience/${exp.slug}`);
    const next = master.experiences[(index + 1) % master.experiences.length];

    return (
        <div className="sp-page">
            <div className="sp-about pj">
                <Link href="/#revisions" className="cx-back"><ArrowLeft size={14} aria-hidden="true" /> Revision history</Link>

                <section className="sp-section">
                    <SectionHead no={1} title="Revision note" page={`R${rev}`} />
                    <p className="sp-part" style={{ marginTop: 22 }}><b>{PART_NO}</b><span>R{rev}</span><span>{exp.period}</span></p>
                    <div className="pj-head">
                        <span className="pj-head__logo pj-head__logo--box">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={career?.logo ?? exp.logo} alt="" />
                        </span>
                        <div>
                            <h1 className="sp-name" style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}>{exp.role}</h1>
                            <a href={exp.url} target="_blank" rel="noreferrer" className="sp-role pj-company">{exp.company} <ArrowUpRight size={16} aria-hidden="true" /></a>
                        </div>
                    </div>
                    <p className="sp-lede pj-overview">{exp.deepDive.systemOverview}</p>
                </section>

                <section className="sp-section">
                    <SectionHead no={2} title="Responsibilities" page={`R${rev}`} />
                    <p className="sp-lede" style={{ marginTop: '1rem' }}>{exp.deepDive.responsibilities}</p>
                </section>

                <section className="sp-section">
                    <SectionHead no={3} title="Problem → solution" page={`R${rev}`} />
                    <div className="pj-two">
                        <div className="pj-panel" data-tone="problem">
                            <p className="sp-sub">Challenges</p>
                            <ol className="pj-bullets">{exp.deepDive.challenges.map((c, i) => <li key={i}><span>›</span>{c}</li>)}</ol>
                        </div>
                        <div className="pj-panel" data-tone="solution">
                            <p className="sp-sub">Solutions</p>
                            <ol className="pj-bullets">{exp.deepDive.solutions.map((c, i) => <li key={i}><span>›</span>{c}</li>)}</ol>
                        </div>
                    </div>
                </section>

                <section className="sp-section">
                    <SectionHead no={4} title="Impact" page={`R${rev}`} />
                    <ul className="pj-metrics pj-metrics--list">{exp.deepDive.impact.map((m, i) => <li key={i}>{m}</li>)}</ul>
                </section>

                {next && next.slug !== exp.slug && (
                    <Link href={`/experience/${next.slug}`} className="pj-next">
                        <span>Next revision</span>
                        <b>{next.company}</b>
                        <ArrowRight size={20} aria-hidden="true" />
                    </Link>
                )}
            </div>
        </div>
    );
}
