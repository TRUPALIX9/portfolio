"use client";
import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LinkedinIcon, navLinks } from '@/data/site-config';

const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.18-.35 6.5-1.56 6.5-7.16 0-1.49-.5-2.7-1.35-3.68.14-.33.6-1.74-.15-3.63 0 0-1.12-.36-3.7 1.38a12.8 12.8 0 0 0-6.7 0c-2.58-1.74-3.7-1.38-3.7-1.38-.75 1.89-.29 3.3-.15 3.63-.85.98-1.35 2.19-1.35 3.68 0 5.6 3.32 6.81 6.5 7.16A4.8 4.8 0 0 0 3 18.28V22" />
  </svg>
);

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isStrict = searchParams.get('strict') === 'true';
  const isArcadeOnly = pathname.startsWith('/arcade/');
  const [isOpen, setIsOpen] = useState(false);

  if (isStrict || isArcadeOnly) return null;

  const handleToggle = () => setIsOpen(!isOpen);
  const isLinkActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

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
              {navLinks.map(link => {
                const isActive = isLinkActive(link.href);
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
              <a href="https://www.linkedin.com/in/trupalix" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
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
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="mobile-menu-link"
                  style={{ color: isLinkActive(link.href) ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
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
