"use client";

import { useLayoutEffect, useRef, useState } from 'react';
import { BarChart3, Bot, Box, Cable, Camera, Cloud, Cpu, CreditCard, Database, FileText, GitBranch, Globe, KeyRound, Laptop, Layers, MessageSquare, Monitor, Plug, Radio, Router, ScanBarcode, Server, Smartphone, Sparkles, User, Workflow } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { EDGE_GROUPS, PROTOCOL_NOTES, PROVIDERS, SKILLS, type Skill, type ZoneId } from '@/data/skills';
import { FLOWS, FUNDAMENTALS, PROTOCOL_GROUPS, type Endpoint } from '@/data/protocol-flows';
import ProtocolVisual from './ProtocolVisual';

const VW = 1000, VH = 880;

type BoxZone = Exclude<ZoneId, 'protocol'>;
type Zone = { id: BoxZone; label: string; icon: React.ReactNode; x: number; y: number; w: number; h: number; note: string };

/**
 * The boxes of the system diagram as layers: clients on top, the backend as a bus across the middle,
 * services under it and DevOps along the bottom, so every link runs straight between two bands.
 * Positions are in a 1000×880 canvas.
 */
const ZONES: Zone[] = [
    { id: 'frontend', label: 'Frontend', icon: <Monitor size={15} />, x: 20, y: 20, w: 300, h: 225, note: 'Web apps, dashboards and sites.' },
    { id: 'mobile', label: 'Mobile · Desktop', icon: <Smartphone size={15} />, x: 350, y: 20, w: 300, h: 225, note: 'Store apps and Windows tools.' },
    { id: 'edge', label: 'Edge · Devices', icon: <Cpu size={15} />, x: 680, y: 20, w: 300, h: 225, note: 'Cameras, NVR / DVR recorders, on-site Windows apps and services, scanners and boards, and IoT controls like sirens, gates and lights.' },
    { id: 'backend', label: 'Backend · APIs', icon: <Server size={15} />, x: 20, y: 320, w: 960, h: 90, note: 'Services and workers in the middle of everything.' },
    { id: 'integrations', label: 'Integrations', icon: <Plug size={15} />, x: 20, y: 485, w: 210, h: 250, note: 'Third-party systems wired in, from accounting to POS terminals.' },
    { id: 'ai', label: 'AI · ML', icon: <Sparkles size={15} />, x: 270, y: 485, w: 210, h: 250, note: 'Models, agents, OCR and the data work behind them.' },
    { id: 'data', label: 'Data', icon: <Database size={15} />, x: 520, y: 485, w: 210, h: 250, note: 'Stores, search and analytics.' },
    { id: 'cloud', label: 'Cloud · Deploy', icon: <Cloud size={15} />, x: 770, y: 485, w: 210, h: 250, note: 'Cloud providers, storage and queues, and where things go live: hosting, edge workers, containers and the app stores.' },
    { id: 'devops', label: 'DevOps', icon: <GitBranch size={15} />, x: 20, y: 795, w: 960, h: 68, note: 'CI pipelines, version control, unit tests, API docs, monitoring and the shell.' },
];

/** How the layers talk, and over which protocols. `label` is for links that aren't a protocol. */
type Edge = { a: BoxZone; b: BoxZone; protos: string[]; label?: string; };
const EDGES: Edge[] = [
    { a: 'frontend', b: 'backend', protos: ['REST', 'GraphQL', 'WebSocket', 'OAuth 2.0'] },
    { a: 'mobile', b: 'backend', protos: ['REST', 'WebSocket', 'WebRTC'] },
    { a: 'edge', b: 'backend', protos: ['RTSP', 'SOAP / ONVIF', 'MQTT', 'Serial (UART)', 'WebSocket'] },
    { a: 'backend', b: 'integrations', protos: ['REST', 'Webhooks', 'OAuth 2.0'] },
    { a: 'backend', b: 'ai', protos: ['REST'] },
    { a: 'backend', b: 'data', protos: [], label: 'queries' },
    { a: 'backend', b: 'cloud', protos: [], label: 'Pub/Sub · queues' },
    { a: 'ai', b: 'data', protos: [], label: 'RAG' },
    { a: 'devops', b: 'cloud', protos: [], label: 'CI/CD deploys' },
];

