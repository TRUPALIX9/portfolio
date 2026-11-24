/**
 * How each link on the system map actually talks: the pattern, the messages in order, and
 * where you usually find it. Keys match the protocol names in skills.ts and the non-protocol
 * edge labels in SystemMap.
 */
export type FlowStep = {
    /** Index into `lanes`. */
    from: number;
    to: number;
    msg: string;
    /** Draw as a dashed reply or a stream rather than a request. */
    kind?: 'reply' | 'stream';
};

/** Icons for the things a link usually joins; drawn in SystemMap. */
export type Endpoint = 'ai' | 'box' | 'browser' | 'cable' | 'camera' | 'card' | 'chart' | 'chat' | 'chip' | 'cloud' | 'database' | 'file' | 'git' | 'key' | 'pc' | 'phone' | 'plug' | 'queue' | 'router' | 'scanner' | 'server' | 'signal' | 'user' | 'worker';

export type Flow = {
    pattern: string;
    lanes: string[];
    steps: FlowStep[];
    /** Where it typically shows up, with the chain of things it joins. */
    where: { text: string; path: (Endpoint | Endpoint[])[] }[];
    /** One-line note on when to reach for it. */
    use: string;
};

/** The basics of each protocol or link, shown as a small spec sheet next to its scene. */
export type Fundamentals = {
    facts: [label: string, value: string][];
    pros: string[];
    cons: string[];
};

/** How the chips are grouped, in order. */
export const PROTOCOL_GROUPS: { name: string; items: string[] }[] = [
    { name: 'Request · response', items: ['REST', 'GraphQL', 'SOAP / ONVIF'] },
    { name: 'Real-time · streams', items: ['WebSocket', 'WebRTC', 'RTSP'] },
    { name: 'Events · messaging', items: ['Webhooks', 'MQTT', 'Pub/Sub · queues'] },
    { name: 'Access', items: ['OAuth 2.0'] },
    { name: 'Hardware', items: ['Serial (UART)'] },
    { name: 'Data · AI · delivery', items: ['queries', 'RAG', 'CI/CD deploys'] },
];

