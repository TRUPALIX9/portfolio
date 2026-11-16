import { ogCard, OG_SIZE } from '@/utils/og';

export const alt = 'Every way to reach Trupal Patel';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpengraphImage() {
    return ogCard({ section: 'LINKS', title: 'Say hi.', subtitle: 'LinkedIn, GitHub, email, WhatsApp, Instagram, Snapchat, BeReal and Discord.', footer: 'One hub, every channel' });
}
