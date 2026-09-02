"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Mail, ArrowUp } from 'lucide-react';

const GithubIcon = ({ size = 18 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.18-.35 6.5-1.56 6.5-7.16 0-1.49-.5-2.7-1.35-3.68.14-.33.6-1.74-.15-3.63 0 0-1.12-.36-3.7 1.38a12.8 12.8 0 0 0-6.7 0c-2.58-1.74-3.7-1.38-3.7-1.38-.75 1.89-.29 3.3-.15 3.63-.85.98-1.35 2.19-1.35 3.68 0 5.6 3.32 6.81 6.5 7.16A4.8 4.8 0 0 0 3 18.28V22" />
    </svg>
);

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

export default function Footer() {
    const pathname = usePathname();
    const router = useRouter();

    const [clickCount, setClickCount] = useState(0);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handlePointerDown = () => {
        if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = setTimeout(() => {
            router.push('/social-only');
        }, 2000);
    };

    const handlePointerUpOrLeave = () => {
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
            holdTimeoutRef.current = null;
        }
    };

    const handleSecretClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const nextCount = clickCount + 1;
        setClickCount(nextCount);
        
        if (nextCount >= 5) {
            router.push('/social-only');
            setClickCount(0);
            if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
            return;
        }

        if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = setTimeout(() => {
            setClickCount(0);
            if (pathname !== '/') {
                router.push('/');
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 400);
    };


    if (pathname === '/game' || pathname === '/game-only' || pathname?.startsWith('/arcade')) {
        return null;
    }

    const scrollToTop = () => {
        if (typeof window !== 'undefined') {
            if (window.location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.location.href = '/';
            }
        }
    };

    return (
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5, 5, 5, 0.8)', backdropFilter: 'blur(16px)', marginBottom: '3rem' }} className="py-12">
            <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Top row: name/tagline + social icons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <Link
                            href="/"
                            onClick={handleSecretClick}
                            onPointerDown={handlePointerDown}
                            onPointerUp={handlePointerUpOrLeave}
                            onPointerLeave={handlePointerUpOrLeave}
                            onContextMenu={(e) => { e.preventDefault(); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', textDecoration: 'none', color: '#fff' }}
                        >
                            <span>TRUPAL PATEL<span style={{ color: 'var(--accent-primary)' }}>.</span></span>
                        </Link>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                            Full-Stack Systems Engineer &amp; Creative Technologist.
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <a href="https://github.com/TRUPALIX9" target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '0.6rem 0.85rem', borderRadius: '50%' }} aria-label="GitHub">
                            <GithubIcon size={18} />
                        </a>
                        <a href="https://www.linkedin.com/in/trupalix" target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '0.6rem 0.85rem', borderRadius: '50%' }} aria-label="LinkedIn">
                            <LinkedinIcon size={18} />
                        </a>
                        <a href="mailto:trupal.work@gmail.com" className="btn-outline" style={{ padding: '0.6rem 0.85rem', borderRadius: '50%' }} aria-label="Email">
                            <Mail size={18} />
                        </a>
                        <button onClick={scrollToTop} className="btn-primary" style={{ padding: '0.6rem 0.85rem', borderRadius: '50%' }} aria-label="Scroll to top">
                            <ArrowUp size={18} />
                        </button>
                    </div>
                </div>

                {/* Center: spinning favicon */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <style>{`
                        @keyframes spin2d {
                            from { transform: rotate(0deg); }
                            to   { transform: rotate(360deg); }
                        }
                        .favicon-spin2d {
                            animation: spin2d 8s linear infinite;
                            display: block;
                        }
                    `}</style>
                    <Image
                        src="/favicon.svg"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="favicon-spin2d"
                        style={{ objectFit: 'contain', opacity: 0.7 }}
                    />
                </div>

                {/* Bottom row: copyright + nav links */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <p>© {new Date().getFullYear()} Trupal Patel. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <Link href="/#about" style={{ color: 'inherit' }}>About</Link>
                        <Link href="/#projects" style={{ color: 'inherit' }}>Work</Link>
                        <Link href="/#experience" style={{ color: 'inherit' }}>Experience</Link>
                        <Link href="/game" style={{ color: 'inherit' }}>Arcade</Link>
                        <Link href="/#contact" style={{ color: 'inherit' }}>Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
