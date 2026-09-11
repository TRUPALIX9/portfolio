import './logicsprint.css';
import type { Metadata } from 'next';
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
 * LogicSprint product section. The portfolio navbar and footer stay (root layout);
 * everything inside uses the app's own look. No analytics run under this route
 * (see SiteAnalytics).
 */
export default function LogicSprintLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`ls-root ${rajdhani.variable} ${plex.variable} ${jetbrains.variable}`}>
            {children}
        </div>
    );
}
