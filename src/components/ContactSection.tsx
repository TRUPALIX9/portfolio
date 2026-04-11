"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ContactSection() {
    return (
        <section id="contact" className="section container">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="heading-lg" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    Get In <span style={{ color: 'var(--accent-primary)' }}>Touch.</span>
                </h2>

                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <p className="text-body" style={{ marginBottom: '3rem', fontSize: '1.25rem' }}>
                        I'm currently open for freelance, contract, or full-time roles. Whether you have a question or just want to say hi, my inbox is always open!
                    </p>

                    <a href="mailto:trupal.work@gmail.com" className="btn-primary" style={{ fontSize: '1.25rem', padding: '1rem 3rem' }}>
                        Say Hello
                    </a>

                    <div style={{ marginTop: '2rem' }}>
                        <Link href="/resume" className="btn-outline" style={{ display: 'inline-flex', padding: '0.75rem 2rem' }}>
                            View My Resume
                        </Link>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
