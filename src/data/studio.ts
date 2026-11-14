/**
 * True or False (trueorfalse.dev), the software studio Trupal is a member of.
 * The studio site is the source of truth for every product; this file only mirrors enough of it
 * to show the family tree on the portfolio. Keep counts in step with https://trueorfalse.dev/llms.txt.
 */

export const STUDIO = {
    name: 'True or False',
    wordmark: ['true', 'false'] as const,
    url: 'https://trueorfalse.dev',
    email: 'hello@trueorfalse.dev',
    motto: ['Every idea starts false.', 'We ship it true.'] as const,
    pitch: 'A small software studio. We build mobile apps, web products and websites, ship them, and keep them running.',
    platforms: ['iOS', 'Android', 'Windows', 'Web'],
};

export type StudioNode = {
    id: string;
    /** Path segment shown in the tree. */
    path: string;
    name: string;
    group: 'products' | 'websites' | 'projects';
    /** true = live in the wild, false = still compiling. */
    live: boolean;
    tagline: string;
    summary: string;
    points: string[];
    platforms: string;
    stack: string[];
    links: { label: string; href: string }[];
    /** Small badge, e.g. "new" or "MCP". */
    badge?: string;
};

export const STUDIO_TREE: StudioNode[] = [
    {
        id: 'skills',
        path: 'skills.',
        name: 'Skills & Agents',
        group: 'products',
        live: true,
        badge: 'MCP',
        tagline: 'Agent skills you can search, map and take with you.',
        summary:
            'A catalog of agent skills, subagents and workflows plus the MCP servers worth installing. Each card says what it does and when to use it; the cart pulls in dependencies and checkout hands you a zip for Claude Code, Claude.ai, Codex or ChatGPT, with the source, license and changes for every item.',
        points: [
            '55 skills, subagents and workflows written in-house, 48 more from 17 companies, pinned and licensed',
            '31 MCP servers with install lines, auth notes and licenses',
            'A skills map and starter packs: solo dev, small team, mobile, data, security',
            'Its own remote MCP server, read-only and no auth, so agents can query the catalog directly',
        ],
        platforms: 'Web · MCP',
        stack: ['Next.js', 'TypeScript', 'MCP'],
        links: [
            { label: 'skills.trueorfalse.dev', href: 'https://skills.trueorfalse.dev' },
            { label: 'MCP servers', href: 'https://skills.trueorfalse.dev/mcp' },
        ],
    },
    {
        id: 'logicsprint',
        path: 'logicsprint.',
        name: 'LogicSprint',
        group: 'products',
        live: true,
        tagline: 'Four quick games. One more round.',
        summary:
            'A free brain-training game for iPhone and Android: Rocket Launch, Memory Lane, Quick Math and Guess Color. Every run gets harder until your first mistake, and each game has a daily global Top 10. No sign-up, no login.',
        points: [
            'Live on the App Store and Google Play',
            'Anonymous per-device accounts power a daily global Top 10 per game and difficulty',
            'Up to three revives per run with hearts or a short video',
            'Product site with playable in-browser demos and live stats',
        ],
        platforms: 'iOS · Android',
        stack: ['Flutter', 'Dart', 'Supabase', 'AdMob'],
        links: [
            { label: 'logicsprint.trueorfalse.dev', href: 'https://logicsprint.trueorfalse.dev' },
            { label: 'Get the app', href: 'https://logicsprint.trueorfalse.dev/download' },
        ],
    },
    {
        id: 'family',
        path: 'family.',
        name: 'Family Tree',
        group: 'products',
        live: true,
        badge: 'new',
        tagline: 'Build the family tree together.',
        summary:
            'A private family tree that relatives build together: an expandable tree, profiles with photos, upcoming birthdays and anniversaries, view-only share links, and suggestions that family managers review. Relationship names show in Gujarati too.',
        points: [
            'Viewer, manager and admin roles; managers review suggested edits',
            'Email sign-in with a 6-digit code, no passwords',
            'GEDCOM import from MyHeritage and private photo storage',
            'Many families on one app, each tree private to its members',
        ],
        platforms: 'Web',
        stack: ['TypeScript', 'Cloudflare Workers'],
        links: [{ label: 'family.trueorfalse.dev', href: 'https://family.trueorfalse.dev' }],
    },
    {
        id: 'contact-convoy',
        path: 'contactconvoy.com',
        name: 'Contact Convoy',
        group: 'products',
        live: true,
        tagline: 'Business cards in, follow-ups out.',
        summary:
            'Salespeople scan visiting cards at exhibitions and meetings. AI tidies the details and every lead lands in one list with its event, stall and follow-up status. Priced per company, not per person.',
        points: [
            'Scan a card and AI cleans up the fields',
            'Hot, Warm, Cold and Done follow-up board',
            'Admins see the whole company, employees see their own',
            "Hand a leaver's cards to a colleague in one step",
        ],
        platforms: 'Android · Web',
        stack: ['Flutter', 'Gemini', 'Node.js', 'MongoDB', 'Cloud Run'],
        links: [
            { label: 'contactconvoy.com', href: 'https://www.contactconvoy.com' },
            { label: 'Studio page', href: 'https://trueorfalse.dev/products/contact-convoy' },
        ],
    },
    {
        id: 'storedesk',
        path: 'storedesk.net',
        name: 'StoreDesk',
        group: 'products',
        live: true,
        tagline: 'The back office for convenience stores and gas stations.',
        summary:
            "Runs on the store's own PC and talks to the register directly. Track every vendor's cost, see the margin on every item, watch fuel prices, and let staff scan barcodes anywhere on the floor. Keeps working when the internet is down.",
        points: [
            'Five modules: in-store worker, Windows app, Android scanner, web dashboard, cloud relay',
            'Seeds 10,000+ items straight from the Verifone Commander register',
            'Barcode price and margin lookups in under 100 ms',
            'Local-first: syncs only what changed, keeps running offline',
        ],
        platforms: 'Windows · Android · Web',
        stack: ['Electron', 'React', 'Node.js', 'Flutter', 'MongoDB', 'Google Cloud'],
        links: [
            { label: 'storedesk.net', href: 'https://storedesk.net' },
            { label: 'Studio page', href: 'https://trueorfalse.dev/products/storedesk' },
        ],
    },
    {
        id: 'dr-nandini',
        path: 'drnandini.com',
        name: 'Dr. Nandini Jansari',
        group: 'websites',
        live: true,
        tagline: 'Home-visit physiotherapy, Ahmedabad.',
        summary:
            'A patient-facing site with a scroll-driven 3D anatomy explorer, 39 condition pages, verified reviews and WhatsApp-first booking, plus an admin panel the clinic runs itself.',
        points: ['3D anatomy explorer', '39 condition pages', 'WhatsApp booking and admin panel'],
        platforms: 'Web',
        stack: ['Next.js', 'Three.js', 'MongoDB'],
        links: [
            { label: 'drnandini.com', href: 'https://www.drnandini.com' },
            { label: 'Studio page', href: 'https://trueorfalse.dev/websites/dr-nandini' },
        ],
    },
    {
        id: 'meghvin',
        path: 'meghvin',
        name: 'MeghVin Foundation',
        group: 'websites',
        live: true,
        tagline: 'Charitable trust, Ahmedabad and Navi Mumbai.',
        summary:
            'Site and content studio for a community kitchen, tree plantation and health awareness work, so the trust can post updates without a developer.',
        points: ['Built-in content studio', 'Community kitchen, plantation and health programs'],
        platforms: 'Web',
        stack: ['Next.js', 'MongoDB', 'Three.js', 'Cloudinary'],
        links: [
            { label: 'meghvin.vercel.app', href: 'https://meghvin.vercel.app' },
            { label: 'Studio page', href: 'https://trueorfalse.dev/websites/meghvin' },
        ],
    },
    {
        id: 'nyara',
        path: 'nyara',
        name: 'Nyara Melamine',
        group: 'websites',
        live: true,
        tagline: 'Melamine houseware catalogue, Gujarat.',
        summary:
            'Catalogue and lead site with a built-in admin. Visitors request quotes through WhatsApp and an enquiry form.',
        points: ['Product catalogue with admin', 'WhatsApp and form enquiries'],
        platforms: 'Web',
        stack: ['TypeScript', 'Cloudflare Workers'],
        links: [{ label: 'Studio page', href: 'https://trueorfalse.dev/websites/nyara' }],
    },
    {
        id: 'web-warehouse',
        path: 'web-warehouse',
        name: 'Web Warehouse',
        group: 'projects',
        live: false,
        tagline: 'Inventory, slots and purchase orders.',
        summary:
            'Track stock, lay out warehouse slots in 3D, and run supplier and vendor purchase orders with pallet estimates.',
        points: ['3D slot layout', 'Supplier and vendor purchase orders', 'Pallet estimates'],
        platforms: 'Web',
        stack: ['Next.js', 'MUI', 'MongoDB', 'Three.js'],
        links: [
            { label: 'Case study', href: '/projects/web-warehouse' },
            { label: 'Studio page', href: 'https://trueorfalse.dev/projects/web-warehouse' },
        ],
    },
    {
        id: 'shipping-agent',
        path: 'shipping-agent',
        name: 'Shipping Agent',
        group: 'projects',
        live: false,
        tagline: 'Paste an order. Get a label.',
        summary:
            'An AI assistant reads an order, quotes every carrier through ShipStation, and walks through checkout to a printable label.',
        points: ['Reads free-text orders', 'Quotes every carrier', 'Checkout to a printable label'],
        platforms: 'Web',
        stack: ['Python', 'Streamlit', 'ShipStation API'],
        links: [
            { label: 'Case study', href: '/projects/shipping-agent' },
            { label: 'Studio page', href: 'https://trueorfalse.dev/projects/shipping-agent' },
        ],
    },
];

export const STUDIO_GROUPS: { id: StudioNode['group']; label: string; note: string }[] = [
    { id: 'products', label: 'products/', note: 'live: true' },
    { id: 'websites', label: 'websites/', note: 'for clients' },
    { id: 'projects', label: 'projects/', note: 'live: false' },
];

/** The Skills & Agents MCP server: remote, read-only, no auth. */
export const SKILLS_MCP = {
    url: 'https://skills.trueorfalse.dev/api/mcp',
    install: 'claude mcp add --transport http tf-skills https://skills.trueorfalse.dev/api/mcp',
    tools: [
        'search_skills',
        'get_skill',
        'skills_map',
        'get_install_files',
        'list_mcp_servers',
        'list_stacks',
        'get_stack',
        'search_packages',
    ],
    stats: [
        { value: 55, label: 'skills written in-house' },
        { value: 48, label: 'from 17 companies' },
        { value: 31, label: 'MCP servers' },
        { value: 18, label: 'stack guides' },
    ],
};
