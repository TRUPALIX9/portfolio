import './globals.css';
import './spec.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SiteAnalytics from '../components/SiteAnalytics';
import MotionProvider from '../components/motion/MotionProvider';
import SpotlightTracker from '../components/motion/SpotlightTracker';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Fraunces, Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { SITE_URL } from '@/data/site';

// Self-hosted via next/font: replaces a render-blocking @import from fonts.googleapis.com.
const geist = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-geist-mono' });
// The home page is a datasheet set in IBM Plex. Fraunces and Newsreader are kept for the quiz page
// and the Moon Knight reveal.
const plex = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-plex' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap', variable: '--font-plex-mono' });
const display = Fraunces({ subsets: ['latin'], display: 'swap', variable: '--font-display', axes: ['opsz', 'SOFT', 'WONK'] });
const body = Newsreader({ subsets: ['latin'], display: 'swap', variable: '--font-body', style: ['normal', 'italic'] });

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: 'Trupal Patel · Software Development Engineer',
    description: 'Trupal Patel: software development engineer at Aetna (CVS Health) and member of trueorfalse.dev, the True or False studio behind Skills & Agents, LogicSprint, Family Tree, Contact Convoy and StoreDesk.',
    keywords: 'Trupal Patel, TrupalIX9, True or False, trueorfalse.dev, Aetna, CVS Health, utilization management, care management, BigQuery, Software Engineer, Skills & Agents, MCP, LogicSprint, StoreDesk, Contact Convoy, React, Next.js, Flutter',
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
        title: 'Trupal Patel · Software Development Engineer',
        description: 'Software Development Engineer at Aetna (CVS Health). Member of trueorfalse.dev.',
        url: SITE_URL,
        siteName: 'Trupal Patel Portfolio',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Trupal Patel · Software Development Engineer',
        description: 'Software Development Engineer at Aetna (CVS Health). Member of trueorfalse.dev.',
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
        // suppressHydrationWarning: the script below sets data-site on <html> before React hydrates.
        <html lang="en" className={`${geist.variable} ${geistMono.variable} ${display.variable} ${body.variable} ${plex.variable} ${plexMono.variable}`} suppressHydrationWarning>
            <head>
                {/* logicsprint.* is a standalone product site (src/proxy.ts): flag it before first
                    paint so the portfolio navbar/footer ([data-site-chrome]) never flash in. */}
                <script dangerouslySetInnerHTML={{ __html: "if(location.hostname.indexOf('logicsprint.')===0)document.documentElement.dataset.site='logicsprint'" }} />
                <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />
            </head>
            <body>
                <a href="#main-content" className="skip-link">Skip to content</a>
                <MotionProvider>
                    <Navbar />
                    <div id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
                        {children}
                    </div>
                    <Footer />
                </MotionProvider>
                {/* Visitor tracking + GA, skipped on analytics-free routes like /logicsprint */}
                <SiteAnalytics gaId={gaId} />
                <SpotlightTracker />
            </body>
        </html>
    );
}
