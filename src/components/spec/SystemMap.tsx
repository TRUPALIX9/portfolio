"use client";

import { useState } from 'react';
import { Cloud, Database, Monitor, Plug, Server, Smartphone, Sparkles } from 'lucide-react';
import { SKILLS, type Skill, type ZoneId } from '@/data/skills';

const VW = 1000, VH = 540;
const PREVIEW = 6; // logos shown inside a box before "+N"

type Zone = { id: ZoneId; label: string; icon: React.ReactNode; x: number; y: number; w: number; h: number; note: string };

/** The boxes of the system diagram. Positions are in a 1000×540 canvas. */
const ZONES: Zone[] = [
    { id: 'frontend', label: 'Frontend', icon: <Monitor size={15} />, x: 30, y: 30, w: 240, h: 220, note: 'Web apps, dashboards and sites.' },
    { id: 'mobile', label: 'Mobile · Desktop', icon: <Smartphone size={15} />, x: 30, y: 290, w: 240, h: 220, note: 'Store apps and Windows tools.' },
    { id: 'integrations', label: 'Integrations', icon: <Plug size={15} />, x: 380, y: 14, w: 240, h: 136, note: 'Third-party systems wired in.' },
    { id: 'backend', label: 'Backend · APIs', icon: <Server size={15} />, x: 380, y: 190, w: 240, h: 160, note: 'Services, workers and the protocols between them.' },
    { id: 'ai', label: 'AI · ML', icon: <Sparkles size={15} />, x: 380, y: 390, w: 240, h: 136, note: 'Models, agents and the data work behind them.' },
    { id: 'data', label: 'Data', icon: <Database size={15} />, x: 730, y: 30, w: 240, h: 220, note: 'Stores, search and analytics.' },
    { id: 'cloud', label: 'Cloud · Tooling', icon: <Cloud size={15} />, x: 730, y: 290, w: 240, h: 220, note: 'Hosting, pipelines, testing and edge.' },
];

/** How the layers talk to each other: clients call the backend, the backend fans out. */
const EDGES: [string, string][] = [
    ['frontend', 'backend'], ['mobile', 'backend'],
    ['backend', 'integrations'], ['backend', 'ai'],
    ['backend', 'data'], ['backend', 'cloud'],
    ['ai', 'data'], ['integrations', 'data'], ['data', 'cloud'],
];

const box = (id: string) => ZONES.find((z) => z.id === id)!;

/** Right side to left side, or straight down when the boxes are stacked. */
function edgePath(a: string, b: string) {
    const s = box(a), t = box(b);
    if (Math.abs(s.x - t.x) < 20) {
        const x = s.x + s.w / 2;
        return s.y < t.y ? `M ${x} ${s.y + s.h} L ${x} ${t.y}` : `M ${x} ${s.y} L ${x} ${t.y + t.h}`;
    }
    const x1 = s.x + s.w, y1 = s.y + s.h / 2, x2 = t.x, y2 = t.y + t.h / 2;
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
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

/** Skills as a system-design map: click a box to open every skill in that layer. */
export default function SystemMap() {
    const [open, setOpen] = useState<ZoneId>('backend');
    const zone = ZONES.find((z) => z.id === open)!;
    const skills = SKILLS.filter((s) => s.zone === open);
    const groups = [...new Set(skills.map((s) => s.sub ?? 'Core'))];
    const lit = (a: string, b: string) => a === open || b === open;

    return (
        <div className="sp-sys">
            <div className="sp-sys__canvas">
                <svg viewBox={`0 0 ${VW} ${VH}`} className="sp-sys__wires" aria-hidden="true">
                    <defs>
                        <marker id="sysArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                            <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
                        </marker>
                    </defs>
                    {EDGES.map(([a, b]) => {
                        const d = edgePath(a, b);
                        const on = lit(a, b);
                        return (
                            <g key={`${a}-${b}`} className="sp-sys__edge" data-on={on}>
                                <path d={d} className="sp-sys__line" markerEnd="url(#sysArrow)" />
                                <path d={d} className="sp-sys__flow" />
                                <circle r={on ? 4.5 : 3} className="sp-sys__pulse">
                                    <animateMotion dur={on ? '1.6s' : '3.2s'} repeatCount="indefinite" path={d} />
                                </circle>
                            </g>
                        );
                    })}
                </svg>

                {ZONES.map((z, i) => {
                    const all = SKILLS.filter((s) => s.zone === z.id);
                    return (
                        <button
                            key={z.id}
                            type="button"
                            className="sp-sys__zone"
                            aria-pressed={open === z.id}
                            aria-controls="sys-detail"
                            aria-label={`${z.label}: ${all.length} skills`}
                            onClick={() => setOpen(z.id)}
                            style={{ left: pct(z.x, VW), top: pct(z.y, VH), width: pct(z.w, VW), height: pct(z.h, VH), ['--d' as string]: `${i * 70}ms` }}
                        >
                            <span className="sp-sys__head"><span className="sp-sys__icon" aria-hidden="true">{z.icon}</span>{z.label}<b>{all.length}</b></span>
                            <span className="sp-sys__logos">
                                {all.slice(0, PREVIEW).map((s) => <span key={s.name} title={s.name}><SkillLogo s={s} size={22} /></span>)}
                                {all.length > PREVIEW && <span className="sp-sys__more">+{all.length - PREVIEW}</span>}
                            </span>
                            <span className="sp-sys__names">{all.slice(0, 3).map((s) => s.name).join(' · ')}</span>
                        </button>
                    );
                })}
            </div>

            <div className="sp-sys__detail" id="sys-detail" aria-live="polite" key={open}>
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
            </div>
        </div>
    );
}
