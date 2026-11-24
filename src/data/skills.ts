/**
 * Every skill, grouped by the box it sits in on the home page system map.
 * `icon` is a Devicon class, `img` a brand logo in /public/brands, `mono` a lettered badge.
 * `light` puts a dark logo on a white tile so it stays readable.
 */
export type ZoneId = 'frontend' | 'mobile' | 'edge' | 'backend' | 'integrations' | 'ai' | 'data' | 'cloud' | 'devops' | 'protocol';
export type Skill = { name: string; zone: ZoneId; icon?: string; img?: string; mono?: string; light?: boolean; sub?: string };

const d = (cls: string) => `devicon-${cls}`;

export const SKILLS: Skill[] = [
    // Frontend
    { name: 'React', zone: 'frontend', sub: 'Frameworks', icon: d('react-original colored') },
    { name: 'Next.js', zone: 'frontend', sub: 'Frameworks', icon: d('nextjs-plain') },
    { name: 'TypeScript', zone: 'frontend', sub: 'Frameworks', icon: d('typescript-plain colored') },
    { name: 'JavaScript', zone: 'frontend', sub: 'Frameworks', icon: d('javascript-plain colored') },
    { name: 'Angular', zone: 'frontend', sub: 'Frameworks', icon: d('angularjs-plain colored') },
    { name: 'Vue.js', zone: 'frontend', sub: 'Frameworks', icon: d('vuejs-plain colored') },
    { name: 'HTML5 / CSS3', zone: 'frontend', sub: 'Frameworks', icon: d('html5-plain colored') },
    { name: 'Tailwind CSS', zone: 'frontend', icon: d('tailwindcss-original colored'), sub: 'Libraries' },
    { name: 'Redux & RTK', zone: 'frontend', icon: d('redux-original colored'), sub: 'Libraries' },
    { name: 'Material UI', zone: 'frontend', icon: d('materialui-plain colored'), sub: 'Libraries' },
    { name: 'Three.js', zone: 'frontend', icon: d('threejs-original'), sub: 'Libraries' },
    { name: 'D3.js', zone: 'frontend', icon: d('d3js-plain colored'), sub: 'Libraries' },
    { name: 'Framer Motion', zone: 'frontend', icon: d('framermotion-original'), sub: 'Libraries' },

    // Mobile & desktop
    { name: 'Flutter', zone: 'mobile', sub: 'Mobile', icon: d('flutter-plain colored') },
    { name: 'Dart', zone: 'mobile', sub: 'Mobile', icon: d('dart-plain colored') },
    { name: 'React Native', zone: 'mobile', sub: 'Mobile', icon: d('react-original colored') },
    { name: 'Google ML Kit', zone: 'mobile', sub: 'Mobile', icon: d('google-plain colored') },
    { name: 'Electron', zone: 'mobile', icon: d('electron-original colored'), sub: 'Desktop' },
    { name: 'WinForms', zone: 'mobile', icon: d('windows8-original colored'), sub: 'Desktop' },

    // Backend
    { name: 'Node.js', zone: 'backend', sub: 'Languages', icon: d('nodejs-plain colored') },
    { name: 'Python', zone: 'backend', sub: 'Languages', icon: d('python-plain colored') },
    { name: 'Express', zone: 'backend', sub: 'Frameworks', icon: d('express-original'), light: true },
    { name: 'Django', zone: 'backend', sub: 'Frameworks', icon: d('django-plain colored'), light: true },
    { name: 'Flask', zone: 'backend', sub: 'Frameworks', icon: d('flask-original colored'), light: true },
    { name: 'Java', zone: 'backend', sub: 'Languages', icon: d('java-plain colored') },
    { name: 'C#', zone: 'backend', sub: 'Languages', icon: d('csharp-plain colored') },
    { name: '.NET', zone: 'backend', sub: 'Frameworks', icon: d('dotnetcore-plain colored') },
    { name: 'Windows Services', zone: 'edge', sub: 'Windows apps & services', icon: d('windows8-original colored') },
    { name: 'AWS SQS', zone: 'cloud', sub: 'Storage & queues', icon: d('amazonwebservices-plain colored') },
    { name: 'REST', zone: 'protocol', mono: 'API' },
    { name: 'GraphQL', zone: 'protocol', icon: d('graphql-plain colored') },
    { name: 'WebSocket', zone: 'protocol', mono: 'WS' },
    { name: 'WebRTC', zone: 'protocol', img: '/brands/webrtc.svg', light: true },
    { name: 'MQTT', zone: 'protocol', img: '/brands/mqtt.svg', light: true },
    { name: 'Webhooks', zone: 'protocol', mono: 'WH' },
    { name: 'OAuth 2.0', zone: 'protocol', icon: d('oauth-plain') },
    { name: 'RTSP', zone: 'protocol', mono: 'RT' },
    { name: 'SOAP / ONVIF', zone: 'protocol', mono: 'SO' },
    { name: 'Serial (UART)', zone: 'protocol', mono: 'SR' },

    // Integrations
    { name: 'QuickBooks Online', zone: 'integrations', sub: 'Business apps', img: '/brands/quickbooks.svg' },
    { name: 'ShipStation', zone: 'integrations', sub: 'Business apps', img: '/brands/shipstation.ico', light: true },
    { name: 'Slack', zone: 'integrations', sub: 'Messaging', icon: d('slack-plain colored') },
    { name: 'WhatsApp', zone: 'integrations', sub: 'Messaging', img: '/brands/whatsapp.svg' },
    { name: 'Jira', zone: 'integrations', sub: 'Business apps', icon: d('jira-plain colored') },
    { name: 'Google Sheets', zone: 'integrations', sub: 'Files & docs', img: '/brands/googlesheets.svg' },
    { name: 'Google Drive', zone: 'integrations', sub: 'Files & docs', img: '/brands/googledrive.svg' },
    { name: 'SendGrid', zone: 'integrations', sub: 'Messaging', img: '/brands/sendgrid.ico', light: true },
    { name: 'Gmail SMTP', zone: 'integrations', sub: 'Messaging', img: '/brands/gmail.svg' },
    { name: 'Resend', zone: 'integrations', sub: 'Messaging', img: '/brands/resend.svg', light: true },
    { name: 'Razorpay', zone: 'integrations', sub: 'Payments & POS', img: '/brands/razorpay.svg', light: true },
    { name: 'Google Play Billing', zone: 'integrations', sub: 'Payments & POS', img: '/brands/googleplay.svg', light: true },
    { name: 'Cloudinary', zone: 'integrations', sub: 'Files & docs', img: '/brands/cloudinary.svg' },
    { name: 'Verifone', zone: 'integrations', sub: 'Payments & POS', mono: 'VF' },

    // AI & ML
    { name: 'Gemini', zone: 'ai', sub: 'Models', img: '/brands/googlegemini.svg' },
    { name: 'Vertex AI', zone: 'ai', sub: 'Models', icon: d('googlecloud-plain colored') },
    { name: 'Claude', zone: 'ai', sub: 'Models', img: '/brands/claude.svg' },
    { name: 'OpenAI API', zone: 'ai', sub: 'Models', mono: 'OA' },
    { name: 'AWS Bedrock Agents', zone: 'ai', sub: 'Models', icon: d('amazonwebservices-plain colored') },
    { name: 'Groq', zone: 'ai', sub: 'Models', img: '/brands/groq.ico', light: true },
    { name: 'MCP servers', zone: 'ai', sub: 'Agents & RAG', mono: 'MCP' },
    { name: 'LangChain', zone: 'ai', sub: 'Agents & RAG', img: '/brands/langchain.svg' },
    { name: 'LlamaIndex', zone: 'ai', sub: 'Agents & RAG', mono: 'LI' },
    { name: 'RAG', zone: 'ai', sub: 'Agents & RAG', mono: 'RAG' },
    { name: 'Prompt engineering', zone: 'ai', sub: 'Agents & RAG', mono: 'PE' },
    { name: 'Machine learning', zone: 'ai', sub: 'Vision & ML', img: '/brands/scikitlearn.svg' },
    { name: 'MLOps', zone: 'ai', sub: 'Vision & ML', mono: 'MO' },
    { name: 'OpenCV', zone: 'ai', sub: 'Vision & ML', icon: d('opencv-plain colored') },
    { name: 'OCR', zone: 'ai', sub: 'Vision & ML', mono: 'OCR' },
    { name: 'Amazon Textract', zone: 'ai', sub: 'Vision & ML', icon: d('amazonwebservices-plain colored') },
    { name: 'Pandas', zone: 'ai', sub: 'Vision & ML', icon: d('pandas-plain colored'), light: true },

    // Data
    { name: 'BigQuery', zone: 'data', sub: 'Analytics', img: '/brands/googlebigquery.svg' },
    { name: 'PostgreSQL', zone: 'data', sub: 'Databases', icon: d('postgresql-plain colored') },
    { name: 'MongoDB', zone: 'data', sub: 'Databases', icon: d('mongodb-plain colored') },
    { name: 'Elasticsearch', zone: 'data', sub: 'Cache & search', icon: d('elasticsearch-plain colored') },
    { name: 'SQL & MySQL', zone: 'data', sub: 'Databases', icon: d('mysql-plain colored') },
    { name: 'Oracle', zone: 'data', sub: 'Databases', icon: d('oracle-original') },
    { name: 'Redis', zone: 'data', sub: 'Cache & search', icon: d('redis-plain colored') },
    { name: 'Firebase', zone: 'data', sub: 'Databases', icon: d('firebase-plain colored') },
    { name: 'Supabase', zone: 'data', sub: 'Databases', icon: d('supabase-plain colored') },
    { name: 'SQLite', zone: 'data', sub: 'Databases', icon: d('sqlite-plain colored') },
    { name: 'Prisma ORM', zone: 'data', sub: 'Databases', icon: d('prisma-original') },
    { name: 'Dataflow', zone: 'data', sub: 'Analytics', img: '/brands/googledataflow.svg' },

    // Cloud
    { name: 'Google Cloud', zone: 'cloud', sub: 'Providers', icon: d('googlecloud-plain colored') },
    { name: 'AWS', zone: 'cloud', sub: 'Providers', icon: d('amazonwebservices-plain colored') },
    { name: 'Azure', zone: 'cloud', sub: 'Providers', icon: d('azure-plain colored') },
    { name: 'Vercel', zone: 'cloud', sub: 'Hosting', icon: d('vercel-original') },
    { name: 'Cloud Storage', zone: 'cloud', sub: 'Storage & queues', img: '/brands/googlecloudstorage.svg' },
    { name: 'Pub/Sub', zone: 'cloud', sub: 'Storage & queues', img: '/brands/googlepubsub.svg' },
    { name: 'Docker', zone: 'cloud', sub: 'Hosting', icon: d('docker-plain colored') },
    { name: 'GitHub Actions', zone: 'devops', sub: 'CI & code', icon: d('githubactions-plain colored') },
    { name: 'Git', zone: 'devops', sub: 'CI & code', icon: d('git-plain colored') },
    { name: 'Jest', zone: 'devops', sub: 'Testing & docs', icon: d('jest-plain colored') },
    { name: 'Playwright', zone: 'frontend', sub: 'Testing', icon: d('playwright-plain colored') },
    { name: 'ESLint', zone: 'frontend', sub: 'Tooling', icon: d('eslint-plain colored') },
    { name: 'Vite', zone: 'frontend', sub: 'Tooling', icon: d('vitejs-plain colored') },
    { name: 'Postman', zone: 'backend', sub: 'Tooling', icon: d('postman-plain colored') },
    { name: 'Swagger', zone: 'devops', sub: 'Testing & docs', icon: d('swagger-plain colored') },
    { name: 'Kibana', zone: 'devops', sub: 'Ops', icon: d('kibana-plain colored') },
    { name: 'IP cameras', zone: 'edge', sub: 'Cameras', mono: 'IP' },
    { name: 'PTZ control', zone: 'edge', sub: 'Cameras', mono: 'PTZ' },
    { name: 'FFmpeg', zone: 'edge', sub: 'Cameras', img: '/brands/ffmpeg.svg' },
    { name: 'NVR / DVR', zone: 'edge', sub: 'NVR / DVR', mono: 'NVR' },
    { name: 'NSSM', zone: 'edge', sub: 'Windows apps & services', mono: 'NS' },
    { name: 'Barcode scanners', zone: 'edge', sub: 'Scanners & boards', mono: 'BC' },
    { name: 'Arduino', zone: 'edge', sub: 'Scanners & boards', icon: d('arduino-plain colored') },
    { name: 'Sirens', zone: 'edge', sub: 'IoT & controls', mono: 'SR' },
    { name: 'Toll-booth gates', zone: 'edge', sub: 'IoT & controls', mono: 'TG' },
    { name: 'Lights & strobes', zone: 'edge', sub: 'IoT & controls', mono: 'LT' },
    { name: 'Relays & sensors', zone: 'edge', sub: 'IoT & controls', mono: 'RL' },

    // Cloud · deploy (hosting)
    { name: 'Cloudflare Workers', zone: 'cloud', sub: 'Hosting', icon: d('cloudflare-plain colored') },
    { name: 'Google Cloud Run', zone: 'cloud', sub: 'Hosting', icon: d('googlecloud-plain colored') },
    { name: 'App Store Connect', zone: 'cloud', sub: 'App stores', icon: d('apple-original'), light: true },
    { name: 'Google Play Console', zone: 'cloud', sub: 'App stores', img: '/brands/googleplay.svg', light: true },

    // DevOps (Linux and Bash are backed by the Coursera certificates)
    { name: 'Linux', zone: 'devops', sub: 'Ops', icon: d('linux-plain') },
    { name: 'Bash', zone: 'devops', sub: 'Ops', icon: d('bash-plain'), light: true },
];

