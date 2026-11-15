"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { useSitePathname } from '@/hooks/useSitePathname';

export default function Footer() {
    const pathname = useSitePathname();
    const router = useRouter();
    const clicks = useRef(0);
    const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    if (pathname === '/social-only' || pathname === '/playground' || pathname.startsWith('/binge') || pathname.startsWith('/travel')) return null;

    // Hidden door to /social-only: tap the name five times, or press and hold it for two seconds.
    const onNameClick = () => {
        clicks.current += 1;
        if (clickTimer.current) clearTimeout(clickTimer.current);
        if (clicks.current >= 5) {
            clicks.current = 0;
            router.push('/social-only');
            return;
        }
        clickTimer.current = setTimeout(() => { clicks.current = 0; }, 600);
    };
    const onHoldStart = () => {
        if (holdTimer.current) clearTimeout(holdTimer.current);
        holdTimer.current = setTimeout(() => router.push('/social-only'), 2000);
    };
    const onHoldEnd = () => {
        if (holdTimer.current) clearTimeout(holdTimer.current);
        holdTimer.current = null;
    };

    return (
        <footer data-site-chrome className="sp-footer">
            <div className="sp-footer__inner">
                <span>
                    <span
                        className="sp-footer__name"
                        onClick={onNameClick}
                        onPointerDown={onHoldStart}
                        onPointerUp={onHoldEnd}
                        onPointerLeave={onHoldEnd}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        Trupal Patel
                    </span>
                    {' '}· TP-SDE-2026 · Rev 4 · trupalpatel.com · © {new Date().getFullYear()}
                </span>
                <nav aria-label="Footer" className="sp-footer__links">
                    <Link href="/">Datasheet</Link>
                    <Link href="/about">About</Link>
                    <Link href="/binge">Binge</Link>
                    <Link href="/projects">Archive</Link>
                    <Link href="/certifications">Certifications</Link>
                    <a href="https://trueorfalse.dev" target="_blank" rel="noreferrer">trueorfalse.dev</a>
                </nav>
            </div>
        </footer>
    );
}
