import type { MetadataRoute } from 'next';
import { LOGICSPRINT_URL } from '@/data/site';

// Sitemap for logicsprint.* (src/proxy.ts rewrites /sitemap.xml there to /logicsprint/sitemap.xml).
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: LOGICSPRINT_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
        { url: `${LOGICSPRINT_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ];
}
