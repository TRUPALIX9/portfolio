"use client";

import { useState } from 'react';
import { Cloud, Cpu, Database, GitBranch, Monitor, Plug, Server, Smartphone, Sparkles } from 'lucide-react';
import { PROTOCOL_NOTES, SKILLS, type Skill, type ZoneId } from '@/data/skills';

const VW = 1000, VH = 600;

type BoxZone = Exclude<ZoneId, 'protocol'>;
type Zone = { id: BoxZone; label: string; icon: React.ReactNode; x: number; y: number; w: number; h: number; note: string };

/** The boxes of the system diagram, three columns of three. Positions are in a 1000×600 canvas. */
const ZONES: Zone[] = [
    { id: 'frontend', label: 'Frontend', icon: <Monitor size={15} />, x: 20, y: 18, w: 230, h: 170, note: 'Web apps, dashboards and sites.' },
    { id: 'mobile', label: 'Mobile · Desktop', icon: <Smartphone size={15} />, x: 20, y: 215, w: 230, h: 170, note: 'Store apps and Windows tools.' },
    { id: 'edge', label: 'Edge · Devices', icon: <Cpu size={15} />, x: 20, y: 412, w: 230, h: 170, note: 'Cameras, scanners, boards and on-site services.' },
    { id: 'integrations', label: 'Integrations', icon: <Plug size={15} />, x: 385, y: 18, w: 230, h: 160, note: 'Third-party systems wired in, from accounting to POS terminals.' },
    { id: 'backend', label: 'Backend · APIs', icon: <Server size={15} />, x: 385, y: 215, w: 230, h: 170, note: 'Services and workers in the middle of everything.' },
    { id: 'ai', label: 'AI · ML', icon: <Sparkles size={15} />, x: 385, y: 422, w: 230, h: 160, note: 'Models, agents, OCR and the data work behind them.' },
    { id: 'data', label: 'Data', icon: <Database size={15} />, x: 750, y: 18, w: 230, h: 170, note: 'Stores, search and analytics.' },
    { id: 'cloud', label: 'Cloud · Deploy', icon: <Cloud size={15} />, x: 750, y: 215, w: 230, h: 170, note: 'Cloud providers, storage and queues, and where things go live: hosting, edge workers, containers and the app stores.' },
    { id: 'devops', label: 'DevOps', icon: <GitBranch size={15} />, x: 750, y: 412, w: 230, h: 170, note: 'CI pipelines, version control, unit tests, API docs, monitoring and the shell.' },
];

/** How the layers talk, and over which protocols. `label` is for links that aren't a protocol. */
type Edge = { a: BoxZone; b: BoxZone; protos: string[]; label?: string };
const EDGES: Edge[] = [
    { a: 'frontend', b: 'backend', protos: ['REST', 'GraphQL', 'WebSocket', 'OAuth 2.0'] },
    { a: 'mobile', b: 'backend', protos: ['REST', 'WebSocket', 'WebRTC'] },
    { a: 'edge', b: 'backend', protos: ['RTSP', 'SOAP / ONVIF', 'MQTT', 'Serial (UART)'] },
    { a: 'backend', b: 'integrations', protos: ['REST', 'Webhooks', 'OAuth 2.0'] },
    { a: 'backend', b: 'ai', protos: ['REST'] },
    { a: 'backend', b: 'data', protos: [], label: 'queries' },
    { a: 'backend', b: 'cloud', protos: [], label: 'Pub/Sub · queues' },
    { a: 'ai', b: 'data', protos: [], label: 'RAG' },
    { a: 'devops', b: 'cloud', protos: [], label: 'CI/CD deploys' },
];

const box = (id: string) => ZONES.find((z) => z.id === id)!;

