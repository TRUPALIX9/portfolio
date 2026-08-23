"use client";

import MemoryArcade from './MemoryArcade';

type TrackedGameHubProps = {
    route: string;
    shareToken?: string;
    source?: string;
    standalone?: boolean;
};

export default function TrackedGameHub({
    route,
    shareToken,
    source,
    standalone = false,
}: TrackedGameHubProps) {
    return (
        <MemoryArcade
            standalone={standalone}
            route={route}
            shareToken={shareToken}
            source={source}
        />
    );
}
