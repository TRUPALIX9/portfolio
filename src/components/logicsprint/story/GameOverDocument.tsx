'use client';

import { useLayoutEffect } from 'react';

/**
 * A notFound() response is rendered on the client (Next serves an error shell with
 * <html id="__next_error__"> and client-renders the tree), so the root layout's inline script that
 * sets html[data-site='logicsprint'] never runs and the page title falls back to the portfolio's.
 * Restore both before first paint so the portfolio navbar/footer don't show on the product 404.
 */
export default function GameOverDocument({ title }: { title: string }) {
    useLayoutEffect(() => {
        if (window.location.hostname.startsWith('logicsprint.')) document.documentElement.dataset.site = 'logicsprint';
        document.title = title;
    }, [title]);
    return null;
}
