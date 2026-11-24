import Image from 'next/image';
import { ArrowUpRight, FileText, Mail } from 'lucide-react';
import Reveal from '@/components/motion/Reveal';
import { CAREER, CURRENT_JOB } from '@/data/career';
import { STUDIO, STUDIO_TREE } from '@/data/studio';
import { LinkedinIcon } from '@/data/site-config';
import ContactForm from './ContactForm';
import { PageIndex, ScrollRuler } from './PageIndex';
import SystemMap from './SystemMap';
import RelatedDocs from './RelatedDocs';
import Platforms from './Platforms';
import CareerTiming from './CareerTiming';
import Education from './Education';
import ProjectsPreview from './ProjectsPreview';
import CertificationsPreview from './CertificationsPreview';
import SectionHead from './SectionHead';

const products = STUDIO_TREE.filter((n) => n.group === 'products');
/** Live products and the platforms they ship on, from the same list the Platforms folder uses. */
const LIVE_PRODUCTS = products.filter((n) => n.live);
const SHIPPED_ON = STUDIO.platforms.filter((p) => LIVE_PRODUCTS.some((n) => n.platforms.split('·').map((s) => s.trim()).includes(p)));

const GithubIcon = ({ size = 17 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.18-.35 6.5-1.56 6.5-7.16 0-1.49-.5-2.7-1.35-3.68.14-.33.6-1.74-.15-3.63 0 0-1.12-.36-3.7 1.38a12.8 12.8 0 0 0-6.7 0c-2.58-1.74-3.7-1.38-3.7-1.38-.75 1.89-.29 3.3-.15 3.63-.85.98-1.35 2.19-1.35 3.68 0 5.6 3.32 6.81 6.5 7.16A4.8 4.8 0 0 0 3 18.28V22" />
    </svg>
);


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
                            <Reveal className="sp-hero__text">
                                <div className="sp-hero__id">
                                <h1 className="sp-name">Trupal Patel</h1>
                                <p className="sp-role">{CURRENT_JOB.role}</p>
                                <p className="sp-role sp-role--co"><b className="sp-role__co"><Image src="/logos/cvs-health.png" alt="" width={26} height={26} />CVS Health</b><span className="sp-role__sub" aria-label="(Aetna)"><span className="sp-role__paren" aria-hidden="true">(</span><Image src="/logos/aetna.png" alt="" width={22} height={22} />aetna<span className="sp-role__paren" aria-hidden="true">)</span></span></p>
                                </div>
                                {/* Who I am as a builder, not the day job */}
                                <p className="sp-hero__lede">I build things end to end, from the first sketch to something people use every day: a back office for gas stations, brain games on the App Store, a family tree relatives grow together. Every idea starts false; I like shipping it true.</p>
                                <div className="sp-hero__tags">
                                    {/* Studio membership, in the studio's own true || false colours */}
                                    <a href={STUDIO.url} target="_blank" rel="noreferrer" className="sp-member">
                                        <span className="sp-member__text">
                                            <small>Member of</small>
                                            {/* The studio's own logo, the version made for light backgrounds */}
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="/studio/logo-horizontal-light.svg" alt="True || False" width={792} height={96} className="sp-member__logo" />
                                        </span>
                                        <ArrowUpRight size={15} aria-hidden="true" className="sp-member__go" />
                                    </a>
                                </div>
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


                        <h3 id="platforms" className="sp-sub">Platforms shipped · <b>{LIVE_PRODUCTS.length}</b> live products on <b>{SHIPPED_ON.length}</b> platforms</h3>
                        <Platforms />
                    </section>

                    {/* 2 · Pinout */}
                    <section id="pinout" data-track-section="pinout" className="sp-section">
                        <SectionHead no={2} title="System map" page="p. 2" />
                        <p className="sp-lede" style={{ marginTop: '1rem' }}>How the pieces I build fit together. Pick a box to open every tool in that layer.</p>
                        <SystemMap />
                    </section>

                    {/* 3 · Revision history */}
                    <section id="revisions" data-track-section="revisions" className="sp-section">
                        <SectionHead no={3} title="Revision history" page="p. 3" />
                        <h3 className="sp-sub">Education</h3>
                        <Education />
                        <h3 className="sp-sub" style={{ marginTop: '1.6rem' }}>Experience</h3>
                        <CareerTiming rows={CAREER} />
                        <h3 className="sp-sub" style={{ marginTop: '1.6rem' }}>Project archive</h3>
                        <ProjectsPreview />
                        <h3 className="sp-sub" style={{ marginTop: '1.8rem' }}>Certifications</h3>
                        <CertificationsPreview />
                    </section>

                    {/* 4 · Related documents */}
                    <section id="documents" data-track-section="documents" className="sp-section">
                        <SectionHead no={4} title="Related documents" page="p. 4" />
                        <RelatedDocs />
                    </section>

                    {/* 5 · Ordering information */}
                    <section id="ordering" data-track-section="contact" className="sp-section">
                        <SectionHead no={5} title="Ordering information" page="p. 5" />
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
