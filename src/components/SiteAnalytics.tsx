"use client";

import { useLayoutEffect } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { useSitePathname } from '@/hooks/useSitePathname';
import BehavioralTracker from './BehavioralTracker';

/** Routes that must stay free of analytics and cookies (the LogicSprint product + privacy pages). */
export const isAnalyticsFreePath = (pathname: string) =>
    pathname === '/logicsprint' || pathname.startsWith('/logicsprint/');

export default function SiteAnalytics({ gaId }: { gaId?: string }) {
    const excluded = isAnalyticsFreePath(useSitePathname());

    // If GA was loaded by an earlier page, its opt-out flag stops it sending hits or setting
    // cookies. A layout effect sets it synchronously on commit, before GA's history-change
    // page_view is dispatched.
    useLayoutEffect(() => {
        if (gaId) (window as unknown as Record<string, boolean>)[`ga-disable-${gaId}`] = excluded;
    }, [gaId, excluded]);

    if (excluded) return null;
    return (
        <>
            <BehavioralTracker />
            {/* Was hard-coded to the "G-XXXXXXXXXX" placeholder, which sent hits nowhere. */}
            {gaId && <GoogleAnalytics gaId={gaId} />}
        </>
    );
}
