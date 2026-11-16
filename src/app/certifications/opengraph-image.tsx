import { ogCard, OG_SIZE } from '@/utils/og';
import { certifications } from '@/data/certifications';
export const alt = 'Certifications earned by Trupal Patel';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpengraphImage() {
    return ogCard({ section: 'CREDENTIALS', title: 'Certifications', subtitle: 'AI Mastery (Cal Poly & AWS), Meta Front-End Developer, and courses from Google, Duke and Johns Hopkins.', footer: `${certifications.length} credentials · every one verifiable` });
}
