import master from './master.json';

/**
 * The day-job log shown on the home page. Aetna (CVS Health) is the current role; earlier roles come from
 * master.json, which also feeds the /experience/[slug] deep dives.
 */
export type CareerEntry = {
    company: string;
    role: string;
    period: string;
    url: string;
    summary: string;
    /** Deep-dive page, when there is one. */
    href?: string;
    current?: boolean;
};

// Current role: Aetna, a CVS Health company. Started Oct 2026.
export const CURRENT_JOB = {
    company: 'Aetna (CVS Health)',
    employer: 'Aetna',
    parent: 'CVS Health',
    role: 'Software Development Engineer',
    period: 'Oct 2026 – now',
    url: 'https://www.aetna.com',
    focus: 'Utilization management and care management, with BigQuery and AI',
};

const SUMMARIES: Record<string, string> = {
    allyvia: 'First engineer. Built the SaaS platform on GCP: React 19 front end, Django REST APIs, BigQuery pipelines that sync QuickBooks, Pub/Sub ingestion and RBAC.',
    'aivid-ai': 'Analytics apps and data pipelines running across 200+ production sites. Cut Elasticsearch query time by about 25%.',
};

export const CAREER: CareerEntry[] = [
    {
        company: CURRENT_JOB.company,
        role: CURRENT_JOB.role,
        period: CURRENT_JOB.period,
        url: CURRENT_JOB.url,
        summary: 'Cloud-native apps on GCP for utilization management and care management: BigQuery analytics and data pipelines, GenAI prototypes, and the APIs that connect them.',
        current: true,
    },
    ...master.experiences.map((exp) => ({
        company: exp.company.replace(' Pvt. Ltd.', ''),
        role: exp.role,
        period: exp.period,
        url: exp.url,
        summary: SUMMARIES[exp.slug] ?? exp.achievements[0],
        href: `/experience/${exp.slug}`,
    })),
];

/** Skill map: what I use, grouped by field, with where each group has shipped. */
export const SKILL_MAP: { field: string; skills: string[]; shipped: string }[] = [
    {
        field: 'Languages',
        skills: ['TypeScript', 'JavaScript', 'Python', 'Dart', 'Java', 'C#', 'C++', 'SQL'],
        shipped: 'Aetna, Allyvia, AIVID.AI, studio products',
    },
    {
        field: 'Front end & mobile',
        skills: ['React', 'Next.js', 'Angular', 'Redux Toolkit', 'Flutter', 'Three.js', 'Tailwind CSS'],
        shipped: 'LogicSprint, Contact Convoy, client sites',
    },
    {
        field: 'Back end',
        skills: ['Node.js', 'Express', 'Django REST', 'FastAPI', 'WebSockets', 'REST APIs'],
        shipped: 'StoreDesk, Allyvia, Contact Convoy',
    },
    {
        field: 'Data',
        skills: ['PostgreSQL', 'MongoDB', 'BigQuery', 'Elasticsearch', 'Oracle', 'Supabase'],
        shipped: 'Aetna, Allyvia, AIVID.AI, LogicSprint',
    },
    {
        field: 'Cloud & shipping',
        skills: ['Google Cloud', 'Pub/Sub', 'Cloud Storage', 'AWS', 'Cloudflare Workers', 'Vercel', 'Docker', 'CI/CD', 'App Store & Play'],
        shipped: 'Aetna, Allyvia, studio products',
    },
    {
        field: 'AI & agents',
        skills: ['Gemini', 'Vertex AI', 'Prompt engineering', 'RAG', 'Agent skills', 'MCP servers', 'Claude Code', 'Agent workflows'],
        shipped: 'Aetna, Skills & Agents, Shipping Agent',
    },
];
