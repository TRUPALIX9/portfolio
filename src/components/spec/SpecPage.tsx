import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, FileText, Mail, MapPin } from 'lucide-react';
import Reveal from '@/components/motion/Reveal';
import { CAREER, CURRENT_JOB } from '@/data/career';
import { STUDIO, STUDIO_TREE } from '@/data/studio';
import { LinkedinIcon } from '@/data/site-config';
import ContactForm from './ContactForm';
import CountUp from './CountUp';
import { PageIndex, ScrollRuler } from './PageIndex';
import SystemMap from './SystemMap';
import AppIcon from './AppIcon';
import RelatedDocs from './RelatedDocs';
import Platforms from './Platforms';
import CareerTiming from './CareerTiming';
import { EDUCATION } from '@/data/education';
import SectionHead, { PART_NO } from './SectionHead';

const products = STUDIO_TREE.filter((n) => n.group === 'products');
const others = STUDIO_TREE.filter((n) => n.group !== 'products');
const SINCE = CURRENT_JOB.period.replace(' – now', '');
const YEARS = Math.floor((Date.now() - Date.UTC(2022, 0, 1)) / (365.25 * 24 * 3600 * 1000));

const GithubIcon = ({ size = 17 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.18-.35 6.5-1.56 6.5-7.16 0-1.49-.5-2.7-1.35-3.68.14-.33.6-1.74-.15-3.63 0 0-1.12-.36-3.7 1.38a12.8 12.8 0 0 0-6.7 0c-2.58-1.74-3.7-1.38-3.7-1.38-.75 1.89-.29 3.3-.15 3.63-.85.98-1.35 2.19-1.35 3.68 0 5.6 3.32 6.81 6.5 7.16A4.8 4.8 0 0 0 3 18.28V22" />
    </svg>
);




function ext(href: string) {
    return href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {};
}

export default function SpecPage() {
    return (
        <div className="sp-page">
            <ScrollRuler />
            <div className="sp-layout">
                <PageIndex />
                <main className="sp-main">
                    {/* 1 · Overview */}
                    <section id="overview" data-track-section="overview" className="sp-section">
                        <SectionHead no={1} title="Overview" page="p. 1" />
                        <div className="sp-hero">
                            <Reveal>
                                <p className="sp-part"><b>{PART_NO}</b><span>Software engineer</span><span>Rev 4 · {SINCE}</span></p>
                                <h1 className="sp-name">Trupal Patel</h1>
                                <p className="sp-role">{CURRENT_JOB.role} · <b className="sp-role__co"><Image src="/logos/cvs-health.png" alt="" width={20} height={20} />CVS Health</b></p>
                                <p className="sp-status"><span className="sp-led sp-led--live" aria-hidden="true" /><MapPin size={13} aria-hidden="true" /> Georgia, USA · status: active</p>
                                {/* Ratings: only numbers the hero doesn't already say */}
                                <dl className="sp-ratings sp-ratings--hero">
                                    <div><dt>Experience</dt><dd><CountUp to={YEARS} suffix="+" /><small>years</small></dd></div>
                                    <div><dt>Live products</dt><dd>{STUDIO_TREE.filter((n) => n.live && n.group === 'products').length}</dd></div>
                                    <div><dt>Platforms</dt><dd>{STUDIO.platforms.length}</dd></div>
                                </dl>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <figure className="sp-fig">
                                    <div className="sp-fig__frame">
                                        <Image src="/proffesional.jpeg" alt="Trupal Patel" fill sizes="220px" style={{ objectFit: 'cover', objectPosition: '50% 30%' }} priority />
                                    </div>
                                    <figcaption>Fig. 1 · Trupal Patel</figcaption>
                                </figure>
                            </Reveal>
                        </div>


                        <h3 className="sp-sub">Platforms shipped</h3>
                        <Platforms />
                    </section>

                    {/* 2 · Pinout */}
                    <section id="pinout" data-track-section="pinout" className="sp-section">
                        <SectionHead no={2} title="System map" page="p. 2" />
                        <p className="sp-lede" style={{ marginTop: '1rem' }}>How the pieces I build fit together. Pick a box to open every tool in that layer.</p>
                        <SystemMap />
                    </section>

                    {/* 3 · Applications */}
                    <section id="applications" data-track-section="applications" className="sp-section">
                        <SectionHead no={3} title="Applications · trueorfalse.dev" page="p. 3" />
                        <div className="sp-dark">
                        <Reveal className="sp-tf">
                            <div>
                                <p className="sp-tf__mark" aria-label="True or False"><Image src="/studio/studio.png" alt="" width={40} height={40} className="sp-tf__logo" /><span className="t">true</span><span className="o">||</span><span className="f">false</span></p>
                                <p>{STUDIO.motto[0]} {STUDIO.motto[1]} Trupal is a member of the studio.</p>
                            </div>
                            <a href={STUDIO.url} target="_blank" rel="noreferrer">trueorfalse.dev ↗</a>
                        </Reveal>

                        <div className="sp-apps">
                            {products.map((p, i) => {
                                return (
                                    <Reveal key={p.id} delay={(i % 2) * 0.06}>
                                        <article className="sp-app" style={{ height: '100%' }}>
                                            <header className="sp-app__head">
                                                <AppIcon id={p.id} name={p.name} size={40} />
                                                <div>
                                                    <h3 className="sp-app__name">{p.name}</h3>
                                                    <span className="sp-app__pn">TF-{String(i + 1).padStart(2, '0')} · {p.links[0].label}</span>
                                                </div>
                                                <span className="sp-app__state"><span className="sp-led sp-led--live" aria-hidden="true" />live</span>
                                            </header>
                                            <div className="sp-app__body">
                                                <p className="sp-app__tag">{p.tagline}</p>
                                                <p className="sp-app__fn">{p.summary}</p>
                                                <div className="sp-app__foot">
                                                    <span className="sp-app__plat">{p.platforms}</span>
                                                    <a href={p.links[0].href} className="sp-app__go" {...ext(p.links[0].href)}>Open<ArrowUpRight size={13} aria-hidden="true" /></a>
                                                </div>
                                            </div>
                                        </article>
                                    </Reveal>
                                );
                            })}
                        </div>

                        <h3 className="sp-sub">Client sites and projects</h3>
                        <div className="sp-table-wrap">
                            <table className="sp-table">
                                <thead><tr><th>Name</th><th>Function</th><th>Status</th><th>Link</th></tr></thead>
                                <tbody>
                                    {others.map((o) => (
                                        <tr key={o.id}>
                                            <td>{o.name}</td>
                                            <td>{o.tagline}</td>
                                            <td className="sp-mono" style={{ whiteSpace: 'nowrap' }}>
                                                <span className={`sp-led ${o.live ? '' : 'sp-led--off'}`} style={{ display: 'inline-block', marginRight: 6 }} aria-hidden="true" />
                                                {o.live ? 'live' : 'not yet'}
                                            </td>
                                            <td><a className="sp-link sp-mono" style={{ fontSize: '0.8rem' }} href={o.links[0].href} {...ext(o.links[0].href)}>{o.links[0].label}</a></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </section>

                    {/* 4 · Revision history */}
                    <section id="revisions" data-track-section="revisions" className="sp-section">
                        <SectionHead no={4} title="Revision history" page="p. 4" />
                        <CareerTiming rows={CAREER} />
                        <h3 className="sp-sub" style={{ marginTop: '1.6rem' }}>Education</h3>
                        <CareerTiming rows={EDUCATION} tag="E" />
                        <p className="sp-tim__links">
                            <Link href="/projects" className="sp-btn sp-btn--ghost"><FileText size={15} aria-hidden="true" /> Project archive</Link>
                            <Link href="/certifications" className="sp-btn sp-btn--ghost"><FileText size={15} aria-hidden="true" /> Certifications</Link>
                        </p>
                    </section>

                    {/* 5 · Related documents */}
                    <section id="documents" data-track-section="documents" className="sp-section">
                        <SectionHead no={5} title="Related documents" page="p. 5" />
                        <RelatedDocs />
                    </section>

                    {/* 6 · Ordering information */}
                    <section id="ordering" data-track-section="contact" className="sp-section">
                        <SectionHead no={6} title="Ordering information" page="p. 6" />
                        <div className="sp-order">
                            <div className="sp-order__codes">
                                <a href="mailto:trupal.work@gmail.com"><Mail size={18} aria-hidden="true" /><span><small>Email</small>trupal.work@gmail.com</span><ArrowUpRight size={14} aria-hidden="true" /></a>
                                <a href="https://www.linkedin.com/in/trupalix" target="_blank" rel="noreferrer"><LinkedinIcon size={18} /><span><small>LinkedIn</small>in/trupalix</span><ArrowUpRight size={14} aria-hidden="true" /></a>
                                <a href="https://github.com/TRUPALIX9" target="_blank" rel="noreferrer"><GithubIcon size={18} /><span><small>GitHub</small>TRUPALIX9</span><ArrowUpRight size={14} aria-hidden="true" /></a>
                                <a href={`mailto:${STUDIO.email}`}><FileText size={18} aria-hidden="true" /><span><small>Studio work</small>{STUDIO.email}</span><ArrowUpRight size={14} aria-hidden="true" /></a>
                            </div>
                            <ContactForm />
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