/** What each protocol is for, shown when it's picked in the system map legend. */
/** Edge devices, in the order they're shown, with what each one does and the protocols it speaks. */
export const EDGE_GROUPS: { name: string; note: string; protos: string[] }[] = [
    { name: 'Cameras', note: 'IP cameras streaming live video, found and steered over ONVIF.', protos: ['RTSP', 'SOAP / ONVIF'] },
    { name: 'NVR / DVR', note: 'On-site recorders that store the camera feeds and re-stream them.', protos: ['RTSP', 'SOAP / ONVIF'] },
    { name: 'Windows apps & services', note: 'Programs and background services running on the store or site PC.', protos: ['WebSocket', 'REST'] },
    { name: 'Scanners & boards', note: 'Barcode scanners, scales and microcontrollers wired to that PC.', protos: ['Serial (UART)', 'MQTT'] },
    { name: 'IoT & controls', note: 'Sirens, toll-booth boom gates, warning lights and relays that the system switches on an event.', protos: ['MQTT', 'Serial (UART)'] },
];

/**
 * Which tools actually provide each protocol or link, so picking one on the map lights up
 * only those. Names match SKILLS. Only listed where it narrows things down.
 */
export const PROVIDERS: Record<string, string[]> = {
    Webhooks: ['QuickBooks Online', 'Razorpay', 'ShipStation', 'Slack', 'WhatsApp', 'Jira', 'Resend', 'SendGrid', 'GitHub Actions'],
    'OAuth 2.0': ['QuickBooks Online', 'Google Drive', 'Google Sheets', 'Gmail SMTP', 'Slack', 'Jira'],
    RTSP: ['IP cameras', 'NVR / DVR', 'FFmpeg'],
    'SOAP / ONVIF': ['IP cameras', 'PTZ control', 'NVR / DVR'],
    'Serial (UART)': ['Barcode scanners', 'Arduino', 'Windows Services', 'Toll-booth gates', 'Relays & sensors'],
    MQTT: ['Arduino', 'Sirens', 'Toll-booth gates', 'Lights & strobes', 'Relays & sensors'],
    WebSocket: ['Node.js', 'Express', 'Django', 'Windows Services', 'Electron', 'Flutter', 'React'],
    'Pub/Sub · queues': ['Pub/Sub', 'AWS SQS', 'Redis'],
    RAG: ['RAG', 'LangChain', 'LlamaIndex', 'Elasticsearch', 'Supabase'],
    queries: ['PostgreSQL', 'SQL & MySQL', 'MongoDB', 'Oracle', 'SQLite', 'Supabase', 'Firebase', 'BigQuery', 'Prisma ORM'],
    'CI/CD deploys': ['GitHub Actions', 'Docker', 'Vercel', 'Google Cloud Run', 'App Store Connect', 'Google Play Console'],
};

export const PROTOCOL_NOTES: Record<string, string> = {
    REST: 'Request/response APIs over HTTP: the default between apps, services and third parties.',
    GraphQL: 'One endpoint where the client asks for exactly the fields it needs.',
    WebSocket: 'A long-lived two-way connection for live updates, like syncing a store’s devices in real time.',
    WebRTC: 'Peer-to-peer audio, video and data straight between browsers or devices.',
    MQTT: 'Lightweight publish/subscribe messaging for devices on flaky networks.',
    Webhooks: 'The other system calls you when something happens, instead of you polling it.',
    'OAuth 2.0': 'Signing in and granting scoped access to another service without sharing passwords.',
    RTSP: 'Streaming live video from IP cameras.',
    'SOAP / ONVIF': 'XML web services; ONVIF uses it to discover and control IP cameras (PTZ, profiles).',
    'Serial (UART)': 'Talking byte by byte to hardware like scanners, scales and Arduino boards.',
};
