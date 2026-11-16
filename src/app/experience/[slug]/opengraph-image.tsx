import { ogCard, OG_SIZE } from '@/utils/og';
import master from '@/data/master.json';

export const alt = 'A role in Trupal Patel’s career';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
    return master.experiences.map((e) => ({ slug: e.slug }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const exp = master.experiences.find((e) => e.slug === slug);
    return ogCard({
        section: 'REVISION NOTE',
        title: exp?.company ?? 'Experience',
        subtitle: exp ? `${exp.role} · ${exp.period}` : '',
        footer: 'Overview · responsibilities · challenges · impact',
    });
}
