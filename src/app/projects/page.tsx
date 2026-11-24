import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { pageMetadata } from '@/utils/seo';
import SectionHead, { PART_NO } from '@/components/spec/SectionHead';
import { projects } from '@/data/projects';
import ProjectCard from '@/components/spec/ProjectCard';

export const metadata: Metadata = pageMetadata({
    title: 'Projects | Trupal Patel',
    description: 'Case studies of web apps, edge POS systems, AI agents and data pipelines built by Trupal Patel.',
    path: '/projects',
});

export default function ProjectsPage() {
    return (
        <div className="sp-page">
            <div className="sp-about pj">
                <Link href="/#revisions" className="cx-back"><ArrowLeft size={14} aria-hidden="true" /> Back to the datasheet</Link>
                <section className="sp-section">
                    <SectionHead no={1} title="Project archive" page="Projects" />
                    <p className="sp-part" style={{ marginTop: 22 }}><b>{PART_NO}</b><span>Case studies</span><span>{projects.length} on file</span></p>
                    <h1 className="sp-name">Things I’ve built</h1>
                    <p className="sp-lede" style={{ marginTop: '0.8rem' }}>Each one opens a full case study: the problem, how it’s wired, what got hard, and where it stands.</p>

                    <div className="pj-grid">
                        {projects.map((p, i) => <ProjectCard key={p.slug} p={p} index={i} />)}
                    </div>
                </section>
            </div>
        </div>
    );
}
