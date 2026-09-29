import ProjectsGallery from '../../components/ProjectsGallery';
import ProjectsBackground from '../../components/effects/ProjectsBackground';
import type { Metadata } from 'next';
import { pageMetadata } from '@/utils/seo';

export const metadata: Metadata = pageMetadata({
    title: 'Projects | Trupal Patel',
    description: 'Explore high-performance web applications, edge POS systems, and AI data pipelines built by Trupal Patel.',
    path: '/projects',
});

export default function ProjectsPage() {
    return (
        <main>
            <ProjectsBackground />
            <ProjectsGallery />
        </main>
    );
}
