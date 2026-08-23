import ProjectsGallery from '../../components/ProjectsGallery';
import ProjectsBackground from '../../components/effects/ProjectsBackground';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Projects & Work | Trupal Patel',
    description: 'Explore high-performance web applications, edge POS systems, and AI data pipelines built by Trupal Patel.',
};

export default function ProjectsPage() {
    return (
        <main>
            <ProjectsBackground />
            <ProjectsGallery />
        </main>
    );
}
