import master from '../../../data/master.json';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, Check, ClipboardList, Lightbulb, Target, Sparkles, BookOpen, ExternalLink } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Reveal, { Stagger, StaggerItem } from '@/components/motion/Reveal';

/** Small accents only (icons, labels, bullets) — body text always stays in the ink tiers. */
const ACCENT = { green: '#4ADE80', red: '#f87171' } as const;

export function generateStaticParams() {
    return master.experiences.map((exp) => ({ slug: exp.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const exp = master.experiences.find(e => e.slug === slug);
    if (!exp) return {};
    return {
        title: `${exp.role} @ ${exp.company} | Trupal Patel`,
        description: exp.deepDive.systemOverview,
    };
}

/** Icon + small uppercase heading, matching the case-study chapter eyebrows. */
function SectionHeading({ id, icon, color = ACCENT.green, children }: { id: string; icon: ReactNode; color?: string; children: ReactNode }) {
    return (
        <div className="mb-4 flex items-center gap-2" style={{ color }}>
            {icon}
            <h2 id={id} className="m-0 text-xs font-bold uppercase tracking-[0.16em]">{children}</h2>
        </div>
    );
}

const panelClass = 'card rounded-2xl p-6 sm:p-8';

export default async function ExperienceDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const exp = master.experiences.find(e => e.slug === slug);

    if (!exp) notFound();

    const lists = [
        { key: 'challenges', title: 'Challenges', items: exp.deepDive.challenges, color: ACCENT.red, icon: <Target size={15} aria-hidden="true" /> },
        { key: 'solutions', title: 'Solutions', items: exp.deepDive.solutions, color: ACCENT.green, icon: <Lightbulb size={15} aria-hidden="true" /> },
    ];

    return (
        <main className="container" style={{ paddingTop: 'calc(var(--nav-height) + 2.5rem)', paddingBottom: '6rem', minHeight: '100vh' }}>
            <div className="mx-auto grid w-full max-w-[900px] gap-6">

                {/* Back */}
                <div className="mb-2">
                    <Link href="/#experience" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                        <ArrowLeft size={15} aria-hidden="true" /> Back to Timeline
                    </Link>
                </div>

                {/* ── 1. COVER ────────────────────────────────────────────── */}
                <Reveal>
                    <header className="card relative isolate overflow-hidden rounded-3xl p-6 sm:p-10">
                        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

                        <p className="eyebrow mb-5">Experience</p>
                        <div className="flex flex-wrap items-center gap-5 sm:gap-7">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line-2 bg-white p-1.5 sm:h-[72px] sm:w-[72px]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={exp.logo} alt={exp.company} className="h-full w-full object-contain" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="m-0 mb-1.5 text-2xl font-extrabold leading-tight tracking-tight text-ink-1 text-balance sm:text-[2rem]">{exp.role}</h1>
                                <a
                                    href={exp.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[1.0625rem] font-semibold text-accent underline-offset-4 hover:underline"
                                >
                                    {exp.company} <ExternalLink size={14} aria-hidden="true" />
                                </a>
                                <p className="m-0 mt-2 font-mono text-[0.8125rem] tracking-[0.04em] text-ink-3">{exp.period}</p>
                            </div>
                        </div>
                    </header>
                </Reveal>

                {/* ── 2. OVERVIEW ─────────────────────────────────────────── */}
                <Reveal>
                    <section aria-labelledby="overview-title" className={panelClass}>
                        <SectionHeading id="overview-title" icon={<BookOpen size={15} aria-hidden="true" />}>Overview</SectionHeading>
                        <p className="measure m-0 text-[1.0625rem] leading-[1.8] text-ink-1">{exp.deepDive.systemOverview}</p>
                    </section>
                </Reveal>

                {/* ── 3. RESPONSIBILITIES ─────────────────────────────────── */}
                <Reveal>
                    <section aria-labelledby="responsibilities-title" className={panelClass}>
                        <SectionHeading id="responsibilities-title" icon={<ClipboardList size={15} aria-hidden="true" />}>Responsibilities</SectionHeading>
                        <p className="measure m-0 text-base leading-[1.8] text-ink-2">{exp.deepDive.responsibilities}</p>
                    </section>
                </Reveal>

                {/* ── 4. CHALLENGES / SOLUTIONS ───────────────────────────── */}
                <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {lists.map((list) => (
                        <StaggerItem key={list.key} className="h-full">
                            <section aria-labelledby={`${list.key}-title`} className={`${panelClass} relative h-full overflow-hidden`}>
                                {/* Hairline accent along the top edge ties the card to its label colour */}
                                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, ${list.color}99, transparent 70%)` }} />
                                <SectionHeading id={`${list.key}-title`} icon={list.icon} color={list.color}>{list.title}</SectionHeading>
                                <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
                                    {list.items.map((item, i) => (
                                        <li key={i} className="flex gap-3 text-[0.9375rem] leading-[1.7] text-ink-2">
                                            <span aria-hidden="true" className="shrink-0" style={{ color: list.color }}>—</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </StaggerItem>
                    ))}
                </Stagger>

                {/* ── 5. IMPACT ───────────────────────────────────────────── */}
                <Reveal>
                    <section aria-labelledby="impact-title" className={panelClass}>
                        <SectionHeading id="impact-title" icon={<Sparkles size={15} aria-hidden="true" />}>Impact</SectionHeading>
                        <ul className="m-0 grid list-none gap-3.5 p-0">
                            {exp.deepDive.impact.map((item, i) => (
                                <li key={i} className="flex items-start gap-3.5 text-[0.9375rem] leading-[1.7] text-ink-2">
                                    <span
                                        aria-hidden="true"
                                        className="mt-0.5 inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border text-accent"
                                        style={{ background: `${ACCENT.green}1a`, borderColor: `${ACCENT.green}40` }}
                                    >
                                        <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </Reveal>

            </div>
        </main>
    );
}
