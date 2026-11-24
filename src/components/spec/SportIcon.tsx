import { Footprints, Gamepad2, Goal, HandFist, Timer, Volleyball } from 'lucide-react';

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Lucide has no cricket, racket or most athletics icons, so those are drawn here in the same 24px line style. */
export default function SportIcon({ name, size = 22 }: { name: string; size?: number }) {
    const p = { size, 'aria-hidden': true } as const;
    switch (name) {
        case 'soccer': return <Goal {...p} />;
        case 'volleyball': return <Volleyball {...p} />;
        case 'khokho': return <Footprints {...p} />;
        case 'kabaddi': return <HandFist {...p} />;
        case 'games': return <Gamepad2 {...p} />;
        case 'track': return <Timer {...p} />;
        case 'wrestling':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...line}>
                    <circle cx="7" cy="5" r="2" /><circle cx="17" cy="5" r="2" />
                    <path d="M7 7v5l5 2 5-2V7" /><path d="M7 12l-2 8M17 12l2 8M12 14v6" />
                </svg>
            );
        case 'highjump':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...line}>
                    <path d="M4 20V8M20 20V8M4 9h16" /><path d="M5 18c3-9 9-12 14-9" strokeDasharray="2 3" />
                </svg>
            );
        case 'longjump':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...line}>
                    <path d="M2 18h7" /><path d="M9 18c2-8 7-8 10 0" strokeDasharray="2 3" /><path d="M15 20h7" /><path d="M16 18h5" />
                </svg>
            );
        case 'discus':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...line}>
                    <ellipse cx="12" cy="12" rx="9" ry="5" /><ellipse cx="12" cy="12" rx="3" ry="1.6" />
                </svg>
            );
        case 'hammer':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...line}>
                    <circle cx="16.5" cy="16.5" r="4" /><path d="M13.7 13.7 5.5 5.5" /><path d="M3.5 7.5l4-4" />
                </svg>
            );
        case 'shotput':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="13" r="6.5" fill="currentColor" /><circle cx="9.8" cy="10.8" r="1.6" fill="#fff" opacity="0.6" />
                </svg>
            );
        case 'javelin':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...line}>
                    <path d="M3 21 19 5" /><path d="M19 5l2.5-2.5M16.5 4.5 19 5l.5 2.5" /><path d="M8 16l2 2" />
                </svg>
            );
        case 'cricket':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...line}>
                    <path d="M14.5 3.5l3 3-8 8-3-3z" />
                    <path d="M6.5 11.5 3 15" />
                    <path d="M3 15l2 2" />
                    <circle cx="17.5" cy="17.5" r="2.5" />
                </svg>
            );
        case 'badminton':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...line}>
                    <path d="M8.5 15.5 13 4l7 7-11.5 4.5" />
                    <path d="M10.5 10.5 16.5 7.5" />
                    <path d="M12 13l4.5-3" />
                    <circle cx="6.5" cy="17.5" r="3" />
                </svg>
            );
        case 'tennis':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...line}>
                    <ellipse cx="14.5" cy="9.5" rx="5.5" ry="6.5" transform="rotate(45 14.5 9.5)" />
                    <path d="M10.5 13.5 4 20" />
                    <path d="M11 6.5l6.5 6.5M14.5 4.5l5 5" />
                    <circle cx="5" cy="6" r="2" />
                </svg>
            );
        default: return null;
    }
}
