import './logicsprint.css';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { IBM_Plex_Sans, JetBrains_Mono, Rajdhani } from 'next/font/google';
import { ArrowUpRight } from 'lucide-react';
import { APP } from '@/data/logicsprint';
import { SITE_URL } from '@/data/site';

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

/** Home page sections, linked from the top bar and the footer (work from /privacy too). */
const SECTIONS = [
    { href: '/#games', label: 'Games' },
    { href: '/#how', label: 'How it works' },
    { href: '/#leaderboard', label: 'Leaderboard' },
    { href: '/#screenshots', label: 'Screenshots' },
    { href: '/#faq', label: 'FAQ' },
];

/**
 * LogicSprint product site, served only on logicsprint.* (src/proxy.ts sends /logicsprint on the
 * portfolio there). The root layout's data-site flag hides the portfolio navbar and footer; this
 * layout supplies the product's own top bar and footer. No analytics run here (see SiteAnalytics).
 */
export default function LogicSprintLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`ls-root ${rajdhani.variable} ${plex.variable} ${jetbrains.variable}`}>
            <header className="ls-topbar">
                <div className="ls-container ls-topbar-inner">
                    <Link href="/" className="ls-topbar-brand ls-heading" aria-label="LogicSprint home">
                        <Image src={APP.icon} alt="" width={32} height={32} />
                        <span>Logic<span style={{ color: 'var(--ls-teal)' }}>Sprint</span></span>
                    </Link>
                    <nav aria-label="Sections" className="ls-topbar-nav">
                        {SECTIONS.map((section) => (
                            <Link key={section.href} href={section.href} className="ls-label">{section.label}</Link>
                        ))}
                    </nav>
                    <a href={SITE_URL} target="_blank" rel="noopener" className="ls-label ls-topbar-link">
                        <span><span className="ls-topbar-long">Developer </span>portfolio</span>
                        <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                </div>
            </header>

            {children}

            <footer className="ls-footer">
                <div className="ls-container">
                    <div className="ls-footer-grid">
                        <div>
                            <p className="ls-heading" style={{ fontSize: '1.75rem' }}>
                                Logic<span style={{ color: 'var(--ls-teal)' }}>Sprint</span>
                            </p>
                            <p className="ls-muted" style={{ marginTop: '0.6rem', maxWidth: '36ch' }}>{APP.tagline}</p>
                        </div>
                        <nav aria-label="Explore">
                            <p className="ls-label">Explore</p>
                            <ul className="ls-footer-links">
                                {SECTIONS.map((section) => (
                                    <li key={section.href}><Link href={section.href} className="ls-link">{section.label}</Link></li>
                                ))}
                            </ul>
                        </nav>
                        <div>
                            <p className="ls-label">Support</p>
                            <ul className="ls-footer-links">
                                <li><a href={`mailto:${APP.supportEmail}`} className="ls-link">{APP.supportEmail}</a></li>
                                <li><Link href="/privacy" className="ls-link">Privacy policy</Link></li>
                                <li><a href={APP.apkUrl} className="ls-link">Download APK</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="ls-footer-bottom">
                        <span>© {new Date().getFullYear()} LogicSprint · Contains ads</span>
                        <span>
                            Built by <a href={SITE_URL} target="_blank" rel="noopener" className="ls-link">Trupal Patel</a>
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
