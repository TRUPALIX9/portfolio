/** The five Rocket Launch colour themes, copied from the app (lib/games/rocket_launch/rocket_look.dart). */
export type FlightTheme = {
    name: string;
    hull: string;
    trim: string;
    flame: string;
    /** Asteroid tint in the app; here it colours the unsolved "?" of each equation. */
    rock: string;
    space: string;
    glows: [string, string, string];
    planet: string;
};

export const THEMES: FlightTheme[] = [
    { name: 'Deep teal', hull: '#EAF2F7', trim: '#3B7BF0', flame: '#34C29A', rock: '#D9A066', space: '#000000', glows: ['#8C8CFF', '#3B7BF0', '#34C29A'], planet: '#2BB3D6' },
    { name: 'Deep ocean', hull: '#F0FEFF', trim: '#22D3C5', flame: '#9AF7FF', rock: '#FF7F66', space: '#021A20', glows: ['#06B6D4', '#14B8A6', '#38BDF8'], planet: '#67E8F9' },
    { name: 'Toxic', hull: '#EFFFE6', trim: '#3DDC84', flame: '#B7F34A', rock: '#D08CF0', space: '#06120A', glows: ['#1FAA59', '#9BE15D', '#00C2A8'], planet: '#A6F07A' },
    { name: 'Nebula pink', hull: '#FFEAF7', trim: '#FF4FB8', flame: '#C77DFF', rock: '#F2C14E', space: '#110716', glows: ['#FF4FB8', '#8B5CF6', '#FF8FD8'], planet: '#F0A6FF' },
    { name: 'Ice', hull: '#F2FBFF', trim: '#6FD3FF', flame: '#BDF0FF', rock: '#F08A4B', space: '#050B16', glows: ['#3B82F6', '#93C5FD', '#22D3EE'], planet: '#CFEFFF' },
];

/** Unlocked by finding all three hidden hearts on the site (the `ls:hearts` event). */
export const SECRET_THEME: FlightTheme = {
    name: 'Gold', hull: '#FFF6DC', trim: '#F5B82E', flame: '#FFE08A', rock: '#8C8CFF', space: '#000000', glows: ['#F5B82E', '#FF8A3D', '#FFE08A'], planet: '#FFD36B',
};

/** The hero dogfight: each ship flies in its own Rocket Launch theme. */
export const SHIPS = [
    { kind: 'rocket', label: 'Rocket', theme: THEMES[0] },
    { kind: 'ufo', label: 'UFO', theme: THEMES[3] },
    { kind: 'spaceship', label: 'Spaceship', theme: THEMES[2] },
    { kind: 'missile', label: 'Missile', theme: THEMES[4] },
] as const;

export type ShipKind = (typeof SHIPS)[number]['kind'];

export type DogfightControls = {
    /** Index into SHIPS for the left and right sides. */
    left: number;
    right: number;
    /** All hidden hearts found: the left ship flies the secret gold theme. */
    secret: boolean;
};

/** Each side's look; the right side switches to Deep ocean when both pick the same ship. */
export function sideLooks({ left, right, secret }: DogfightControls): [FlightTheme, FlightTheme] {
    const leftTheme = secret ? SECRET_THEME : SHIPS[left].theme;
    const rightTheme = right === left && !secret ? THEMES[1] : SHIPS[right].theme;
    return [leftTheme, rightTheme];
}
