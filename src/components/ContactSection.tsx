"use client";

import type { CSSProperties, FormEvent } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { trackVisitorEvent } from '@/utils/visitor-analytics';

type FormState = {
    name: string;
    contact: string;
    message: string;
};

const initialState: FormState = {
    name: '',
    contact: '',
    message: '',
};

export default function ContactSection() {
    const [form, setForm] = useState<FormState>(initialState);
    const [status, setStatus] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const updateField = (field: keyof FormState, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    useEffect(() => {
        void trackVisitorEvent({
            event: 'page_view',
            route: '/contact',
            source: 'contact-page',
        });
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setStatus('');

        try {
            const response = await fetch('/api/contact-submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...form,
                    source: '/contact',
                }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(payload?.error ?? 'Unable to send your message right now.');
            }

            void trackVisitorEvent({
                event: 'contact_submit',
                route: '/contact',
                source: 'contact-form',
                linkName: form.name,
                linkUrl: form.contact,
            });

            setForm(initialState);
            setStatus('Message sent. You can review it later from the dashboard.');
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Unable to send your message right now.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="contact" className="section container" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
                style={{ width: '100%' }}
            >
                <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(320px, 1.1fr)', alignItems: 'start' }} className="contact-grid">
                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        <p style={{ margin: 0, color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.82rem' }}>
                            Contact
                        </p>
                        <h1 className="heading-lg">
                            Let&apos;s build something <span style={{ color: 'var(--accent-primary)' }}>useful.</span>
                        </h1>

                        <div style={{ display: 'grid', gap: '0.9rem', maxWidth: '30rem' }}>
                            <ContactInfoRow label="Email" value="trupal.work@gmail.com" href="mailto:trupal.work@gmail.com" />
                            <ContactInfoRow label="Phone" value="+1 943 265 1855" href="tel:+19432651855" />
                            <ContactInfoRow label="Social Hub" value="Direct links and profiles" href="/social" internal />
                        </div>

                        <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
                            <a href="mailto:trupal.work@gmail.com" className="btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
                                Email Directly
                            </a>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '1.5rem', display: 'grid', gap: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'grid', gap: '0.35rem' }}>
                            <p style={{ margin: 0, color: '#fff', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.82rem' }}>
                                Message Form
                            </p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                Best for projects, freelance work, collaboration, referrals, or a proper intro.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.9rem' }} className="contact-form-two-up">
                            <Field
                                label="Name"
                                value={form.name}
                                onChange={(value) => updateField('name', value)}
                                placeholder="Your name"
                                required
                            />
                            <Field
                                label="Contact Info"
                                value={form.contact}
                                onChange={(value) => updateField('contact', value)}
                                placeholder="Email or phone number"
                                required
                            />
                        </div>

                        <label style={{ display: 'grid', gap: '0.5rem' }}>
                            <span style={fieldLabelStyle}>Message</span>
                            <textarea
                                required
                                value={form.message}
                                onChange={(event) => updateField('message', event.target.value)}
                                placeholder="Tell me what you're building, what role you're hiring for, or how you'd like to connect."
                                rows={7}
                                style={fieldStyle}
                            />
                        </label>

                        {status && (
                            <p style={{ margin: 0, color: status.startsWith('Message sent') ? 'var(--accent-primary)' : '#fca5a5', lineHeight: 1.5 }}>
                                {status}
                            </p>
                        )}

                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.95rem 1.25rem', opacity: submitting ? 0.8 : 1 }} disabled={submitting}>
                            {submitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </section>
    );
}

function ContactInfoRow({
    label,
    value,
    href,
    internal = false,
}: {
    label: string;
    value: string;
    href: string;
    internal?: boolean;
}) {
    const content = (
        <div className="glass-card" style={{ padding: '0.9rem 1rem', display: 'grid', gap: '0.25rem' }}>
            <span style={{ color: 'var(--accent-secondary)', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em' }}>{label}</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{value}</span>
        </div>
    );

    if (internal) {
        return <Link href={href}>{content}</Link>;
    }

    return (
        <a href={href}>
            {content}
        </a>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    required = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
    required?: boolean;
}) {
    return (
        <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={fieldLabelStyle}>{label}</span>
            <input
                required={required}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                style={fieldStyle}
            />
        </label>
    );
}

const fieldLabelStyle = {
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.9rem',
} satisfies CSSProperties;

const fieldStyle = {
    width: '100%',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(6, 10, 20, 0.78)',
    color: '#fff',
    padding: '0.95rem 1rem',
    resize: 'vertical' as const,
    outline: 'none',
} satisfies CSSProperties;
