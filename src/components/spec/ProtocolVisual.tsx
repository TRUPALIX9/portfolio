"use client";

import { useEffect, useRef } from 'react';

/**
 * A small animated scene per protocol, each drawn the way that protocol actually behaves:
 * REST ping-pongs, a WebSocket stays open, MQTT fans out by topic, serial sends bits, and so on.
 * Animations are SVG SMIL on a fixed loop so they need no JS; reduced motion freezes a mid frame.
 */

const W = 460, H = 250;

/** Visible only between `s` and `e` seconds of a `T`-second loop. */
function Show({ s, e, T, children }: { s: number; e: number; T: number; children: React.ReactNode }) {
    return (
        <g opacity={0}>
            <animate attributeName="opacity" values="0;1;0" keyTimes={`0;${s / T};${Math.min(1, e / T)}`} calcMode="discrete" dur={`${T}s`} repeatCount="indefinite" />
            {children}
        </g>
    );
}

/** Moves its children along `path`, starting at `s` and taking `d` seconds, inside a `T`-second loop. */
function Move({ path, s, d, T, children }: { path: string; s: number; d: number; T: number; children: React.ReactNode }) {
    const a = s / T, b = Math.min(1, (s + d) / T);
    return (
        <g opacity={0}>
            <animateMotion path={path} dur={`${T}s`} repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes={`0;${a};${b};1`} calcMode="linear" />
            <animate attributeName="opacity" values="0;1;0" keyTimes={`0;${a};${b}`} calcMode="discrete" dur={`${T}s`} repeatCount="indefinite" />
            {children}
        </g>
    );
}

/** A labelled packet centred on its origin. */
function Pill({ text, tone = 'c' }: { text: string; tone?: 'c' | 'ink' | 'ok' | 'bad' | 'muted' }) {
    const w = text.length * 5.7 + 14;
    return (
        <g className={`pv-pill pv-pill--${tone}`}>
            <rect x={-w / 2} y={-9} width={w} height={18} rx={3} />
            <text x={0} y={3.5} textAnchor="middle">{text}</text>
        </g>
    );
}

