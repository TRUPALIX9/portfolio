/** Canonical origins for the portfolio and the LogicSprint subdomain. */
// www is the primary host on Vercel (the bare domain 308-redirects to it), so canonicals, the sitemap and
// og:url must use www; pointing them at a redirecting URL sends search engines mixed signals.
export const SITE_URL = 'https://www.trupalpatel.com';
export const LOGICSPRINT_URL = 'https://logicsprint.trueorfalse.dev';

/**
 * Personal subdomains: each serves one page of this site at its root. The proxy rewrites
 * <sub>.trupalpatel.com/ to the page and sends any other path back to the main site.
 */
export const SUBDOMAINS = {
    me: { path: '/about', label: 'About me' },
    binge: { path: '/binge', label: 'Binge' },
    travel: { path: '/travel', label: 'Travel' },
    link: { path: '/links', label: 'Links' },
    social: { path: '/social', label: 'Social' },
} as const;
export type Subdomain = keyof typeof SUBDOMAINS;
export const subdomainUrl = (sub: Subdomain) => `https://${sub}.trupalpatel.com`;
