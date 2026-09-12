import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDashed, Clock, ExternalLink, Flag, GraduationCap, Lightbulb, Mountain, Target, Workflow } from 'lucide-react';
import { projects } from '@/data/projects';
import { projectStories } from '@/data/project-stories';
import MermaidChart from '@/components/MermaidChart';
import Reveal, { Stagger, StaggerItem } from '@/components/motion/Reveal';
import type { Metadata } from 'next';

/**
 * Chapter accents. Used only for small marks — timeline nodes, icons, eyebrow labels,
 * step numbers — never for running text, which always stays in the ink tiers.
 */
const ACCENT = {
    green: '#4ADE80',
    red: '#f87171',
    sky: '#38bdf8',
    amber: '#fbbf24',
    purple: '#c084fc',
    slate: '#94a3b8',
} as const;

const GithubIcon = ({ size = 18 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.18-.35 6.5-1.56 6.5-7.16 0-1.49-.5-2.7-1.35-3.68.14-.33.6-1.74-.15-3.63 0 0-1.12-.36-3.7 1.38a12.8 12.8 0 0 0-6.7 0c-2.58-1.74-3.7-1.38-3.7-1.38-.75 1.89-.29 3.3-.15 3.63-.85.98-1.35 2.19-1.35 3.68 0 5.6 3.32 6.81 6.5 7.16A4.8 4.8 0 0 0 3 18.28V22" />
    </svg>
);

const stateStyle: Record<string, { icon: ReactNode; badge: string; color: string }> = {
    done:          { icon: <CheckCircle2 size={18} aria-hidden="true" style={{ color: ACCENT.green, flexShrink: 0, marginTop: 2 }} />, badge: 'Shipped',     color: ACCENT.green },
    'in-progress': { icon: <Clock size={18}        aria-hidden="true" style={{ color: ACCENT.sky, flexShrink: 0, marginTop: 2 }} />,   badge: 'In Progress', color: ACCENT.sky },
    planned:       { icon: <CircleDashed size={18} aria-hidden="true" style={{ color: ACCENT.slate, flexShrink: 0, marginTop: 2 }} />, badge: 'Planned',     color: ACCENT.slate },
};

export function generateStaticParams() {
    return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const project = projects.find(p => p.slug === slug);
    if (!project) return {};
    return {
        title: `${project.title} | Trupal Patel`,
        description: project.tagline || project.description,
    };
}

// ── Shared type scale ────────────────────────────────────────────────────────
/** Lead paragraph: the one sentence a skimmer should read in each chapter. */
const leadText = 'measure m-0 text-[1.0625rem] leading-[1.8] text-ink-1';
/** Regular body copy. */
const bodyText = 'measure m-0 text-base leading-[1.75] text-ink-2';
/** Small uppercase label that titles a card. */
const cardLabel = 'text-xs font-bold uppercase tracking-[0.14em] text-ink-3 mb-4';
/** Level-2 surface: separates from the black page. */
const cardClass = 'card rounded-2xl p-5 sm:p-7';

function Chapter({
    id,
    number,
    eyebrow,
    title,
    icon,
    accent = ACCENT.green,
    selfRevealing = false,
    children,
}: {
    id: string;
    number: number;
    eyebrow: string;
    title: string;
    icon: ReactNode;
    accent?: string;
    /** Set when the children animate themselves (card lists), so they aren't wrapped twice. */
    selfRevealing?: boolean;
    children: ReactNode;
}) {
    return (
        <section id={id} aria-labelledby={`${id}-title`} className="relative scroll-mt-28 pl-11 sm:pl-16">
            {/* Timeline node — stays put; it's part of the thread, only the content reveals */}
            <span
                aria-hidden="true"
                className="absolute left-0 top-0 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border bg-surface-0 font-mono text-xs sm:text-sm font-bold"
                style={{
                    borderColor: `color-mix(in srgb, ${accent} 65%, transparent)`,
                    color: accent,
                    boxShadow: `0 0 0 4px var(--surface-0), 0 0 20px color-mix(in srgb, ${accent} 22%, transparent)`,
                }}
            >
                {String(number).padStart(2, '0')}
            </span>

            <Reveal>
                <div className="flex items-center gap-2 mb-2.5" style={{ color: accent }}>
                    {icon}
                    <span className="text-xs font-bold uppercase tracking-[0.18em]">{eyebrow}</span>
                </div>
                <h2 id={`${id}-title`} className="text-2xl sm:text-[1.875rem] font-extrabold text-ink-1 tracking-tight leading-tight mb-6 text-balance">
                    {title}
                </h2>
            </Reveal>

            {selfRevealing ? children : <Reveal delay={0.06}>{children}</Reveal>}
        </section>
    );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const projectIndex = projects.findIndex(p => p.slug === slug);
    const project = projects[projectIndex];

    if (!project) {
        notFound();
    }

    const story = projectStories[project.slug];
    const nextProject = projects[(projectIndex + 1) % projects.length];
    const hasLive = Boolean(project.links?.live) && project.links.live !== '#';
    const hasGithub = Boolean(project.links?.github) && project.links.github !== '#';
    // Product shots: phones sit four across; browser/desktop shots two across, with the first
    // spanning the row when the count is odd so no shot sits alone.
    const screens = project.media.filter((m) => m.type === 'image');
    const phoneShots = screens.length > 0 && screens.every((s) => s.frame === 'phone');
    const spanFirst = !phoneShots && screens.length % 2 === 1;

    const chapters = [
        { id: 'problem', label: 'Problem' },
        { id: 'solution', label: 'Solution' },
        { id: 'build', label: 'How it’s built' },
        ...(story?.challenges.length ? [{ id: 'challenges', label: 'Challenges' }] : []),
        ...(story?.learnings.length ? [{ id: 'learnings', label: 'Learnings' }] : []),
        { id: 'status', label: 'Where it stands' },
    ];
    let chapterNumber = 0;
    const nextNumber = () => ++chapterNumber;

    return (
        <main className="container" style={{ paddingTop: 'calc(var(--nav-height) + 2.5rem)', paddingBottom: '6rem', minHeight: '100vh' }}>
            <div className="mx-auto w-full max-w-[900px]">
                <div className="mb-8">
                    <Link href="/projects" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                        <ArrowLeft size={15} aria-hidden="true" /> Back to Projects
                    </Link>
                </div>

                {/* ── COVER ───────────────────────────────────────────── */}
                <Reveal>
                    <header className="card relative isolate overflow-hidden rounded-3xl p-6 sm:p-10 mb-8">
                        {/* Soft accent bloom gives the cover a lit corner without a gradient wash over text */}
                        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

                        <p className="eyebrow mb-4">Case study</p>
                        <div className="flex items-center gap-4 mb-4">
                            {project.logoIcon && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={project.logoIcon} alt="" className="h-11 w-auto shrink-0 rounded-[10px] object-contain" />
                            )}
                            <h1 className="text-3xl sm:text-[2.5rem] font-extrabold text-ink-1 leading-tight tracking-tight m-0 text-balance">{project.title}</h1>
                        </div>
                        <p className="measure text-lg text-ink-2 leading-[1.7] mb-7">{project.tagline}</p>

                        <ul className="flex flex-wrap gap-2 mb-8" aria-label="Tech stack">
                            {project.tech.map(t => (
                                <li key={t.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line-1 bg-surface-3 text-[0.8125rem] font-medium text-ink-2">
                                    {t.icon && <i className={t.icon} aria-hidden="true" style={{ fontSize: '1rem' }} />}
                                    {t.name}
                                </li>
                            ))}
                        </ul>

                        {(hasLive || hasGithub) && (
                            <div className="flex flex-wrap gap-3">
                                {hasLive && (
                                    <a href={project.links.live} target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                                        View Live <ExternalLink size={15} aria-hidden="true" />
                                    </a>
                                )}
                                {hasGithub && (
                                    <a href={project.links.github} target="_blank" rel="noreferrer" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                                        Source Code <GithubIcon size={15} />
                                    </a>
                                )}
                            </div>
                        )}
                    </header>
                </Reveal>

                {/* ── PRODUCT SHOTS ───────────────────────────────────── */}
                {screens.length > 0 && (
                    <Reveal delay={0.06}>
                        <section aria-labelledby="screens-title" className="mb-12">
                            <h2 id="screens-title" className={cardLabel}>In the product</h2>
                            <div className={`grid gap-5 ${phoneShots ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                                {screens.map((shot, i) => (
                                    <figure key={shot.src} className={`m-0 ${spanFirst && i === 0 ? 'sm:col-span-2' : ''}`}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={shot.src}
                                            alt={`${shot.title}: ${shot.caption}`}
                                            loading={i === 0 ? 'eager' : 'lazy'}
                                            className="block h-auto w-full rounded-xl border border-line-1 bg-surface-1"
                                        />
                                        <figcaption className="mt-2.5 text-[0.8125rem] leading-[1.55] text-ink-3">
                                            <span className="font-semibold text-ink-2">{shot.title}.</span> {shot.caption}
                                        </figcaption>
                                    </figure>
                                ))}
                            </div>
                            <p className="mt-4 text-xs text-ink-3">Screens are recreated from the app&apos;s real UI with fictional demo data.</p>
                        </section>
                    </Reveal>
                )}

                {/* ── CHAPTER INDEX ───────────────────────────────────── */}
                <Reveal delay={0.08}>
                    <nav aria-label="Case study chapters" className="mb-16 -mx-1 overflow-x-auto px-1 pb-1">
                        <ol className="flex gap-2 min-w-max">
                            {chapters.map((c, i) => (
                                <li key={c.id}>
                                    <a
                                        href={`#${c.id}`}
                                        className="inline-flex items-center gap-2 rounded-full border border-line-1 bg-surface-2 px-3.5 py-1.5 text-[0.8125rem] font-medium text-ink-2 transition-colors duration-200 hover:border-line-2 hover:bg-surface-3 hover:text-ink-1"
                                    >
                                        <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                                        {c.label}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </Reveal>

                {/* ── STORY ───────────────────────────────────────────── */}
                <div className="relative flex flex-col gap-20">
                    {/* Vertical thread connecting the chapters — tints follow the chapter accents */}
                    <div
                        aria-hidden="true"
                        className="absolute left-4 sm:left-5 top-2 bottom-2 w-px"
                        style={{ background: `linear-gradient(to bottom, ${ACCENT.red}66, ${ACCENT.sky}4d 40%, ${ACCENT.purple}40 70%, ${ACCENT.green}59)` }}
                    />

                    <Chapter id="problem" number={nextNumber()} eyebrow="The core problem" title="What needed solving" icon={<Target size={16} aria-hidden="true" />} accent={ACCENT.red}>
                        <p className={leadText}>{project.scenario}</p>
                    </Chapter>

                    <Chapter id="solution" number={nextNumber()} eyebrow="The solution" title="What I built" icon={<Lightbulb size={16} aria-hidden="true" />} accent={ACCENT.green}>
                        <div className="flex flex-col gap-5">
                            <p className={leadText}>{project.problemSolved}</p>
                            <p className={bodyText}>{project.description}</p>
                        </div>
                    </Chapter>

                    <Chapter id="build" number={nextNumber()} eyebrow="Integration" title="How it fits together" icon={<Workflow size={16} aria-hidden="true" />} accent={ACCENT.sky}>
                        <div className="flex flex-col gap-6">
                            {story?.integration && (
                                <p className={bodyText}>{story.integration}</p>
                            )}

                            {(project.architectureImage || project.mermaidChart) && (
                                <figure className="card rounded-2xl p-4 sm:p-6 m-0">
                                    {project.architectureImage ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={project.architectureImage} alt={`${project.title} architecture diagram`} className="block w-full h-auto rounded-lg" />
                                    ) : (
                                        project.mermaidChart && <MermaidChart chart={project.mermaidChart} />
                                    )}
                                    <figcaption className="mt-4 text-center text-xs font-medium tracking-wide text-ink-3">System architecture</figcaption>
                                </figure>
                            )}

                            {project.howToUse.length > 0 && (
                                <div className={cardClass}>
                                    <h3 className={cardLabel}>The flow, step by step</h3>
                                    <ol className="flex flex-col gap-4">
                                        {project.howToUse.map((step, i) => (
                                            <li key={i} className="flex gap-4">
                                                <span
                                                    aria-hidden="true"
                                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold"
                                                    style={{ color: ACCENT.sky, borderColor: `${ACCENT.sky}4d`, background: `${ACCENT.sky}14` }}
                                                >
                                                    {i + 1}
                                                </span>
                                                <span className="text-[0.9375rem] leading-[1.7] text-ink-2">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </div>
                    </Chapter>

                    {story?.challenges.length ? (
                        <Chapter id="challenges" number={nextNumber()} eyebrow="Problems along the way" title="What got hard, and what I did about it" icon={<Mountain size={16} aria-hidden="true" />} accent={ACCENT.amber} selfRevealing>
                            <div className="flex flex-col gap-4">
                                {story.challenges.map((c) => (
                                    // Each card reveals as it scrolls in, so long chapters unfold progressively
                                    <Reveal key={c.title}>
                                        <article className={cardClass}>
                                            <h3 className="text-[1.0625rem] font-bold leading-snug text-ink-1 mb-5">{c.title}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-0">
                                                <div className="md:pr-6">
                                                    <p className="text-xs font-bold uppercase tracking-[0.14em] mb-2" style={{ color: ACCENT.red }}>The problem</p>
                                                    <p className="text-[0.9375rem] leading-[1.7] text-ink-2 m-0">{c.problem}</p>
                                                </div>
                                                <div className="border-t border-line-1 pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
                                                    <p className="text-xs font-bold uppercase tracking-[0.14em] mb-2" style={{ color: ACCENT.green }}>What I did</p>
                                                    <p className="text-[0.9375rem] leading-[1.7] text-ink-2 m-0">{c.resolution}</p>
                                                </div>
                                            </div>
                                        </article>
                                    </Reveal>
                                ))}
                            </div>
                        </Chapter>
                    ) : null}

                    {story?.learnings.length ? (
                        <Chapter id="learnings" number={nextNumber()} eyebrow="Takeaways" title="What I learned" icon={<GraduationCap size={16} aria-hidden="true" />} accent={ACCENT.purple}>
                            <ul className="flex flex-col gap-3">
                                {story.learnings.map((l, i) => (
                                    <li
                                        key={i}
                                        className="card flex gap-3 rounded-xl border-l-2 px-5 py-4 text-[0.9375rem] leading-[1.7] text-ink-2"
                                        style={{ borderLeftColor: `${ACCENT.purple}8c` }}
                                    >
                                        <span aria-hidden="true" className="font-bold" style={{ color: ACCENT.purple }}>→</span>
                                        <span>{l}</span>
                                    </li>
                                ))}
                            </ul>
                        </Chapter>
                    ) : null}

                    <Chapter id="status" number={nextNumber()} eyebrow="Outcome" title="Where it stands today" icon={<Flag size={16} aria-hidden="true" />} accent={ACCENT.green} selfRevealing>
                        <div className="flex flex-col gap-6">
                            {project.outcomes.length > 0 && (
                                <Stagger role="list" className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {project.outcomes.map((o, i) => (
                                        <StaggerItem key={i} role="listitem" className="card flex h-full gap-3 rounded-xl px-4 py-3.5 text-[0.9375rem] leading-[1.65] text-ink-2">
                                            <CheckCircle2 size={16} aria-hidden="true" className="mt-1 shrink-0 text-accent" />
                                            <span>{o}</span>
                                        </StaggerItem>
                                    ))}
                                </Stagger>
                            )}

                            {project.progress.length > 0 && (
                                <Reveal>
                                    <div className={cardClass}>
                                        <h3 className={cardLabel}>Milestones</h3>
                                        <ul className="flex flex-col divide-y divide-line-1">
                                            {project.progress.map((m, i) => {
                                                const s = stateStyle[m.state] ?? stateStyle.planned;
                                                return (
                                                    <li key={i} className="grid grid-cols-[18px_1fr] sm:grid-cols-[18px_1fr_auto] items-start gap-x-3 gap-y-2 py-3.5 first:pt-0 last:pb-0">
                                                        {s.icon}
                                                        <div>
                                                            <p className="text-[0.9375rem] font-semibold text-ink-1 m-0 mb-1">{m.title}</p>
                                                            <p className="text-[0.9375rem] leading-[1.65] text-ink-2 m-0">{m.detail}</p>
                                                        </div>
                                                        <span
                                                            className="col-start-2 sm:col-start-auto justify-self-start sm:self-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider"
                                                            style={{ color: s.color, background: `${s.color}14`, border: `1px solid ${s.color}40` }}
                                                        >
                                                            {s.badge}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </Reveal>
                            )}

                            {project.futureGoals.length > 0 && (
                                <Reveal>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-3 mb-3">Next up</h3>
                                    <ul className="flex flex-col gap-2.5">
                                        {project.futureGoals.map((g, i) => (
                                            <li key={i} className="flex gap-3 text-[0.9375rem] leading-[1.7] text-ink-2">
                                                <CircleDashed size={15} aria-hidden="true" className="mt-1 shrink-0 text-ink-3" />
                                                <span>{g}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Reveal>
                            )}
                        </div>
                    </Chapter>
                </div>

                {/* ── NEXT STORY ──────────────────────────────────────── */}
                {nextProject && nextProject.slug !== project.slug && (
                    <Reveal className="mt-24">
                        <Link
                            href={`/projects/${nextProject.slug}`}
                            className="card spotlight group flex items-center justify-between gap-6 rounded-2xl p-6 sm:p-8 transition-colors duration-300 ease-out-expo hover:border-line-2 hover:bg-surface-3"
                        >
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-3 mb-1.5">Next case study</p>
                                <p className="text-xl font-bold text-ink-1 m-0 truncate">{nextProject.title}</p>
                            </div>
                            <ArrowRight size={22} aria-hidden="true" className="shrink-0 text-accent transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
                        </Link>
                    </Reveal>
                )}
            </div>
        </main>
    );
}
