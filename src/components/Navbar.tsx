"use client";

import { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useSitePathname } from '@/hooks/useSitePathname';
import { LinkedinIcon } from '@/data/site-config';

const GithubIcon = ({ size = 17 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.18-.35 6.5-1.56 6.5-7.16 0-1.49-.5-2.7-1.35-3.68.14-.33.6-1.74-.15-3.63 0 0-1.12-.36-3.7 1.38a12.8 12.8 0 0 0-6.7 0c-2.58-1.74-3.7-1.38-3.7-1.38-.75 1.89-.29 3.3-.15 3.63-.85.98-1.35 2.19-1.35 3.68 0 5.6 3.32 6.81 6.5 7.16A4.8 4.8 0 0 0 3 18.28V22" />
    </svg>
);

/** Sections of the home datasheet, then the other pages. */
const SECTIONS = [
    { href: '/#pinout', no: '2', label: 'System map' },
    { href: '/#applications', no: '3', label: 'Applications' },
    { href: '/#revisions', no: '4', label: 'Revisions' },
    { href: '/#ordering', no: '6', label: 'Contact' },
];
const PAGES = [
    { href: '/about', label: 'About' },
    { href: '/binge', label: 'Binge' },
];

function NavbarContent() {
    const pathname = useSitePathname();
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);
    const isHome = pathname === '/';

    // Close the mobile menu on navigation (adjusting state during render, not in an effect).
    const [menuPath, setMenuPath] = useState(pathname);
    if (menuPath !== pathname) {
        setMenuPath(pathname);
        setOpen(false);
    }

    if (
        searchParams.get('strict') === 'true' ||
        pathname === '/social-only' ||
        pathname === '/playground' ||
        pathname.startsWith('/binge') ||
        pathname.startsWith('/travel')
    ) return null;

    const href = (h: string) => (isHome && h.startsWith('/#') ? h.slice(1) : h);

    return (
        <>
            <nav aria-label="Primary" data-site-chrome className="sp-bar">
                <div className="sp-bar__inner">
                    <Link href="/" className="sp-bar__pn" aria-label="Trupal Patel, home">
                        <Image src="/logo-penrose.png" alt="" width={30} height={30} priority className="sp-bar__logo" />Trupal Patel
                    </Link>

                    <div className="sp-bar__links">
                        {SECTIONS.map((s) => (
                            <a key={s.href} href={href(s.href)}>{s.no} · {s.label}</a>
                        ))}
                        <span className="sep" aria-hidden="true" />
                        {PAGES.map((p) => (
                            <Link key={p.href} href={p.href} aria-current={pathname === p.href ? 'page' : undefined}>{p.label}</Link>
                        ))}
                    </div>

                    <div className="sp-bar__right">
                        <span className="sp-bar__rev">REV 4</span>
                        <a href="https://github.com/TRUPALIX9" target="_blank" rel="noreferrer" aria-label="GitHub" className="sp-iconbtn"><GithubIcon /></a>
                        <a href="https://www.linkedin.com/in/trupalix" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="sp-iconbtn"><LinkedinIcon size={17} /></a>
                        <button
                            type="button"
                            className="sp-iconbtn sp-burger"
                            aria-label={open ? 'Close menu' : 'Open menu'}
                            aria-expanded={open}
                            onClick={() => setOpen((o) => !o)}
                        >
                            {open ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            {open && (
                <div className="sp-menu" data-site-chrome>
                    {SECTIONS.map((s) => (
                        <a key={s.href} href={href(s.href)} onClick={() => setOpen(false)}>{s.label} <span>§{s.no}</span></a>
                    ))}
                    {PAGES.map((p) => (
                        <Link key={p.href} href={p.href} onClick={() => setOpen(false)}>{p.label} <span>→</span></Link>
                    ))}
                </div>
            )}
        </>
    );
}

export default function Navbar() {
    return (
        <Suspense fallback={null}>
            <NavbarContent />
        </Suspense>
    );
}
