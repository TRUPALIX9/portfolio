"use client";

import { useEffect } from 'react';
import GameHub from './GameHub';
import { trackVisitorEvent } from '@/utils/visitor-analytics';

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
    useEffect(() => {
        void trackVisitorEvent({
            event: 'page_view',
            route,
            shareToken,
            source,
        });
    }, [route, shareToken, source]);

    return (
        <GameHub
            standalone={standalone}
            onGameOpen={(game) => {
                void trackVisitorEvent({
                    event: 'game_open',
                    route,
                    shareToken,
                    source,
                    game,
                });
            }}
            onTrackedFinish={({ game, score }) => {
                void trackVisitorEvent({
                    event: 'run_complete',
                    route,
                    shareToken,
                    source,
                    game,
                    score,
                });
            }}
        />
    );
}
