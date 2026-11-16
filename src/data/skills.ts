/**
 * Every skill, grouped by the box it sits in on the home page system map.
 * `icon` is a Devicon class, `img` a brand logo in /public/brands, `mono` a lettered badge.
 * `light` puts a dark logo on a white tile so it stays readable.
 */
export type ZoneId = 'frontend' | 'mobile' | 'edge' | 'backend' | 'integrations' | 'ai' | 'data' | 'cloud' | 'deploy' | 'devops' | 'protocol';
export type Skill = { name: string; zone: ZoneId; icon?: string; img?: string; mono?: string; light?: boolean; sub?: string };

const d = (cls: string) => `devicon-${cls}`;

export const SKILLS: Skill[] = [
    // Frontend
    { name: 'React', zone: 'frontend', icon: d('react-original colored') },
    { name: 'Next.js', zone: 'frontend', icon: d('nextjs-plain') },
    { name: 'TypeScript', zone: 'frontend', icon: d('typescript-plain colored') },
    { name: 'JavaScript', zone: 'frontend', icon: d('javascript-plain colored') },
    { name: 'Angular', zone: 'frontend', icon: d('angularjs-plain colored') },
    { name: 'Vue.js', zone: 'frontend', icon: d('vuejs-plain colored') },
    { name: 'HTML5 / CSS3', zone: 'frontend', icon: d('html5-plain colored') },
    { name: 'Tailwind CSS', zone: 'frontend', icon: d('tailwindcss-original colored'), sub: 'Libraries' },
    { name: 'Redux & RTK', zone: 'frontend', icon: d('redux-original colored'), sub: 'Libraries' },
    { name: 'Material UI', zone: 'frontend', icon: d('materialui-plain colored'), sub: 'Libraries' },
    { name: 'Three.js', zone: 'frontend', icon: d('threejs-original'), sub: 'Libraries' },
    { name: 'D3.js', zone: 'frontend', icon: d('d3js-plain colored'), sub: 'Libraries' },
    { name: 'Framer Motion', zone: 'frontend', icon: d('framermotion-original'), sub: 'Libraries' },

    // Mobile & desktop
    { name: 'Flutter', zone: 'mobile', icon: d('flutter-plain colored') },
    { name: 'Dart', zone: 'mobile', icon: d('dart-plain colored') },
    { name: 'React Native', zone: 'mobile', icon: d('react-original colored') },
    { name: 'Google ML Kit', zone: 'mobile', icon: d('google-plain colored') },
    { name: 'Electron', zone: 'mobile', icon: d('electron-original colored'), sub: 'Desktop' },
    { name: 'WinForms', zone: 'mobile', icon: d('windows8-original colored'), sub: 'Desktop' },

    // Backend
    { name: 'Node.js', zone: 'backend', icon: d('nodejs-plain colored') },
    { name: 'Python', zone: 'backend', icon: d('python-plain colored') },
    { name: 'Express', zone: 'backend', icon: d('express-original'), light: true },
    { name: 'Django', zone: 'backend', icon: d('django-plain colored'), light: true },
    { name: 'Flask', zone: 'backend', icon: d('flask-original colored'), light: true },
    { name: 'Java', zone: 'backend', icon: d('java-plain colored') },
    { name: 'C#', zone: 'backend', icon: d('csharp-plain colored') },
    { name: '.NET', zone: 'backend', icon: d('dotnetcore-plain colored') },
    { name: 'Windows Services', zone: 'edge', icon: d('windows8-original colored') },
    { name: 'AWS SQS', zone: 'cloud', icon: d('amazonwebservices-plain colored') },
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
    { name: 'QuickBooks Online', zone: 'integrations', img: '/brands/quickbooks.svg' },
    { name: 'ShipStation', zone: 'integrations', img: '/brands/shipstation.ico', light: true },
    { name: 'Slack', zone: 'integrations', icon: d('slack-plain colored') },
    { name: 'WhatsApp', zone: 'integrations', img: '/brands/whatsapp.svg' },
    { name: 'Jira', zone: 'integrations', icon: d('jira-plain colored') },
    { name: 'Google Sheets', zone: 'integrations', img: '/brands/googlesheets.svg' },
    { name: 'Google Drive', zone: 'integrations', img: '/brands/googledrive.svg' },
    { name: 'SendGrid', zone: 'integrations', img: '/brands/sendgrid.ico', light: true },
    { name: 'Gmail SMTP', zone: 'integrations', img: '/brands/gmail.svg' },
    { name: 'Resend', zone: 'integrations', img: '/brands/resend.svg', light: true },
    { name: 'Razorpay', zone: 'integrations', img: '/brands/razorpay.svg', light: true },
    { name: 'Google Play Billing', zone: 'integrations', img: '/brands/googleplay.svg', light: true },
    { name: 'Cloudinary', zone: 'integrations', img: '/brands/cloudinary.svg' },
    { name: 'Verifone', zone: 'integrations', mono: 'VF' },

    // AI & ML
    { name: 'Gemini', zone: 'ai', img: '/brands/googlegemini.svg' },
    { name: 'Vertex AI', zone: 'ai', icon: d('googlecloud-plain colored') },
    { name: 'Claude', zone: 'ai', img: '/brands/claude.svg' },
    { name: 'OpenAI API', zone: 'ai', mono: 'OA' },
    { name: 'AWS Bedrock Agents', zone: 'ai', icon: d('amazonwebservices-plain colored') },
    { name: 'Groq', zone: 'ai', img: '/brands/groq.ico', light: true },
    { name: 'MCP servers', zone: 'ai', mono: 'MCP' },
    { name: 'LangChain', zone: 'ai', img: '/brands/langchain.svg' },
    { name: 'LlamaIndex', zone: 'ai', mono: 'LI' },
    { name: 'RAG', zone: 'ai', mono: 'RAG' },
    { name: 'Prompt engineering', zone: 'ai', mono: 'PE' },
    { name: 'Machine learning', zone: 'ai', img: '/brands/scikitlearn.svg' },
    { name: 'MLOps', zone: 'ai', mono: 'MO' },
    { name: 'OpenCV', zone: 'ai', icon: d('opencv-plain colored') },
    { name: 'OCR', zone: 'ai', mono: 'OCR' },
    { name: 'Amazon Textract', zone: 'ai', icon: d('amazonwebservices-plain colored') },
    { name: 'Pandas', zone: 'ai', icon: d('pandas-plain colored'), light: true },

    // Data
    { name: 'BigQuery', zone: 'data', img: '/brands/googlebigquery.svg' },
    { name: 'PostgreSQL', zone: 'data', icon: d('postgresql-plain colored') },
    { name: 'MongoDB', zone: 'data', icon: d('mongodb-plain colored') },
    { name: 'Elasticsearch', zone: 'data', icon: d('elasticsearch-plain colored') },
    { name: 'SQL & MySQL', zone: 'data', icon: d('mysql-plain colored') },
    { name: 'Oracle', zone: 'data', icon: d('oracle-original') },
    { name: 'Redis', zone: 'data', icon: d('redis-plain colored') },
    { name: 'Firebase', zone: 'data', icon: d('firebase-plain colored') },
    { name: 'Supabase', zone: 'data', icon: d('supabase-plain colored') },
    { name: 'SQLite', zone: 'data', icon: d('sqlite-plain colored') },
    { name: 'Prisma ORM', zone: 'data', icon: d('prisma-original') },
    { name: 'Dataflow', zone: 'data', img: '/brands/googledataflow.svg' },

    // Cloud
    { name: 'Google Cloud', zone: 'cloud', icon: d('googlecloud-plain colored') },
    { name: 'AWS', zone: 'cloud', icon: d('amazonwebservices-plain colored') },
    { name: 'Azure', zone: 'cloud', icon: d('azure-plain colored') },
    { name: 'Vercel', zone: 'deploy', icon: d('vercel-original') },
    { name: 'Cloud Storage', zone: 'cloud', img: '/brands/googlecloudstorage.svg' },
    { name: 'Pub/Sub', zone: 'cloud', img: '/brands/googlepubsub.svg' },
    { name: 'Docker', zone: 'deploy', icon: d('docker-plain colored') },
    { name: 'GitHub Actions', zone: 'devops', icon: d('githubactions-plain colored') },
    { name: 'Git', zone: 'devops', icon: d('git-plain colored') },
    { name: 'Jest', zone: 'devops', icon: d('jest-plain colored') },
    { name: 'Playwright', zone: 'devops', icon: d('playwright-plain colored') },
    { name: 'ESLint', zone: 'devops', icon: d('eslint-plain colored') },
    { name: 'Vite', zone: 'devops', icon: d('vitejs-plain colored') },
    { name: 'Postman', zone: 'devops', icon: d('postman-plain colored') },
    { name: 'Swagger', zone: 'devops', icon: d('swagger-plain colored') },
    { name: 'Kibana', zone: 'devops', icon: d('kibana-plain colored') },
    { name: 'FFmpeg', zone: 'edge', img: '/brands/ffmpeg.svg' },
    { name: 'NSSM', zone: 'edge', mono: 'NS' },
    { name: 'Arduino', zone: 'edge', icon: d('arduino-plain colored') },

    // Deploy · hosting
    { name: 'Cloudflare Workers', zone: 'deploy', icon: d('cloudflare-plain colored') },
    { name: 'Google Cloud Run', zone: 'deploy', icon: d('googlecloud-plain colored') },
    { name: 'App Store Connect', zone: 'deploy', icon: d('apple-original'), light: true },
    { name: 'Google Play Console', zone: 'deploy', img: '/brands/googleplay.svg', light: true },

    // DevOps (Linux and Bash are backed by the Coursera certificates)
    { name: 'Linux', zone: 'devops', icon: d('linux-plain') },
    { name: 'Bash', zone: 'devops', icon: d('bash-plain'), light: true },
];

/** What each protocol is for, shown when it's picked in the system map legend. */
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
