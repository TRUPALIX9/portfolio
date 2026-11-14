import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Bangers, Bebas_Neue, Comic_Neue } from 'next/font/google';
import BingeApp from '@/components/binge/BingeApp';
import '@/components/binge/binge.css';

// Comic lettering for the Marvel comic-book view only; the streaming UI uses the site's Geist.
const bang = Bangers({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--bx-bang' });
// Marquee lettering for Movies mode.
const marquee = Bebas_Neue({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--bx-marquee' });
const comic = Comic_Neue({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', variable: '--bx-comic' });

export const metadata: Metadata = {
    title: 'Binge · TruePal',
    description: "Trupal Patel's watch list: series and films watched, in progress and on the list, plus every Marvel Studios release. Search any title and suggest what to watch next.",
    alternates: { canonical: '/binge' },
};

export default function BingePage() {
    return (
        <div className={`${bang.variable} ${comic.variable} ${marquee.variable}`}>
            <Suspense fallback={null}>
                <BingeApp />
            </Suspense>
        </div>
    );
}
