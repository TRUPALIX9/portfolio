import Image from 'next/image';
import Link from 'next/link';
import { Caveat, Fredoka } from 'next/font/google';
import BingeButton from '@/components/binge/BingeButton';
import { STICKER_PATHS } from '@/data/travel-stickers';
import { COUNTRIES } from '@/data/travel';
import { INK } from '@/components/travel/lab/shared';
import { TOTAL_REGIONS } from '@/components/travel/geo';

const round = Fredoka({ subsets: ['latin'], weight: ['500', '600'], variable: '--rd-round', display: 'swap' });
const hand = Caveat({ subsets: ['latin'], weight: ['600'], variable: '--rd-hand', display: 'swap' });

/** Where each sticker sits on the little travel card: [x, y, size, tilt]. */
const STICKERS: [string, number, number, number, number][] = [
    ['United States', 6, 20, 96, -8],
    ['Canada', 70, 2, 72, 6],
    ['India', 150, 28, 88, -4],
    ['Nepal', 210, 6, 34, 10],
    ['Australia', 218, 62, 78, 7],
];

/** Related documents: each card dressed in the look of the page it opens. */
export default function RelatedDocs() {
    return (
        <div className={`rd ${round.variable} ${hand.variable}`}>
            {/* About: cream paper, a polaroid, round type */}
            <Link href="/about" className="rd-card rd-about">
                <span className="rd-no">DOC-01 · PERSONAL</span>
                <div className="rd-about__polaroid">
                    <div className="rd-about__img"><Image src="/social.jpeg" alt="" fill sizes="96px" style={{ objectFit: 'cover', objectPosition: '50% 44%' }} /></div>
                    <span>me ✌</span>
                </div>
                <h3>Hi, I’m <em>Trupal.</em></h3>
                <p>Adventures, sports and what I think, away from the datasheet.</p>
                <span className="rd-go">Say hi →</span>
            </Link>

            {/* Binge: the dark TV screen */}
            <div className="rd-card rd-binge">
                <span className="rd-no">DOC-02 · WATCH LOG</span>
                <div className="rd-binge__screen" aria-hidden="true">
                    <span className="rd-binge__scan" />
                    <span className="rd-binge__live"><i />Now playing</span>
                    <span className="rd-binge__ch">CH 02</span>
                    <b>BINGE</b>
                    <small>season by season</small>
                    <span className="rd-binge__bar"><i /></span>
                </div>
                <p>Series and films I’ve watched, with a Marvel timeline. Suggestions welcome.</p>
                <BingeButton />
            </div>

            {/* Travel: sea blue, glossy country stickers */}
            <Link href="/travel" className="rd-card rd-travel">
                <span className="rd-no">DOC-03 · TRAVEL</span>
                <svg viewBox="0 0 300 150" className="rd-travel__map" aria-hidden="true">
                    <defs>
                        <filter id="rdLift" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1d2b4a" floodOpacity="0.3" /></filter>
                        <linearGradient id="rdGloss" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.5" /><stop offset="0.45" stopColor="#fff" stopOpacity="0" /></linearGradient>
                    </defs>
                    {STICKERS.map(([name, x, y, size, r]) => (
                        <g key={name} transform={`translate(${x} ${y}) rotate(${r} ${size / 2} ${size / 2}) scale(${size / 100})`} filter="url(#rdLift)" className="rd-travel__sticker">
                            <path d={STICKER_PATHS[name]} fill="#fff" stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
                            <path d={STICKER_PATHS[name]} fill={INK[name]} />
                            <path d={STICKER_PATHS[name]} fill="url(#rdGloss)" />
                        </g>
                    ))}
                </svg>
                <h3>{COUNTRIES.length} countries, {TOTAL_REGIONS} regions</h3>
                <p>A sticker map of where I’ve been. Tell me where to go next.</p>
                <span className="rd-go">Open the map →</span>
            </Link>
        </div>
    );
}
