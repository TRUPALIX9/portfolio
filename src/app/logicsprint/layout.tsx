import './logicsprint.css';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { SITE_URL } from '@/data/site';
import { IBM_Plex_Sans, JetBrains_Mono, Rajdhani } from 'next/font/google';

// Google Fonts, self-hosted by next/font: no requests to Google from these pages.
const rajdhani = Rajdhani({ subsets: ['latin'], weight: '700', display: 'swap', variable: '--font-rajdhani' });
const plex = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap', variable: '--font-plex' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['500', '700'], display: 'swap', variable: '--font-jetbrains' });

export const metadata: Metadata = {
    icons: {
        icon: [{ url: '/logicsprint/icon.png', type: 'image/png', sizes: '512x512' }],
        apple: [{ url: '/logicsprint/icon.png', sizes: '512x512', type: 'image/png' }],
    },
};

/**
 * LogicSprint product section. Inside the portfolio the portfolio navbar and footer stay
 * (root layout); on logicsprint.* they're hidden and the product top bar below takes over.
 * Everything inside uses the app's own look. No analytics run under this route (see SiteAnalytics).
 */
export default function LogicSprintLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`ls-root ${rajdhani.variable} ${plex.variable} ${jetbrains.variable}`}>
            <header className="ls-topbar ls-on-subdomain">
                <div className="ls-container ls-topbar-inner">
                    <Link href="/" className="ls-topbar-brand ls-heading" aria-label="LogicSprint home">
                        <Image src="/logicsprint/icon.png" alt="" width={32} height={32} />
                        <span>Logic<span style={{ color: 'var(--ls-teal)' }}>Sprint</span></span>
                    </Link>
                    <a href={SITE_URL} target="_blank" rel="noopener" className="ls-label ls-topbar-link">
                        <span><span className="ls-topbar-long">Developer </span>portfolio</span>
                        <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                </div>
            </header>
            {children}
        </div>
    );
}
