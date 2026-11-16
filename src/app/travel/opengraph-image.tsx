import { ogCard, OG_SIZE } from '@/utils/og';
import { COUNTRIES } from '@/data/travel';
import { INK } from '@/components/travel/lab/shared';

const REGIONS = COUNTRIES.reduce((n, c) => n + (c.regions?.visited.length ?? 0), 0);
export const alt = 'Trupal Patel’s travel sticker map';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpengraphImage() {
    return ogCard({ section: 'TRAVEL', title: `Collected ${COUNTRIES.length} countries.`, subtitle: 'A sticker map of every country and state visited. Tell me where to go next.', chips: COUNTRIES.map((c) => ({ label: c.label, color: INK[c.label] ?? '#ea580c' })), footer: `${COUNTRIES.length} countries · ${REGIONS} states, provinces and territories` });
}
