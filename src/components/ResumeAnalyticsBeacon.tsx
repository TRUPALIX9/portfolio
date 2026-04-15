"use client";

import { useEffect } from 'react';
import { trackVisitorEvent } from '@/utils/visitor-analytics';

export default function ResumeAnalyticsBeacon() {
    useEffect(() => {
        void trackVisitorEvent({
            event: 'page_view',
            route: '/resume',
            source: 'resume-page',
        });
    }, []);

    return null;
}
