"use client";

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Accessible modal: focus moves in, Esc and the backdrop close it, focus returns to the opener. */
export default function Modal({ label, onClose, children, wide = false }: { label: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const opener = document.activeElement as HTMLElement | null;
        const first = ref.current?.querySelector<HTMLElement>('button, a, input, textarea, [tabindex]');
        first?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Tab' && ref.current) {
                const items = [...ref.current.querySelectorAll<HTMLElement>('button, a, input, textarea, [tabindex]:not([tabindex="-1"])')];
                if (items.length === 0) return;
                const [a, b] = [items[0], items[items.length - 1]];
                if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
                else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
            }
        };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
            opener?.focus?.();
        };
    }, [onClose]);

    return createPortal(
        <div className="bx-modal" onClick={onClose}>
            <div ref={ref} className={`bx-modal__box ${wide ? 'bx-modal__box--wide' : ''}`} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
                <button type="button" className="bx-modal__x" aria-label="Close" onClick={onClose}>✕</button>
                {children}
            </div>
        </div>,
        document.body,
    );
}
