"use client";
import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.18-.35 6.5-1.56 6.5-7.16 0-1.49-.5-2.7-1.35-3.68.14-.33.6-1.74-.15-3.63 0 0-1.12-.36-3.7 1.38a12.8 12.8 0 0 0-6.7 0c-2.58-1.74-3.7-1.38-3.7-1.38-.75 1.89-.29 3.3-.15 3.63-.85.98-1.35 2.19-1.35 3.68 0 5.6 3.32 6.81 6.5 7.16A4.8 4.8 0 0 0 3 18.28V22" />
  </svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isStrict = searchParams.get('strict') === 'true';
  const isArcadeOnly = pathname.startsWith('/arcade/');
  const [isOpen, setIsOpen] = useState(false);

  if (isStrict || isArcadeOnly) return null;

  const links = [
    { href: "/about", label: "About" },
    { href: "/projects", label: "Work" },
    { href: "/experience", label: "Experience" },
    { href: "/game", label: "Take a Break" },
    { href: "/contact", label: "Contact" },
    { href: "/social", label: "Socials" }
  ];

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: 'var(--nav-height)',
          zIndex: 150,
          display: 'flex',
          alignItems: 'center'
        }}
        className="glass"
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', textDecoration: 'none', color: 'inherit' }}>
            TRUPAL PATEL<span style={{ color: 'var(--accent-primary)' }}>.</span>
          </Link>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }} className="nav-links">
              {links.map(link => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 600 : 500,
                      textShadow: isActive ? '0 0 12px rgba(74, 222, 128, 0.4)' : 'none',
                      transition: 'all 0.2s',
                      textDecoration: 'none'
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link href="/resume" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>Resume</Link>
            </div>

            <button className="hamburger-btn" onClick={handleToggle} aria-label="Toggle Menu">
              <span style={{ transform: isOpen ? 'rotate(45deg) translate(0, 8px)' : 'none' }}></span>
              <span style={{ opacity: isOpen ? 0 : 1 }}></span>
              <span style={{ transform: isOpen ? 'rotate(-45deg) translate(0, -8px)' : 'none' }}></span>
            </button>

            <div style={{ display: 'flex', gap: '1.25rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem' }} className="nav-auth">
              <a href="https://github.com/TRUPALIX9" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
                <GithubIcon size={20} />
              </a>
              <a href="https://linkedin.com/in/trupalix9" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
                <LinkedinIcon size={20} />
              </a>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mobile-menu-overlay"
          >
            {links.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={link.href} onClick={() => setIsOpen(false)} className="mobile-menu-link">
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <Link href="/resume" onClick={() => setIsOpen(false)} className="mobile-menu-link" style={{ color: 'var(--accent-primary)' }}>Resume</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<nav className="glass" style={{ height: 'var(--nav-height)' }} />}>
      <NavbarContent />
    </Suspense>
  );
}
