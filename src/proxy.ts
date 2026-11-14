import { NextResponse, type NextRequest } from 'next/server';
import { LOGICSPRINT_URL, SITE_URL } from '@/data/site';

// LogicSprint moved to logicsprint.trueorfalse.dev (the True or False studio site). Every old
// LogicSprint address redirects there permanently, keeping the path, so the App Store and Google
// Play links (/privacy, /download) keep working:
//   logicsprint.trupalpatel.com/<path>   -> logicsprint.trueorfalse.dev/<path>
//   trupalpatel.com/logicsprint/<path>   -> logicsprint.trueorfalse.dev/<path>
// Portfolio sections opened on the old subdomain still go to the portfolio.

/** Top-level portfolio routes (src/app/*) that the old logicsprint.* host forwards to the portfolio. */
const PORTFOLIO_SECTIONS = new Set([
    'certifications', 'experience', 'playground', 'products', 'projects', 'social', 'social-only',
]);

export function proxy(request: NextRequest) {
    const host = request.headers.get('host') ?? '';
    const { pathname, search } = request.nextUrl;

    if (host.startsWith('logicsprint.')) {
        if (PORTFOLIO_SECTIONS.has(pathname.split('/')[1])) {
            return NextResponse.redirect(new URL(pathname + search, SITE_URL), 308);
        }
        return NextResponse.redirect(new URL(pathname + search, LOGICSPRINT_URL), 308);
    }

    // /logicsprint/privacy -> /privacy on the product's own domain.
    if (pathname === '/logicsprint' || pathname.startsWith('/logicsprint/')) {
        const productPath = pathname.slice('/logicsprint'.length) || '/';
        return NextResponse.redirect(new URL(productPath + search, LOGICSPRINT_URL), 308);
    }

    return NextResponse.next();
}

export const config = {
    // Skip Next internals, API routes, and any file with an extension (images, icons, PDFs),
    // except the crawler files, which the old subdomain redirects too.
    matcher: ['/((?!_next/|api/|.*\\.[^/]+$).*)', '/robots.txt', '/sitemap.xml', '/llms.txt'],
};
