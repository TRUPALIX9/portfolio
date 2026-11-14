import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
    ArrowUpRight, Bot, ChevronRight, Database, FileText, Film, Gamepad2, HeartPulse, Mail, MapPin,
    ScanLine, Sparkles, Store, TreePine, User,
} from 'lucide-react';
import Reveal, { Stagger, StaggerItem } from '@/components/motion/Reveal';
import BingeButton from '@/components/binge/BingeButton';
import { CAREER, CURRENT_JOB } from '@/data/career';
import { STUDIO, STUDIO_TREE } from '@/data/studio';
import { LinkedinIcon } from '@/data/site-config';
import BlockDiagram, { type DiagramNode } from './BlockDiagram';
import ContactForm from './ContactForm';
import CountUp from './CountUp';
import { PageIndex, ScrollRuler } from './PageIndex';
import Pinout from './Pinout';
import RevisionTable from './RevisionTable';
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

const FEATURES: { icon: ReactNode; text: string }[] = [
    { icon: <HeartPulse size={16} aria-hidden="true" />, text: `Utilization management and care management applications on Google Cloud at ${CURRENT_JOB.employer}` },
    { icon: <Database size={16} aria-hidden="true" />, text: 'BigQuery analytics and data processing pipelines' },
    { icon: <Sparkles size={16} aria-hidden="true" />, text: 'GenAI prototypes and the REST APIs around them' },
    { icon: <Store size={16} aria-hidden="true" />, text: 'Member of trueorfalse.dev, building apps for iOS, Android, Windows and the web' },
];

/** Hero functional block diagram: what goes in, the core, what comes out. */
const CORE_NODES: DiagramNode[] = [
    { id: 'req', label: 'Requirements', x: 4, y: 8, w: 118 },
    { id: 'data', label: 'Data', x: 4, y: 74, w: 118 },
    { id: 'users', label: 'Users', x: 4, y: 140, w: 118 },
    { id: 'core', label: 'TP-SDE core', sub: 'Python · TypeScript · GCP', x: 200, y: 62, w: 160, h: 56, variant: 'core' },
    { id: 'pipe', label: 'Data pipelines', x: 436, y: 8, w: 120, variant: 'accent' },
    { id: 'api', label: 'APIs', x: 436, y: 74, w: 120 },
    { id: 'apps', label: 'Apps', sub: 'web · mobile', x: 436, y: 140, w: 120 },
];
const CORE_EDGES: [string, string][] = [['req', 'core'], ['data', 'core'], ['users', 'core'], ['core', 'pipe'], ['core', 'api'], ['core', 'apps']];

