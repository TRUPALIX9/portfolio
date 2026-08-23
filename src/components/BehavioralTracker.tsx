"use client";

import { useEffect, useRef } from "react";
import { trackVisitorEvent } from "@/utils/visitor-analytics";
import { usePathname } from "next/navigation";

export default function BehavioralTracker() {
    const pathname = usePathname();
    const startTimeRef = useRef<number>(0);
    const maxScrollRef = useRef<number>(0);
    const rageClicksRef = useRef<number>(0);
    const clickLogRef = useRef<{ x: number; y: number; time: number }[]>([]);
    const hasInitializedRef = useRef<boolean>(false);

    useEffect(() => {
        if (!hasInitializedRef.current) {
            hasInitializedRef.current = true;
            startTimeRef.current = Date.now();
            
            // Collect Hardware Info
            const hardware = {
                connection: (navigator as any).connection?.effectiveType || 'unknown',
                memory: (navigator as any).deviceMemory || 'unknown',
                cores: navigator.hardwareConcurrency || 'unknown',
            };

            // Send initial ping with hardware details
            trackVisitorEvent({
                event: 'behavior_ping',
                route: pathname || '/',
                hardware
            });
        }
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight <= 0) return;
            const currentScroll = window.scrollY;
            const percentage = Math.round((currentScroll / scrollHeight) * 100);
            if (percentage > maxScrollRef.current) {
                maxScrollRef.current = Math.min(percentage, 100);
            }
        };

        const handleClick = (e: MouseEvent) => {
            const now = Date.now();
            const log = clickLogRef.current;
            log.push({ x: e.clientX, y: e.clientY, time: now });

            // Keep only clicks from the last 1500ms
            const recentClicks = log.filter(c => now - c.time < 1500);
            clickLogRef.current = recentClicks;

            if (recentClicks.length >= 4) {
                // Check if they are within a 50px radius
                const first = recentClicks[0];
                const isRage = recentClicks.every(c => 
                    Math.abs(c.x - first.x) < 50 && Math.abs(c.y - first.y) < 50
                );
                
                if (isRage) {
                    rageClicksRef.current += 1;
                    // Reset to avoid double counting the same burst
                    clickLogRef.current = [];
                }
            }
        };

        const sendPing = () => {
            const durationSecs = Math.round((Date.now() - startTimeRef.current) / 1000);
            trackVisitorEvent({
                event: 'behavior_ping',
                route: pathname || '/',
                behavior: {
                    maxScrollDepth: maxScrollRef.current,
                    sessionDuration: durationSecs,
                    rageClicks: rageClicksRef.current,
                }
            });
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                sendPing();
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('click', handleClick, { passive: true });
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', sendPing);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('click', handleClick);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', sendPing);
        };
    }, [pathname]);

    return null;
}
