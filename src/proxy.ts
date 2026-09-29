import { NextResponse, type NextRequest } from 'next/server';
import { LOGICSPRINT_URL, SITE_URL } from '@/data/site';

// LogicSprint's product site lives only on its subdomain, at clean paths. The subdomain
// sends every other page to the portfolio, and the portfolio sends /logicsprint/* to the
// subdomain, so each page has exactly one home. Assets and API routes pass through (see matcher).
const LOGICSPRINT_PAGES: Record<string, string> = {
    '/': '/logicsprint',
    '/privacy': '/logicsprint/privacy',
    // The subdomain's own crawler files, so it can be a separate Search Console property.
    '/robots.txt': '/logicsprint/robots.txt',
    '/sitemap.xml': '/logicsprint/sitemap.xml',
    '/llms.txt': '/logicsprint/llms.txt',
};

/** Top-level portfolio routes (src/app/*) that logicsprint.* forwards to the portfolio. */
const PORTFOLIO_SECTIONS = new Set([
    'certifications', 'experience', 'playground', 'products', 'projects', 'social', 'social-only',
]);

/** Where to send cross-host redirects: the matching local hosts in dev, production otherwise. */
function origins(request: NextRequest, rootHost: string) {
    if (rootHost.startsWith('localhost')) {
        const { protocol } = request.nextUrl;
        return { site: `${protocol}//${rootHost}`, product: `${protocol}//logicsprint.${rootHost}` };
    }
    return { site: SITE_URL, product: LOGICSPRINT_URL };
}

export function proxy(request: NextRequest) {
    const host = request.headers.get('host') ?? '';
    const isProductHost = host.startsWith('logicsprint.');
    const { site, product } = origins(request, host.replace(/^logicsprint\./, ''));
    const { pathname, search } = request.nextUrl;
    // /logicsprint/privacy -> /privacy; unchanged for paths outside /logicsprint.
    const productPath = pathname.replace(/^\/logicsprint(?=\/|$)/, '') || '/';

    if (!isProductHost) {
        // Temporary (307) so browsers don't cache it while DNS for the subdomain is new.
        return productPath !== pathname
            ? NextResponse.redirect(new URL(productPath + search, product))
            : NextResponse.next();
    }

    const target = LOGICSPRINT_PAGES[pathname];
    if (target) return NextResponse.rewrite(new URL(target + search, request.url));
    if (LOGICSPRINT_PAGES[productPath]) return NextResponse.redirect(new URL(productPath + search, request.url));
    // Portfolio pages still go to the portfolio; any other path is a dead end on the product
    // site, so render its own 404 (src/app/logicsprint/[...missing] -> not-found.tsx). The target is
    // a fixed "_" path, which can never be a route folder, so this can't expose other routes under
    // src/app/logicsprint; only the pages listed above are reachable here.
    if (PORTFOLIO_SECTIONS.has(pathname.split('/')[1])) return NextResponse.redirect(new URL(pathname + search, site));
    return NextResponse.rewrite(new URL('/logicsprint/_missing', request.url));
}

export const config = {
    // Skip Next internals, API routes, and any file with an extension (images, icons, PDFs),
    // except the crawler files, which differ per host.
    matcher: ['/((?!_next/|api/|.*\\.[^/]+$).*)', '/robots.txt', '/sitemap.xml', '/llms.txt'],
};
