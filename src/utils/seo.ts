import type { Metadata } from 'next';

const DEFAULT_IMAGE = { url: '/opengraph-image', width: 1200, height: 630 };

type PageSeo = {
    title: string;
    description: string;
    /** Site-relative path, resolved against metadataBase (e.g. "/projects/retailsync"). */
    path: string;
    image?: { url: string; width?: number; height?: number; alt?: string };
};

/**
 * Title, description, canonical URL and share cards for one indexable page.
 * Pages must set their own og:url: otherwise they inherit the root layout's (the home page),
 * and link previews for that page would show the home page instead.
 */
export function pageMetadata({ title, description, path, image }: PageSeo): Metadata {
    const images = [image ?? DEFAULT_IMAGE];
    return {
        title,
        description,
        alternates: { canonical: path },
        openGraph: { title, description, url: path, siteName: 'Trupal Patel Portfolio', type: 'website', images },
        twitter: { card: 'summary_large_image', title, description, images },
    };
}
