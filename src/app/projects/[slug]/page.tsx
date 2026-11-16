import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, CircleDashed, Clock } from 'lucide-react';
import { projects, type ProjectMediaItem } from '@/data/projects';
import { projectStories } from '@/data/project-stories';
import MermaidChart from '@/components/MermaidChart';
import SectionHead, { PART_NO } from '@/components/spec/SectionHead';
import { pageMetadata } from '@/utils/seo';

export function generateStaticParams() {
    return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const p = projects.find((x) => x.slug === slug);
    if (!p) return {};
    return pageMetadata({ title: `${p.title} | Trupal Patel`, description: p.tagline, path: `/projects/${p.slug}` });
}

const real = (url?: string) => !!url && url !== '#';

const STATE: Record<string, { icon: ReactNode; label: string }> = {
    done: { icon: <CheckCircle2 size={16} aria-hidden="true" />, label: 'Done' },
    'in-progress': { icon: <Clock size={16} aria-hidden="true" />, label: 'In progress' },
    planned: { icon: <CircleDashed size={16} aria-hidden="true" />, label: 'Planned' },
};

function Shots({ shots }: { shots: ProjectMediaItem[] }) {
    const phones = shots.every((s) => s.frame === 'phone');
    return (
        <div className="pj-shots" data-phones={String(phones)}>
            {shots.map((s, i) => (
                <figure key={s.src} className="pj-shot">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.src} alt={`${s.title}: ${s.caption}`} loading={i === 0 ? 'eager' : 'lazy'} />
                    <figcaption><b>{s.title}.</b> {s.caption}</figcaption>
                </figure>
            ))}
        </div>
    );
}

function Bullets({ items, numbered = false }: { items: string[]; numbered?: boolean }) {
    return (
        <ol className="pj-bullets" data-numbered={String(numbered)}>
            {items.map((t, i) => <li key={i}><span>{numbered ? String(i + 1).padStart(2, '0') : '›'}</span>{t}</li>)}
        </ol>
    );
}

