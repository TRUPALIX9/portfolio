import type { Metadata } from 'next';
import { Caveat, Fredoka } from 'next/font/google';
import StickerTravel from '@/components/travel/StickerTravel';

const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--lab-round', display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], weight: ['500', '700'], variable: '--lab-hand', display: 'swap' });

export const metadata: Metadata = {
    title: 'Travel · Trupal Patel',
    description: 'A sticker album of the countries, states and places Trupal Patel has been to.',
    alternates: { canonical: '/travel' },
};

export default function TravelPage() {
    return (
        <div className={`${fredoka.variable} ${caveat.variable}`}>
            <StickerTravel />
        </div>
    );
}
