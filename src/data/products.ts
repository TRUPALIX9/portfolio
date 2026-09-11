import { APP } from '@/data/logicsprint';
import { LOGICSPRINT_URL } from '@/data/site';

/**
 * Software shipped to real users. Each gets a one-section summary at /products/[slug]; the full
 * story lives on the product's own site. Portfolio work stays in projects.ts.
 */
export type Product = {
    slug: string;
    name: string;
    /** Category and platforms, shown above the name. */
    kicker: string;
    tagline: string;
    summary: string;
    highlights: string[];
    platform: string;
    /** Release state. */
    status: string;
    /** The product's own home on the web. */
    site: { url: string; label: string };
    tech: { name: string; icon: string }[];
    /** Link-preview image; defaults to the portfolio card. */
    previewImage?: { url: string; width: number; height: number };
    /** Square app icon shown next to the name. */
    icon: string;
    image: string;
    /** Logos are shown whole on a plain surface; artwork fills the frame. */
    imageIsLogo?: boolean;
};

export const products: Product[] = [
    {
        slug: 'storedesk',
        name: 'StoreDesk',
        kicker: 'Retail operations · Windows, Android, Web',
        tagline: 'A local-first back office for convenience stores and gas stations.',
        summary:
            'StoreDesk plugs into the Verifone Commander register a store already runs, pulls in the full price book, and puts live cost, margin and sales data on the back-office PC, a phone scanner and the web. The store floor keeps working when the internet drops.',
        highlights: [
            'Five modules: an in-store Worker, a Windows desktop app, an Android scanner, a web dashboard and a Google Cloud relay.',
            'Seeds 10,000+ PLUs straight from the Verifone Commander over NAXML.',
            'Barcode price and margin lookups in under 100 ms.',
            'Local-first: syncs only changed records, and the store keeps running offline.',
        ],
        platform: 'Windows · Android · Web',
        status: 'v0.0.4 released',
        site: { url: 'https://storedesk.net', label: 'storedesk.net' },
        tech: [
            { name: 'Electron', icon: 'devicon-electron-original colored' },
            { name: 'React', icon: 'devicon-react-original colored' },
            { name: 'TypeScript', icon: 'devicon-typescript-plain colored' },
            { name: 'Node.js', icon: 'devicon-nodejs-plain colored' },
            { name: 'Flutter', icon: 'devicon-flutter-plain colored' },
            { name: 'MongoDB', icon: 'devicon-mongodb-plain colored' },
            { name: 'Next.js', icon: 'devicon-nextjs-plain' },
            { name: 'Google Cloud', icon: 'devicon-googlecloud-plain colored' },
        ],
        icon: '/storedesk_icon.svg',
        image: '/storedesk_logo.svg',
        imageIsLogo: true,
    },
    {
        slug: 'logicsprint',
        name: APP.name,
        kicker: 'Brain games · Android',
        tagline: APP.tagline,
        summary:
            'An Android app with four endless brain games (Rocket Launch, Memory Lane, Quick Math and Guess Color) where your first mistake ends the run. Every game and difficulty has a global Top 10, backed by an anonymous Supabase account per device, so there is no login.',
        highlights: [
            'Four games, each training one skill: reflex, memory, arithmetic and focus.',
            'Global Top 10 per game and difficulty, with anonymous per-device accounts.',
            'Optional rewarded ad for one extra life per run.',
            'Live, read-only game stats and leaderboards on the product site.',
        ],
        platform: 'Android',
        status: 'Test build · Google Play soon',
        site: { url: LOGICSPRINT_URL, label: 'logicsprint.trupalpatel.com' },
        previewImage: { url: APP.featureGraphic, width: 1024, height: 500 },
        tech: [
            { name: 'Flutter', icon: 'devicon-flutter-plain colored' },
            { name: 'Dart', icon: 'devicon-dart-plain colored' },
            { name: 'Supabase', icon: 'devicon-supabase-plain colored' },
        ],
        icon: APP.icon,
        image: APP.featureGraphic,
    },
];