/** Path and label point: right side to left side as a smooth curve, or straight when stacked. */
function edgeGeom(a: string, b: string) {
    const s = box(a), t = box(b);
    if (Math.abs(s.x - t.x) < 20) {
        const x = s.x + s.w / 2;
        const [y1, y2] = s.y < t.y ? [s.y + s.h, t.y] : [s.y, t.y + t.h];
        return { d: `M ${x} ${y1} L ${x} ${y2}`, mx: x, my: (y1 + y2) / 2 };
    }
    const x1 = s.x + s.w, y1 = s.y + s.h / 2, x2 = t.x, y2 = t.y + t.h / 2;
    const mx = (x1 + x2) / 2;
    return { d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`, mx, my: (y1 + y2) / 2 };
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

/** Skills as a system-design map: boxes are layers, arrows carry the protocols between them. */
export default function SystemMap() {
    const [open, setOpen] = useState<BoxZone>('backend');
    const [proto, setProto] = useState<string | null>(null);
    const zone = ZONES.find((z) => z.id === open)!;
    const skills = SKILLS.filter((s) => s.zone === open);
    const groups = [...new Set(skills.map((s) => s.sub ?? 'Core'))];
    const lit = (e: Edge) => (proto ? e.protos.includes(proto) : e.a === open || e.b === open);

    return (
        <div className="sp-sys" data-proto={proto ?? ''}>
            <div className="sp-sys__canvas sp-sys__canvas--9">
                <svg viewBox={`0 0 ${VW} ${VH}`} className="sp-sys__wires" aria-hidden="true">
                    <defs>
                        <marker id="sysArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                            <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
                        </marker>
                    </defs>
                    {EDGES.map((e) => {
                        const { d } = edgeGeom(e.a, e.b);
                        const on = lit(e);
                        const live = e.protos.includes('WebSocket') || e.protos.includes('MQTT');
                        return (
                            <g key={`${e.a}-${e.b}`} className="sp-sys__edge" data-on={on} data-dim={String(!!proto && !on)}>
                                {/* Two-way protocols get arrows at both ends */}
                                <path d={d} className="sp-sys__line" markerEnd="url(#sysArrow)" markerStart={live ? 'url(#sysArrow)' : undefined} />
                                <path d={d} className="sp-sys__flow" />
                                <circle r={on ? 4.5 : 3} className="sp-sys__pulse">
                                    <animateMotion dur={on ? '1.6s' : '3.2s'} repeatCount="indefinite" path={d} />
                                </circle>
                                {live && (
                                    <circle r={on ? 3.5 : 2.5} className="sp-sys__pulse">
                                        <animateMotion dur={on ? '1.9s' : '3.6s'} repeatCount="indefinite" path={d} keyPoints="1;0" keyTimes="0;1" calcMode="linear" />
                                    </circle>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {EDGES.map((e) => {
                    const { mx, my } = edgeGeom(e.a, e.b);
                    const text = e.protos.length ? e.protos.join(' · ') : e.label;
                    if (!text) return null;
                    return (
                        <span key={`l-${e.a}-${e.b}`} className="sp-sys__wire-label" data-on={lit(e)} data-dim={String(!!proto && !lit(e))} data-kind={e.protos.length ? 'proto' : 'note'} style={{ left: pct(mx, VW), top: pct(my, VH) }}>
                            {text}
                        </span>
                    );
                })}

                {ZONES.map((z, i) => {
                    const all = SKILLS.filter((s) => s.zone === z.id);
                    return (
                        <button
                            key={z.id}
                            type="button"
                            className="sp-sys__zone"
                            aria-pressed={!proto && open === z.id}
                            aria-controls="sys-detail"
                            aria-label={`${z.label}: ${all.length} skills`}
                            onClick={() => { setOpen(z.id); setProto(null); }}
                            style={{ left: pct(z.x, VW), top: pct(z.y, VH), width: pct(z.w, VW), height: pct(z.h, VH), ['--d' as string]: `${i * 60}ms` }}
                        >
                            <span className="sp-sys__head"><span className="sp-sys__icon" aria-hidden="true">{z.icon}</span>{z.label}<b>{all.length}</b></span>
                            <span className="sp-sys__logos">
                                {all.map((s) => <span key={s.name} title={s.name}><SkillLogo s={s} size={18} /></span>)}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Protocols: pick one to light up every link that uses it */}
            <div className="sp-sys__protos" role="group" aria-label="Protocols">
                <span className="sp-sys__protos-label">Protocols · {PROTOCOLS.length}</span>
                {PROTOCOLS.map((p) => (
                    <button key={p.name} type="button" aria-pressed={proto === p.name} onClick={() => setProto(proto === p.name ? null : p.name)}>
                        <SkillLogo s={p} size={16} />{p.name}
                    </button>
                ))}
            </div>

            <div className="sp-sys__detail" id="sys-detail" aria-live="polite" key={proto ?? open}>
                {proto ? (
                    <>
                        <p className="sp-sys__crumb">Protocol · {proto} <span>· {PROTOCOL_NOTES[proto]}</span></p>
                        <ul className="sp-sys__chips">
                            {EDGES.filter((e) => e.protos.includes(proto)).map((e) => (
                                <li key={`${e.a}-${e.b}`}>{box(e.a).label} <span aria-hidden="true">⇄</span> {box(e.b).label}</li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <>
                        <p className="sp-sys__crumb"><span className="sp-sys__icon" aria-hidden="true">{zone.icon}</span>{zone.label} <b>{skills.length}</b> <span>· {zone.note}</span></p>
                        {groups.map((g) => (
                            <div key={g} className="sp-sys__group">
                                {groups.length > 1 && <p className="sp-sys__sub">{g}</p>}
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
