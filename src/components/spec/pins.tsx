import type { ReactNode } from 'react';
import { Database, Plug, Sparkles } from 'lucide-react';

export type Pin = {
    no: number;
    name: string;
    type: string;
    icon: ReactNode;
    description: string;
    usedAt: string;
    /** Destination ids (see DESTINATIONS) this skill is routed to. */
    routes: string[];
};

const dev = (cls: string) => <i className={cls} aria-hidden="true" />;

/** Skills, wired as the pins of a chip. Facts only: what each is used for and where. */
export const PINS: Pin[] = [
    { no: 1, name: 'Google Cloud', type: 'Cloud', icon: dev('devicon-googlecloud-plain colored'), description: 'Cloud-native applications; Cloud Storage, Pub/Sub and Cloud Run.', usedAt: 'Aetna, Allyvia, StoreDesk, Contact Convoy', routes: ['aetna', 'allyvia', 'storedesk', 'contact-convoy'] },
    { no: 2, name: 'BigQuery', type: 'Data', icon: <Database size={17} aria-hidden="true" />, description: 'Analytics and data processing pipelines, incremental loads, reporting aggregates.', usedAt: 'Aetna, Allyvia', routes: ['aetna', 'allyvia'] },
    { no: 3, name: 'Python', type: 'Language', icon: dev('devicon-python-plain colored'), description: 'Back-end services and pipelines: Django REST Framework, FastAPI, Streamlit.', usedAt: 'Aetna, Allyvia, AIVID.AI, Shipping Agent', routes: ['aetna', 'allyvia', 'aivid', 'shipping-agent'] },
    { no: 4, name: 'TypeScript', type: 'Language', icon: dev('devicon-typescript-plain colored'), description: 'Typed front ends and Node services.', usedAt: 'Allyvia, AIVID.AI, studio products', routes: ['allyvia', 'aivid', 'skills', 'storedesk', 'family', 'client-sites'] },
    { no: 5, name: 'React · Next.js', type: 'Front end', icon: dev('devicon-react-original colored'), description: 'Web apps and sites; Redux Toolkit and React Query for state.', usedAt: 'Allyvia, InfoLabz, Skills & Agents, client sites', routes: ['allyvia', 'infolabz', 'skills', 'storedesk', 'client-sites'] },
    { no: 6, name: 'Flutter', type: 'Mobile', icon: dev('devicon-flutter-plain colored'), description: 'iOS and Android apps, released to the App Store and Google Play.', usedAt: 'LogicSprint, Contact Convoy, StoreDesk scanner', routes: ['logicsprint', 'contact-convoy', 'storedesk'] },
    { no: 7, name: 'Node.js', type: 'Back end', icon: dev('devicon-nodejs-plain colored'), description: 'APIs, background workers and WebSocket sync.', usedAt: 'StoreDesk, Contact Convoy, AIVID.AI', routes: ['storedesk', 'contact-convoy', 'aivid'] },
    { no: 8, name: 'PostgreSQL', type: 'Data', icon: dev('devicon-postgresql-plain colored'), description: 'Relational models and trigram similarity search.', usedAt: 'Allyvia, LogicSprint (Supabase)', routes: ['allyvia', 'logicsprint'] },
    { no: 9, name: 'MongoDB', type: 'Data', icon: dev('devicon-mongodb-plain colored'), description: 'Document stores for products and client sites.', usedAt: 'StoreDesk, Contact Convoy, client sites', routes: ['storedesk', 'contact-convoy', 'client-sites'] },
    { no: 10, name: 'GenAI', type: 'AI', icon: <Sparkles size={17} aria-hidden="true" />, description: 'Prompting, retrieval and AI-enabled APIs; Gemini and Vertex AI.', usedAt: 'Aetna, Allyvia, Contact Convoy, Shipping Agent', routes: ['aetna', 'allyvia', 'contact-convoy', 'shipping-agent'] },
    { no: 11, name: 'MCP', type: 'AI', icon: <Plug size={17} aria-hidden="true" />, description: 'Model Context Protocol servers that give AI agents tools.', usedAt: 'Skills & Agents (remote MCP server, 8 tools)', routes: ['skills'] },
    { no: 12, name: 'Docker · CI/CD', type: 'Delivery', icon: dev('devicon-docker-plain colored'), description: 'Containers, pipelines, store releases and deploys.', usedAt: 'AIVID.AI, studio products', routes: ['aivid', 'skills', 'logicsprint', 'storedesk', 'contact-convoy'] },
];

export type Destination = { id: string; name: string; group: 'Work' | 'Studio' };

/** Where the pins are routed: jobs, then studio products and projects. */
export const DESTINATIONS: Destination[] = [
    { id: 'aetna', name: 'Aetna', group: 'Work' },
    { id: 'allyvia', name: 'Allyvia', group: 'Work' },
    { id: 'aivid', name: 'AIVID.AI', group: 'Work' },
    { id: 'infolabz', name: 'InfoLabz', group: 'Work' },
    { id: 'skills', name: 'Skills & Agents', group: 'Studio' },
    { id: 'logicsprint', name: 'LogicSprint', group: 'Studio' },
    { id: 'family', name: 'Family Tree', group: 'Studio' },
    { id: 'contact-convoy', name: 'Contact Convoy', group: 'Studio' },
    { id: 'storedesk', name: 'StoreDesk', group: 'Studio' },
    { id: 'shipping-agent', name: 'Shipping Agent', group: 'Studio' },
    { id: 'client-sites', name: 'Client websites', group: 'Studio' },
];
