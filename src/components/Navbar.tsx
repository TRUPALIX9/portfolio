"use client";
import { useState, Suspense, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LinkedinIcon, navLinks } from '@/data/site-config';

const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.18-.35 6.5-1.56 6.5-7.16 0-1.49-.5-2.7-1.35-3.68.14-.33.6-1.74-.15-3.63 0 0-1.12-.36-3.7 1.38a12.8 12.8 0 0 0-6.7 0c-2.58-1.74-3.7-1.38-3.7-1.38-.75 1.89-.29 3.3-.15 3.63-.85.98-1.35 2.19-1.35 3.68 0 5.6 3.32 6.81 6.5 7.16A4.8 4.8 0 0 0 3 18.28V22" />
  </svg>
);

// Map of nav link labels to section IDs for single-page scroll anchors
const SECTION_ANCHORS: Record<string, string> = {
  'About':      'about',
  'Work':       'projects',
  'Experience': 'experience',
  'Contact':    'contact',
};

// These always navigate to their own route regardless of page
const ROUTE_ONLY = new Set(['/social', '/game']);

function NavbarContent() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const isStrict            = searchParams.get('strict') === 'true';
  const isArcadeOnly        = pathname.startsWith('/arcade/');
  const isDedicatedSharePage = pathname === '/social-only' || pathname === '/arcade-only' || pathname === '/game-only';
  const isPlayground        = pathname === '/playground';
  const isHome              = pathname === '/';
  const [isOpen, setIsOpen] = useState(false);

  // New logic for hiding/showing navbar based on scroll direction and mouse position
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [isHoveringTop, setIsHoveringTop] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    lastScrollY.current = window.scrollY;
    setIsAtTop(window.scrollY < 50);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 50);
      
      if (currentScrollY > lastScrollY.current + 10) {
        setIsScrollingUp(false); // Scrolled down
      } else if (currentScrollY < lastScrollY.current - 10) {
        setIsScrollingUp(true); // Scrolled up
      }
      lastScrollY.current = currentScrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      setIsHoveringTop(e.clientY < 120);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (isStrict || isArcadeOnly || isDedicatedSharePage || isPlayground) return null;

  const handleToggle = () => setIsOpen(!isOpen);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false);
    }
  }, []);

  // Determine if a link is "active" — on home, we always consider it active for section links
  const isLinkActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Render a nav link — on home page, section links scroll instead of navigate
  const renderLink = (link: { href: string; label: string }, onClick?: () => void) => {
    const sectionId = isHome ? SECTION_ANCHORS[link.label] : undefined;
    const isExternal = ROUTE_ONLY.has(link.href);

    if (sectionId && !isExternal) {
      return (
        <button
          key={link.href}
          type="button"
          onClick={() => { scrollToSection(sectionId); onClick?.(); }}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: 'inherit',
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {link.label}
        </button>
      );
    }

    const isActive = isLinkActive(link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={onClick}
        style={{
          color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
          fontWeight: isActive ? 600 : 500,
          textShadow: isActive ? '0 0 12px rgba(74, 222, 128, 0.4)' : 'none',
          transition: 'all 0.2s',
          textDecoration: 'none',
        }}
      >
        {link.label}
      </Link>
    );
  };

  // Show nav when: at the top, scrolling up, hovering at top, or menu is open
  const showNav = isAtTop || isScrollingUp || isHoveringTop || isOpen;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: showNav ? 0 : -100 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: 'var(--nav-height)',
          zIndex: 150,
          display: 'flex',
          alignItems: 'center',
        }}
        className="glass"
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isHome ? (
            <button
              type="button"
              onClick={() => scrollToSection('hero')}
              style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit' }}
            >
              TRUPAL PATEL<span style={{ color: 'var(--accent-primary)' }}>.</span>
            </button>
          ) : (
            <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', textDecoration: 'none', color: 'inherit' }}>
              TRUPAL PATEL<span style={{ color: 'var(--accent-primary)' }}>.</span>
            </Link>
          )}

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }} className="nav-links">
              {pathname === '/projects' || isHome ? (
                navLinks.map(link => renderLink(link))
              ) : pathname.startsWith('/projects/') ? (
                <Link href="/projects" className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                  &larr; Go to Projects
                </Link>
              ) : (
                <Link href="/" className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                  &larr; Back to Home
                </Link>
              )}
            </div>

            <button className="hamburger-btn" onClick={handleToggle} aria-label="Toggle Menu">
              <span style={{ transform: isOpen ? 'rotate(45deg) translate(0, 8px)' : 'none' }}></span>
              <span style={{ opacity: isOpen ? 0 : 1 }}></span>
              <span style={{ transform: isOpen ? 'rotate(-45deg) translate(0, -8px)' : 'none' }}></span>
            </button>

            <div style={{ display: 'flex', gap: '1.25rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem', alignItems: 'center' }} className="nav-auth">
              <a 
                href="/RESUME.pdf" 
                download="Trupal_Patel_Resume.pdf"
                className="btn-outline" 
                style={{ 
                  padding: '0.4rem 1rem', 
                  fontSize: '0.85rem', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <span>Resume</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </a>
              <a href="https://github.com/TRUPALIX9" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}>
                <GithubIcon size={20} />
              </a>
              <a href="https://www.linkedin.com/in/trupalix" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}>
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
                {renderLink(link, () => setIsOpen(false))}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navLinks.length * 0.05 }}
              style={{ marginTop: '1.5rem' }}
            >
              <a 
                href="/RESUME.pdf" 
                download="Trupal_Patel_Resume.pdf"
                className="btn-outline" 
                onClick={() => setIsOpen(false)}
                style={{ 
                  padding: '0.6rem 1.5rem', 
                  fontSize: '0.95rem', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <span>Download Resume</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </a>
            </motion.div>
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
