"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import confetti from 'canvas-confetti';
import { Mail, Phone, Share2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { trackVisitorEvent } from '@/utils/visitor-analytics';

const contactSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    contact: z.string().min(3, { message: 'Please provide a valid email or phone number.' }),
    message: z.string().min(10, { message: 'Message must be at least 10 characters long.' }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactSection() {
    const [status, setStatus] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

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
        void trackVisitorEvent({
            event: 'page_view',
            route: '/contact',
            source: 'contact-page',
        });
    }, []);

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

            void trackVisitorEvent({
                event: 'contact_submit',
                route: '/contact',
                source: 'contact-form',
                linkName: data.name,
                linkUrl: data.contact,
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
        <section id="contact" className="section container pt-24 md:pt-32 pb-6 md:pb-8" style={{ minHeight: 'auto' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8 }}
                className="w-full"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left Column: Direct pathways */}
                    <div className="flex flex-col gap-8">
                        <div>
                            <p className="text-[#4ADE80] font-bold text-xs uppercase tracking-[0.2em] mb-3">
                                Get In Touch
                            </p>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                                Let&apos;s build something <span className="gradient-text">exceptional.</span>
                            </h2>
                        </div>

                        <p className="text-neutral-400 text-base md:text-lg leading-relaxed font-light">
                            Whether you have an upcoming project, hiring opportunity, system architecture question, or just want to connect — feel free to send a message.
                        </p>

                        <div className="flex flex-col gap-4 max-w-md w-full">
                            <ContactInfoRow icon={<Mail size={20} />} label="Email" value="trupal.work@gmail.com" href="mailto:trupal.work@gmail.com" />
                            <ContactInfoRow icon={<Phone size={20} />} label="Phone" value="+1 943 265 1855" href="tel:+19432651855" />
                        </div>
                    </div>

                    {/* Right Column: Sleek message dispatch form */}
                    <form 
                        onSubmit={handleSubmit(onSubmit)} 
                        className="w-full h-auto bg-neutral-900/[0.25] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 md:p-10 flex flex-col gap-6 md:gap-8 shadow-2xl relative overflow-hidden"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-3xl pointer-events-none" />

                        <div className="flex flex-col gap-1.5 relative z-10 shrink-0 text-center">
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-wide">
                                Send a Message
                            </h3>
                            <p className="text-neutral-400 text-sm md:text-base font-light">
                                Fill out the form below for instant dispatch.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 shrink-0">
                            <div className="flex flex-col gap-3">
                                <label className="text-white text-xs font-semibold uppercase tracking-wider">Name</label>
                                <input
                                    {...register('name')}
                                    placeholder="Your name"
                                    className={`w-full h-14 rounded-xl border bg-black/40 text-white px-4 text-sm outline-none transition-all duration-300 shrink-0 ${
                                        errors.name 
                                        ? 'border-red-500/50 focus:border-red-500' 
                                        : touchedFields.name 
                                            ? 'border-emerald-500/30 focus:border-emerald-500' 
                                            : 'border-white/10 focus:border-white focus:bg-black/60'
                                    }`}
                                />
                                {errors.name && (
                                    <span className="text-red-400 text-xs flex items-center gap-1.5 mt-1 font-medium shrink-0">
                                        <AlertCircle size={12} /> {errors.name.message}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-white text-xs font-semibold uppercase tracking-wider">Contact Info</label>
                                <input
                                    {...register('contact')}
                                    placeholder="Email or phone number"
                                    className={`w-full h-14 rounded-xl border bg-black/40 text-white px-4 text-sm outline-none transition-all duration-300 shrink-0 ${
                                        errors.contact 
                                        ? 'border-red-500/50 focus:border-red-500' 
                                        : touchedFields.contact 
                                            ? 'border-emerald-500/30 focus:border-emerald-500' 
                                            : 'border-white/10 focus:border-white focus:bg-black/60'
                                    }`}
                                />
                                {errors.contact && (
                                    <span className="text-red-400 text-xs flex items-center gap-1.5 mt-1 font-medium shrink-0">
                                        <AlertCircle size={12} /> {errors.contact.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 relative z-10 shrink-0">
                            <label className="text-white text-xs font-semibold uppercase tracking-wider">Message</label>
                            <textarea
                                {...register('message')}
                                placeholder="Tell me about what you're building or how I can help..."
                                className={`w-full h-40 md:h-48 rounded-xl border bg-black/40 text-white p-4 text-sm outline-none resize-none transition-all duration-300 shrink-0 ${
                                    errors.message 
                                    ? 'border-red-500/50 focus:border-red-500' 
                                    : touchedFields.message 
                                        ? 'border-emerald-500/30 focus:border-emerald-500' 
                                        : 'border-white/10 focus:border-white focus:bg-black/60'
                                }`}
                            />
                            {errors.message && (
                                <span className="text-red-400 text-xs flex items-center gap-1.5 mt-1 font-medium shrink-0">
                                        <AlertCircle size={12} /> {errors.message.message}
                                    </span>
                            )}
                        </div>

                        {status && (
                            <div className={`p-4 rounded-xl border flex items-center gap-2.5 text-sm relative z-10 transition-all duration-300 shrink-0 ${isSuccess ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-red-500/10 border-red-500/25 text-red-400'}`}>
                                {isSuccess ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                <span>{status}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{ backgroundColor: '#EAEAEA', color: '#111111' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#EAEAEA'; }}
                            className="group w-full h-14 flex-shrink-0 flex items-center justify-center text-[15px] gap-2 font-bold rounded-xl transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none relative z-10 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                            <Send size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                            {isSubmitting ? 'Sending Message...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </motion.div>
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
            className="group flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.04] p-4 rounded-2xl transition-all duration-300"
        >
            <div className="text-[#4ADE80] group-hover:scale-105 transition-transform duration-300 bg-[#4ADE80]/5 p-3 rounded-xl">
                {icon}
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-neutral-500 text-[0.7rem] font-bold uppercase tracking-widest">{label}</span>
                <span className="text-white font-medium text-[0.95rem] tracking-wide">{value}</span>
            </div>
        </a>
    );
}
