import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BehavioralTracker from '../components/BehavioralTracker';
import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'True Pal',
    description: 'Portfolio of Trupal Patel (True Pal) — High-performance web applications, edge POS systems, and AI data pipelines.',
    keywords: 'True Pal, TruePal, Trupal Patel, Frontend Architect, Software Engineer, React, Next.js, AI, Edge POS, Web Development',
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/favicon.svg', type: 'image/svg+xml' },
            { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
        ],
        apple: [
            { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
        other: [
            { rel: 'manifest', url: '/site.webmanifest' },
        ],
    },
    openGraph: {
        title: 'True Pal',
        description: 'Portfolio of Trupal Patel (True Pal) — High-performance web applications, edge POS systems, and AI data pipelines.',
        url: 'https://true-pal.vercel.app',
        siteName: 'Trupal Patel Portfolio',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'True Pal',
        description: 'Portfolio of Trupal Patel — High-performance web applications, edge POS systems, and AI data pipelines.',
    },
    verification: {
        google: 'ELm9u6dJOxQAaNx5-2-a8-u1wsPVVsjgEBJD9TDN3Jw',
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
