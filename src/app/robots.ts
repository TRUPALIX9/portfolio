import { MetadataRoute } from 'next';
import { SITE_URL } from '@/data/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /playground, /social and /social-only stay crawlable on purpose: they carry noindex, and a
      // crawler blocked here would never see it (a blocked URL can still be indexed from links).
      disallow: ['/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
