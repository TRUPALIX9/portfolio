import Image from 'next/image';
import Link from 'next/link';
import { LinkedinIcon, socialLinks, type SocialLink } from '@/data/site-config';
import './social.css';

const VW = 1000, VH = 600;

const LINKEDIN: SocialLink = {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/trupalix',
    icon: <LinkedinIcon size={22} />,
    color: '#0a66c2',
    handle: 'in/trupalix',
    blurb: '',
    cta: 'Open LinkedIn',
};

const WORK = ['LinkedIn', 'GitHub', 'Email', 'Mobile', 'WhatsApp'];
const LIFE = ['Instagram', 'Snapchat', 'BeReal', 'Discord'];

const all = [LINKEDIN, ...socialLinks];
const pick = (names: string[]) => names.map((n) => all.find((s) => s.name === n)).filter((s): s is SocialLink => !!s);

/** Hub in the middle; Work fans out to the left, Life to the right. Card positions in a 1000×600 canvas. */
const HUB = { x: 400, y: 190, w: 200, h: 220 };
const CARD = { w: 220, h: 64 };
const column = (n: number, x: number) => Array.from({ length: n }, (_, i) => ({ x, y: VH / 2 - ((n - 1) * 92) / 2 + i * 92 - CARD.h / 2 }));

function wire(fromLeft: boolean, card: { x: number; y: number }) {
    const hx = fromLeft ? HUB.x : HUB.x + HUB.w;
    const hy = HUB.y + HUB.h / 2;
    const cx = fromLeft ? card.x + CARD.w : card.x;
    const cy = card.y + CARD.h / 2;
    const mx = (hx + cx) / 2;
    return `M ${hx} ${hy} C ${mx} ${hy}, ${mx} ${cy}, ${cx} ${cy}`;
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const ext = (url: string) => (url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {});

function Card({ s, pos, i, side }: { s: SocialLink; pos: { x: number; y: number }; i: number; side: 'work' | 'life' }) {
    return (
        <a
            href={s.url}
            {...ext(s.url)}
            className="so-card"
            data-side={side}
            style={{ left: pct(pos.x, VW), top: pct(pos.y, VH), width: pct(CARD.w, VW), height: pct(CARD.h, VH), ['--c' as string]: s.color, ['--d' as string]: `${300 + i * 90}ms` }}
        >
            <span className="so-card__icon" aria-hidden="true">{s.icon}</span>
            <span className="so-card__text"><b>{s.name}</b><small>{s.handle}</small></span>
            <span className="so-card__go" aria-hidden="true">↗</span>
        </a>
    );
}

/** Link-in-bio as a system diagram: one hub, arrows flowing out to every account. */
export default function SocialFlow({ standalone = false }: { standalone?: boolean }) {
    const work = pick(WORK), life = pick(LIFE);
    const workPos = column(work.length, 40);
    const lifePos = column(life.length, VW - 40 - CARD.w);

    return (
        <main className="so" data-standalone={String(standalone)}>
            <div className="so-canvas">
                <span className="so-tag so-tag--work">Work</span>
                <span className="so-tag so-tag--life">Life</span>

                <svg viewBox={`0 0 ${VW} ${VH}`} className="so-wires" aria-hidden="true">
                    <defs>
                        <marker id="soArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                            <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
                        </marker>
                    </defs>
                    {[...work.map((s, i) => ({ s, d: wire(true, workPos[i]) })), ...life.map((s, i) => ({ s, d: wire(false, lifePos[i]) }))].map(({ s, d }, i) => (
                        <g key={s.name} className="so-wire" style={{ color: s.color === '#f5f5f5' || s.color === '#f5f5f4' || s.color === '#FFFC00' ? '#1d1d1d' : s.color }}>
                            <path d={d} className="so-wire__line" markerEnd="url(#soArrow)" />
                            <path d={d} className="so-wire__flow" style={{ animationDelay: `${-i * 0.3}s` }} />
                            <circle r={4} className="so-wire__dot">
                                <animateMotion dur={`${2 + (i % 3) * 0.4}s`} begin={`${i * 0.25}s`} repeatCount="indefinite" path={d} />
                            </circle>
                        </g>
                    ))}
                </svg>

                <div className="so-hub" style={{ left: pct(HUB.x, VW), top: pct(HUB.y, VH), width: pct(HUB.w, VW), height: pct(HUB.h, VH) }}>
                    <div className="so-hub__photo">
                        <Image src="/social.jpeg" alt="Trupal Patel" fill sizes="120px" style={{ objectFit: 'cover', objectPosition: '50% 40%' }} priority />
                    </div>
                    <b className="so-hub__name"><Image src="/logo-penrose.png" alt="" width={18} height={18} /> Trupal Patel</b>
                    <small>Human</small>
                </div>

                {work.map((s, i) => <Card key={s.name} s={s} pos={workPos[i]} i={i} side="work" />)}
                {life.map((s, i) => <Card key={s.name} s={s} pos={lifePos[i]} i={i + work.length} side="life" />)}

                <span className="so-fig">FIG. 1 · ROUTING TABLE</span>
            </div>

            <p className="so-foot">
                <Link href="/">trupalpatel.com</Link> · <Link href="/about">About me</Link> · <Link href="/travel">Travel</Link> · <Link href="/binge">Binge</Link>
            </p>
        </main>
    );
}
