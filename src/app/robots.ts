import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/playground', '/api/'],
    },
    sitemap: 'https://true-pal.vercel.app/sitemap.xml',
  };
}