function Node({ x, y, w, h, label, sub, dim }: { x: number; y: number; w: number; h: number; label: string; sub?: string; dim?: boolean }) {
    return (
        <g className="pv-node" opacity={dim ? 0.45 : 1}>
            <rect x={x} y={y} width={w} height={h} rx={3} />
            <text x={x + w / 2} y={y + h / 2 + (sub ? -2 : 4)} textAnchor="middle" className="pv-b">{label}</text>
            {sub && <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" className="pv-muted pv-xs">{sub}</text>}
        </g>
    );
}

const Caption = ({ children }: { children: string }) => <text x={W / 2} y={H - 6} textAnchor="middle" className="pv-muted pv-xs">{children}</text>;

/* ── REST: a request goes out, a response comes back, one at a time ─────────────────── */
function Rest() {
    const T = 6;
    const verbs = ['GET', 'POST', 'PUT', 'DELETE'];
    return (
        <>
            <g className="pv-url">
                <rect x={60} y={14} width={340} height={26} rx={13} />
                <text x={80} y={31} className="pv-xs">https://api.example.com/orders/42</text>
            </g>
            {verbs.map((v, i) => (
                <g key={v}>
                    <rect x={120 + i * 58} y={48} width={50} height={18} rx={2} className="pv-chip" />
                    <text x={145 + i * 58} y={61} textAnchor="middle" className="pv-xs">{v}</text>
                </g>
            ))}
            <Show s={0} e={2.6} T={T}><rect x={120} y={48} width={50} height={18} rx={2} className="pv-chip--on" /><text x={145} y={61} textAnchor="middle" className="pv-xs pv-on">GET</text></Show>
            <Show s={3} e={5.6} T={T}><rect x={178} y={48} width={50} height={18} rx={2} className="pv-chip--on" /><text x={203} y={61} textAnchor="middle" className="pv-xs pv-on">POST</text></Show>
            <Node x={14} y={92} w={104} h={74} label="Client" sub="browser · app" />
            <Node x={342} y={92} w={104} h={74} label="API server" sub="/orders" />
            <line x1={122} y1={112} x2={338} y2={112} className="pv-rail" markerEnd="url(#pvArrow)" />
            <line x1={338} y1={146} x2={122} y2={146} className="pv-rail" markerEnd="url(#pvArrow)" />
            <text x={230} y={104} textAnchor="middle" className="pv-muted pv-xs">request</text>
            <text x={230} y={162} textAnchor="middle" className="pv-muted pv-xs">response</text>
            <Move path="M 150 112 L 310 112" s={0} d={1.2} T={T}><Pill text="GET /orders/42" /></Move>
            <Move path="M 310 146 L 150 146" s={1.4} d={1.2} T={T}><Pill text="200 OK · {json}" tone="ok" /></Move>
            <Move path="M 150 112 L 310 112" s={3} d={1.2} T={T}><Pill text="POST /orders" /></Move>
            <Move path="M 310 146 L 150 146" s={4.4} d={1.2} T={T}><Pill text="201 Created" tone="ok" /></Move>
            <Show s={0} e={2.6} T={T}><text x={230} y={196} textAnchor="middle" className="pv-xs">read one order</text></Show>
            <Show s={3} e={5.6} T={T}><text x={230} y={196} textAnchor="middle" className="pv-xs">create a new one</text></Show>
            <Caption>one URL per resource · each request stands alone</Caption>
        </>
    );
}

/* ── GraphQL: ask for a shape, get exactly that shape back ─────────────────────────── */
function GraphQL() {
    const T = 7;
    const q = ['query {', '  user(id: 7) {', '    name', '    orders {', '      total', '    }', '  }', '}'];
    const r = ['{ "user": {', '  "name": "Ana",', '  "orders": [', '    { "total": 42 },', '    { "total": 18 }', '  ]', '} }'];
    const pick = [2, 4];
    return (
        <>
            <g className="pv-card"><rect x={8} y={14} width={140} height={176} rx={3} /></g>
            <text x={16} y={30} className="pv-muted pv-xs">you send</text>
            {q.map((l, i) => <text key={i} x={16} y={50 + i * 17} className={`pv-xs pv-pre ${pick.includes(i) || i === 1 || i === 3 ? 'pv-on' : ''}`}>{l}</text>)}
            {/* the server's graph: only the asked-for nodes light up */}
            <line x1={235} y1={60} x2={195} y2={130} className="pv-rail" />
            <line x1={235} y1={60} x2={278} y2={130} className="pv-rail" />
            <line x1={235} y1={60} x2={235} y2={180} className="pv-rail" />
            <g className="pv-gnode"><circle cx={235} cy={60} r={20} /><text x={235} y={64} textAnchor="middle" className="pv-xs">User</text></g>
            <g className="pv-gnode"><circle cx={195} cy={130} r={20} /><text x={195} y={134} textAnchor="middle" className="pv-xs">Orders</text></g>
            <g className="pv-gnode" opacity={0.35}><circle cx={278} cy={130} r={20} /><text x={278} y={134} textAnchor="middle" className="pv-xs">Address</text></g>
            <g className="pv-gnode" opacity={0.35}><circle cx={235} cy={180} r={20} /><text x={235} y={184} textAnchor="middle" className="pv-xs">Reviews</text></g>
            <Show s={1} e={T} T={T}><circle cx={235} cy={60} r={20} className="pv-glow" /></Show>
            <Show s={1.8} e={T} T={T}><circle cx={195} cy={130} r={20} className="pv-glow" /></Show>
            <Show s={2.2} e={T} T={T}><text x={278} y={160} textAnchor="middle" className="pv-muted pv-xs">not asked,</text><text x={278} y={172} textAnchor="middle" className="pv-muted pv-xs">not sent</text></Show>
            <g className="pv-card"><rect x={314} y={14} width={140} height={176} rx={3} /></g>
            <text x={322} y={30} className="pv-muted pv-xs">you get back</text>
            {r.map((l, i) => <Show key={i} s={2.8 + i * 0.3} e={T} T={T}><text x={322} y={50 + i * 17} className="pv-xs pv-pre">{l}</text></Show>)}
            <Caption>one endpoint · one round trip · exactly the fields you asked for</Caption>
        </>
    );
}

/* ── WebSocket: upgrade once, then an open pipe both sides push into ───────────────── */
function WebSocket() {
    const T = 6;
    const right = [['price', 1.4], ['stock', 2.6], ['alert', 3.6], ['price', 4.7]] as const;
    const left = [['scan', 1.9], ['ping', 3.1], ['scan', 4.2], ['ack', 5.1]] as const;
    return (
        <>
            <Node x={14} y={80} w={100} h={84} label="Client" sub="dashboard" />
            <Node x={346} y={80} w={100} h={84} label="Server" />
            <rect x={116} y={100} width={228} height={44} rx={22} className="pv-tube" />
            <Show s={0} e={1.2} T={T}><g transform="translate(230 70)"><Pill text="HTTP Upgrade → 101" tone="ink" /></g></Show>
            <Show s={1.2} e={T} T={T}><circle cx={180} cy={70} r={4} className="pv-live" /><text x={190} y={74} className="pv-xs">connection open</text></Show>
            {right.map(([t, s], i) => <Move key={`r${i}`} path="M 140 113 L 320 113" s={s} d={1.1} T={T}><Pill text={t} /></Move>)}
            {left.map(([t, s], i) => <Move key={`l${i}`} path="M 320 131 L 140 131" s={s} d={1.1} T={T}><Pill text={t} tone="ink" /></Move>)}
            <text x={230} y={168} textAnchor="middle" className="pv-muted pv-xs">server → client and client → server, at the same time</text>
            <Caption>one connection kept open · no polling</Caption>
        </>
    );
}

/* ── WebRTC: meet through a signaling server, then talk directly ───────────────────── */
function WebRTC() {
    const T = 8;
    return (
        <>
            <Node x={180} y={12} w={100} h={46} label="Signaling" sub="server" />
            <Node x={14} y={150} w={104} h={62} label="Peer A" sub="phone" />
            <Node x={342} y={150} w={104} h={62} label="Peer B" sub="browser" />
            <path d="M 80 150 L 200 58" className="pv-rail pv-dash" />
            <path d="M 260 58 L 380 150" className="pv-rail pv-dash" />
            <Move path="M 80 150 L 200 58" s={0} d={1} T={T}><Pill text="offer" tone="ink" /></Move>
            <Move path="M 260 58 L 380 150" s={1.1} d={1} T={T}><Pill text="offer" tone="ink" /></Move>
            <Move path="M 380 150 L 260 58" s={2.2} d={1} T={T}><Pill text="answer" tone="ink" /></Move>
            <Move path="M 200 58 L 80 150" s={3.3} d={1} T={T}><Pill text="answer + ICE" tone="ink" /></Move>
            <Show s={4.4} e={T} T={T}>
                <line x1={120} y1={181} x2={340} y2={181} className="pv-direct" />
                <text x={230} y={230} textAnchor="middle" className="pv-xs">media flows peer to peer</text>
                <text x={230} y={74} textAnchor="middle" className="pv-muted pv-xs">(no longer in the path)</text>
            </Show>
            {[0, 1, 2, 3].map((i) => <Move key={`a${i}`} path="M 128 176 L 332 176" s={4.5 + i * 0.8} d={1} T={T}><rect x={-8} y={-5} width={16} height={10} rx={1} className="pv-frame" /></Move>)}
            {[0, 1, 2, 3].map((i) => <Move key={`b${i}`} path="M 332 187 L 128 187" s={4.9 + i * 0.8} d={1} T={T}><rect x={-8} y={-5} width={16} height={10} rx={1} className="pv-frame pv-frame--b" /></Move>)}
        </>
    );
}

/* ── MQTT: devices publish to topics, the broker fans out only to matching subscribers ─ */
function Mqtt() {
    const T = 7;
    return (
        <>
            <Node x={8} y={34} w={100} h={44} label="Temp sensor" sub="publisher" />
            <Node x={8} y={150} w={100} h={44} label="Door board" sub="publisher" />
            <g className="pv-broker"><circle cx={225} cy={112} r={46} /><text x={225} y={108} textAnchor="middle" className="pv-b">Broker</text><text x={225} y={122} textAnchor="middle" className="pv-muted pv-xs">routes by topic</text></g>
            <Node x={346} y={14} w={108} h={44} label="Dashboard" sub="store/7/#" />
            <Node x={346} y={90} w={108} h={44} label="Backend" sub="store/+/temp" />
            <Node x={346} y={166} w={108} h={44} label="Phone" sub="store/9/door" />
            {['M 108 56 L 180 100', 'M 108 172 L 180 125', 'M 270 100 L 346 36', 'M 271 112 L 346 112', 'M 270 125 L 346 188'].map((d) => <path key={d} d={d} className="pv-rail" />)}
            <Move path="M 108 56 L 180 100" s={0} d={1} T={T}><Pill text="store/7/temp 4.2°C" /></Move>
            <Move path="M 180 100 L 108 56" s={1.1} d={0.7} T={T}><Pill text="PUBACK" tone="ink" /></Move>
            <Move path="M 270 100 L 346 36" s={1.2} d={1} T={T}><Pill text="4.2°C" /></Move>
            <Move path="M 271 112 L 346 112" s={1.2} d={1} T={T}><Pill text="4.2°C" /></Move>
            <Show s={1.2} e={3} T={T}><text x={400} y={224} textAnchor="middle" className="pv-muted pv-xs">✕ not its topic</text></Show>
            <Move path="M 108 172 L 180 125" s={3.6} d={1} T={T}><Pill text="store/7/door open" tone="ink" /></Move>
            <Move path="M 270 100 L 346 36" s={4.8} d={1} T={T}><Pill text="open" tone="ink" /></Move>
            <Show s={4.8} e={6.6} T={T}><text x={400} y={148} textAnchor="middle" className="pv-muted pv-xs">✕ only wants temp</text></Show>
            <Caption>publishers never know who listens · tiny packets · QoS 0/1/2</Caption>
        </>
    );
}

/* ── Webhooks: polling over and over vs. one call when it happens ──────────────────── */
function Webhooks() {
    const T = 8;
    return (
        <>
            <text x={8} y={16} className="pv-muted pv-xs">polling</text>
            <Node x={8} y={24} w={104} h={42} label="Your server" dim />
            <Node x={348} y={24} w={104} h={42} label="Service" dim />
            <line x1={112} y1={45} x2={348} y2={45} className="pv-rail" />
            {[0, 1.6, 3.2, 4.8].map((s) => (
                <g key={s}>
                    <Move path="M 140 38 L 320 38" s={s} d={0.7} T={T}><Pill text="anything new?" tone="muted" /></Move>
                    <Move path="M 320 54 L 140 54" s={s + 0.8} d={0.6} T={T}><Pill text="no" tone="muted" /></Move>
                </g>
            ))}
            <text x={230} y={84} textAnchor="middle" className="pv-muted pv-xs">lots of requests, mostly wasted</text>
            <line x1={8} y1={100} x2={452} y2={100} className="pv-sep" />
            <text x={8} y={120} className="pv-b pv-xs">webhook</text>
            <Node x={8} y={136} w={104} h={52} label="Your endpoint" sub="/hooks/pay" />
            <Node x={348} y={136} w={104} h={52} label="Service" sub="payments" />
            <line x1={112} y1={162} x2={348} y2={162} className="pv-rail" />
            <Show s={5.4} e={6.4} T={T}><circle cx={400} cy={136} r={10} className="pv-ping" /><text x={400} y={128} textAnchor="middle" className="pv-xs">invoice.paid</text></Show>
            <Move path="M 330 155 L 135 155" s={5.6} d={1.1} T={T}><Pill text="POST event + signature" /></Move>
            <Move path="M 135 171 L 330 171" s={6.8} d={0.8} T={T}><Pill text="200 OK" tone="ok" /></Move>
            <Caption>they call you once, the moment it happens</Caption>
        </>
    );
}

/* ── OAuth 2.0: consent, a code, swap it for a token, call the API with it ─────────── */
function OAuth() {
    const T = 10;
    const steps: [string, number, number][] = [
        ['1 · send the user to sign in', 0, 1.6], ['2 · user approves the scopes', 1.6, 3.4], ['3 · auth server returns a code', 3.4, 4.8],
        ['4 · app swaps code + verifier', 4.8, 6.2], ['5 · gets an access token', 6.2, 7.6], ['6 · calls the API with it', 7.6, T],
    ];
    return (
        <>
            <Node x={8} y={22} w={96} h={44} label="User" />
            <Node x={8} y={160} w={96} h={44} label="Your app" />
            <Node x={356} y={22} w={96} h={44} label="Auth server" sub="Google · Intuit" />
            <Node x={356} y={160} w={96} h={44} label="API" />
            {steps.map(([t, s, e]) => <Show key={t} s={s} e={e} T={T}><text x={230} y={236} textAnchor="middle" className="pv-b pv-xs">{t}</text></Show>)}
            <Move path="M 104 170 L 356 56" s={0.2} d={1.2} T={T}><Pill text="redirect ↗" tone="ink" /></Move>
            <Show s={1.6} e={3.4} T={T}>
                <g className="pv-card"><rect x={170} y={36} width={120} height={98} rx={4} /></g>
                <text x={180} y={54} className="pv-xs pv-b">Your app wants to:</text>
                <text x={180} y={74} className="pv-xs">☑ read invoices</text>
                <text x={180} y={90} className="pv-xs">☑ create reports</text>
                <rect x={196} y={104} width={68} height={20} rx={3} className="pv-btn" />
                <text x={230} y={118} textAnchor="middle" className="pv-xs pv-white">Allow</text>
            </Show>
            <Move path="M 104 44 L 356 44" s={2.6} d={0.8} T={T}><Pill text="approve" tone="ok" /></Move>
            <Move path="M 356 66 L 104 166" s={3.5} d={1.2} T={T}><Pill text="code" tone="ink" /></Move>
            <Move path="M 104 178 L 356 70" s={4.9} d={1.2} T={T}><Pill text="code + PKCE" tone="ink" /></Move>
            <Move path="M 356 74 L 104 186" s={6.3} d={1.2} T={T}><Pill text="🔑 access token" /></Move>
            <Move path="M 104 190 L 356 190" s={7.7} d={1.2} T={T}><Pill text="Bearer 🔑" /></Move>
            <Show s={8.9} e={T} T={T}><text x={404} y={220} textAnchor="middle" className="pv-xs">200 · scoped data</text></Show>
        </>
    );
}

/* ── RTSP: a control talk, then a steady stream of video frames ────────────────────── */
function Rtsp() {
    const T = 7;
    return (
        <>
            <g className="pv-cam">
                <rect x={14} y={92} width={78} height={48} rx={6} />
                <circle cx={53} cy={116} r={15} /><circle cx={53} cy={116} r={7} className="pv-lens" />
                <rect x={44} y={140} width={18} height={30} />
            </g>
            <text x={53} y={186} textAnchor="middle" className="pv-xs">IP camera</text>
            <Show s={3.3} e={T} T={T}><circle cx={84} cy={100} r={4} className="pv-rec" /></Show>
            <Node x={346} y={86} w={104} h={70} label="NVR · server" sub="records · analyses" />
            <text x={220} y={50} textAnchor="middle" className="pv-muted pv-xs">control · RTSP over TCP 554</text>
            <line x1={100} y1={64} x2={346} y2={64} className="pv-rail" />
            <Move path="M 330 64 L 120 64" s={0} d={0.8} T={T}><Pill text="DESCRIBE" tone="ink" /></Move>
            <Move path="M 120 64 L 330 64" s={0.9} d={0.8} T={T}><Pill text="SDP · H.264 1080p" tone="ink" /></Move>
            <Move path="M 330 64 L 120 64" s={1.8} d={0.7} T={T}><Pill text="SETUP" tone="ink" /></Move>
            <Move path="M 330 64 L 120 64" s={2.6} d={0.7} T={T}><Pill text="PLAY" /></Move>
            <text x={220} y={204} textAnchor="middle" className="pv-muted pv-xs">media · RTP frames</text>
            <line x1={100} y1={176} x2={346} y2={176} className="pv-rail" />
            {Array.from({ length: 9 }, (_, i) => (
                <Move key={i} path="M 110 176 L 336 176" s={3.4 + i * 0.4} d={1.2} T={T}>
                    <rect x={-11} y={-8} width={22} height={16} rx={1} className="pv-frame" />
                    <rect x={-8} y={-5} width={16} height={10} className="pv-frame-in" />
                </Move>
            ))}
            <Caption>ask once, then the camera keeps streaming</Caption>
        </>
    );
}

/* ── SOAP / ONVIF: find cameras, ask for profiles, then steer one ──────────────────── */
function Onvif() {
    const T = 9;
    return (
        <>
            <Node x={8} y={90} w={110} h={60} label="Edge service" sub="any camera brand" />
            {[0, 0.4, 0.8].map((d) => (
                <Show key={d} s={0} e={1.4} T={T}>
                    <circle cx={118} cy={120} r={10} className="pv-ripple">
                        <animate attributeName="r" values="10;70" dur="1.2s" begin={`${d}s`} repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0" dur="1.2s" begin={`${d}s`} repeatCount="indefinite" />
                    </circle>
                </Show>
            ))}
            <Show s={0} e={1.4} T={T}><text x={180} y={70} className="pv-xs">WS-Discovery: who’s there?</text></Show>
            {/* PTZ dome that pans on command */}
            <g className="pv-cam">
                <rect x={350} y={60} width={92} height={14} rx={2} />
                <g>
                    <animateTransform attributeName="transform" type="rotate" values="0 396 100;0 396 100;-35 396 100;30 396 100;0 396 100;0 396 100" keyTimes="0;0.6;0.7;0.82;0.9;1" dur={`${T}s`} repeatCount="indefinite" />
                    <path d="M 366 74 A 30 30 0 0 0 426 74 Z" />
                    <circle cx={396} cy={92} r={7} className="pv-lens" />
                </g>
            </g>
            <text x={396} y={124} textAnchor="middle" className="pv-xs">PTZ camera</text>
            <Move path="M 350 100 L 130 108" s={1.4} d={1} T={T}><Pill text="Hello · http://cam/onvif" tone="ink" /></Move>
            {([['GetProfiles', 2.6, 'out'], ['Profile_1 · rtsp://…', 3.8, 'back'], ['ContinuousMove(pan)', 5, 'out']] as const).map(([t, s, dir]) => (
                <Move key={t} path={dir === 'out' ? 'M 130 128 L 345 108' : 'M 345 118 L 130 138'} s={s} d={1} T={T}>
                    <g className="pv-env"><rect x={-12} y={-24} width={24} height={16} /><path d="M -12 -24 L 0 -15 L 12 -24" /></g>
                    <Pill text={t} tone={dir === 'out' ? 'c' : 'ink'} />
                </Move>
            ))}
            <g className="pv-card"><rect x={8} y={176} width={444} height={44} rx={3} /></g>
            <text x={16} y={194} className="pv-xs pv-pre">{'<s:Envelope><s:Body>'}</text>
            <text x={16} y={210} className="pv-xs pv-pre pv-on">{'  <tptz:ContinuousMove><Velocity pan="0.5"/></tptz:ContinuousMove>'}</text>
            <Caption>XML envelopes over HTTP · same calls for every brand</Caption>
        </>
    );
}

/* ── Serial (UART): bits on a wire, framed by start and stop bits ──────────────────── */
function Serial() {
    const T = 6;
    // 0x31 ('1'), sent least significant bit first, framed as start(0) … stop(1).
    const bits = [0, 1, 0, 0, 0, 1, 1, 0, 0, 1];
    const cell = 18, hi = 96, lo = 116;
    let d = `M 0 ${hi} L 30 ${hi}`, x = 30, prev = 1;
    for (const b of bits) { const y = b ? hi : lo; if (b !== prev) d += ` L ${x} ${y}`; x += cell; d += ` L ${x} ${y}`; prev = b; }
    d += ` L ${x + 30} ${hi}`;
    const frameW = x + 30;
    const labels = ['S', '1', '0', '0', '0', '1', '1', '0', '0', 'P'];
    return (
        <>
            <g className="pv-chip-ic"><rect x={8} y={70} width={76} height={110} rx={3} />{[0, 1, 2, 3, 4].map((i) => <line key={i} x1={84} y1={84 + i * 20} x2={92} y2={84 + i * 20} />)}</g>
            <text x={46} y={122} textAnchor="middle" className="pv-xs pv-b">Host</text>
            <text x={46} y={136} textAnchor="middle" className="pv-muted pv-xs">PC · ESP32</text>
            <g className="pv-chip-ic"><rect x={376} y={70} width={76} height={110} rx={3} /></g>
            <text x={414} y={122} textAnchor="middle" className="pv-xs pv-b">Scanner</text>
            <text x={98} y={80} className="pv-muted pv-xs">RX ← TX</text>
            <text x={98} y={156} className="pv-muted pv-xs">TX → RX</text>
            <text x={98} y={176} className="pv-muted pv-xs">GND</text>
            <line x1={92} y1={160} x2={376} y2={160} className="pv-rail" />
            <line x1={92} y1={172} x2={376} y2={172} className="pv-rail pv-dash" />
            <clipPath id="pvSerialClip"><rect x={92} y={80} width={284} height={50} /></clipPath>
            <g clipPath="url(#pvSerialClip)">
                <g>
                    <animateTransform attributeName="transform" type="translate" values={`376 0;${92 - frameW} 0`} dur={`${T}s`} repeatCount="indefinite" />
                    <path d={d} className="pv-wave" />
                    {labels.map((l, i) => <text key={i} x={30 + i * cell + cell / 2} y={128} textAnchor="middle" className={`pv-xs ${i === 0 || i === 9 ? 'pv-muted' : 'pv-on'}`}>{l}</text>)}
                </g>
            </g>
            <Show s={4.6} e={T} T={T}><g transform="translate(46 210)"><Pill text="0x31 = '1'" /></g></Show>
            <Caption>9600 baud · 8N1 · no clock: both ends agree on the speed</Caption>
        </>
    );
}

/* ── Queries: SQL goes in through a pool, rows come back ──────────────────────────── */
function Queries() {
    const T = 7;
    const rows = [['1042', 'Coke 12oz', '1.99'], ['1043', 'Chips', '2.49'], ['1044', 'Coffee', '1.29']];
    return (
        <>
            <Node x={8} y={54} w={100} h={64} label="Backend" sub="API server" />
            <g className="pv-db">
                <path d="M 352 52 L 352 116 A 48 12 0 0 0 448 116 L 448 52" />
                <ellipse cx={400} cy={52} rx={48} ry={12} />
            </g>
            <text x={400} y={92} textAnchor="middle" className="pv-b pv-xs">PostgreSQL</text>
            {[70, 86, 102].map((y) => <line key={y} x1={108} y1={y} x2={352} y2={y} className="pv-rail" />)}
            <text x={230} y={60} textAnchor="middle" className="pv-muted pv-xs">connection pool</text>
            <Move path="M 150 86 L 300 86" s={0} d={1.2} T={T}><Pill text="SELECT … WHERE store = $1" /></Move>
            <Move path="M 300 102 L 150 102" s={1.4} d={1} T={T}><Pill text="3 rows" tone="ok" /></Move>
            <g className="pv-card"><rect x={120} y={130} width={220} height={82} rx={3} /></g>
            {['sku', 'name', 'price'].map((h, i) => <text key={h} x={132 + i * 72} y={148} className="pv-muted pv-xs">{h}</text>)}
            {rows.map((r, j) => (
                <Show key={j} s={1.6 + j * 0.3} e={T} T={T}>{r.map((c, i) => <text key={i} x={132 + i * 72} y={168 + j * 16} className="pv-xs">{c}</text>)}</Show>
            ))}
            <Move path="M 150 70 L 300 70" s={3.6} d={1.2} T={T}><Pill text="BEGIN · UPDATE · COMMIT" tone="ink" /></Move>
            <Move path="M 300 102 L 150 102" s={5} d={1} T={T}><Pill text="✓ committed" tone="ok" /></Move>
            <Caption>parameterised queries · transactions all-or-nothing</Caption>
        </>
    );
}

/* ── Pub/Sub · queues: drop work in, workers take it off when they can ─────────────── */
function Queues() {
    const T = 6;
    return (
        <>
            <Node x={8} y={88} w={90} h={60} label="API" sub="producer" />
            <g className="pv-queue"><rect x={140} y={98} width={170} height={40} rx={4} />{[1, 2, 3, 4].map((i) => <line key={i} x1={140 + i * 34} y1={98} x2={140 + i * 34} y2={138} />)}</g>
            <text x={225} y={92} textAnchor="middle" className="pv-muted pv-xs">topic / queue</text>
            <Node x={352} y={30} w={100} h={48} label="Worker 1" />
            <Node x={352} y={158} w={100} h={48} label="Worker 2" />
            <Show s={0.2} e={1.4} T={T}><g transform="translate(53 72)"><Pill text="202 accepted" tone="ok" /></g></Show>
            {[0, 0.8, 1.6, 2.4, 3.2, 4].map((s, i) => {
                const fail = i === 3, toTop = i % 2 === 0;
                const path = fail ? 'M 98 118 L 300 118 L 352 182 L 300 118 L 160 118' : toTop ? 'M 98 118 L 300 118 L 352 56' : 'M 98 118 L 300 118 L 352 182';
                return <Move key={s} path={path} s={s} d={fail ? 2.6 : 1.8} T={T}><rect x={-7} y={-7} width={14} height={14} rx={2} className={fail ? 'pv-msg pv-msg--bad' : 'pv-msg'} /></Move>;
            })}
            <Show s={1.9} e={2.6} T={T}><text x={464} y={60} textAnchor="end" className="pv-ok pv-xs">✓ ack</text></Show>
            <Show s={4.2} e={5.2} T={T}><text x={402} y={222} textAnchor="middle" className="pv-bad pv-xs">✕ failed → back in the queue</text></Show>
            <Caption>the request returns right away · slow work happens later, with retries</Caption>
        </>
    );
}

/* ── RAG: embed the question, find the nearest passages, answer from them ──────────── */
function Rag() {
    const T = 8;
    const dots: [number, number][] = [[170, 40], [190, 120], [210, 60], [240, 150], [260, 40], [280, 110], [300, 70], [180, 160], [290, 150], [220, 30], [300, 30], [165, 90], [250, 75], [228, 108], [270, 92]];
    const near = [12, 13, 14];
    return (
        <>
            <g className="pv-card"><rect x={8} y={20} width={126} height={34} rx={14} /></g>
            <text x={71} y={41} textAnchor="middle" className="pv-xs">How do refunds work?</text>
            <Show s={0.6} e={T} T={T}>
                {[14, 26, 10, 30, 20, 8].map((h, i) => <rect key={i} x={30 + i * 14} y={110 - h} width={9} height={h} className="pv-bar" />)}
                <text x={71} y={126} textAnchor="middle" className="pv-muted pv-xs">embedding</text>
            </Show>
            <g className="pv-space"><rect x={150} y={14} width={166} height={160} rx={3} /></g>
            <text x={233} y={186} textAnchor="middle" className="pv-muted pv-xs">vector store</text>
            {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3.5} className="pv-dot" />)}
            <Show s={1.6} e={T} T={T}>
                <path d="M 250 98 l 4 8 l 9 1 l -7 6 l 2 9 l -8 -5 l -8 5 l 2 -9 l -7 -6 l 9 -1 z" className="pv-star" />
                <circle cx={250} cy={98} r={10} className="pv-ring"><animate attributeName="r" values="10;34;34" dur="1s" begin="0s" fill="freeze" repeatCount="indefinite" /></circle>
            </Show>
            {near.map((n, i) => <Show key={n} s={2.4 + i * 0.2} e={T} T={T}><circle cx={dots[n][0]} cy={dots[n][1]} r={5} className="pv-dot--on" /><line x1={250} y1={106} x2={dots[n][0]} y2={dots[n][1]} className="pv-link" /></Show>)}
            {['refunds.md', 'faq#returns', 'terms §4'].map((t, i) => (
                <Show key={t} s={3.2 + i * 0.25} e={T} T={T}><g className="pv-card"><rect x={330} y={18 + i * 36} width={122} height={28} rx={2} /></g><text x={340} y={36 + i * 36} className="pv-xs">[{i + 1}] {t}</text></Show>
            ))}
            <Node x={190} y={196} w={90} h={34} label="LLM" />
            <Move path="M 390 128 L 280 206" s={4.4} d={0.9} T={T}><Pill text="question + passages" tone="ink" /></Move>
            <Show s={5.6} e={T} T={T}><g className="pv-card"><rect x={296} y={196} width={156} height={34} rx={14} /></g><text x={374} y={217} textAnchor="middle" className="pv-xs">Within 30 days [1][2]</text></Show>
        </>
    );
}

