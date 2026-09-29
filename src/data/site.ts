/** Canonical origins for the portfolio and the LogicSprint subdomain. */
// www is the primary host on Vercel (the bare domain 308-redirects to it), so canonicals, the sitemap and
// og:url must use www; pointing them at a redirecting URL sends search engines mixed signals.
export const SITE_URL = 'https://www.trupalpatel.com';
export const LOGICSPRINT_URL = 'https://logicsprint.trupalpatel.com';
