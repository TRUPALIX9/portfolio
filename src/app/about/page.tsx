import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Briefcase, Clapperboard, Compass, MapPin, MessageSquareQuote, Moon, Mountain, Plane, Sparkles } from 'lucide-react';
import SectionHead, { PART_NO } from '@/components/spec/SectionHead';
import { CAREER, CURRENT_JOB } from '@/data/career';
import { STUDIO } from '@/data/studio';

export const metadata: Metadata = {
    title: 'About · Trupal Patel',
    description: `Trupal Patel: ${CURRENT_JOB.role} at ${CURRENT_JOB.company}, member of trueorfalse.dev. Life outside work, opinions and adventures.`,
    alternates: { canonical: '/about' },
};

const SINCE = CURRENT_JOB.period.replace(' – now', '');

/** Sections waiting on Trupal's own words. Nothing here is made up. */
const COMING_SOON = [
    {
        id: 'adventures',
        icon: <Mountain size={18} aria-hidden="true" />,
        title: 'Adventures',
        note: 'The adrenaline log: activities done, where and when, with photos.',
    },
    {
        id: 'life',
        icon: <Plane size={18} aria-hidden="true" />,
        title: 'Life outside work',
        note: 'Hobbies, places lived and travelled, and what fills the weekends.',
    },
    {
        id: 'opinions',
        icon: <MessageSquareQuote size={18} aria-hidden="true" />,
        title: 'Opinions',
        note: 'Views on software, work and life, in his own words.',
    },
];

export default function AboutPage() {
    return (
        <div className="sp-page">
            <div className="sp-about">
                <section className="sp-section">
                    <SectionHead no={1} title="Profile" page="About" />
                    <div className="sp-hero">
                        <div>
                            <p className="sp-part"><b>{PART_NO}</b><span>Profile</span><span>Rev 4 · {SINCE}</span></p>
                            <h1 className="sp-name">Trupal Patel</h1>
                            <p className="sp-role">{CURRENT_JOB.role} · <b>{CURRENT_JOB.company}</b></p>
                            <ul className="sp-features" style={{ marginTop: '1.4rem' }}>
                                <li><span className="sp-features__icon"><MapPin size={16} aria-hidden="true" /></span><span>Lives in Georgia, USA. Raised in Ahmedabad, Gujarat, India.</span></li>
                                <li><span className="sp-features__icon"><Briefcase size={16} aria-hidden="true" /></span><span>Works on utilization management and care management on Google Cloud at {CURRENT_JOB.employer}, with BigQuery and AI.</span></li>
                                <li><span className="sp-features__icon"><Sparkles size={16} aria-hidden="true" /></span><span>Member of <a className="sp-link" href={STUDIO.url} target="_blank" rel="noreferrer">trueorfalse.dev</a>, a small software studio.</span></li>
                                <li><span className="sp-features__icon"><Clapperboard size={16} aria-hidden="true" /></span><span>Watches a lot of series and films; the full log is on <Link className="sp-link" href="/binge">Binge</Link>.</span></li>
                                <li><span className="sp-features__icon"><Moon size={16} aria-hidden="true" /></span><span>Favourite Marvel character: Moon Knight.</span></li>
                            </ul>
                        </div>
                        <figure className="sp-fig">
                            <div className="sp-fig__frame">
                                <Image src="/proffesional.jpeg" alt="Trupal Patel" fill sizes="220px" style={{ objectFit: 'cover', objectPosition: '50% 30%' }} priority />
                            </div>
                            <figcaption>Fig. 1 · Trupal Patel</figcaption>
                        </figure>
                    </div>
                </section>

                <section className="sp-section">
                    <SectionHead no={2} title="Path so far" page="About" />
                    <ol className="sp-path">
                        {[...CAREER].reverse().map((job) => (
                            <li key={job.company} data-current={String(!!job.current)}>
                                <span className="sp-path__date">{job.period}</span>
                                <b>{job.company}</b>
                                <span>{job.role}</span>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="sp-section">
                    <SectionHead no={3} title="Off the clock" page="About" />
                    <div className="sp-soon">
                        {COMING_SOON.map((s) => (
                            <div key={s.id} id={s.id} className="sp-soon__card">
                                <span className="sp-doc__title">{s.icon} {s.title}</span>
                                <p>{s.note}</p>
                                <span className="sp-soon__tag"><Compass size={13} aria-hidden="true" /> Coming soon</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