/* ── CI/CD: push, and every stage runs in order until it’s live ────────────────────── */
function CiCd() {
    const T = 8;
    const stages = [['Push', 'Git'], ['Lint', 'ESLint'], ['Test', 'Jest · Playwright'], ['Build', 'Docker'], ['Deploy', 'Actions'], ['Live', '✓']];
    const x0 = 34, step = 78;
    return (
        <>
            <line x1={x0} y1={80} x2={x0 + step * 5} y2={80} className="pv-rail" />
            <line x1={x0} y1={80} x2={x0 + step * 5} y2={80} className="pv-progress" pathLength={1}>
                <animate attributeName="stroke-dashoffset" values="1;0;0" keyTimes="0;0.75;1" dur={`${T}s`} repeatCount="indefinite" />
            </line>
            {stages.map(([n, tool], i) => (
                <g key={n}>
                    <circle cx={x0 + i * step} cy={80} r={16} className="pv-stage" />
                    <Show s={i * 1.2} e={T} T={T}><circle cx={x0 + i * step} cy={80} r={16} className="pv-stage--on" /><text x={x0 + i * step} y={84} textAnchor="middle" className="pv-white pv-xs">✓</text></Show>
                    <text x={x0 + i * step} y={52} textAnchor="middle" className="pv-b pv-xs">{n}</text>
                    <text x={x0 + i * step} y={112} textAnchor="middle" className="pv-muted pv-xs">{tool}</text>
                </g>
            ))}
            <g className="pv-term"><rect x={8} y={134} width={260} height={84} rx={3} /></g>
            {['$ git push origin main', '$ npm run lint      ✓', '$ npm test          ✓ 128 passed', '$ docker build .    ✓', '→ deployed'].map((l, i) => (
                <Show key={l} s={i * 1.2 + 0.2} e={T} T={T}><text x={18} y={152 + i * 14} className="pv-xs pv-pre pv-term-t">{l}</text></Show>
            ))}
            {['Vercel', 'Cloud Run', 'App Store', 'Play'].map((t, i) => (
                <Show key={t} s={6} e={T} T={T}><g transform={`translate(${352} ${146 + i * 20})`}><Pill text={t} tone="ok" /></g></Show>
            ))}
            <Caption>every merge ships the same way</Caption>
        </>
    );
}

const SCENES: Record<string, () => React.ReactElement> = {
    REST: Rest, GraphQL, WebSocket, WebRTC, MQTT: Mqtt, Webhooks, 'OAuth 2.0': OAuth, RTSP: Rtsp,
    'SOAP / ONVIF': Onvif, 'Serial (UART)': Serial, queries: Queries, 'Pub/Sub · queues': Queues, RAG: Rag, 'CI/CD deploys': CiCd,
};

export default function ProtocolVisual({ name, color }: { name: string; color?: string }) {
    const ref = useRef<SVGSVGElement>(null);
    const Scene = SCENES[name];

    // Restart from the top whenever the protocol changes; freeze mid-way for reduced motion.
    useEffect(() => {
        const svg = ref.current;
        if (!svg) return;
        svg.setCurrentTime(0);
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            svg.setCurrentTime(3.5);
            svg.pauseAnimations();
        } else svg.unpauseAnimations();
    }, [name]);

    if (!Scene) return null;
    return (
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="pv" style={{ ['--c' as string]: color ?? 'var(--sp-accent)' }} role="img" aria-label={`Animated diagram of how ${name} works`}>
            <defs>
                <marker id="pvArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="currentColor" /></marker>
            </defs>
            <Scene />
        </svg>
    );
}
