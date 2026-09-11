import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight, CheckCircle2, CircleDashed } from 'lucide-react';
import Reveal, { Stagger, StaggerItem } from '@/components/motion/Reveal';
import { DECISIONS, HIGHLIGHTS, HOW_IT_WORKS, INTEGRATION, MODULES, NEXT_UP, SHIPPED, STOREDESK, TECH } from '@/data/storedesk';

export const metadata: Metadata = {
    title: `${STOREDESK.name} | Trupal Patel`,
    description: STOREDESK.tagline,
    alternates: { canonical: '/products/storedesk' },
    openGraph: {
        title: STOREDESK.name,
        description: STOREDESK.tagline,
        url: '/products/storedesk',
        siteName: 'Trupal Patel Portfolio',
        type: 'website',
    },
};

/** Small marks only (labels, step numbers), as on the case-study pages; running text stays in the ink tiers. */
const ACCENT = { red: '#f87171', green: '#4ADE80', sky: '#38bdf8' } as const;

const cardClass = 'card rounded-2xl p-5 sm:p-7';
const cardLabel = 'text-xs font-bold uppercase tracking-[0.14em] text-ink-3 mb-4';
const buttonStyle = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem', fontSize: '0.925rem' } as const;

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
    return (
        <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28">
            <Reveal>
                <p className="eyebrow mb-3">{eyebrow}</p>
                <h2 id={`${id}-title`} className="text-2xl sm:text-[2rem] font-extrabold text-ink-1 tracking-tight leading-tight mb-8 text-balance">
                    {title}
                </h2>
            </Reveal>
            {children}
        </section>
    );
}

