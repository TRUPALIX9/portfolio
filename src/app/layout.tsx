import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BehavioralTracker from '../components/BehavioralTracker';
import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Trupal Patel (True Pal) | Staff Frontend Architect & Software Engineer',
    description: 'Portfolio of Trupal Patel (True Pal) — High-performance web applications, edge POS systems, and AI data pipelines.',
    keywords: 'True Pal, TruePal, Trupal Patel, Frontend Architect, Software Engineer, React, Next.js, AI, Edge POS, Web Development',
    openGraph: {
        title: 'Trupal Patel (True Pal) | Software Engineer',
        description: 'Portfolio of Trupal Patel (True Pal) — High-performance web applications, edge POS systems, and AI data pipelines.',
        url: 'https://true-pal.vercel.app',
        siteName: 'Trupal Patel Portfolio',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Trupal Patel | Software Engineer',
        description: 'Portfolio of Trupal Patel — High-performance web applications, edge POS systems, and AI data pipelines.',
    },
    verification: {
        google: 'gVvu39FUFxE1mWGP9DfVIPF9C8-cy48MZIyEV02CQHY',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />
            </head>
            <body>
                <Navbar />
                {children}
                <Footer />
                <BehavioralTracker />
                <GoogleAnalytics gaId="G-XXXXXXXXXX" />
            </body>
        </html>
    );
}
