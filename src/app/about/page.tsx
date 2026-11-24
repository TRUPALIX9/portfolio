import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Caveat, Fredoka } from 'next/font/google';
import { ArrowRight, Clapperboard, Compass, House, MapPin, MessageSquareQuote, Moon, Mountain, Plane, Trophy } from 'lucide-react';
import { ADVENTURES, ADVENTURE_CATEGORIES } from '@/data/adventures';
import { SPORTS } from '@/data/sports';
import SportIcon from '@/components/spec/SportIcon';
import { COUNTRIES } from '@/data/travel';
import { STICKER_PATHS } from '@/data/travel-stickers';
import { INK } from '@/components/travel/lab/shared';
import { TOTAL_REGIONS } from '@/components/travel/geo';
import './about.css';

const round = Fredoka({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--ab-round', display: 'swap' });
const hand = Caveat({ subsets: ['latin'], weight: ['500', '700'], variable: '--ab-hand', display: 'swap' });

export const metadata: Metadata = {
    title: 'About · Trupal Patel',
    description: 'The person behind the datasheet: adventures, travel, sports and the shows on repeat.',
    alternates: { canonical: '/about' },
};

const DONE = ADVENTURES.filter((a) => a.status === 'done');
const PLANNED = ADVENTURES.filter((a) => a.status === 'planned');

/** Where each sticker sits on the travel banner: [country, x, y, size, tilt]. */
const TRIP: [string, number, number, number, number][] = [
    ['United States', 4, 18, 84, -8],
    ['Canada', 62, 0, 66, 6],
    ['India', 136, 22, 80, -4],
    ['Nepal', 190, 6, 30, 10],
    ['Australia', 214, 46, 72, 7],
];

const JUMPS = [
    { id: 'adventures', label: 'Adventures' },
    { id: 'travel', label: 'Travel', href: '/travel' },
    { id: 'sports', label: 'Sports' },
    { id: 'opinions', label: 'Opinions' },
];

/** Quick facts about me, each one a doorway into the page. */
const FACTS = [
    { icon: <MapPin size={18} aria-hidden="true" />, label: 'Lives in', value: 'Georgia, USA' },
    { icon: <House size={18} aria-hidden="true" />, label: 'Grew up in', value: 'Ahmedabad, India' },
    { icon: <Mountain size={18} aria-hidden="true" />, label: 'Adventures', value: `${DONE.length} done, ${PLANNED.length} next`, href: '#adventures' },
    { icon: <Plane size={18} aria-hidden="true" />, label: 'Travel', value: `${COUNTRIES.length} countries`, href: '/travel' },
    { icon: <Trophy size={18} aria-hidden="true" />, label: 'Plays', value: `${SPORTS.length} sports and games`, href: '#sports' },
    { icon: <Clapperboard size={18} aria-hidden="true" />, label: 'Watches', value: 'Way too many series', href: '/binge' },
    { icon: <Moon size={18} aria-hidden="true" />, label: 'Favourite Marvel hero', value: 'Moon Knight' },
];

function Head({ no, title, kicker }: { no: number; title: string; kicker?: string }) {
    return (
        <header className="ab-head">
            <span className="ab-head__no">{no}</span>
            <div>
                {kicker && <p className="ab-head__kicker">{kicker}</p>}
                <h2>{title}</h2>
            </div>
        </header>
    );
}

export default function AboutPage() {
    return (
        <div className={`sp-page ab ${round.variable} ${hand.variable}`}>
            <div className="sp-about">
                {/* Hello */}
                <section id="profile" className="ab-hello">
                    <figure className="ab-polaroid">
                        <div className="ab-polaroid__img">
                            <Image src="/social.jpeg" alt="Trupal Patel smiling in a lavender hoodie" fill sizes="(max-width: 760px) 70vw, 320px" style={{ objectFit: 'cover', objectPosition: '50% 44%' }} priority />
                        </div>
                        <figcaption>that’s me ✌</figcaption>
                    </figure>
                    <div className="ab-hello__text">
                        <p className="ab-eyebrow">About me</p>
                        <h1>Hi, I’m <em>Trupal.</em></h1>
                        <p className="ab-lede">
                            I build software for a living. The rest of the time I’m rafting rivers, trekking up mountains, playing just about any sport going, and watching far too many series.
                        </p>
                        <ul className="ab-facts">
                            {FACTS.map((f) => {
                                const inner = (<><span className="ab-facts__icon">{f.icon}</span><span><small>{f.label}</small><b>{f.value}</b></span></>);
                                return (
                                    <li key={f.label}>
                                        {f.href ? (f.href.startsWith('/') ? <Link href={f.href}>{inner}</Link> : <a href={f.href}>{inner}</a>) : <div>{inner}</div>}
                                    </li>
                                );
                            })}
                        </ul>
                        <Link href="/" className="ab-work">Looking for the work side? The full datasheet is on the home page <ArrowRight size={15} aria-hidden="true" /></Link>
                    </div>
                </section>

                <nav className="ab-jump" aria-label="On this page">
                    {JUMPS.map((j, i) => <a key={j.id} href={'href' in j ? j.href : `#${j.id}`}><span>{i + 1}</span>{j.label}</a>)}
                </nav>

                {/* 1 · Adventures */}
                <section id="adventures" className="sp-section">
                    <Head no={1} kicker={`${DONE.length} done · ${PLANNED.length} on the list`} title="Things I’ve jumped off, into and over" />

                    <dl className="sp-readout">
                        <div><dt>Logged</dt><dd>{ADVENTURES.length}</dd></div>
                        <div><dt>Done</dt><dd className="sp-accent">{DONE.length}</dd></div>
                        <div><dt>Next</dt><dd>{PLANNED.length}</dd></div>
                        <div><dt>Up next</dt><dd className="sp-readout__text">{PLANNED[0]?.activity ?? '—'}</dd></div>
                    </dl>

                    <div className="sp-adv">
                        {ADVENTURE_CATEGORIES.map((cat) => {
                            const rows = ADVENTURES.filter((a) => a.category === cat.id);
                            const done = rows.filter((a) => a.status === 'done').length;
                            return (
                                <div key={cat.id} className="sp-adv__cat">
                                    <h3 className="sp-adv__head">
                                        <span>{cat.label}</span>
                                        <span>{done}/{rows.length}</span>
                                    </h3>
                                    <ul>
                                        {rows.map((a) => (
                                            <li key={a.activity} data-status={a.status}>
                                                <span className={a.status === 'done' ? 'sp-led' : 'sp-led sp-led--off'} aria-hidden="true" />
                                                <div className="sp-adv__body">
                                                    <b>{a.activity}</b>
                                                    {a.note && <span className="sp-adv__note">{a.note}</span>}
                                                    {a.items && <span className="sp-chips">{a.items.map((it) => <span key={it}>{it}</span>)}</span>}
                                                </div>
                                                <span className="sp-adv__state">{a.status === 'done' ? 'Done' : 'Next'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Travel lives on its own page; this is just the door */}
                <Link href="/travel" id="travel" className="ab-trip">
                    <svg viewBox="0 0 300 120" className="ab-trip__stickers" aria-hidden="true">
                        <defs>
                            <filter id="abLift" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1d2b4a" floodOpacity="0.3" /></filter>
                            <linearGradient id="abGloss" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.5" /><stop offset="0.45" stopColor="#fff" stopOpacity="0" /></linearGradient>
                        </defs>
                        {TRIP.map(([name, x, y, size, r]) => (
                            <g key={name} transform={`translate(${x} ${y}) rotate(${r} ${size / 2} ${size / 2}) scale(${size / 100})`} filter="url(#abLift)">
                                <path d={STICKER_PATHS[name]} fill="#fff" stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
                                <path d={STICKER_PATHS[name]} fill={INK[name]} />
                                <path d={STICKER_PATHS[name]} fill="url(#abGloss)" />
                            </g>
                        ))}
                    </svg>
                    <div className="ab-trip__text">
                        <p className="ab-eyebrow">Places I’ve been</p>
                        <h2>{COUNTRIES.length} countries, {TOTAL_REGIONS} states and provinces</h2>
                        <p>Every one is a sticker on the map. Open it and tell me where to go next.</p>
                    </div>
                    <span className="ab-cta">Open the sticker map <ArrowRight size={16} aria-hidden="true" /></span>
                </Link>

                {/* 3 · Sports */}
                <section id="sports" className="sp-section">
                    <Head no={2} kicker={`${SPORTS.length} and counting`} title="Games I play" />
                    {/* Two worlds: on a field or court, and on a screen */}
                    {([['real', 'Real', 'on the field, the court and the track'], ['virtual', 'Virtual', 'on a screen']] as const).map(([world, label, where]) => {
                        const list = SPORTS.filter((sp) => sp.world === world);
                        return (
                            <div key={world} className="ab-world" data-world={world}>
                                <h3 className="ab-world__head"><b>{label}</b><span>{where}</span><i>{list.length}</i></h3>
                                <ul className="sp-sports">
                                    {list.map((sp, i) => (
                                        <li key={sp.name} style={{ ['--d' as string]: `${i * 40}ms` }}>
                                            <span className="sp-sports__icon"><SportIcon name={sp.icon} /></span>
                                            <b>{sp.name}</b>
                                            <span className="sp-sports__kind">{sp.kind}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </section>

                {/* 4 · Opinions */}
                <section id="opinions" className="sp-section">
                    <Head no={3} kicker="Still writing" title="What I think" />
                    <div className="sp-soon">
                        <div className="sp-soon__card">
                            <span className="sp-doc__title"><MessageSquareQuote size={18} aria-hidden="true" /> Opinions</span>
                            <p>Views on software, work and life, in my own words.</p>
                            <span className="sp-soon__tag"><Compass size={13} aria-hidden="true" /> Coming soon</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
