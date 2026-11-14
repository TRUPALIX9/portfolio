"use client";

import { useEffect, useId, useRef, useState } from 'react';

export type Option<T extends string> = { value: T; label: string };

/**
 * A multi-select dropdown whose choices show inside the trigger as compact chips ("+2" overflow).
 * Popover of checkboxes with Select all / Clear; arrow keys move, Space toggles, Esc closes and
 * returns focus to the trigger; closes on outside click. `single` turns it into a one-of list (sort).
 */
export default function MultiSelect<T extends string>({
    label, options, value, onChange, single = false, maxChips = 2,
}: {
    label: string;
    options: Option<T>[];
    value: T[];
    onChange: (next: T[]) => void;
    single?: boolean;
    maxChips?: number;
}) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const items = useRef<(HTMLElement | null)[]>([]);
    const listId = useId();

    useEffect(() => {
        if (!open) return;
        const onDown = (e: PointerEvent) => {
            if (!root.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('pointerdown', onDown);
        return () => document.removeEventListener('pointerdown', onDown);
    }, [open]);

    useEffect(() => {
        if (open) items.current[active]?.focus();
    }, [open, active]);

    const close = (refocus = true) => {
        setOpen(false);
        if (refocus) trigger.current?.focus();
    };

    const toggle = (v: T) => {
        if (single) {
            onChange([v]);
            close();
            return;
        }
        onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
    };

    const onKey = (e: React.KeyboardEvent) => {
        const count = options.length + (single ? 0 : 2);
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % count); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + count) % count); }
        else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
        else if (e.key === 'End') { e.preventDefault(); setActive(count - 1); }
        else if (e.key === 'Tab') setOpen(false);
    };

    const chosen = options.filter((o) => value.includes(o.value));
    const shown = chosen.slice(0, maxChips);
    const extra = chosen.length - shown.length;

    return (
        <div className="bx-ms" ref={root} data-open={open} data-active={!single && chosen.length > 0}>
            <button
                ref={trigger}
                type="button"
                className="bx-ms__trigger"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => { setActive(0); setOpen((o) => !o); }}
                onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setActive(0); setOpen(true); } }}
            >
                <span className="bx-ms__label">{label}</span>
                {chosen.length === 0 ? (
                    <span className="bx-ms__all">All</span>
                ) : (
                    <span className="bx-ms__chips">
                        {shown.map((o) => <span key={o.value} className="bx-ms__chip">{o.label}</span>)}
                        {extra > 0 && <span className="bx-ms__chip bx-ms__chip--more">+{extra}</span>}
                    </span>
                )}
                <svg className="bx-ms__caret" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
            </button>

            {open && (
                <div className="bx-ms__pop" role="listbox" id={listId} aria-label={label} aria-multiselectable={!single} onKeyDown={onKey}>
                    {!single && (
                        <div className="bx-ms__bulk">
                            <button type="button" ref={(el) => { items.current[0] = el; }} tabIndex={active === 0 ? 0 : -1} onClick={() => onChange(options.map((o) => o.value))}>Select all</button>
                            <button type="button" ref={(el) => { items.current[1] = el; }} tabIndex={active === 1 ? 0 : -1} onClick={() => onChange([])}>Clear</button>
                        </div>
                    )}
                    {options.map((o, i) => {
                        const idx = i + (single ? 0 : 2);
                        const on = value.includes(o.value);
                        return (
                            <div
                                key={o.value}
                                ref={(el) => { items.current[idx] = el; }}
                                role="option"
                                aria-selected={on}
                                tabIndex={active === idx ? 0 : -1}
                                className="bx-ms__opt"
                                onClick={() => toggle(o.value)}
                                onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(o.value); } }}
                                onFocus={() => setActive(idx)}
                            >
                                <span className={`bx-ms__box ${single ? 'bx-ms__box--radio' : ''}`} aria-hidden="true">{on ? (single ? '' : '✓') : ''}</span>
                                {o.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