/** A project case study, laid out as datasheet sections. */
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const index = projects.findIndex((p) => p.slug === slug);
    const project = projects[index];
    if (!project) notFound();

    const story = projectStories[project.slug];
    const next = projects[(index + 1) % projects.length];
    const screens = project.media.filter((m) => m.type === 'image');
    const videos = project.media.filter((m) => m.type === 'video');
    let n = 0;
    const no = () => ++n;

    return (
        <div className="sp-page">
            <div className="sp-about pj">
                <Link href="/projects" className="cx-back"><ArrowLeft size={14} aria-hidden="true" /> All projects</Link>

                {/* Overview */}
                <section className="sp-section">
                    <SectionHead no={no()} title="Overview" page={project.title} />
                    <p className="sp-part" style={{ marginTop: 22 }}><b>{PART_NO}</b><span>PJ-{String(index + 1).padStart(2, '0')}</span>{project.category && <span>{project.category}</span>}</p>
                    <div className="pj-head">
                        {project.logoIcon && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={project.logoIcon} alt="" className="pj-head__logo" />
                        )}
                        <h1 className="sp-name">{project.title}</h1>
                    </div>
                    <p className="sp-role">{project.tagline}</p>
                    <ul className="pj-tech pj-tech--lg" aria-label="Tech stack">
                        {project.tech.map((t) => <li key={t.name}>{t.icon && <i className={t.icon} aria-hidden="true" />}{t.name}</li>)}
                    </ul>
                    {(real(project.links.live) || real(project.links.github)) && (
                        <div className="pj-cta">
                            {real(project.links.live) && <a href={project.links.live} target="_blank" rel="noreferrer" className="sp-btn">Open it <ArrowUpRight size={15} aria-hidden="true" /></a>}
                            {real(project.links.github) && <a href={project.links.github} target="_blank" rel="noreferrer" className="sp-btn sp-btn--ghost">Source code <ArrowUpRight size={15} aria-hidden="true" /></a>}
                        </div>
                    )}
                    {project.metrics && project.metrics.length > 0 && (
                        <ul className="pj-metrics">{project.metrics.map((m) => <li key={m}>{m}</li>)}</ul>
                    )}
                </section>

                {(videos.length > 0 || screens.length > 0) && (
                    <section className="sp-section">
                        <SectionHead no={no()} title="In the product" page={project.title} />
                        {videos.map((v) => (
                            <figure key={v.src} className="pj-video">
                                <video src={v.src} poster={v.poster} controls playsInline preload="none" aria-label={v.title} />
                                <figcaption><b>{v.title}.</b> {v.caption}</figcaption>
                            </figure>
                        ))}
                        {screens.length > 0 && <Shots shots={screens} />}
                        {screens.length > 0 && <p className="pj-note">{project.screensNote ?? 'Screens are recreated from the app’s real UI with fictional demo data.'}</p>}
                    </section>
                )}

                <section className="sp-section">
                    <SectionHead no={no()} title="Problem → solution" page={project.title} />
                    <div className="pj-two">
                        <div className="pj-panel" data-tone="problem">
                            <p className="sp-sub">The problem</p>
                            <p className="pj-lead">{project.scenario}</p>
                        </div>
                        <div className="pj-panel" data-tone="solution">
                            <p className="sp-sub">What I built</p>
                            <p className="pj-lead">{project.problemSolved}</p>
                            <p className="pj-body">{project.description}</p>
                        </div>
                    </div>
                </section>

                {project.legacy && (
                    <section className="sp-section">
                        <SectionHead no={no()} title={`Where it started: ${project.legacy.title}`} page={project.title} />
                        <p className="sp-lede" style={{ marginTop: '1rem' }}>{project.legacy.summary}</p>
                        <div className="pj-two">
                            <div className="pj-panel"><p className="sp-sub">What it did</p><Bullets items={project.legacy.features} /></div>
                            <div className="pj-panel"><p className="sp-sub">What changed</p><Bullets items={project.legacy.changes} /></div>
                        </div>
                        {project.legacy.screens && project.legacy.screens.length > 0 && <Shots shots={project.legacy.screens} />}
                        {real(project.legacy.github) && <a href={project.legacy.github} target="_blank" rel="noreferrer" className="sp-btn sp-btn--ghost" style={{ marginTop: 14 }}>Legacy source <ArrowUpRight size={15} aria-hidden="true" /></a>}
                    </section>
                )}

                <section className="sp-section">
                    <SectionHead no={no()} title="How it fits together" page={project.title} />
                    {story?.integration && <p className="sp-lede" style={{ marginTop: '1rem' }}>{story.integration}</p>}
                    {(project.architectureImage || project.mermaidChart) && (
                        <figure className="pj-arch">
                            {project.architectureImage
                                // eslint-disable-next-line @next/next/no-img-element
                                ? <img src={project.architectureImage} alt={`${project.title} architecture diagram`} />
                                : project.mermaidChart && <MermaidChart chart={project.mermaidChart} />}
                            <figcaption>Fig. {n} · System architecture</figcaption>
                        </figure>
                    )}
                    {project.howToUse.length > 0 && (<><p className="sp-sub">How it’s used</p><Bullets items={project.howToUse} numbered /></>)}
                </section>

                {story?.challenges.length ? (
                    <section className="sp-section">
                        <SectionHead no={no()} title="What got hard" page={project.title} />
                        <div className="pj-challenges">
                            {story.challenges.map((c, i) => (
                                <article key={c.title} className="pj-challenge">
                                    <span className="pj-challenge__no">C{i + 1}</span>
                                    <h3>{c.title}</h3>
                                    <p><b>Problem.</b> {c.problem}</p>
                                    <p><b>Fix.</b> {c.resolution}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                ) : null}

                {story?.learnings.length ? (
                    <section className="sp-section">
                        <SectionHead no={no()} title="What I learned" page={project.title} />
                        <Bullets items={story.learnings} numbered />
                    </section>
                ) : null}

                <section className="sp-section">
                    <SectionHead no={no()} title="Where it stands" page={project.title} />
                    {project.outcomes.length > 0 && (<><p className="sp-sub">Outcomes</p><Bullets items={project.outcomes} /></>)}
                    {project.progress.length > 0 && (
                        <>
                            <p className="sp-sub">Milestones</p>
                            <ol className="pj-milestones">
                                {project.progress.map((m) => (
                                    <li key={m.title} data-state={m.state}>
                                        <span className="pj-milestones__state">{STATE[m.state]?.icon}{STATE[m.state]?.label}</span>
                                        <b>{m.title}</b>
                                        <p>{m.detail}</p>
                                    </li>
                                ))}
                            </ol>
                        </>
                    )}
                    {project.futureGoals.length > 0 && (<><p className="sp-sub">Next</p><Bullets items={project.futureGoals} /></>)}
                </section>

                {next && next.slug !== project.slug && (
                    <Link href={`/projects/${next.slug}`} className="pj-next">
                        <span>Next case study</span>
                        <b>{next.title}</b>
                        <ArrowRight size={20} aria-hidden="true" />
                    </Link>
                )}
            </div>
        </div>
    );
}
