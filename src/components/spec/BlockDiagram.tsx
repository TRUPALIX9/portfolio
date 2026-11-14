"use client";

import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

export type DiagramNode = {
    id: string;
    label: string;
    sub?: string;
    x: number;
    y: number;
    w?: number;
    h?: number;
    variant?: 'core' | 'accent';
};

type Props = {
    nodes: DiagramNode[];
    edges: [string, string][];
    width: number;
    height: number;
    caption?: string;
    label: string;
};

/**
 * A small functional block diagram. Wires draw in when it scrolls into view, and redraw on hover
 * (or tap), like a signal tracing through the parts.
 */
export default function BlockDiagram({ nodes, edges, width, height, caption, label }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const reduce = useReducedMotion();
    const [run, setRun] = useState(0);
    const drawn = reduce || inView;

    const byId = Object.fromEntries(nodes.map((n) => [n.id, { ...n, w: n.w ?? 120, h: n.h ?? 38 }]));

    const wire = (from: string, to: string) => {
        const a = byId[from];
        const b = byId[to];
        const sameRow = Math.abs(a.y - b.y) < 2;
        // Left-to-right wires with one elbow; vertical when stacked.
        if (b.x > a.x + a.w - 1) {
            const x1 = a.x + a.w;
            const y1 = a.y + a.h / 2;
            const x2 = b.x;
            const y2 = b.y + b.h / 2;
            const mx = sameRow ? x2 : x1 + (x2 - x1) / 2;
            return { d: sameRow ? `M${x1} ${y1} H${x2}` : `M${x1} ${y1} H${mx} V${y2} H${x2}`, end: [x2, y2] };
        }
        const x1 = a.x + a.w / 2;
        const y1 = a.y + a.h;
        const x2 = b.x + b.w / 2;
        const y2 = b.y;
        return { d: `M${x1} ${y1} V${(y1 + y2) / 2} H${x2} V${y2}`, end: [x2, y2] };
    };

    return (
        <div
            ref={ref}
            className="sp-diagram"
            onMouseEnter={() => !reduce && setRun((r) => r + 1)}
            onClick={() => !reduce && setRun((r) => r + 1)}
        >
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
                <g key={run}>
                    {edges.map(([from, to], i) => {
                        const { d, end } = wire(from, to);
                        return (
                            <g key={`${from}-${to}`}>
                                <motion.path
                                    className="sp-wire"
                                    d={d}
                                    initial={{ pathLength: reduce ? 1 : 0 }}
                                    animate={{ pathLength: drawn ? 1 : 0 }}
                                    transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.15 + i * 0.12, ease: 'easeInOut' }}
                                />
                                <motion.circle
                                    className="sp-wire-dot"
                                    cx={end[0]}
                                    cy={end[1]}
                                    r={3}
                                    initial={{ opacity: reduce ? 1 : 0 }}
                                    animate={{ opacity: drawn ? 1 : 0 }}
                                    transition={{ delay: reduce ? 0 : 0.7 + i * 0.12 }}
                                />
                            </g>
                        );
                    })}
                </g>
                {Object.values(byId).map((n) => (
                    <g key={n.id} className={`sp-node ${n.variant ? `sp-node--${n.variant}` : ''}`}>
                        <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={2} />
                        <text x={n.x + n.w / 2} y={n.y + (n.sub ? n.h / 2 - 2 : n.h / 2 + 4)} textAnchor="middle">{n.label}</text>
                        {n.sub && (
                            <text className="sp-node__sub" x={n.x + n.w / 2} y={n.y + n.h / 2 + 11} textAnchor="middle">{n.sub}</text>
                        )}
                    </g>
                ))}
            </svg>
            {caption && (
                <div className="sp-diagram__cap">
                    <span>{caption}</span>
                    {!reduce && <span aria-hidden="true">hover to trace</span>}
                </div>
            )}
        </div>
    );
}
