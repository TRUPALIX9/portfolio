import { ogCard, OG_SIZE } from '@/utils/og';
import { projects } from '@/data/projects';
export const alt = 'Projects by Trupal Patel';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpengraphImage() {
    return ogCard({ section: 'PROJECTS', title: 'Things I’ve built', subtitle: 'Case studies: edge POS systems, AI agents, data pipelines and web apps.', footer: `${projects.length} case studies` });
}
