import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SiteAnalytics from '../components/SiteAnalytics';
import MotionProvider from '../components/motion/MotionProvider';
import SpotlightTracker from '../components/motion/SpotlightTracker';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { SITE_URL } from '@/data/site';

// Self-hosted via next/font: replaces a render-blocking @import from fonts.googleapis.com.
const outfit = Outfit({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    display: 'swap',
    variable: '--font-outfit',
});

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: 'Trupal Patel (True Pal) | Software Engineer',
    description: 'Portfolio of Trupal Patel (True Pal) — High-performance web applications, edge POS systems, and AI data pipelines.',
    keywords: 'Trupal Patel, True Pal, TruePal, TrupalIX9, Trupal Patel Portfolio, Frontend Architect, Software Engineer, React, Next.js, AI, Edge POS, Web Development',
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
        title: 'Trupal Patel (True Pal) | Software Engineer',
        description: 'Portfolio of Trupal Patel (True Pal) — High-performance web applications, edge POS systems, and AI data pipelines.',
        url: SITE_URL,
        siteName: 'Trupal Patel Portfolio',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Trupal Patel (True Pal) | Software Engineer',
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
        // suppressHydrationWarning: the script below sets data-site on <html> before React hydrates.
        <html lang="en" className={outfit.variable} suppressHydrationWarning>
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
