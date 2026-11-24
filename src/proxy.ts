import { NextResponse, type NextRequest } from 'next/server';
import { LOGICSPRINT_URL, SITE_URL, SUBDOMAINS, type Subdomain } from '@/data/site';

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

    // me. / binge. / travel. / link. serve one page each at their root (works on *.localhost too).
    const sub = host.split('.')[0] as Subdomain;
    if (sub in SUBDOMAINS && host.split('.').length > 1) {
        const page = SUBDOMAINS[sub].path;
        if (pathname === '/') return NextResponse.rewrite(new URL(page + search, request.url));
        // The page's own routes (e.g. /travel/flight) stay on the subdomain.
        if (pathname === page || pathname.startsWith(`${page}/`)) return NextResponse.next();
        // Anything else belongs to the main site.
        return NextResponse.redirect(new URL(pathname + search, SITE_URL), 307);
    }

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
