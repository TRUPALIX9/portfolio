"use client";

import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import confetti from 'canvas-confetti';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { trackVisitorEvent } from '@/utils/visitor-analytics';
import Reveal from '@/components/motion/Reveal';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

// Limits mirror the API route so users see the error inline instead of a silent truncation.
const contactSchema = z.object({
    name: z.string().trim().min(2, { message: 'Name must be at least 2 characters.' }).max(100, { message: 'Name is too long.' }),
    contact: z.string().trim().max(200).refine((v) => EMAIL_RE.test(v) || PHONE_RE.test(v), {
        message: 'Please provide a valid email or phone number.',
    }),
    message: z.string().trim().min(10, { message: 'Message must be at least 10 characters long.' }).max(5000, { message: 'Message must be under 5000 characters.' }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactSection() {
    const [status, setStatus] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px 0px" });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, touchedFields },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        mode: 'onTouched',
        defaultValues: {
            name: '',
            contact: '',
            message: '',
        },
    });

    useEffect(() => {
        if (isInView) {
            void trackVisitorEvent({
                event: 'page_view',
                route: '/contact',
                source: 'contact-page',
            });
        }
    }, [isInView]);

    const onSubmit = async (data: ContactFormData) => {
        setStatus(null);
        setIsSuccess(false);

        try {
            const response = await fetch('/api/contact-submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    contact: data.contact,
                    message: data.message,
                    source: '/contact',
                }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(payload?.error ?? 'Unable to send your message right now.');
            }

            // Don't copy the visitor's name/email into analytics — it's already in contact_submissions.
            void trackVisitorEvent({
                event: 'contact_submit',
                route: '/contact',
                source: 'contact-form',
            });

            setIsSuccess(true);
            setStatus('Message sent successfully! I will get back to you shortly.');
            reset();

            void confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.7 },
            });
        } catch (error) {
            setIsSuccess(false);
            setStatus(error instanceof Error ? error.message : 'Unable to send your message right now.');
        }
    };

    return (
        <section ref={sectionRef} aria-labelledby="contact-heading" className="section container pt-24 md:pt-32 pb-6 md:pb-8" style={{ minHeight: 'auto' }}>
            <Reveal className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left Column: Direct pathways */}
                    <div className="flex flex-col gap-8">
                        <div>
                            <p className="eyebrow mb-3">
                                Get In Touch
                            </p>
                            <h2 id="contact-heading" className="text-4xl md:text-5xl font-extrabold text-ink-1 tracking-tight leading-tight">
                                Let&apos;s build something <span className="text-accent">exceptional.</span>
                            </h2>
                        </div>

                        <p className="measure text-ink-2 text-base md:text-[1.0625rem] leading-[1.7]">
                            Whether you have an upcoming project, hiring opportunity, system architecture question, or just want to connect — feel free to send a message.
                        </p>

                        <div className="flex flex-col gap-4 max-w-md w-full">
                            <ContactInfoRow icon={<Mail size={20} />} label="Email" value="trupal.work@gmail.com" href="mailto:trupal.work@gmail.com" />
                        </div>
                    </div>

                    {/* Right Column: Sleek message dispatch form */}
                    <form
                        noValidate
                        aria-label="Send a message"
                        onSubmit={handleSubmit(onSubmit)}
                        className="card w-full rounded-2xl relative overflow-hidden flex flex-col"
                    >

                        {/* Header */}
                        <div className="px-6 md:px-10 pt-8 md:pt-10 pb-6 border-b border-line-1 text-center relative z-10">
                            <h3 className="text-xl md:text-2xl font-bold text-ink-1 tracking-tight">
                                Send a Message
                            </h3>
                            <p className="text-ink-3 text-sm mt-1.5">
                                Fill out the form below for instant dispatch.
                            </p>
                        </div>

                        {/* Fields */}
                        <div className="px-6 md:px-10 py-7 flex flex-col gap-5 relative z-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="contact-name" className="text-ink-2 text-xs font-semibold uppercase tracking-wider">Name</label>
                                    <input
                                        id="contact-name"
                                        {...register('name')}
                                        autoComplete="name"
                                        aria-invalid={Boolean(errors.name)}
                                        aria-describedby={errors.name ? 'contact-name-error' : undefined}
                                        placeholder="Your name"
                                        className={`w-full h-12 rounded-xl border bg-surface-1 text-ink-1 placeholder:text-ink-3 px-4 text-[0.9375rem] outline-none transition-colors duration-150 ${
                                            errors.name
                                            ? 'border-red-500/50 focus:border-red-500'
                                            : touchedFields.name
                                                ? 'border-emerald-500/30 focus:border-emerald-500'
                                                : 'border-line-2 hover:border-white/25 focus:border-accent/70 focus:bg-surface-0'
                                        }`}
                                    />
                                    {errors.name && (
                                        <span id="contact-name-error" className="text-red-400 text-xs flex items-center gap-1.5 font-medium">
                                            <AlertCircle size={12} aria-hidden="true" /> {errors.name.message}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="contact-info" className="text-ink-2 text-xs font-semibold uppercase tracking-wider">Contact Info</label>
                                    <input
                                        id="contact-info"
                                        {...register('contact')}
                                        autoComplete="email"
                                        aria-invalid={Boolean(errors.contact)}
                                        aria-describedby={errors.contact ? 'contact-info-error' : undefined}
                                        placeholder="Email or phone number"
                                        className={`w-full h-12 rounded-xl border bg-surface-1 text-ink-1 placeholder:text-ink-3 px-4 text-[0.9375rem] outline-none transition-colors duration-150 ${
                                            errors.contact
                                            ? 'border-red-500/50 focus:border-red-500'
                                            : touchedFields.contact
                                                ? 'border-emerald-500/30 focus:border-emerald-500'
                                                : 'border-line-2 hover:border-white/25 focus:border-accent/70 focus:bg-surface-0'
                                        }`}
                                    />
                                    {errors.contact && (
                                        <span id="contact-info-error" className="text-red-400 text-xs flex items-center gap-1.5 font-medium">
                                            <AlertCircle size={12} aria-hidden="true" /> {errors.contact.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="contact-message" className="text-ink-2 text-xs font-semibold uppercase tracking-wider">Message</label>
                                <textarea
                                    id="contact-message"
                                    {...register('message')}
                                    maxLength={5000}
                                    aria-invalid={Boolean(errors.message)}
                                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                                    placeholder="Tell me about what you're building or how I can help..."
                                    className={`w-full h-36 md:h-44 rounded-xl border bg-surface-1 text-ink-1 placeholder:text-ink-3 p-4 text-[0.9375rem] leading-[1.6] outline-none resize-none transition-colors duration-150 ${
                                        errors.message
                                        ? 'border-red-500/50 focus:border-red-500'
                                        : touchedFields.message
                                            ? 'border-emerald-500/30 focus:border-emerald-500'
                                            : 'border-line-2 hover:border-white/25 focus:border-accent/70 focus:bg-surface-0'
                                    }`}
                                />
                                {errors.message && (
                                    <span id="contact-message-error" className="text-red-400 text-xs flex items-center gap-1.5 font-medium">
                                        <AlertCircle size={12} aria-hidden="true" /> {errors.message.message}
                                    </span>
                                )}
                            </div>

                            {/* Always-mounted live region so screen readers announce the result */}
                            <div role="status" aria-live="polite">
                                {status && (
                                    <div className={`p-4 rounded-xl border flex items-center gap-2.5 text-sm transition-all duration-300 ${isSuccess ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-red-500/10 border-red-500/25 text-red-400'}`}>
                                        {isSuccess ? <CheckCircle2 size={16} aria-hidden="true" /> : <AlertCircle size={16} aria-hidden="true" />}
                                        <span>{status}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer / Submit */}
                        <div className="px-6 md:px-10 pb-8 md:pb-10 relative z-10">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group w-full h-13 flex items-center justify-center text-[15px] gap-2 font-bold rounded-xl bg-ink-1 text-surface-2 shadow-[var(--shadow-card)] transition-[transform,background-color,box-shadow] duration-200 ease-out-expo hover:-translate-y-0.5 hover:bg-white hover:shadow-[var(--shadow-raised)] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-white/50"
                            >
                                <Send size={16} aria-hidden="true" className="transition-transform duration-200 ease-out-expo group-hover:translate-x-0.5" />
                                {isSubmitting ? 'Sending Message...' : 'Send Message'}
                            </button>
                        </div>
                    </form>
                </div>
            </Reveal>
        </section>
    );
}

function ContactInfoRow({
    icon,
    label,
    value,
    href,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    href: string;
}) {
    return (
        <a 
            href={href}
            className="card card-interactive spotlight group flex items-center gap-4 p-4 rounded-2xl"
        >
            <div aria-hidden="true" className="text-accent bg-accent/10 border border-accent/15 p-3 rounded-xl transition-colors duration-200 group-hover:bg-accent/15">
                {icon}
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-ink-3 text-xs font-bold uppercase tracking-widest">{label}</span>
                <span className="text-ink-1 font-medium text-[0.95rem] tracking-wide">{value}</span>
            </div>
        </a>
    );
}