export default function StoreDeskPage() {
    return (
        <main className="container" style={{ paddingTop: 'calc(var(--nav-height) + 2.5rem)', paddingBottom: '6rem', minHeight: '100vh' }}>
            <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-24">
                <div className="flex flex-col gap-6">
                    <div>
                        <Link href="/products" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                            <ArrowLeft size={15} aria-hidden="true" /> All Products
                        </Link>
                    </div>

                    {/* ── HERO ───────────────────────────────────────────── */}
                    <Reveal>
                        <header className="card relative isolate grid gap-8 overflow-hidden rounded-3xl p-6 sm:p-10 md:grid-cols-[1.25fr_1fr] md:items-center">
                            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

                            <div>
                                <p className="eyebrow mb-4">Product · Retail operations</p>
                                <div className="mb-4 flex items-center gap-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={STOREDESK.icon} alt="" className="h-11 w-auto shrink-0 rounded-[10px] object-contain" />
                                    <h1 className="m-0 text-3xl sm:text-[2.75rem] font-extrabold leading-tight tracking-tight text-ink-1">{STOREDESK.name}</h1>
                                </div>
                                <p className="mb-4 text-lg sm:text-xl leading-[1.5] text-ink-1 text-balance">{STOREDESK.tagline}</p>
                                <p className="measure mb-8 text-base leading-[1.75] text-ink-2">{STOREDESK.summary}</p>

                                <div className="flex flex-wrap gap-3">
                                    <a href={STOREDESK.siteUrl} target="_blank" rel="noreferrer" className="btn-primary" style={buttonStyle}>
                                        Visit {STOREDESK.siteLabel} <ArrowUpRight size={16} aria-hidden="true" />
                                    </a>
                                    <a href={STOREDESK.githubUrl} target="_blank" rel="noreferrer" className="btn-outline" style={buttonStyle}>
                                        Source on GitHub <ArrowUpRight size={16} aria-hidden="true" />
                                    </a>
                                </div>
                                <p className="mt-5 mb-0 text-xs font-medium tracking-wide text-ink-3">{STOREDESK.release}</p>
                            </div>

                            <div className="flex items-center justify-center rounded-2xl border border-line-1 bg-surface-1 p-8 sm:p-10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={STOREDESK.logo} alt="StoreDesk logo" className="h-auto max-h-48 w-auto max-w-full rounded-xl object-contain" />
                            </div>
                        </header>
                    </Reveal>

                    {/* ── HIGHLIGHTS ─────────────────────────────────────── */}
                    <Stagger role="list" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {HIGHLIGHTS.map((h) => (
                            <StaggerItem key={h.label} role="listitem" className="card rounded-2xl p-5">
                                <p className="m-0 font-mono text-2xl sm:text-[1.75rem] font-bold text-ink-1">{h.value}</p>
                                <p className="mt-1.5 mb-0 text-[0.875rem] leading-[1.5] text-ink-2">{h.label}</p>
                            </StaggerItem>
                        ))}
                    </Stagger>
                </div>

                {/* ── MODULES ────────────────────────────────────────── */}
                <Section id="modules" eyebrow="What's inside" title="Five modules, one store">
                    <Stagger role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MODULES.map((m, i) => (
                            <StaggerItem key={m.name} role="listitem" className={`${cardClass} h-full`}>
                                <p className="mb-3 font-mono text-xs font-bold" style={{ color: ACCENT.sky }}>{String(i + 1).padStart(2, '0')}</p>
                                <h3 className="m-0 text-lg font-bold text-ink-1">StoreDesk {m.name}</h3>
                                <p className="mt-1 mb-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-3">{m.platform}</p>
                                <p className="m-0 text-[0.9375rem] leading-[1.7] text-ink-2">{m.description}</p>
                            </StaggerItem>
                        ))}
                    </Stagger>
                </Section>

                {/* ── HOW IT WORKS ───────────────────────────────────── */}
                <Section id="how-it-works" eyebrow="In the store" title="How it works">
                    <Reveal>
                        <ol className={`${cardClass} flex flex-col gap-5`}>
                            {HOW_IT_WORKS.map((step, i) => (
                                <li key={step} className="flex gap-4">
                                    <span
                                        aria-hidden="true"
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold"
                                        style={{ color: ACCENT.sky, borderColor: `${ACCENT.sky}4d`, background: `${ACCENT.sky}14` }}
                                    >
                                        {i + 1}
                                    </span>
                                    <span className="pt-0.5 text-[0.9375rem] leading-[1.7] text-ink-2">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </Reveal>
                </Section>

                {/* ── HOW IT'S BUILT ─────────────────────────────────── */}
                <Section id="architecture" eyebrow="Under the hood" title="How it’s built">
                    <Reveal>
                        <div className="flex flex-col gap-6">
                            <p className="measure m-0 text-base leading-[1.75] text-ink-2">{INTEGRATION}</p>
                            <figure className="card m-0 rounded-2xl p-4 sm:p-6">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={STOREDESK.architectureImage}
                                    alt="StoreDesk architecture: the in-store Worker and Desktop UI, and the Cloud Hub relaying the Mobile scanner and Web dashboard to the store"
                                    className="block h-auto w-full rounded-lg"
                                />
                                <figcaption className="mt-4 text-center text-xs font-medium tracking-wide text-ink-3">System architecture</figcaption>
                            </figure>
                            <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
                                {TECH.map((t) => (
                                    <li key={t.name} className="flex items-center gap-1.5 rounded-full border border-line-1 bg-surface-3 px-3 py-1.5 text-[0.8125rem] font-medium text-ink-2">
                                        <i className={t.icon} aria-hidden="true" style={{ fontSize: '1rem' }} />
                                        {t.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Reveal>
                </Section>

                {/* ── DECISIONS ──────────────────────────────────────── */}
                <Section id="decisions" eyebrow="Engineering" title="The decisions that shaped it">
                    <div className="flex flex-col gap-4">
                        {DECISIONS.map((d) => (
                            <Reveal key={d.title}>
                                <article className={cardClass}>
                                    <h3 className="mb-5 text-[1.0625rem] font-bold leading-snug text-ink-1">{d.title}</h3>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-0">
                                        <div className="md:pr-6">
                                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: ACCENT.red }}>The problem</p>
                                            <p className="m-0 text-[0.9375rem] leading-[1.7] text-ink-2">{d.problem}</p>
                                        </div>
                                        <div className="border-t border-line-1 pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
                                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: ACCENT.green }}>What I did</p>
                                            <p className="m-0 text-[0.9375rem] leading-[1.7] text-ink-2">{d.resolution}</p>
                                        </div>
                                    </div>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </Section>

                {/* ── ROADMAP ────────────────────────────────────────── */}
                <Section id="roadmap" eyebrow="Roadmap" title="Where it stands">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Reveal className="h-full">
                            <div className={`${cardClass} h-full`}>
                                <h3 className={cardLabel}>Shipped</h3>
                                <ul className="flex flex-col gap-4">
                                    {SHIPPED.map((m) => (
                                        <li key={m.title} className="flex gap-3">
                                            <CheckCircle2 size={18} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: ACCENT.green }} />
                                            <div>
                                                <p className="m-0 mb-1 text-[0.9375rem] font-semibold text-ink-1">{m.title}</p>
                                                <p className="m-0 text-[0.9375rem] leading-[1.65] text-ink-2">{m.detail}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>
                        <Reveal delay={0.06} className="h-full">
                            <div className={`${cardClass} h-full`}>
                                <h3 className={cardLabel}>Next up</h3>
                                <ul className="flex flex-col gap-4">
                                    {NEXT_UP.map((goal) => (
                                        <li key={goal} className="flex gap-3 text-[0.9375rem] leading-[1.65] text-ink-2">
                                            <CircleDashed size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3" />
                                            <span>{goal}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>
                    </div>
                </Section>

                {/* ── CTA ────────────────────────────────────────────── */}
                <Reveal>
                    <aside aria-label={`${STOREDESK.name} website`} className="card relative isolate flex flex-col items-center overflow-hidden rounded-3xl p-8 text-center sm:p-12">
                        <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
                        <p className="m-0 mb-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-1">StoreDesk has its own home.</p>
                        <p className="measure m-0 mb-7 leading-[1.7] text-ink-2">Everything about running StoreDesk in a store lives on its own site.</p>
                        <a href={STOREDESK.siteUrl} target="_blank" rel="noreferrer" className="btn-primary" style={buttonStyle}>
                            Visit {STOREDESK.siteLabel} <ArrowUpRight size={16} aria-hidden="true" />
                        </a>
                    </aside>
                </Reveal>
            </div>
        </main>
    );
}