const box = (id: string) => ZONES.find((z) => z.id === id)!;

/** Icons for the things a link usually joins, with a name for screen readers and tooltips. */
const ENDPOINT: Record<Endpoint, [LucideIcon, string]> = {
    ai: [Bot, 'AI model'], box: [Box, 'Edge box'], browser: [Globe, 'Browser'], cable: [Cable, 'Serial cable'], camera: [Camera, 'IP camera'],
    card: [CreditCard, 'Payments'], chart: [BarChart3, 'Dashboard'], chat: [MessageSquare, 'Chat'], chip: [Cpu, 'Sensor or board'], cloud: [Cloud, 'Cloud'],
    database: [Database, 'Database'], file: [FileText, 'Documents'], git: [GitBranch, 'Git host'], key: [KeyRound, 'Auth server'], pc: [Laptop, 'Local PC'],
    phone: [Smartphone, 'Phone app'], plug: [Plug, 'Third-party API'], queue: [Layers, 'Queue'], router: [Router, 'Hub or broker'], scanner: [ScanBarcode, 'Scanner'],
    server: [Server, 'Server'], signal: [Radio, 'Weak network'], user: [User, 'Person'], worker: [Workflow, 'Worker'],
};

function EndpointIcon({ k }: { k: Endpoint }) {
    const [Icon, name] = ENDPOINT[k];
    return <span className="sp-ep" title={name}><Icon size={15} aria-hidden="true" /><span className="sr-only">{name}</span></span>;
}

