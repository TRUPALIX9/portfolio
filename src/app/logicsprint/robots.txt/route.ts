import { LOGICSPRINT_URL } from '@/data/site';

// robots.txt for logicsprint.* (src/proxy.ts rewrites /robots.txt there to this route).
export const dynamic = 'force-static';

export function GET() {
    const body = `User-agent: *\nAllow: /\n\nSitemap: ${LOGICSPRINT_URL}/sitemap.xml\n`;
    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
