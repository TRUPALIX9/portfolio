"use client";
import Link from 'next/link';
import master from '../data/master.json';
import Reveal from '@/components/motion/Reveal';

export default function ExperienceTimeline() {
    return (
        <div id="experience" style={{ width: '100%', paddingTop: '2rem' }}>
            <Reveal className="text-center mb-14">
                <p className="eyebrow mb-3">Experience</p>
                <h2
                    className="text-ink-1"
                    style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}
                >
                    Where I&apos;ve <span className="text-accent">worked.</span>
                </h2>
            </Reveal>

            <div className="relative mx-auto flex max-w-[800px] flex-col gap-10 border-l-2 border-line-2 pl-10">
                {master.experiences.map((exp) => (
                    // One entrance per entry: dot, year and card rise together as they scroll in.
                    <Reveal key={exp.slug} className="relative">
                        {/* TIMELINE DOT */}
                        <div
                            aria-hidden="true"
                            style={{
                                position: 'absolute',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: '#4ADE80',
                                left: 'calc(-2.5rem - 9px)',
                                top: '3rem',
                                boxShadow: '0 0 0 4px #000, 0 0 12px rgba(74,222,128,0.5)',
                            }}
                        />
                        {/* TIMELINE YEAR */}
                        <div className="hidden md:block" style={{
                            position: 'absolute',
                            left: 'calc(-2.5rem - 60px)',
                            top: '2.95rem',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--ink-3, #8c8c8c)', // was white @ 40% (3.66:1 — failed WCAG AA)
                            fontFamily: 'monospace',
                            letterSpacing: '0.05em'
                        }}>
                            {exp.period.match(/\d{4}/)?.[0]}
                        </div>

                        {/* Card classes live on this inner element: framer's inline transform on the
                            Reveal wrapper would otherwise cancel the .card-interactive hover lift. */}
                        <article className="card card-interactive spotlight rounded-2xl p-7 md:p-10">
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line-2 bg-white p-1.5">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={exp.logo} alt={exp.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-[1.5rem] font-semibold leading-tight text-ink-1">
                                            {exp.role}{' '}
                                            <span className="text-accent">
                                                @{' '}
                                                <a
                                                    href={exp.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-inherit underline decoration-transparent underline-offset-4 transition-colors duration-150 hover:decoration-accent/60"
                                                >
                                                    {exp.company}
                                                </a>
                                            </span>
                                        </h3>
                                        <span className="font-mono text-sm text-ink-3">{exp.period}</span>
                                    </div>
                                </div>
                                <Link
                                    href={`/experience/${exp.slug}`}
                                    aria-label={`Read more about my role at ${exp.company}`}
                                    className="group/more inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-accent transition-colors duration-150 hover:text-ink-1"
                                >
                                    Read More
                                    <span aria-hidden="true" className="transition-transform duration-150 ease-out-expo group-hover/more:translate-x-1">&rarr;</span>
                                </Link>
                            </div>

                            <ul className="mb-2 flex max-w-[68ch] flex-col gap-3">
                                {exp.achievements.map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-base leading-[1.7] text-ink-2">
                                        <span aria-hidden="true" className="mt-[0.3rem] text-xs text-accent">▹</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    </Reveal>
                ))}
            </div>
        </div>
    );
}