/** A chain of endpoints: server → queue → worker. A group shows alternatives (browser / phone). */
function EndpointPath({ path }: { path: (Endpoint | Endpoint[])[] }) {
    return (
        <span className="sp-ep-path">
            {path.map((step, i) => (
                <span key={i} className="sp-ep-path__step">
                    {i > 0 && <span className="sp-ep-path__arrow" aria-hidden="true">→</span>}
                    {Array.isArray(step)
                        ? <span className="sp-ep-group">{step.map((k, j) => <span key={k}>{j > 0 && <i aria-hidden="true">/</i>}<EndpointIcon k={k} /></span>)}</span>
                        : <EndpointIcon k={step} />}
                </span>
            ))}
        </span>
    );
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** A skill's logo: Devicon font, brand image, or a lettered badge. */
export function SkillLogo({ s, size = 18 }: { s: Skill; size?: number }) {
    const style = { width: size, height: size, fontSize: size };
    if (s.icon) return <span className="sp-logo" data-light={String(!!s.light)} style={style}><i className={s.icon} aria-hidden="true" /></span>;
    // eslint-disable-next-line @next/next/no-img-element
    if (s.img) return <span className="sp-logo" data-light={String(!!s.light)} style={style}><img src={s.img} alt="" width={size} height={size} /></span>;
    return <span className="sp-logo sp-logo--mono" style={{ ...style, fontSize: size * 0.42 }}>{s.mono}</span>;
}

const PROTOCOLS = SKILLS.filter((s) => s.zone === 'protocol');

/** A zone's tools split into its sub-groups, in a stable order (edge follows EDGE_GROUPS). */
function subGroups(zone: BoxZone) {
    const all = SKILLS.filter((s) => s.zone === zone);
    const names = zone === 'edge' ? EDGE_GROUPS.map((g) => g.name) : [...new Set(all.map((s) => s.sub ?? 'Core'))];
    return names.map((name) => ({ name, items: all.filter((s) => (s.sub ?? 'Core') === name) })).filter((g) => g.items.length);
}
/** Every name a link carries: its protocols, or its label. */
const carries = (e: Edge) => (e.protos.length ? e.protos : e.label ? [e.label] : []);

/** Skills as a system-design map: boxes are layers, arrows carry the protocols between them. */
/** One colour per protocol or link, so every wire can be told apart. Shown as swatches on the chips. */
const WIRE_COLOR: Record<string, string> = {
    REST: '#2563eb', GraphQL: '#e10098', WebSocket: '#0891b2', WebRTC: '#16a34a', MQTT: '#7c3aed', Webhooks: '#ea580c',
    'OAuth 2.0': '#ca8a04', RTSP: '#dc2626', 'SOAP / ONVIF': '#9333ea', 'Serial (UART)': '#0d9488',
    queries: '#475569', 'Pub/Sub · queues': '#db2777', RAG: '#65a30d', 'CI/CD deploys': '#1f2937',
};

type Pt = { x: number; y: number };
/** One protocol between two zones: a single trunk, forking like a Y into each sub-box that uses it. */
type Wire = { key: string; name: string; edge: Edge; trunk: string; d: string; ends: Pt[]; mid: Pt };

/** Sub-boxes in a zone that hold a tool providing `name`; empty when the whole layer speaks it. */
const providingSubs = (zone: BoxZone, name: string) =>
    subGroups(zone).filter((g) => g.items.some((s) => PROVIDERS[name]?.includes(s.name))).map((g) => g.name);

/** How far outside a zone the trunk forks into its branches. */
const FORK = 16;

/**
 * Lay out the wires from the live DOM boxes. Every protocol on a link gets its own evenly spaced
 * lane across the gap; at each end the lane forks into one branch per sub-box that provides it,
 * or meets the zone's edge directly when the whole layer speaks it.
 */
function layoutWires(canvas: HTMLElement): { w: number; h: number; wires: Wire[] } {
    const c = canvas.getBoundingClientRect();
    const rect = (sel: string) => {
        const el = canvas.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { l: r.left - c.left, t: r.top - c.top, r: r.right - c.left, b: r.bottom - c.top, cx: (r.left + r.right) / 2 - c.left, cy: (r.top + r.bottom) / 2 - c.top };
    };
    type R = NonNullable<ReturnType<typeof rect>>;
    const wires: Wire[] = [];
    for (const e of EDGES) {
        const A = rect(`[data-zone="${e.a}"]`), B = rect(`[data-zone="${e.b}"]`);
        if (!A || !B) continue;
        // Boxes in different bands talk up/down; neighbours in one band talk sideways.
        const stacked = A.b <= B.t + 1 || B.b <= A.t + 1;
        // Along = the axis the lanes are spread on (y for side-by-side zones, x for stacked ones).
        const along = (r: R) => (stacked ? r.cx : r.cy);
        const sideOf = (z: R, toward: R) => (stacked ? (z.cy < toward.cy ? z.b : z.t) : z.cx < toward.cx ? z.r : z.l);
        const dir = (z: R, toward: R) => (stacked ? (z.cy < toward.cy ? 1 : -1) : z.cx < toward.cx ? 1 : -1);
        const pt = (across: number, a: number): Pt => (stacked ? { x: a, y: across } : { x: across, y: a });

        const lanes = carries(e).map((name) => {
            // The backend is the hub: lines meet it straight on rather than forking across the bar.
            const subs = (zid: BoxZone) => (zid === 'backend' ? [] : providingSubs(zid, name)).map((g) => rect(`[data-sub="${zid}:${g}"]`)).filter((r): r is R => !!r).map(along);
            return { name, as: subs(e.a), bs: subs(e.b) };
        });
        // Each lane wants to sit over the sub-boxes it serves (or mid-span when the whole layer speaks it).
        const lo = Math.max(stacked ? A.l : A.t, stacked ? B.l : B.t) + 14, hi = Math.min(stacked ? A.r : A.b, stacked ? B.r : B.b) - 14;
        const [from, to] = hi > lo + 10 ? [lo, hi] : [Math.min(along(A), along(B)) - 30, Math.max(along(A), along(B)) + 30];
        const want = (xs: number[]) => (xs.length ? xs.reduce((p, q) => p + q, 0) / xs.length : (from + to) / 2);
        const placed = lanes.map((ln) => ({ ln, at: Math.min(to, Math.max(from, want([...ln.as, ...ln.bs]))) })).sort((p, q) => p.at - q.at);
        // Then push them apart so no two lanes sit closer than GAP, staying inside the span.
        const GAP = 16;
        for (let i = 1; i < placed.length; i++) placed[i].at = Math.max(placed[i].at, placed[i - 1].at + GAP);
        const over = placed.length ? placed[placed.length - 1].at - to : 0;
        if (over > 0) placed.forEach((p) => (p.at -= over));
        for (let i = placed.length - 2; i >= 0; i--) placed[i].at = Math.min(placed[i].at, placed[i + 1].at - GAP);

        placed.forEach(({ ln, at: lane }) => {
            const aEdge = sideOf(A, B), bEdge = sideOf(B, A), aDir = dir(A, B), bDir = dir(B, A);
            const aFork = pt(aEdge + aDir * FORK, lane), bFork = pt(bEdge + bDir * FORK, lane);
            const curve = (p: Pt, q: Pt) => (stacked
                ? `M ${p.x} ${p.y} C ${p.x} ${(p.y + q.y) / 2}, ${q.x} ${(p.y + q.y) / 2}, ${q.x} ${q.y}`
                : `M ${p.x} ${p.y} C ${(p.x + q.x) / 2} ${p.y}, ${(p.x + q.x) / 2} ${q.y}, ${q.x} ${q.y}`);
            const trunk = curve(aFork, bFork);
            // Branches: fork → each sub-box (Y shape), or a straight stub to the zone edge at the lane.
            const branch = (fork: Pt, edgeAcross: number, targets: number[]) =>
                (targets.length ? targets : [lane]).map((t) => ({ d: curve(fork, pt(edgeAcross, t)), end: pt(edgeAcross, t) }));
            const aB = branch(aFork, aEdge, ln.as), bB = branch(bFork, bEdge, ln.bs);
            wires.push({
                key: `${e.a}-${e.b}-${ln.name}`, name: ln.name, edge: e, trunk,
                d: [trunk, ...aB.map((x) => x.d), ...bB.map((x) => x.d)].join(' '),
                ends: [...aB.map((x) => x.end), ...bB.map((x) => x.end)],
                mid: { x: (aFork.x + bFork.x) / 2, y: (aFork.y + bFork.y) / 2 },
            });
        });
    }
    return { w: c.width, h: c.height, wires };
}

export default function SystemMap() {
    const [open, setOpen] = useState<BoxZone>('backend');
    const [proto, setProto] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [layout, setLayout] = useState<ReturnType<typeof layoutWires> | null>(null);

    // Wires follow the real boxes, so re-measure whenever the canvas changes size.
    useLayoutEffect(() => {
        const el = canvasRef.current;
        if (!el) return;
        const measure = () => setLayout(layoutWires(el));
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    const zone = ZONES.find((z) => z.id === open)!;
    const skills = SKILLS.filter((s) => s.zone === open);
    const groups = open === 'edge' ? EDGE_GROUPS.map((g) => g.name) : [...new Set(skills.map((s) => s.sub ?? 'Core'))];
    const edgeGroup = (g: string) => (open === 'edge' ? EDGE_GROUPS.find((e) => e.name === g) : undefined);
    const pick = (name: string) => setProto(proto === name ? null : name);
    const flow = proto ? FLOWS[proto] : undefined;
    /** Tools that provide the picked protocol, when we know them. */
    const providers = proto ? PROVIDERS[proto] : undefined;
    const fund = proto ? FUNDAMENTALS[proto] : undefined;

    return (
        <div className="sp-sys" data-proto={proto ?? ''}>
            <div className="sp-sys__canvas sp-sys__canvas--9" ref={canvasRef}>
                {layout && (
                    <svg viewBox={`0 0 ${layout.w} ${layout.h}`} className="sp-sys__wires" aria-hidden="true">
                        {layout.wires.map((w) => {
                            const on = proto ? w.name === proto : w.edge.a === open || w.edge.b === open;
                            const two = w.name === 'WebSocket' || w.name === 'MQTT' || w.name === 'WebRTC';
                            return (
                                <g key={w.key} className="sp-sys__edge" data-on={String(on)} data-dim={String(!!proto && !on)} style={{ ['--c' as string]: WIRE_COLOR[w.name] ?? 'var(--sp-ink-3)' }}>
                                    <title>{w.name}</title>
                                    <path d={w.d} className="sp-sys__line" />
                                    {on && <path d={w.trunk} className="sp-sys__flow" />}
                                    {w.ends.map((p, k) => <circle key={k} cx={p.x} cy={p.y} r={2.6} className="sp-sys__end" />)}
                                    {on && (
                                        <circle r={3.5} className="sp-sys__pulse">
                                            <animateMotion dur="1.8s" repeatCount="indefinite" path={w.trunk} />
                                        </circle>
                                    )}
                                    {on && two && (
                                        <circle r={3} className="sp-sys__pulse">
                                            <animateMotion dur="2.1s" repeatCount="indefinite" path={w.trunk} keyPoints="1;0" keyTimes="0;1" calcMode="linear" />
                                        </circle>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                )}
                {/* The picked protocol's name, once per wire */}
                {layout && proto && layout.wires.filter((w) => w.name === proto).map((w) => (
                    <span key={`t-${w.key}`} className="sp-sys__wire-tag" style={{ left: w.mid.x, top: w.mid.y, ['--c' as string]: WIRE_COLOR[w.name] }}>{w.name}</span>
                ))}

                {ZONES.map((z, i) => {
                    const all = SKILLS.filter((s) => s.zone === z.id);
                    return (
                        <button
                            key={z.id}
                            type="button"
                            className="sp-sys__zone"
                            data-zone={z.id}
                            aria-pressed={!proto && open === z.id}
                            aria-controls="sys-detail"
                            aria-label={`${z.label}: ${all.length} skills`}
                            onClick={() => { setOpen(z.id); setProto(null); }}
                            style={{ left: pct(z.x, VW), top: pct(z.y, VH), width: pct(z.w, VW), height: pct(z.h, VH), ['--d' as string]: `${i * 60}ms` }}
                        >
                            <span className="sp-sys__head"><span className="sp-sys__icon" aria-hidden="true">{z.icon}</span>{z.label}<b>{all.length}</b></span>
                            <span className="sp-sys__subs">
                                {subGroups(z.id).map((g) => {
                                    const has = !!providers && g.items.some((s) => providers.includes(s.name));
                                    return (
                                        <span key={g.name} data-sub={`${z.id}:${g.name}`} className="sp-sys__subbox" data-has={String(has)} data-dim={String(!!providers && !has)}>
                                            <span className="sp-sys__sublabel">{g.name}</span>
                                            <span className="sp-sys__logos">
                                                {g.items.map((s) => <span key={s.name} title={s.name} data-on={String(!!providers?.includes(s.name))}><SkillLogo s={s} size={18} /></span>)}
                                            </span>
                                        </span>
                                    );
                                })}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Protocols, grouped by how they talk: pick one to light up its wires and open its sheet */}
            <div className="sp-sys__protos" role="group" aria-label="Protocols and links">
                {PROTOCOL_GROUPS.map((g) => (
                    <div key={g.name} className="sp-sys__pgroup">
                        <span className="sp-sys__protos-label">{g.name}</span>
                        <div className="sp-sys__pgroup-items">
                            {g.items.map((name) => {
                                const skill = PROTOCOLS.find((p) => p.name === name);
                                return (
                                    <button key={name} type="button" className={skill ? '' : 'sp-sys__link-btn'} aria-pressed={proto === name} aria-controls="sys-detail" onClick={() => pick(name)}>
                                        {skill && <SkillLogo s={skill} size={16} />}{name}<i className="sp-sys__swatch" style={{ background: WIRE_COLOR[name] }} aria-hidden="true" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="sp-sys__detail" id="sys-detail" aria-live="polite" key={proto ?? open}>
                {proto ? (
                    <>
                        <p className="sp-sys__crumb">{PROTOCOLS.some((p) => p.name === proto) ? 'Protocol' : 'Link'} · {proto} {flow && <b>{flow.pattern}</b>} <span>· {PROTOCOL_NOTES[proto] ?? flow?.use}</span></p>
                        {flow && (
                            <div className="sp-flowbox">
                                <div className="sp-flowbox__diagram"><ProtocolVisual name={proto} color={WIRE_COLOR[proto]} /></div>
                                {fund && (
                                    <div className="sp-fund">
                                        <dl className="sp-fund__facts">
                                            {fund.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                                        </dl>
                                        <div className="sp-fund__pc">
                                            <div><p className="sp-sys__sub">Pros</p><ul className="sp-fund__list sp-fund__list--pro">{fund.pros.map((t) => <li key={t}>{t}</li>)}</ul></div>
                                            <div><p className="sp-sys__sub">Cons</p><ul className="sp-fund__list sp-fund__list--con">{fund.cons.map((t) => <li key={t}>{t}</li>)}</ul></div>
                                        </div>
                                    </div>
                                )}
                                <div className="sp-flowbox__side">
                                    <div>
                                        <p className="sp-sys__sub">How it works</p>
                                        <ol className="sp-flowbox__steps">
                                            {flow.steps.map((st, i) => <li key={i}><b>{flow.lanes[st.from]}{st.from !== st.to && <> → {flow.lanes[st.to]}</>}</b> {st.msg}</li>)}
                                        </ol>
                                        {PROTOCOL_NOTES[proto] && <p className="sp-flowbox__use">{flow.use}</p>}
                                    </div>
                                    <div>
                                        <p className="sp-sys__sub">Typically connects</p>
                                        <ul className="sp-flowbox__where">{flow.where.map((w) => <li key={w.text}><EndpointPath path={w.path} /><span>{w.text}</span></li>)}</ul>
                                    </div>
                                </div>
                            </div>
                        )}
                        {providers && (
                            <>
                                <p className="sp-sys__sub">Provided by</p>
                                <ul className="sp-sys__chips sp-sys__chips--providers">
                                    {providers.map((n) => SKILLS.find((s) => s.name === n)).filter((s): s is Skill => !!s).map((s) => (
                                        <li key={s.name}><SkillLogo s={s} size={18} />{s.name}<small>{s.sub}</small></li>
                                    ))}
                                </ul>
                            </>
                        )}
                        <p className="sp-sys__sub">On this map</p>
                        <ul className="sp-sys__chips">
                            {EDGES.filter((e) => carries(e).includes(proto)).map((e) => (
                                <li key={`${e.a}-${e.b}`}>{box(e.a).label} <span aria-hidden="true">⇄</span> {box(e.b).label}</li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <>
                        <p className="sp-sys__crumb"><span className="sp-sys__icon" aria-hidden="true">{zone.icon}</span>{zone.label} <b>{skills.length}</b> <span>· {zone.note}</span></p>
                        {groups.map((g) => (
                            <div key={g} className={`sp-sys__group ${edgeGroup(g) ? 'sp-sys__group--device' : ''}`}>
                                {groups.length > 1 && <p className="sp-sys__sub">{g}</p>}
                                {edgeGroup(g) && (
                                    <p className="sp-sys__devnote">
                                        {edgeGroup(g)!.note}
                                        {edgeGroup(g)!.protos.map((p) => <button key={p} type="button" className="sp-sys__devproto" onClick={() => pick(p)}>{p}</button>)}
                                    </p>
                                )}
                                <ul className="sp-sys__chips">
                                    {skills.filter((s) => (s.sub ?? 'Core') === g).map((s, i) => (
                                        <li key={s.name} style={{ ['--d' as string]: `${i * 25}ms` }}><SkillLogo s={s} size={20} />{s.name}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
