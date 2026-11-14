"use client";

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send } from 'lucide-react';
import { track } from '@/utils/analytics/client';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

// Limits mirror /api/contact-submissions so errors show inline instead of a silent truncation.
const schema = z.object({
    name: z.string().trim().min(2, { message: 'At least 2 characters.' }).max(100, { message: 'Too long.' }),
    contact: z.string().trim().max(200).refine((v) => EMAIL_RE.test(v) || PHONE_RE.test(v), {
        message: 'An email or phone number, so I can reply.',
    }),
    message: z.string().trim().min(10, { message: 'At least 10 characters.' }).max(5000, { message: 'Under 5000 characters.' }),
});
type FormData = z.infer<typeof schema>;

export default function ContactForm() {
    const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
    const started = useRef(false);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: { name: '', contact: '', message: '' },
    });

    const onSubmit = async (data: FormData) => {
        setStatus(null);
        try {
            const res = await fetch('/api/contact-submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, source: '/contact' }),
            });
            const payload = await res.json().catch(() => null);
            if (!res.ok) throw new Error(payload?.error ?? 'Could not send right now.');
            track('contact_submit', undefined, { immediate: true });
            setStatus({ ok: true, text: 'Sent. I will reply soon.' });
            reset();
        } catch (err) {
            track('contact_error', undefined, { immediate: true });
            setStatus({ ok: false, text: err instanceof Error ? err.message : 'Could not send right now.' });
        }
    };

    const onFocus = () => {
        if (started.current) return;
        started.current = true;
        track('contact_start');
    };

    return (
        <form className="sp-form" onSubmit={handleSubmit(onSubmit)} onFocus={onFocus} noValidate aria-label="Send a message">
            <div className="sp-form__row">
                <div className="sp-field" data-invalid={!!errors.name}>
                    <label htmlFor="c-name">Name</label>
                    <input id="c-name" autoComplete="name" {...register('name')} aria-invalid={!!errors.name} />
                    {errors.name && <span className="sp-field__err">{errors.name.message}</span>}
                </div>
                <div className="sp-field" data-invalid={!!errors.contact}>
                    <label htmlFor="c-contact">Email or phone</label>
                    <input id="c-contact" autoComplete="email" {...register('contact')} aria-invalid={!!errors.contact} />
                    {errors.contact && <span className="sp-field__err">{errors.contact.message}</span>}
                </div>
            </div>
            <div className="sp-field" data-invalid={!!errors.message}>
                <label htmlFor="c-message">Message</label>
                <textarea id="c-message" {...register('message')} aria-invalid={!!errors.message} />
                {errors.message && <span className="sp-field__err">{errors.message.message}</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <button type="submit" className="sp-btn" disabled={isSubmitting}>
                    <Send size={15} aria-hidden="true" /> {isSubmitting ? 'Sending…' : 'Send message'}
                </button>
                {status && (
                    <span className={`sp-form__status ${status.ok ? '' : 'sp-accent'}`} role="status">{status.text}</span>
                )}
            </div>
        </form>
    );
}