/** Mini diagrams per product: how each one is put together. */
const APP_DIAGRAMS: Record<string, { nodes: DiagramNode[]; edges: [string, string][] }> = {
    skills: {
        nodes: [
            { id: 'a', label: 'Catalog', sub: 'skills · agents', x: 2, y: 6, w: 96 },
            { id: 'b', label: 'MCP server', sub: '8 tools', x: 124, y: 6, w: 96, variant: 'accent' },
            { id: 'c', label: 'Your agent', sub: 'Claude · Codex', x: 246, y: 6, w: 96 },
        ],
        edges: [['a', 'b'], ['b', 'c']],
    },
    logicsprint: {
        nodes: [
            { id: 'a', label: 'Flutter app', sub: 'iOS · Android', x: 2, y: 6, w: 96 },
            { id: 'b', label: 'Supabase', sub: 'anon accounts', x: 124, y: 6, w: 96, variant: 'accent' },
            { id: 'c', label: 'Top 10', sub: 'daily, global', x: 246, y: 6, w: 96 },
        ],
        edges: [['a', 'b'], ['b', 'c']],
    },
    family: {
        nodes: [
            { id: 'a', label: 'Relatives', sub: 'code sign-in', x: 2, y: 6, w: 96 },
            { id: 'b', label: 'Workers', sub: 'Cloudflare', x: 124, y: 6, w: 96, variant: 'accent' },
            { id: 'c', label: 'Private tree', sub: 'per family', x: 246, y: 6, w: 96 },
        ],
        edges: [['a', 'b'], ['b', 'c']],
    },
    'contact-convoy': {
        nodes: [
            { id: 'a', label: 'Card scan', sub: 'on-device OCR', x: 2, y: 6, w: 96 },
            { id: 'b', label: 'Gemini', sub: 'field clean-up', x: 124, y: 6, w: 96, variant: 'accent' },
            { id: 'c', label: 'Lead board', sub: 'per company', x: 246, y: 6, w: 96 },
        ],
        edges: [['a', 'b'], ['b', 'c']],
    },
    storedesk: {
        nodes: [
            { id: 'a', label: 'Register', sub: 'Verifone', x: 2, y: 6, w: 76 },
            { id: 'b', label: 'Store PC', sub: 'local-first', x: 92, y: 6, w: 76, variant: 'accent' },
            { id: 'c', label: 'Cloud relay', sub: 'GCP', x: 182, y: 6, w: 76 },
            { id: 'd', label: 'Phone · web', x: 272, y: 6, w: 70 },
        ],
        edges: [['a', 'b'], ['b', 'c'], ['c', 'd']],
    },
};

