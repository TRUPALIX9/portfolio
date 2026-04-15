"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { trackVisitorEvent } from '@/utils/visitor-analytics';

type TrackedAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
    route: string;
    eventType: 'link_open' | 'resume_open' | 'resume_download';
    linkName: string;
    linkUrl: string;
    source?: string;
};

export default function TrackedAnchor({
    children,
    route,
    eventType,
    linkName,
    linkUrl,
    source,
    onClick,
    ...props
}: TrackedAnchorProps) {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        void trackVisitorEvent({
            event: eventType,
            route,
            source,
            linkName,
            linkUrl,
        });

        onClick?.(event);
    };

    return (
        <a {...props} onClick={handleClick}>
            {children}
        </a>
    );
}
