/**
 * Every skill, grouped by the box it sits in on the home page system map.
 * `icon` is a Devicon class, `img` a brand logo in /public/brands, `mono` a lettered badge.
 * `light` puts a dark logo on a white tile so it stays readable.
 */
export type ZoneId = 'frontend' | 'mobile' | 'backend' | 'integrations' | 'ai' | 'data' | 'cloud';
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

    // Backend & protocols
    { name: 'Node.js', zone: 'backend', icon: d('nodejs-plain colored') },
    { name: 'Python', zone: 'backend', icon: d('python-plain colored') },
    { name: 'Express', zone: 'backend', icon: d('express-original'), light: true },
    { name: 'Django', zone: 'backend', icon: d('django-plain colored'), light: true },
    { name: 'Flask', zone: 'backend', icon: d('flask-original colored'), light: true },
    { name: 'Java', zone: 'backend', icon: d('java-plain colored') },
    { name: 'C#', zone: 'backend', icon: d('csharp-plain colored') },
    { name: '.NET', zone: 'backend', icon: d('dotnetcore-plain colored') },
    { name: 'Windows Services', zone: 'backend', icon: d('windows8-original colored') },
    { name: 'AWS SQS', zone: 'backend', icon: d('amazonwebservices-plain colored') },
    { name: 'REST', zone: 'backend', mono: 'API', sub: 'Protocols' },
    { name: 'GraphQL', zone: 'backend', icon: d('graphql-plain colored'), sub: 'Protocols' },
    { name: 'WebSocket', zone: 'backend', mono: 'WS', sub: 'Protocols' },
    { name: 'WebRTC', zone: 'backend', img: '/brands/webrtc.svg', light: true, sub: 'Protocols' },
    { name: 'MQTT', zone: 'backend', img: '/brands/mqtt.svg', light: true, sub: 'Protocols' },
    { name: 'Webhooks', zone: 'backend', mono: 'WH', sub: 'Protocols' },
    { name: 'OAuth 2.0', zone: 'backend', icon: d('oauth-plain'), sub: 'Protocols' },
    { name: 'RTSP', zone: 'backend', mono: 'RT', sub: 'Protocols' },
    { name: 'SOAP / ONVIF', zone: 'backend', mono: 'SO', sub: 'Protocols' },
    { name: 'Serial (UART)', zone: 'backend', mono: 'SR', sub: 'Protocols' },

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

    // Cloud & tooling
    { name: 'Google Cloud', zone: 'cloud', icon: d('googlecloud-plain colored') },
    { name: 'AWS', zone: 'cloud', icon: d('amazonwebservices-plain colored') },
    { name: 'Azure', zone: 'cloud', icon: d('azure-plain colored') },
    { name: 'Vercel', zone: 'cloud', icon: d('vercel-original') },
    { name: 'Cloud Storage', zone: 'cloud', img: '/brands/googlecloudstorage.svg' },
    { name: 'Pub/Sub', zone: 'cloud', img: '/brands/googlepubsub.svg' },
    { name: 'Docker', zone: 'cloud', icon: d('docker-plain colored') },
    { name: 'GitHub Actions', zone: 'cloud', icon: d('githubactions-plain colored'), sub: 'Tooling' },
    { name: 'Git', zone: 'cloud', icon: d('git-plain colored'), sub: 'Tooling' },
    { name: 'Jest', zone: 'cloud', icon: d('jest-plain colored'), sub: 'Tooling' },
    { name: 'Playwright', zone: 'cloud', icon: d('playwright-plain colored'), sub: 'Tooling' },
    { name: 'ESLint', zone: 'cloud', icon: d('eslint-plain colored'), sub: 'Tooling' },
    { name: 'Vite', zone: 'cloud', icon: d('vitejs-plain colored'), sub: 'Tooling' },
    { name: 'Postman', zone: 'cloud', icon: d('postman-plain colored'), sub: 'Tooling' },
    { name: 'Swagger', zone: 'cloud', icon: d('swagger-plain colored'), sub: 'Tooling' },
    { name: 'Kibana', zone: 'cloud', icon: d('kibana-plain colored'), sub: 'Tooling' },
    { name: 'FFmpeg', zone: 'cloud', img: '/brands/ffmpeg.svg', sub: 'Edge & video' },
    { name: 'NSSM', zone: 'cloud', mono: 'NS', sub: 'Edge & video' },
    { name: 'Arduino', zone: 'cloud', icon: d('arduino-plain colored'), sub: 'Edge & video' },
];
