import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Award, FileText, FolderGit2, Globe, MessageCircleHeart, Plane, Tv, User } from 'lucide-react';
import { LinkedinIcon, socialLinks } from '@/data/site-config';
import { SITE_URL, subdomainUrl } from '@/data/site';
import { STUDIO, STUDIO_TREE } from '@/data/studio';
import AppIcon from '@/components/spec/AppIcon';
import './links.css';

export const metadata: Metadata = {
    title: 'Links · Trupal Patel',
    description: 'Every link in one place: my corners of the web, work, the True or False studio, and every way to say hi.',
    alternates: { canonical: '/links' },
};

type Row = { href: string; title: string; sub: string; icon: React.ReactNode; tint?: string };

const GITHUB = socialLinks.find((s) => s.name === 'GitHub')!;
const SAY_HI = socialLinks.filter((s) => s.name !== 'GitHub');

/** My own subdomains first, then work, the studio, and every way to reach me. */
const GROUPS: { name: string; rows: Row[] }[] = [
    {
        name: 'My corners',
        rows: [
            { href: subdomainUrl('me'), title: 'me.trupalpatel.com', sub: 'About me: adventures, sports and what I think', icon: <User size={20} />, tint: '#ff6b35' },
            { href: subdomainUrl('binge'), title: 'binge.trupalpatel.com', sub: 'What I’m watching, season by season', icon: <Tv size={20} />, tint: '#ffb547' },
            { href: subdomainUrl('social'), title: 'social.trupalpatel.com', sub: 'Every way to say hi, on one map', icon: <MessageCircleHeart size={20} />, tint: '#e1306c' },
            { href: subdomainUrl('travel'), title: 'travel.trupalpatel.com', sub: 'A sticker map of where I’ve been', icon: <Plane size={20} />, tint: '#3a86ff' },
            { href: SITE_URL, title: 'trupalpatel.com', sub: 'The portfolio: system map, experience, contact', icon: <Globe size={20} />, tint: '#1a1a1a' },
        ],
    },
    {
        name: 'Work',
        rows: [
            { href: 'https://www.linkedin.com/in/trupalix', title: 'LinkedIn', sub: 'in/trupalix', icon: <LinkedinIcon size={20} />, tint: '#0a66c2' },
            { href: GITHUB.url, title: 'GitHub', sub: GITHUB.handle, icon: GITHUB.icon, tint: '#1a1a1a' },
            { href: '/projects', title: 'Projects', sub: 'Case studies of things I’ve built', icon: <FolderGit2 size={20} /> },
            { href: '/certifications', title: 'Certifications', sub: 'Every certificate, with the originals', icon: <Award size={20} /> },
            { href: '/RESUME.pdf', title: 'Résumé', sub: 'PDF', icon: <FileText size={20} /> },
        ],
    },
    {
        name: 'True || False studio',
        rows: [
            { href: STUDIO.url, title: 'trueorfalse.dev', sub: 'The studio I’m a member of', icon: <Image src="/studio/studio.png" alt="" width={22} height={22} />, tint: '#0c0c0d' },
            ...STUDIO_TREE.filter((n) => n.group === 'products' && n.live).map((n) => ({
                href: n.links[0].href, title: n.name, sub: n.tagline, icon: <AppIcon id={n.id} name={n.name} size={26} />,
            })),
        ],
    },
    {
        name: 'Say hi',
        rows: SAY_HI.map((s) => ({ href: s.url, title: s.name, sub: s.handle, icon: s.icon, tint: s.color })),
    },
];

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href) || href.endsWith('.pdf');

export default function LinksPage() {
    return (
        <div className="sp-page">
        <main className="lk">
            <header className="lk-head">
                <div className="lk-avatar"><Image src="/social.jpeg" alt="Trupal Patel" fill sizes="96px" style={{ objectFit: 'cover', objectPosition: '50% 40%' }} priority /></div>
                <h1>Trupal Patel</h1>
                <p>Human · every link in one place</p>
            </header>
            {GROUPS.map((g) => (
                <section key={g.name} className="lk-group" aria-labelledby={`lk-${g.name}`}>
                    <h2 id={`lk-${g.name}`}>{g.name}</h2>
                    <ul>
                        {g.rows.map((r, i) => {
                            const inner = (
                                <>
                                    <span className="lk-icon" style={r.tint ? { ['--tint' as string]: r.tint } : undefined}>{r.icon}</span>
                                    <span className="lk-text"><b>{r.title}</b><small>{r.sub}</small></span>
                                    <ArrowUpRight size={16} aria-hidden="true" className="lk-go" />
                                </>
                            );
                            return (
                                <li key={r.title} style={{ ['--d' as string]: `${i * 40}ms` }}>
                                    {isExternal(r.href)
                                        ? <a href={r.href} className="lk-row" {...(r.href.startsWith('http') || r.href.endsWith('.pdf') ? { target: '_blank', rel: 'noreferrer' } : {})}>{inner}</a>
                                        : <Link href={r.href} className="lk-row">{inner}</Link>}
                                </li>
                            );
                        })}
                    </ul>
                </section>
            ))}
            <p className="lk-foot">link.trupalpatel.com</p>
        </main>
        </div>
    );
}
