import { MetadataRoute } from 'next';
import { SITE_URL } from '@/data/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/playground', '/api/', '/social', '/social-only'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