const APP_ICONS: Record<string, ReactNode> = {
    skills: <Bot size={19} aria-hidden="true" />,
    logicsprint: <Gamepad2 size={19} aria-hidden="true" />,
    family: <TreePine size={19} aria-hidden="true" />,
    'contact-convoy': <ScanLine size={19} aria-hidden="true" />,
    storedesk: <Store size={19} aria-hidden="true" />,
};

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
                                <p className="sp-role">{CURRENT_JOB.role} · <b>{CURRENT_JOB.company}</b></p>
                                <p className="sp-status"><span className="sp-led sp-led--live" aria-hidden="true" /><MapPin size={13} aria-hidden="true" /> Georgia, USA · status: active</p>
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

                        <div className="sp-two">
                            <div>
                                <h3 className="sp-sub">Features</h3>
                                <Stagger className="sp-features" role="list">
                                    {FEATURES.map((f) => (
                                        <StaggerItem key={f.text} role="listitem">
                                            <span className="sp-features__icon">{f.icon}</span>
                                            <span>{f.text}</span>
                                        </StaggerItem>
                                    ))}
                                </Stagger>
                            </div>
                            <div>
                                <h3 className="sp-sub">Key specifications</h3>
                                <table className="sp-table">
                                    <tbody>
                                        <tr><th scope="row">Current role</th><td>{CURRENT_JOB.role}, {CURRENT_JOB.company}</td></tr>
                                        <tr><th scope="row">Since</th><td className="sp-num">{SINCE}</td></tr>
                                        <tr><th scope="row">Experience</th><td className="sp-num"><CountUp to={YEARS} suffix="+ years" /></td></tr>
                                        <tr><th scope="row">Platforms shipped</th><td>iOS · Android · Windows · Web</td></tr>
                                        <tr><th scope="row">Location</th><td>Georgia, USA · raised in Ahmedabad, India</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <h3 className="sp-sub">Functional block diagram</h3>
                        <BlockDiagram nodes={CORE_NODES} edges={CORE_EDGES} width={560} height={182} caption="Fig. 2 · Inputs, core, outputs" label="Requirements, data and users feed a core of Python, TypeScript and Google Cloud, which outputs data pipelines, APIs and apps." />
                    </section>

                    {/* 2 · Pinout */}
                    <section id="pinout" data-track-section="pinout" className="sp-section">
                        <SectionHead no={2} title="Pin configuration" page="p. 2" />
                        <p className="sp-lede" style={{ marginTop: '1rem' }}>Pick a skill to see where it has been used, or pick a place to see the skills behind it.</p>
                        <Pinout />
                    </section>

                    {/* 3 · Applications */}
                    <section id="applications" data-track-section="applications" className="sp-section">
                        <SectionHead no={3} title="Applications · trueorfalse.dev" page="p. 3" />
                        <Reveal className="sp-tf">
                            <div>
                                <p className="sp-tf__mark" aria-label="True or False"><span className="t">true</span><span className="o">||</span><span className="f">false</span></p>
                                <p>{STUDIO.motto[0]} {STUDIO.motto[1]} Trupal is a member of the studio.</p>
                            </div>
                            <a href={STUDIO.url} target="_blank" rel="noreferrer">trueorfalse.dev ↗</a>
                        </Reveal>

                        <div className="sp-apps">
                            {products.map((p, i) => {
                                const diagram = APP_DIAGRAMS[p.id];
                                return (
                                    <Reveal key={p.id} delay={(i % 2) * 0.06}>
                                        <article className="sp-app" style={{ height: '100%' }}>
                                            <header className="sp-app__head">
                                                <span className="sp-app__icon">{APP_ICONS[p.id]}</span>
                                                <div>
                                                    <h3 className="sp-app__name">{p.name}</h3>
                                                    <span className="sp-app__pn">TF-{String(i + 1).padStart(2, '0')} · {p.links[0].label}</span>
                                                </div>
                                                <span className="sp-app__state"><span className="sp-led sp-led--live" aria-hidden="true" />live</span>
                                            </header>
                                            <div className="sp-app__body">
                                                <p className="sp-app__fn">{p.tagline}</p>
                                                {diagram && (
                                                    <BlockDiagram nodes={diagram.nodes} edges={diagram.edges} width={344} height={50} label={`How ${p.name} is put together`} />
                                                )}
                                                <dl className="sp-app__rows">
                                                    <dt>Platforms</dt><dd>{p.platforms}</dd>
                                                    <dt>Stack</dt><dd className="sp-chips">{p.stack.map((s) => <span key={s}>{s}</span>)}</dd>
                                                </dl>
                                                <div className="sp-app__links">
                                                    {p.links.map((l) => (
                                                        <a key={l.href} href={l.href} className="sp-link" {...ext(l.href)}>{l.label}<ArrowUpRight size={13} aria-hidden="true" /></a>
                                                    ))}
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
                    </section>

                    {/* 4 · Revision history */}
                    <section id="revisions" data-track-section="revisions" className="sp-section">
                        <SectionHead no={4} title="Revision history" page="p. 4" />
                        <div className="sp-table-wrap" style={{ marginTop: 20 }}>
                            <RevisionTable rows={CAREER} />
                        </div>
                        <p style={{ marginTop: '0.9rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.25rem' }} className="sp-mono">
                            <Link href="/projects" className="sp-link">Project archive</Link>
                            <Link href="/certifications" className="sp-link">Certifications</Link>
                        </p>
                    </section>

                    {/* 5 · Related documents */}
                    <section id="documents" data-track-section="documents" className="sp-section">
                        <SectionHead no={5} title="Related documents" page="p. 5" />
                        <div className="sp-docs">
                            <Link href="/about" className="sp-doc">
                                <span className="sp-doc__no">DOC-01 · PROFILE</span>
                                <span className="sp-doc__title"><User size={18} aria-hidden="true" /> About</span>
                                <p>Life outside work, opinions, and adventures.</p>
                                <span className="sp-doc__go">Open <ChevronRight size={14} aria-hidden="true" /></span>
                            </Link>
                            <div className="sp-doc">
                                <span className="sp-doc__no">DOC-02 · WATCH LOG</span>
                                <span className="sp-doc__title"><Film size={18} aria-hidden="true" /> Binge</span>
                                <p>Series and films, season by season, with a Marvel timeline. Suggestions welcome.</p>
                                <BingeButton />
                            </div>
                        </div>
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
