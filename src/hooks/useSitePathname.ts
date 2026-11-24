"use client";

import { usePathname, useSelectedLayoutSegments } from 'next/navigation';

/**
 * usePathname(), but for requests the proxy rewrote (the personal subdomains serve /about, /binge,
 * /travel, /links and /social at /, and logicsprint.* serves /logicsprint; see src/proxy.ts) it returns the
 * route that actually rendered. The browser URL, and in dev the
 * server's pathname, is "/" there; layout segments come from the rendered route tree, so they
 * match on server and client and keep route checks (analytics opt-out, nav state) correct.
 * Call it from components rendered by the root layout.
 */
export function useSitePathname() {
    const pathname = usePathname() ?? '';
    const route = `/${useSelectedLayoutSegments().filter((segment) => !segment.startsWith('(')).join('/')}`;
    if (route.startsWith('/logicsprint')) return route;
    // A subdomain's root: the browser shows "/" but another page rendered.
    if (pathname === '/' && route !== '/') return route;
    return pathname;
}
