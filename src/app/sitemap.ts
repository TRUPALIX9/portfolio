import { MetadataRoute } from 'next';
import { projects } from '@/data/projects';
import master from '@/data/master.json';
import { SITE_URL } from '@/data/site';

// Portfolio pages only. Products live on trueorfalse.dev and its subdomains, which have their own sitemaps. LogicSprint has its own sitemap on its subdomain (src/app/logicsprint/sitemap.ts).
// No lastModified: stamping every URL with the build time tells crawlers everything changed on each
// deploy, which trains them to ignore the field. Every URL here must match that page's canonical.

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  return [
    {
      url: `${baseUrl}/`,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/binge`,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/projects`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/travel`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/social`,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/quiz`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/certifications`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // There is no /experience index route — list the real detail pages instead.
    ...master.experiences.map((exp) => ({
      url: `${baseUrl}/experience/${exp.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...projects.map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
