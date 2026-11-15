import type { Metadata } from 'next';
import FlightLog from '@/components/travel/FlightLog';

export const metadata: Metadata = {
    title: 'Travel · Trupal Patel',
    description: 'Countries, states and places Trupal Patel has been to, on a 3D globe.',
    robots: { index: false },
};

export default function Page() {
    return <FlightLog />;
}
