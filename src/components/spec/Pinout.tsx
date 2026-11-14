"use client";

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DESTINATIONS, PINS, type Pin } from './pins';

/** The current selection: a pin (skill) or a destination (job / product). Either side lights up the other. */
type Selection = { kind: 'pin'; no: number } | { kind: 'dest'; id: string };

export default function Pinout() {
    const reduce = useReducedMotion();
    const [sel, setSel] = useState<Selection>({ kind: 'pin', no: 1 });

    const activePins = new Set(sel.kind === 'pin' ? [sel.no] : PINS.filter((p) => p.routes.includes(sel.id)).map((p) => p.no));
    const activeDests = new Set(sel.kind === 'dest' ? [sel.id] : PINS.find((p) => p.no === sel.no)?.routes ?? []);
    const pin = sel.kind === 'pin' ? PINS.find((p) => p.no === sel.no) : undefined;
    const dest = sel.kind === 'dest' ? DESTINATIONS.find((d) => d.id === sel.id) : undefined;

    const left = PINS.slice(0, 6);
    const right = PINS.slice(6);

    const renderPin = (p: Pin, side: 'left' | 'right', i: number) => {
        const on = activePins.has(p.no);
        const pick = () => setSel({ kind: 'pin', no: p.no });
        return (
            <button
                key={p.no}
                type="button"
                className="sp-pin"
                aria-pressed={sel.kind === 'pin' && sel.no === p.no}
                data-lit={on}
                onClick={pick}
                onMouseEnter={pick}
                onFocus={pick}
            >
                {side === 'left' ? (
                    <>
                        <span className="sp-pin__no">{String(p.no).padStart(2, '0')}</span>
                        <span className="sp-pin__icon">{p.icon}</span>
                        <span>{p.name}</span>
                    </>
                ) : (
                    <>
                        <span className="sp-pin__icon">{p.icon}</span>
                        <span>{p.name}</span>
                        <span className="sp-pin__no">{String(p.no).padStart(2, '0')}</span>
                    </>
                )}
                <motion.span
                    className="sp-pin__leg"
                    aria-hidden="true"
                    initial={{ scaleX: reduce ? 1 : 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : 0.05 * i }}
                />
            </button>
        );
    };

    return (
        <>
            <div className="sp-pinout">
                <div className="sp-pins sp-pins--left">{left.map((p, i) => renderPin(p, 'left', i))}</div>
                <div className="sp-chip" aria-hidden="true">
                    <div>
                        <b>TP-SDE</b>
                        <span>2026<br />12 pins · rev 4</span>
                    </div>
                </div>
                <div className="sp-pins sp-pins--right">{right.map((p, i) => renderPin(p, 'right', i))}</div>
            </div>

            {/* Signal routing: which jobs and products each skill reaches, and back. */}
            <div className="sp-route">
                <div className="sp-route__bus" aria-hidden="true">
                    <span className="sp-route__signal" key={sel.kind === 'pin' ? `p${sel.no}` : `d${sel.id}`} />
                </div>
                <p className="sp-route__readout" aria-live="polite">
                    {pin && (
                        <>
                            <b>{pin.name}</b> <span className="sp-route__type">{pin.type}</span> {pin.description} Routed to {pin.routes.length}{' '}
                            {pin.routes.length === 1 ? 'place' : 'places'}.
                        </>
                    )}
                    {dest && (
                        <>
                            <b>{dest.name}</b> <span className="sp-route__type">{dest.group}</span> {activePins.size}{' '}
                            {activePins.size === 1 ? 'skill' : 'skills'}: {PINS.filter((p) => activePins.has(p.no)).map((p) => p.name).join(', ')}.
                        </>
                    )}
                </p>
                {(['Work', 'Studio'] as const).map((group) => (
                    <div key={group} className="sp-route__group">
                        <span className="sp-route__label">{group}</span>
                        <div className="sp-route__dests">
                            {DESTINATIONS.filter((d) => d.group === group).map((d) => {
                                const pick = () => setSel({ kind: 'dest', id: d.id });
                                return (
                                    <button
                                        key={d.id}
                                        type="button"
                                        className="sp-dest"
                                        data-lit={activeDests.has(d.id)}
                                        aria-pressed={sel.kind === 'dest' && sel.id === d.id}
                                        onClick={pick}
                                        onMouseEnter={pick}
                                        onFocus={pick}
                                    >
                                        <span className="sp-dest__led" aria-hidden="true" />
                                        {d.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
