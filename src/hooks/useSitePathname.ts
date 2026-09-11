"use client";

import { usePathname, useSelectedLayoutSegments } from 'next/navigation';

/**
 * usePathname(), but for requests the proxy rewrote (logicsprint.* serves /logicsprint at /,
 * see src/proxy.ts) it returns the route that actually rendered. The browser URL, and in dev the
 * server's pathname, is "/" there; layout segments come from the rendered route tree, so they
 * match on server and client and keep route checks (analytics opt-out, nav state) correct.
 * Call it from components rendered by the root layout.
 */
export function useSitePathname() {
    const pathname = usePathname() ?? '';
    const route = `/${useSelectedLayoutSegments().filter((segment) => !segment.startsWith('(')).join('/')}`;
    return route.startsWith('/logicsprint') ? route : pathname;
}
