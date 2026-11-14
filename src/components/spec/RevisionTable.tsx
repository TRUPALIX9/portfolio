"use client";

import { motion, useReducedMotion } from 'framer-motion';
import type { CareerEntry } from '@/data/career';

/** Career as a datasheet revision table, newest first; rows slide in one after another. */
export default function RevisionTable({ rows }: { rows: CareerEntry[] }) {
    const reduce = useReducedMotion();

    return (
        <table className="sp-table sp-rev">
            <thead>
                <tr><th>Rev</th><th>Date</th><th>Company · role</th><th>Changes</th></tr>
            </thead>
            <tbody>
                {rows.map((r, i) => (
                    <motion.tr
                        key={r.company}
                        data-current={String(!!r.current)}
                        initial={{ opacity: reduce ? 1 : 0, x: reduce ? 0 : -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : i * 0.08 }}
                    >
                        <td className="sp-num">{r.current ? <span className="sp-accent">R{rows.length - i}</span> : `R${rows.length - i}`}</td>
                        <td>{r.period}</td>
                        <td>
                            <a href={r.url} target="_blank" rel="noreferrer" className="sp-rev__co sp-link">{r.company}</a>
                            <div style={{ color: 'var(--sp-ink-2)', fontSize: '0.88rem' }}>{r.role}</div>
                        </td>
                        <td style={{ color: 'var(--sp-ink-2)' }}>{r.summary}</td>
                    </motion.tr>
                ))}
            </tbody>
        </table>
    );
}