export const FUNDAMENTALS: Record<string, Fundamentals> = {
    REST: {
        facts: [['Transport', 'HTTP/1.1 · HTTP/2'], ['Pattern', 'Request → response'], ['Direction', 'Client asks, server answers'], ['Format', 'JSON (usually)'], ['State', 'Stateless'], ['Port', '443']],
        pros: ['Simple, everywhere, every tool speaks it', 'Cacheable with plain HTTP caching', 'Easy to debug with curl or Postman'],
        cons: ['Over- or under-fetching on complex screens', 'Several round trips to assemble one view', 'No push: clients must poll for changes'],
    },
    GraphQL: {
        facts: [['Transport', 'HTTP POST'], ['Pattern', 'Query → exact shape'], ['Direction', 'Client asks'], ['Format', 'JSON'], ['State', 'Stateless'], ['Schema', 'Typed, introspectable']],
        pros: ['One round trip for a whole screen', 'Client picks the fields, no over-fetching', 'Strong types and self-documenting schema'],
        cons: ['HTTP caching is harder (one endpoint)', 'Expensive queries need depth and cost limits', 'More server setup than plain REST'],
    },
    WebSocket: {
        facts: [['Transport', 'TCP, upgraded from HTTP'], ['Pattern', 'Full duplex'], ['Direction', 'Both, any time'], ['Format', 'Text or binary frames'], ['State', 'Stateful connection'], ['Port', '443 (wss://)']],
        pros: ['Instant server → client updates', 'Low overhead per message once open', 'Works through most proxies on 443'],
        cons: ['Every client holds a connection: harder to scale', 'You handle reconnects and missed messages', 'No built-in request/response or caching'],
    },
    WebRTC: {
        facts: [['Transport', 'UDP (SRTP / SCTP)'], ['Pattern', 'Peer to peer'], ['Direction', 'Both'], ['Format', 'Audio, video, data'], ['Setup', 'SDP offer/answer + ICE'], ['Helpers', 'STUN · TURN']],
        pros: ['Lowest latency for live media', 'Media skips your servers (cheaper)', 'Encrypted by default'],
        cons: ['Needs a signaling server to start', 'Strict NATs need a TURN relay', 'Complex to debug'],
    },
    MQTT: {
        facts: [['Transport', 'TCP (or WebSocket)'], ['Pattern', 'Publish / subscribe'], ['Direction', 'Via a broker'], ['Format', 'Any bytes, 2-byte header'], ['Delivery', 'QoS 0 · 1 · 2'], ['Port', '1883 · 8883 (TLS)']],
        pros: ['Tiny overhead, great for small devices', 'Survives flaky and metered networks', 'Retained messages and last will built in'],
        cons: ['Needs a broker to run and secure', 'Topic design is up to you', 'Not request/response by nature'],
    },
    Webhooks: {
        facts: [['Transport', 'HTTP POST'], ['Pattern', 'Event push'], ['Direction', 'Them → you'], ['Format', 'JSON'], ['Security', 'Signed payloads (HMAC)'], ['Retries', 'Sender retries on failure']],
        pros: ['No polling: you hear about it right away', 'Cheap for both sides', 'Easy to receive with any web server'],
        cons: ['Your endpoint must be public and up', 'Duplicates happen: handlers must be idempotent', 'Order is not guaranteed'],
    },
    'OAuth 2.0': {
        facts: [['Transport', 'HTTPS redirects + calls'], ['Pattern', 'Authorization code + PKCE'], ['Tokens', 'Access (short) · refresh (long)'], ['Scopes', 'Least access needed'], ['Format', 'JSON · JWT'], ['Port', '443']],
        pros: ['Users never give you their password', 'Scoped, revocable access', 'Standard across Google, Microsoft, Intuit'],
        cons: ['Many moving parts to get right', 'Tokens expire: refresh handling needed', 'Redirect setup differs per provider'],
    },
    RTSP: {
        facts: [['Control', 'RTSP over TCP'], ['Media', 'RTP over UDP (or TCP)'], ['Pattern', 'Commands, then a stream'], ['Codecs', 'H.264 · H.265'], ['Direction', 'Camera → client'], ['Port', '554']],
        pros: ['Supported by nearly every IP camera', 'Low latency on a local network', 'Works with FFmpeg, OpenCV and NVRs'],
        cons: ['Not playable in browsers directly', 'UDP struggles across the internet', 'Auth and URLs vary by vendor'],
    },
    'SOAP / ONVIF': {
        facts: [['Transport', 'HTTP POST'], ['Format', 'XML envelopes (SOAP)'], ['Discovery', 'WS-Discovery multicast'], ['Pattern', 'Request → response'], ['Covers', 'Profiles, streams, PTZ, events'], ['Port', '80 · 8080']],
        pros: ['One API for many camera brands', 'Find cameras on the network automatically', 'Control pan, tilt, zoom and presets'],
        cons: ['Verbose XML, heavy to parse', 'Vendors implement it unevenly', 'WS-Security auth is awkward'],
    },
    'Serial (UART)': {
        facts: [['Wires', 'TX · RX · GND'], ['Framing', 'Start · 8 data · stop (8N1)'], ['Speed', '9600–115200 baud'], ['Clock', 'None: agreed baud rate'], ['Direction', 'Full duplex'], ['Range', 'Short cables']],
        pros: ['Dead simple and very reliable', 'No network or drivers needed', 'Every microcontroller has one'],
        cons: ['Short distance, point to point', 'Speeds must match exactly', 'You define the message format yourself'],
    },
    queries: {
        facts: [['Transport', 'DB wire protocol over TCP'], ['Language', 'SQL (or Mongo queries)'], ['Pattern', 'Query → rows'], ['Safety', 'Parameterised, never string-built'], ['Transactions', 'All or nothing'], ['Pooling', 'Reuse connections']],
        pros: ['Exact data with joins and filters', 'Transactions keep data consistent', 'Indexes make reads fast'],
        cons: ['Slow queries hurt everyone', 'Too many connections exhaust the DB', 'Schema changes need migrations'],
    },
    'Pub/Sub · queues': {
        facts: [['Pattern', 'Producer → topic → consumers'], ['Delivery', 'At least once'], ['Ack', 'Consumer acks when done'], ['Retries', 'Automatic, then dead-letter'], ['Examples', 'GCP Pub/Sub · SQS'], ['Coupling', 'Loose']],
        pros: ['Requests return fast, work happens later', 'Absorbs spikes', 'Failures retry without user impact'],
        cons: ['Eventual, not instant', 'Duplicates: work must be idempotent', 'Harder to trace end to end'],
    },
    RAG: {
        facts: [['Step 1', 'Embed the question'], ['Step 2', 'Nearest-neighbour search'], ['Step 3', 'Top passages into the prompt'], ['Store', 'pgvector · Elasticsearch'], ['Output', 'Answer with sources'], ['Updates', 'Re-index, no retraining']],
        pros: ['Answers from your own, current data', 'Cites sources', 'Cheaper than fine-tuning'],
        cons: ['Only as good as the retrieval', 'Chunking and ranking need tuning', 'Adds latency per question'],
    },
    'CI/CD deploys': {
        facts: [['Trigger', 'Push or merge'], ['Stages', 'Lint · test · build · deploy'], ['Runner', 'GitHub Actions'], ['Targets', 'Vercel · Cloud Run · stores'], ['Rollback', 'Redeploy previous build'], ['Secrets', 'Stored in the CI, not the repo']],
        pros: ['Every release is the same, repeatable', 'Tests catch breakage before users do', 'Ship small changes often'],
        cons: ['Flaky tests block releases', 'Pipelines need upkeep', 'Secrets in CI must be guarded'],
    },
};

