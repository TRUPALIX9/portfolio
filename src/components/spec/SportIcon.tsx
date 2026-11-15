import { Footprints, Gamepad2, Goal, HandFist, Volleyball } from 'lucide-react';

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Lucide has no cricket, badminton or tennis icon, so those three are drawn here in the same 24px line style. */
export default function SportIcon({ name, size = 22 }: { name: string; size?: number }) {
    const p = { size, 'aria-hidden': true } as const;
    switch (name) {
        case 'soccer': return <Goal {...p} />;
        case 'volleyball': return <Volleyball {...p} />;
        case 'khokho': return <Footprints {...p} />;
        case 'kabaddi': return <HandFist {...p} />;
        case 'games': return <Gamepad2 {...p} />;
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
