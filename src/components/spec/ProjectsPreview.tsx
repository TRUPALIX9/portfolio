import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { projects } from '@/data/projects';
import ProjectCard from './ProjectCard';

const SHOWN = 3;

/** The first few case studies, then a centered button to the full archive. */
export default function ProjectsPreview() {
    const rest = projects.length - SHOWN;
    return (
        <>
            <div className="pj-grid pj-grid--preview">
                {projects.slice(0, SHOWN).map((p, i) => <ProjectCard key={p.slug} p={p} index={i} heading="h3" />)}
            </div>
            {rest > 0 && (
                <p className="pj-more">
                    <Link href="/projects" className="sp-btn sp-btn--accent" aria-label={`View all ${projects.length} projects`}>
                        <b className="sp-btn__count">+{rest}</b> more projects <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </p>
            )}
        </>
    );
}