export const FLOWS: Record<string, Flow> = {
    REST: {
        pattern: 'Request → response',
        lanes: ['Client', 'API server'],
        steps: [
            { from: 0, to: 1, msg: 'GET /orders/42' },
            { from: 1, to: 0, msg: '200 OK · JSON', kind: 'reply' },
            { from: 0, to: 1, msg: 'POST /orders' },
            { from: 1, to: 0, msg: '201 Created', kind: 'reply' },
        ],
        where: [
            { text: 'Web or mobile app → backend', path: [['browser', 'phone'], 'server'] },
            { text: 'Service → service', path: ['server', 'server'] },
            { text: 'Backend → third-party APIs', path: ['server', 'plug'] },
        ],
        use: 'Stateless, cacheable, one URL per resource. The default unless something below fits better.',
    },
    GraphQL: {
        pattern: 'One endpoint, client picks the fields',
        lanes: ['Client', 'GraphQL server', 'Data sources'],
        steps: [
            { from: 0, to: 1, msg: 'POST /graphql { user { name orders { total } } }' },
            { from: 1, to: 2, msg: 'resolve user, orders' },
            { from: 2, to: 1, msg: 'rows', kind: 'reply' },
            { from: 1, to: 0, msg: 'exactly those fields', kind: 'reply' },
        ],
        where: [
            { text: 'Frontend → backend-for-frontend', path: ['browser', 'server'] },
            { text: 'Dashboards that join many sources', path: ['chart', 'database'] },
        ],
        use: 'Saves round trips when one screen needs data from several places.',
    },
    WebSocket: {
        pattern: 'Open once, both sides push',
        lanes: ['Client', 'Server'],
        steps: [
            { from: 0, to: 1, msg: 'HTTP Upgrade: websocket' },
            { from: 1, to: 0, msg: '101 Switching Protocols', kind: 'reply' },
            { from: 1, to: 0, msg: 'price changed', kind: 'stream' },
            { from: 0, to: 1, msg: 'item scanned', kind: 'stream' },
            { from: 1, to: 0, msg: 'stock updated', kind: 'stream' },
        ],
        where: [
            { text: 'Browser ↔ backend for live dashboards', path: ['browser', 'server'] },
            { text: 'Store devices ↔ local hub', path: ['scanner', 'router'] },
            { text: 'Chat and presence', path: ['chat', 'server'] },
        ],
        use: 'Live updates without polling. The connection stays open until one side closes it.',
    },
    WebRTC: {
        pattern: 'Signal through a server, then peer to peer',
        lanes: ['Peer A', 'Signaling server', 'Peer B'],
        steps: [
            { from: 0, to: 1, msg: 'SDP offer' },
            { from: 1, to: 2, msg: 'offer' },
            { from: 2, to: 1, msg: 'SDP answer', kind: 'reply' },
            { from: 1, to: 0, msg: 'answer + ICE candidates', kind: 'reply' },
            { from: 0, to: 2, msg: 'audio · video · data (direct)', kind: 'stream' },
        ],
        where: [
            { text: 'Phone or browser ↔ phone or browser', path: ['phone', 'browser'] },
            { text: 'Camera viewer ↔ edge device', path: ['browser', 'camera'] },
        ],
        use: 'Low-latency media. The server only introduces the peers; the media skips it.',
    },
    MQTT: {
        pattern: 'Publish / subscribe through a broker',
        lanes: ['Device', 'Broker', 'Subscriber'],
        steps: [
            { from: 2, to: 1, msg: 'SUBSCRIBE store/7/temp' },
            { from: 0, to: 1, msg: 'PUBLISH store/7/temp 4.2°C' },
            { from: 1, to: 2, msg: 'deliver message', kind: 'stream' },
            { from: 0, to: 1, msg: 'PUBLISH (QoS 1)' },
            { from: 1, to: 0, msg: 'PUBACK', kind: 'reply' },
        ],
        where: [
            { text: 'Sensors and boards → broker → backend', path: ['chip', 'router', 'server'] },
            { text: 'Devices on weak or metered networks', path: ['signal', 'router'] },
        ],
        use: 'Tiny packets, topics instead of URLs, and delivery guarantees (QoS 0, 1, 2).',
    },
    Webhooks: {
        pattern: 'They call you when something happens',
        lanes: ['Your backend', 'Third party'],
        steps: [
            { from: 0, to: 1, msg: 'register https://you/hooks/pay' },
            { from: 1, to: 0, msg: 'POST event: invoice.paid', kind: 'stream' },
            { from: 0, to: 1, msg: '200 OK (verify signature)', kind: 'reply' },
        ],
        where: [
            { text: 'Payments, accounting and Git hosts → your backend', path: [['card', 'git'], 'server'] },
        ],
        use: 'Replaces polling. Check the signature and make the handler safe to run twice.',
    },
    'OAuth 2.0': {
        pattern: 'Authorization code flow',
        lanes: ['User / app', 'Auth server', 'API'],
        steps: [
            { from: 0, to: 1, msg: 'redirect: sign in, approve scopes' },
            { from: 1, to: 0, msg: 'code', kind: 'reply' },
            { from: 0, to: 1, msg: 'code + PKCE verifier → token' },
            { from: 1, to: 0, msg: 'access + refresh token', kind: 'reply' },
            { from: 0, to: 2, msg: 'Authorization: Bearer …' },
        ],
        where: [
            { text: '“Sign in with Google”', path: ['user', 'key'] },
            { text: 'Backend → QuickBooks, Google, Microsoft APIs', path: ['server', 'key', 'plug'] },
        ],
        use: 'Scoped access to another service without ever seeing the user’s password.',
    },
    RTSP: {
        pattern: 'Control channel + media stream',
        lanes: ['Recorder / server', 'IP camera'],
        steps: [
            { from: 0, to: 1, msg: 'DESCRIBE rtsp://cam/stream1' },
            { from: 1, to: 0, msg: 'SDP: H.264, 1080p', kind: 'reply' },
            { from: 0, to: 1, msg: 'SETUP · PLAY' },
            { from: 1, to: 0, msg: 'RTP video frames', kind: 'stream' },
        ],
        where: [
            { text: 'IP cameras → NVR or edge box', path: ['camera', 'box'] },
            { text: 'Edge box → video AI pipeline', path: ['box', 'ai'] },
        ],
        use: 'The standard way to pull live video off a camera on the local network.',
    },
    'SOAP / ONVIF': {
        pattern: 'XML request → response',
        lanes: ['Edge service', 'IP camera'],
        steps: [
            { from: 0, to: 1, msg: 'WS-Discovery probe (multicast)' },
            { from: 1, to: 0, msg: 'I’m here: device URL', kind: 'reply' },
            { from: 0, to: 1, msg: 'GetProfiles · GetStreamUri' },
            { from: 1, to: 0, msg: 'rtsp://… URL', kind: 'reply' },
            { from: 0, to: 1, msg: 'ContinuousMove (PTZ)' },
        ],
        where: [
            { text: 'Edge service → any brand of IP camera', path: ['box', 'camera'] },
        ],
        use: 'Finds cameras and controls them (pan, tilt, zoom) the same way across vendors.',
    },
    'Serial (UART)': {
        pattern: 'Bytes over a wire',
        lanes: ['Host PC / board', 'Device'],
        steps: [
            { from: 0, to: 1, msg: 'open COM3 · 9600 baud 8N1' },
            { from: 1, to: 0, msg: '012345678905\\r\\n (barcode)', kind: 'stream' },
            { from: 0, to: 1, msg: 'W\\r (read weight)' },
            { from: 1, to: 0, msg: '+001.25 lb', kind: 'reply' },
        ],
        where: [
            { text: 'Scanners, scales, Arduino and ESP32 → a local PC or board', path: ['scanner', 'cable', 'pc'] },
        ],
        use: 'No network at all: a fixed speed and a framing format both sides agree on.',
    },
    queries: {
        pattern: 'Query → rows',
        lanes: ['Backend', 'Database'],
        steps: [
            { from: 0, to: 1, msg: 'SELECT … WHERE store_id = $1' },
            { from: 1, to: 0, msg: 'rows', kind: 'reply' },
            { from: 0, to: 1, msg: 'BEGIN · UPDATE · COMMIT' },
            { from: 1, to: 0, msg: 'ok', kind: 'reply' },
        ],
        where: [
            { text: 'API server → Postgres, MongoDB, BigQuery', path: ['server', 'database'] },
            { text: 'Usually through a connection pool', path: ['server', 'database'] },
        ],
        use: 'Parameterized queries and transactions; only the backend talks to the database.',
    },
    'Pub/Sub · queues': {
        pattern: 'Fire and forget, processed later',
        lanes: ['Producer', 'Topic / queue', 'Worker'],
        steps: [
            { from: 0, to: 1, msg: 'publish: receipt.uploaded' },
            { from: 1, to: 0, msg: 'accepted', kind: 'reply' },
            { from: 1, to: 2, msg: 'deliver', kind: 'stream' },
            { from: 2, to: 1, msg: 'ack (or retry later)', kind: 'reply' },
        ],
        where: [
            { text: 'API → background workers', path: ['server', 'queue', 'worker'] },
            { text: 'Service → service across the cloud', path: ['server', 'cloud', 'server'] },
        ],
        use: 'Slow or bursty work leaves the request path; failed jobs retry on their own.',
    },
    RAG: {
        pattern: 'Retrieve, then generate',
        lanes: ['AI service', 'Vector store', 'LLM'],
        steps: [
            { from: 0, to: 1, msg: 'embed question → nearest chunks' },
            { from: 1, to: 0, msg: 'top 5 passages', kind: 'reply' },
            { from: 0, to: 2, msg: 'prompt + passages' },
            { from: 2, to: 0, msg: 'answer with sources', kind: 'reply' },
        ],
        where: [
            { text: 'Chat over your own documents', path: ['chat', 'file', 'ai'] },
            { text: 'Support and search assistants', path: ['user', 'ai'] },
        ],
        use: 'Grounds the model in your data instead of what it remembers.',
    },
    'CI/CD deploys': {
        pattern: 'Push → build → ship',
        lanes: ['Git', 'CI runner', 'Cloud / store'],
        steps: [
            { from: 0, to: 1, msg: 'push to main' },
            { from: 1, to: 1, msg: 'lint · test · build' },
            { from: 1, to: 2, msg: 'deploy image / upload build' },
            { from: 2, to: 1, msg: 'live ✓', kind: 'reply' },
        ],
        where: [
            { text: 'GitHub Actions → Vercel, Cloud Run, App Store, Play', path: ['git', 'worker', ['cloud', 'phone']] },
        ],
        use: 'Every merge ships the same way, so releases are boring.',
    },
};
