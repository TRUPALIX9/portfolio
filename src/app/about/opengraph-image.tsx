import { ogCard, OG_SIZE } from '@/utils/og';
import { ADVENTURES } from '@/data/adventures';
import { COUNTRIES } from '@/data/travel';
import { SPORTS } from '@/data/sports';

const DONE = ADVENTURES.filter((a) => a.status === 'done').length;
export const alt = 'About Trupal Patel: adventures, travel, sports';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpengraphImage() {
    return ogCard({ section: 'ABOUT', title: 'Hi, I’m Trupal.', subtitle: 'Adventures, travel, the games I play, and what I think.', footer: `${DONE} adventures done · ${COUNTRIES.length} countries · ${SPORTS.length} sports` });
}
