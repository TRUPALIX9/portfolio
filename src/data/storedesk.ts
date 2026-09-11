/** Content for the StoreDesk product page (/products/storedesk). The product's own site is storedesk.net. */

export const STOREDESK = {
    name: 'StoreDesk',
    tagline: 'A local-first back office for convenience stores and gas stations.',
    summary:
        'StoreDesk plugs into the Verifone Commander register a store already runs, pulls in the full price book, and puts live cost, margin and sales data on the back-office PC, a phone scanner and the web. The store floor keeps working when the internet drops.',
    siteUrl: 'https://storedesk.net',
    siteLabel: 'storedesk.net',
    githubUrl: 'https://github.com/TRUPALIX9/StoreDesk',
    logo: '/storedesk_logo.svg',
    icon: '/storedesk_icon.svg',
    architectureImage: '/projects/storedesk_architecture.svg',
    release: 'v0.0.4 · Windows installer and Android APK',
} as const;

export type StoreDeskHighlight = { value: string; label: string };

export const HIGHLIGHTS: StoreDeskHighlight[] = [
    { value: '5', label: 'Modules across edge, desktop, mobile, web and cloud' },
    { value: '10,000+', label: 'PLUs seeded straight from the register' },
    { value: '<100 ms', label: 'Barcode price and margin lookups' },
    { value: 'Offline', label: 'The store floor keeps running when the ISP drops' },
];

export type StoreDeskModule = { name: string; platform: string; description: string };

export const MODULES: StoreDeskModule[] = [
    {
        name: 'Worker',
        platform: 'Store edge node',
        description: 'Runs on the store network next to the Verifone Commander. Seeds the PLU catalog over NAXML into a local MongoDB and keeps working through internet outages.',
    },
    {
        name: 'Desktop',
        platform: 'Windows · Electron',
        description: 'The back-office command center: Price Book, Cost Analysis, POS Sales and Vendor Review, read straight from the local Worker.',
    },
    {
        name: 'Mobile',
        platform: 'Android · Flutter',
        description: 'Scan any shelf barcode for live cost, margin and retail price in under 100 ms.',
    },
    {
        name: 'Web',
        platform: 'Cloud dashboard · Next.js',
        description: 'Multi-store margins, vendor costs and automated Google Sheets sales reports. Issues the Setup Keys that pair each device.',
    },
    {
        name: 'Cloud Hub',
        platform: 'Google Cloud',
        description: 'A WebSocket relay that lets the scanner and dashboard reach the store without the store network accepting inbound connections.',
    },
];

export const HOW_IT_WORKS: string[] = [
    'Install StoreDesk Desktop on the back-office PC and activate it with a Setup Key from StoreDesk Web.',
    'The Worker seeds the full price book (10,000+ PLUs) from the Verifone Commander over NAXML into a local database.',
    'Staff scan shelf barcodes with StoreDesk Mobile and see live cost, margin and retail price.',
    'Owners review margins, vendor costs and automated sales reports from StoreDesk Web, across every store.',
];

export const INTEGRATION =
    'StoreDesk is five Git submodules that meet on two paths. Inside the store, StoreDesk Worker pulls the PLU catalog from the Verifone Commander over NAXML into a local MongoDB, and the Electron Desktop UI reads from it directly. Outside the store, the Cloud Hub on Google Cloud relays WebSocket traffic, so the Flutter scanner and the Next.js dashboard can reach the Worker without the store network accepting inbound connections. Devices are paired with Setup Keys issued from StoreDesk Web.';

export type StoreDeskDecision = { title: string; problem: string; resolution: string };

export const DECISIONS: StoreDeskDecision[] = [
    {
        title: 'The internet could not be a dependency',
        problem: 'A cloud-first design would stop a store the moment its ISP dropped, which is exactly when a register still has to ring up sales.',
        resolution: 'Made the Worker local-first on the store edge network, with MongoDB persisted to disk. The cloud only adds reach, it never gates the store floor.',
    },
    {
        title: '15 MB XML dumps on every sync',
        problem: 'Full NAXML catalog exports were far too heavy to push to the cloud repeatedly over store connections.',
        resolution: 'Replaced full uploads with MD5 delta-hash synchronization, so only records that actually changed leave the store.',
    },
    {
        title: 'Price checks had to feel instant',
        problem: 'Staff scanning a shelf will not wait on a slow round trip for cost and margin.',
        resolution: 'Routed scanner lookups over a persistent WebSocket relay to the Worker, bringing lookups under 100 ms.',
    },
];

export type StoreDeskMilestone = { title: string; detail: string };

export const SHIPPED: StoreDeskMilestone[] = [
    { title: 'Worker: NAXML integration', detail: 'Bulk XML PLU auto-seeding with local MongoDB disk resilience.' },
    { title: 'Cloud Hub: WebSocket relay', detail: 'Sub-100 ms lookups connecting StoreDesk Mobile with the Worker.' },
    { title: 'Desktop UI and Web admin', detail: 'Back-office Electron control room and a Next.js multi-store dashboard.' },
    { title: 'Multi-platform release (v0.0.4)', detail: 'Windows .exe installer and Android .apk published on GitHub Releases.' },
];

export const NEXT_UP: string[] = [
    'POS connectors for Gilbarco Passport and Wayne Nucleus registers.',
    'AI-driven vendor invoice OCR in StoreDesk Web.',
    'Multi-store inventory transfers in StoreDesk Web.',
];

export const TECH = [
    { name: 'Electron', icon: 'devicon-electron-original colored' },
    { name: 'React', icon: 'devicon-react-original colored' },
    { name: 'TypeScript', icon: 'devicon-typescript-plain colored' },
    { name: 'Node.js', icon: 'devicon-nodejs-plain colored' },
    { name: 'Flutter', icon: 'devicon-flutter-plain colored' },
    { name: 'MongoDB', icon: 'devicon-mongodb-plain colored' },
    { name: 'Next.js', icon: 'devicon-nextjs-plain' },
    { name: 'Google Cloud', icon: 'devicon-googlecloud-plain colored' },
];
