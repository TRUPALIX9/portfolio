"use client";

import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Shapes, X } from 'lucide-react';
import { KINDS, type ExploreKind } from '@/data/explore';
import KindIcon from './KindIcon';

const ORDER = Object.keys(KINDS) as ExploreKind[];

/** A dropdown of kinds of place with checkboxes. Nothing ticked means every kind. */
export default function KindPicker({ value, counts, onChange }: {
    value: Set<ExploreKind>;
    counts: Record<ExploreKind, number>;
    onChange: (next: Set<ExploreKind>) => void;
}) {
    const id = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);

    useEffect(() => {
        if (!open) return;
        const on = (e: PointerEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('pointerdown', on);
        requestAnimationFrame(() => listRef.current?.focus());
        return () => document.removeEventListener('pointerdown', on);
    }, [open]);

    const toggle = (k: ExploreKind) => {
        const n = new Set(value);
        if (n.has(k)) n.delete(k); else n.add(k);
        onChange(n);
    };

    const onKey = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, ORDER.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(ORDER[active]); }
        else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    };

    const one = value.size === 1 ? [...value][0] : null;

    return (
        <div className="tv-pick tv-pick--kind" ref={rootRef}>
            <button type="button" className="tv-pick__btn" aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`} onClick={() => setOpen((o) => !o)}>
                <span className="tv-pick__val" style={one ? { ['--c' as string]: KINDS[one].color } : undefined}>
                    {one ? <span className="tv-pick__ico"><KindIcon kind={one} size={16} /></span> : <Shapes size={16} aria-hidden="true" />}
                    {value.size === 0 ? 'All kinds' : one ? KINDS[one].label : `${value.size} kinds`}
                </span>
                <ChevronDown size={16} className="tv-pick__chev" aria-hidden="true" />
            </button>
            {value.size > 0 && (
                <button type="button" className="tv-pick__clear" aria-label="Show every kind" onClick={() => onChange(new Set())}><X size={14} /></button>
            )}
            {open && (
                <div className="tv-pick__pop tv-pick__pop--right">
                    <ul
                        className="tv-pick__list"
                        id={`${id}-list`}
                        role="listbox"
                        aria-multiselectable="true"
                        aria-label="Kinds of place"
                        tabIndex={0}
                        ref={listRef}
                        aria-activedescendant={`${id}-${ORDER[active]}`}
                        onKeyDown={onKey}
                    >
                        {ORDER.map((k, i) => (
                            <li
                                key={k}
                                id={`${id}-${k}`}
                                role="option"
                                aria-selected={value.has(k)}
                                className="tv-pick__row tv-pick__row--kind"
                                data-active={String(i === active)}
                                style={{ ['--c' as string]: KINDS[k].color }}
                                onMouseEnter={() => setActive(i)}
                                onClick={() => toggle(k)}
                            >
                                <span className="tv-pick__box" aria-hidden="true">{value.has(k) && <Check size={12} strokeWidth={3} />}</span>
                                <span className="tv-pick__ico"><KindIcon kind={k} size={16} /></span>
                                <b>{KINDS[k].label}</b>
                                <em>{counts[k]}</em>
                            </li>
                        ))}
                    </ul>
                    {value.size > 0 && <button type="button" className="tv-pick__reset" onClick={() => onChange(new Set())}>Show every kind</button>}
                </div>
            )}
        </div>
    );
}
