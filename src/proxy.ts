import { NextResponse, type NextRequest } from 'next/server';
import { SITE_URL } from '@/data/site';

// logicsprint.trupalpatel.com serves only the LogicSprint pages, at clean paths.
// Assets and API routes pass through (see matcher); any other page goes to the portfolio.
const LOGICSPRINT_PAGES: Record<string, string> = {
    '/': '/logicsprint',
    '/privacy': '/logicsprint/privacy',
};

export function proxy(request: NextRequest) {
    const host = request.headers.get('host') ?? '';
    if (!host.startsWith('logicsprint.')) return NextResponse.next();

    const { pathname, search } = request.nextUrl;
    const target = LOGICSPRINT_PAGES[pathname];
    if (target) return NextResponse.rewrite(new URL(target + search, request.url));

    // In-page links use the portfolio paths (/logicsprint/privacy): send them to the clean ones.
    const cleanPath = pathname.replace(/^\/logicsprint(?=\/|$)/, '') || '/';
    if (LOGICSPRINT_PAGES[cleanPath]) return NextResponse.redirect(new URL(cleanPath + search, request.url));

    return NextResponse.redirect(new URL(pathname + search, SITE_URL));
}

export const config = {
    // Skip Next internals, API routes, and any file with an extension (images, icons, PDFs).
    matcher: ['/((?!_next/|api/|.*\\.[^/]+$).*)'],
};
