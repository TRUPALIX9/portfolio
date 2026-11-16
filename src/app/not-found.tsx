import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SectionHead, { PART_NO } from '@/components/spec/SectionHead';

export const metadata: Metadata = { title: 'Page not found · Trupal Patel', robots: { index: false } };

/** 404 as a datasheet error page: the pin you asked for isn't connected. */
export default function NotFound() {
    return (
        <div className="sp-page">
            <div className="sp-about nf">
                <section className="sp-section">
                    <SectionHead no={404} title="Page not found" page="Error" />
                    <div className="nf-body">
                        <div>
                            <p className="sp-part" style={{ marginTop: 22 }}><b>{PART_NO}</b><span>Fault code</span><span>E404</span></p>
                            <h1 className="sp-name">No signal<br />on this pin.</h1>
                            <p className="sp-lede" style={{ marginTop: '0.9rem' }}>The page you asked for isn’t wired to anything. It may have moved in the redesign, or the link has a typo.</p>
                            <div className="nf-links">
                                <Link href="/" className="sp-btn"><ArrowLeft size={15} aria-hidden="true" /> Back to the datasheet</Link>
                                <Link href="/about" className="sp-btn sp-btn--ghost">About me</Link>
                                <Link href="/projects" className="sp-btn sp-btn--ghost">Projects</Link>
                                <Link href="/travel" className="sp-btn sp-btn--ghost">Travel</Link>
                            </div>
                        </div>
                        <svg viewBox="0 0 320 200" className="nf-scope" aria-hidden="true">
                            <rect x="1" y="1" width="318" height="198" className="nf-scope__frame" />
                            {Array.from({ length: 7 }, (_, i) => <line key={`v${i}`} x1={40 * (i + 1)} y1="0" x2={40 * (i + 1)} y2="200" className="nf-scope__grid" />)}
                            {Array.from({ length: 4 }, (_, i) => <line key={`h${i}`} x1="0" y1={40 * (i + 1)} x2="320" y2={40 * (i + 1)} className="nf-scope__grid" />)}
                            <path d="M0 140 H60 V60 H100 V140 H140 V60 H160 L170 140 L176 100 L182 150 L190 120 L196 160 L204 140 H320" className="nf-scope__trace" />
                            <text x="12" y="22" className="nf-scope__label">CH1 · SIGNAL LOST</text>
                        </svg>
                    </div>
                </section>
            </div>
        </div>
    );
}
