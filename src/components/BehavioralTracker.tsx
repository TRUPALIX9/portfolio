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
    
    // UTM and Viewport
    const utmRef = useRef<{ source?: string, medium?: string, campaign?: string }>({});
    // Active time tracking
    const lastActivePingRef = useRef<number>(0);
    const cumulativeActiveTimeRef = useRef<number>(0);
    const routeTimesRef = useRef<Record<string, number>>({});
    
    const hasInitializedRef = useRef<boolean>(false);

    useEffect(() => {
        if (!hasInitializedRef.current) {
            hasInitializedRef.current = true;
            startTimeRef.current = Date.now();
            lastActivePingRef.current = Date.now();
            
            // Extract UTM
            const params = new URLSearchParams(window.location.search);
            utmRef.current = {
                source: params.get('utm_source') || undefined,
                medium: params.get('utm_medium') || undefined,
                campaign: params.get('utm_campaign') || undefined,
            };

            const gatherHardware = async () => {
                let batteryLevel = 'unknown';
                let isCharging = false;
                let exactModel = 'unknown';

                try {
                    if ('getBattery' in navigator) {
                        const battery: any = await (navigator as any).getBattery();
                        if (battery) {
                            batteryLevel = Math.round(battery.level * 100) + '%';
                            isCharging = battery.charging;
                        }
                    }
                } catch(e) {}

                try {
                    if ((navigator as any).userAgentData && (navigator as any).userAgentData.getHighEntropyValues) {
                        const uaData = await (navigator as any).userAgentData.getHighEntropyValues(['model']);
                        if (uaData && uaData.model) {
                            exactModel = uaData.model;
                        }
                    }
                } catch(e) {}

                const hardware = {
                    connection: (navigator as any).connection?.effectiveType || 'unknown',
                    memory: (navigator as any).deviceMemory || 'unknown',
                    cores: navigator.hardwareConcurrency || 'unknown',
                    batteryLevel,
                    isCharging,
                    exactModel
                };

                trackVisitorEvent({
                    event: 'behavior_ping',
                    route: pathname || '/',
                    hardware,
                    utm: utmRef.current
                } as any);
            };

            gatherHardware();
        }
    }, [pathname]);

    useEffect(() => {
        // We accumulate active time per route
        const currentRoute = pathname || '/';
        const routeStartTime = Date.now();
        
        const updateActiveTime = () => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                const delta = now - lastActivePingRef.current;
                cumulativeActiveTimeRef.current += delta;
                
                // Add to route specific time
                routeTimesRef.current[currentRoute] = (routeTimesRef.current[currentRoute] || 0) + delta;
                lastActivePingRef.current = now;
            } else {
                // If they hide the tab, log the last visible delta, but don't count time while hidden
                const now = Date.now();
                const delta = now - lastActivePingRef.current;
                cumulativeActiveTimeRef.current += delta;
                routeTimesRef.current[currentRoute] = (routeTimesRef.current[currentRoute] || 0) + delta;
                lastActivePingRef.current = now; // It's paused essentially
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                updateActiveTime();
                sendPing();
            } else {
                // Became visible again, reset the active ping timer
                lastActivePingRef.current = Date.now();
            }
        };

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
            
            // Log element clicked for dead clicks / interaction tracking
            let target = e.target as HTMLElement;
            let targetLabel = target.tagName;
            if (target.id) targetLabel += `#${target.id}`;
            else if (target.className && typeof target.className === 'string') targetLabel += `.${target.className.split(' ')[0]}`;

            log.push({ x: e.clientX, y: e.clientY, time: now });
            const recentClicks = log.filter(c => now - c.time < 1500);
            clickLogRef.current = recentClicks;

            if (recentClicks.length >= 4) {
                const first = recentClicks[0];
                const isRage = recentClicks.every(c => 
                    Math.abs(c.x - first.x) < 50 && Math.abs(c.y - first.y) < 50
                );
                
                if (isRage) {
                    rageClicksRef.current += 1;
                    clickLogRef.current = [];
                    // You could also track a rage_click event explicitly here
                    trackVisitorEvent({
                        event: 'behavior_ping',
                        route: currentRoute,
                        linkName: `Rage click on ${targetLabel}`
                    } as any);
                }
            }
        };

        const sendPing = () => {
            updateActiveTime(); // ensure latest delta is counted before sending
            
            trackVisitorEvent({
                event: 'behavior_ping',
                route: currentRoute,
                behavior: {
                    maxScrollDepth: maxScrollRef.current,
                    sessionDuration: Math.round(cumulativeActiveTimeRef.current / 1000), // Only active time!
                    rageClicks: rageClicksRef.current,
                    activeTimePerRoute: Object.fromEntries(
                        Object.entries(routeTimesRef.current).map(([k, v]) => [k, Math.round(v / 1000)])
                    )
                }
            } as any);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('click', handleClick, { passive: true });
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', sendPing);

        return () => {
            // When route changes, update time and send ping
            updateActiveTime();
            sendPing();
            
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('click', handleClick);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', sendPing);
        };
    }, [pathname]);

    return null;
}

