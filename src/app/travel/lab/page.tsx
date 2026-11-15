import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Caveat, Fredoka } from 'next/font/google';
import TravelLab from '@/components/travel/lab/TravelLab';

const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--lab-round', display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], weight: ['500', '700'], variable: '--lab-hand', display: 'swap' });

export const metadata: Metadata = {
    title: 'Travel lab · Trupal Patel',
    robots: { index: false },
};

export default function Page() {
    return (
        <div className={`${fredoka.variable} ${caveat.variable}`}>
            <Suspense fallback={null}>
                <TravelLab />
            </Suspense>
        </div>
    );
}
