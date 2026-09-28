'use client';

import { useCallback, useRef } from 'react';
import { THEMES, type FlightTheme } from '@/components/logicsprint/flight/themes';
import { FIELD_H, GameBar, SCREEN_W } from './PhoneFrame';
import { clamp, mulberry32, useCanvasScene, useDemoActive, type Scene, type SceneFonts } from './useDemoRuntime';

/* Rocket Launch, as played on the phone (lib/games/rocket_launch). A 2D-canvas port of the app's
   field: nebula glows, parallax stars, the four drifting planets and seeded shooting stars from
   space_scenery.dart, gold-shaded asteroids, and the Missile from rocket_look.dart's ShipPainter.
   RocketLaunchEngine's rules drive it (spawn gap 0.75 → 0.45 s, fall speed 0.32 × 1 → 1.7, steer
   ease capped at 1.8 widths/s, +10 a rock, space changes every 1250 points) while an autopilot
   finger steers through the gaps. */

const ACCENT = '#3B7BF0';
const W = SCREEN_W;
const H = FIELD_H;
const TEXT = '#EAF2F7';
const MUTED = '#8C9DAD';
const TEAL = '#34C29A';

// RocketLaunchEngine
const ROCKET_Y = 0.85;
const MIN_X = 0.05;
const MAX_X = 0.95;
const STEER_SPEED = 1.8;
const HIT_REACH = 0.12;
const HIT_TOP = 0.8;
const HIT_BOTTOM = 0.9;
const STORM_AT = 90;
const CAP_AT = 420;
const THEME_EVERY = 1250;
const FALL_SPEED = 0.32;
/** Where the recording starts: a minute in, just short of the Nebula pink theme. */
const START_FLIGHT = 60;
const START_SCORE = 3650;
/** Keeps the recording watchable: the ramp stops here. */
const MAX_FLIGHT = 150;

// Theme roll-out windows (ms of flight since the change): ship, then rocks, then space.
const SHIP_FADE: [number, number] = [0, 700];
const ROCK_FADE: [number, number] = [500, 1400];
const SPACE_FADE: [number, number] = [1200, 2600];
const LEVEL_BANNER = 2200;

type RGB = [number, number, number];
type Look = { hull: RGB; trim: RGB; flame: RGB; rock: RGB; space: RGB; glows: [RGB, RGB, RGB]; planet: RGB };

const hex = (c: string): RGB => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) as RGB;
const lookOf = (t: FlightTheme): Look => ({
    hull: hex(t.hull),
    trim: hex(t.trim),
    flame: hex(t.flame),
    rock: hex(t.rock),
    space: hex(t.space),
    glows: t.glows.map(hex) as [RGB, RGB, RGB],
    planet: hex(t.planet),
});
const LOOKS = THEMES.map(lookOf);
const lerp = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const rgba = (c: RGB, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${clamp(a, 0, 1)})`;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const TEXT_RGB = hex(TEXT);
const BLACK: RGB = [0, 0, 0];

function blend(a: Look, b: Look, ship: number, rock: number, space: number): Look {
    return {
        hull: lerp(a.hull, b.hull, ship),
        trim: lerp(a.trim, b.trim, ship),
        flame: lerp(a.flame, b.flame, ship),
        rock: lerp(a.rock, b.rock, rock),
        space: lerp(a.space, b.space, space),
        glows: [0, 1, 2].map((i) => lerp(a.glows[i], b.glows[i], space)) as [RGB, RGB, RGB],
        planet: lerp(a.planet, b.planet, space),
    };
}

/* ── Scenery (space_scenery.dart) ── */

type PlanetKind = 'gasGiant' | 'ringed' | 'moonOrbit' | 'cloudWorld';
type Planet = { kind: PlanetKind; x: number; size: number; speed: number; phase: number; dim: number; tint: number };
const PLANETS: Planet[] = [
    { kind: 'moonOrbit', x: 0.2, size: 0.13, speed: 0.004, phase: 0.55, dim: 0.6, tint: 0 },
    { kind: 'ringed', x: 0.8, size: 0.2, speed: 0.006, phase: 0.05, dim: 0.8, tint: 3 },
    { kind: 'cloudWorld', x: 0.72, size: 0.24, speed: 0.008, phase: 0.62, dim: 0.85, tint: 2 },
    { kind: 'gasGiant', x: 0.3, size: 0.36, speed: 0.011, phase: 0.95, dim: 1, tint: 1 },
];
const STREAMS = [2.7, 3.8, 5.3];
const BURST = 0.55;

function place(p: Planet, t: number): [number, number, number] {
    const r = (W * p.size) / 2;
    const span = H + r * 6;
    const y = (((p.phase * span + t * p.speed * H) % span) + span) % span - r * 3;
    return [p.x * W, y, r];
}

function shootingStar(t: number, stream: number) {
    const period = STREAMS[stream];
    const pass = Math.floor(t / period);
    const r = mulberry32(stream * 7919 + pass * 104729);
    const duration = 0.7 + r() * 0.8;
    const start = pass * period + r() * Math.max(0, period - duration - BURST);
    const from: [number, number] = [W * (0.05 + r() * 0.9), H * (0.03 + r() * 0.75)];
    const angle = r() * 2 * Math.PI;
    const length = W * (0.35 + r() * 0.45);
    const to: [number, number] = [from[0] + Math.cos(angle) * length, from[1] + Math.sin(angle) * length];
    const over = (x: number, y: number, time: number) =>
        PLANETS.some((p) => {
            const [cx, cy, pr] = place(p, time);
            return Math.hypot(x - cx, y - cy) < pr * 0.92;
        });
    let hitAt: number | null = null;
    if (!over(from[0], from[1], start)) {
        for (let step = 1; step <= 30 && hitAt === null; step++) {
            const v = step / 30;
            if (over(from[0] + (to[0] - from[0]) * v, from[1] + (to[1] - from[1]) * v, start + v * duration)) hitAt = v;
        }
    }
    return { from, to, angle, start, duration, hitAt };
}

/* ── Stars (the screen's _StarPainter): far, mid and near layers ── */

type Star = { x: number; y: number; size: number; color: string };
const STAR_LAYERS: [number, Star[]][] = (() => {
    const r = mulberry32(42);
    const make = (count: number, size: number, alpha: number, tint = false): Star[] =>
        Array.from({ length: count }, (_, i) => ({
            x: r(),
            y: r(),
            size: size * (0.7 + r() * 0.6),
            color: rgba(hex(tint && i % 4 === 0 ? TEAL : TEXT), alpha * (0.6 + r() * 0.4)),
        }));
    return [
        [0.012, make(70, 1.0, 0.3)],
        [0.035, make(36, 1.5, 0.5)],
        [0.09, make(14, 2.2, 0.8, true)],
    ];
})();

/* ── Asteroids ── */

type Rock = {
    x: number;
    y: number;
    size: number;
    speed: number;
    rotation: number;
    spin: number;
    outline: [number, number][];
    craters: [number, number, number][];
};

function makeRock(rand: () => number, speedFactor: number): Rock {
    const seed = Math.floor(rand() * 2 ** 30);
    const shape = mulberry32(seed);
    const corners = 7 + Math.floor(shape() * 5);
    const outline = Array.from({ length: corners }, (_, i): [number, number] => [
        ((i + shape() * 0.5) / corners) * 2 * Math.PI,
        0.75 + shape() * 0.25,
    ]);
    const craters = Array.from({ length: 2 + Math.floor(shape() * 3) }, (): [number, number, number] => [
        shape() * 2 * Math.PI,
        shape() * 0.45,
        0.1 + shape() * 0.12,
    ]);
    return {
        x: MIN_X + rand() * (MAX_X - MIN_X),
        y: -0.08,
        size: 30 + rand() * 26,
        speed: FALL_SPEED * speedFactor * (0.85 + rand() * 0.3),
        rotation: rand() * 2 * Math.PI,
        spin: (rand() - 0.5) * 1.2,
        outline,
        craters,
    };
}

const ramp = (s: number, calm: number, storm: number, cap: number) =>
    s <= STORM_AT ? calm + ((storm - calm) * s) / STORM_AT : storm + (cap - storm) * Math.min(1, (s - STORM_AT) / (CAP_AT - STORM_AT));

/* ── The scene ── */

function createRocketScene(fonts: SceneFonts, onScore: (score: number) => void): Scene {
    let k = 1;
    let rand = mulberry32(7);
    let flight = START_FLIGHT;
    let now = 0;
    let score = START_SCORE;
    let streak = 0;
    let rocketX = 0.5;
    let targetX = 0.5;
    let rocks: Rock[] = [];
    let untilSpawn = 0;
    let untilThink = 0;
    let level = Math.floor(score / THEME_EVERY);
    let from: Look = LOOKS[level % LOOKS.length];
    let changedAt: number | null = null;

    const flightRamp = () => Math.min(flight, MAX_FLIGHT);
    const spawnInterval = () => ramp(flightRamp(), 0.75, 0.45, 0.3);
    const speedFactor = () => ramp(flightRamp(), 1, 1.7, 2.4);
    const sinceChange = () => (changedAt === null ? null : (flight - changedAt) * 1000);

    const look = (): Look => {
        const to = LOOKS[level % LOOKS.length];
        const since = sinceChange();
        if (since === null) return to;
        const stage = ([a, b]: [number, number]) => ease(clamp((since - a) / (b - a), 0, 1));
        return blend(from, to, stage(SHIP_FADE), stage(ROCK_FADE), stage(SPACE_FADE));
    };

    /** Danger of flying to x: rocks whose crossing of the rocket's band overlaps the path there. */
    const cost = (x: number) => {
        let c = Math.abs(x - rocketX) * 0.5 + Math.abs(x - 0.5) * 0.25;
        const dir = Math.sign(x - rocketX);
        for (const r of rocks) {
            if (r.y > HIT_BOTTOM) continue;
            const enter = Math.max(0, (HIT_TOP - 0.03 - r.y) / r.speed);
            if (enter > 1.8) continue;
            const exit = (HIT_BOTTOM + 0.03 - r.y) / r.speed;
            for (let i = 0; i <= 4; i++) {
                const tau = enter + ((exit - enter) * i) / 4;
                const pos = rocketX + dir * Math.min(Math.abs(x - rocketX), 1.2 * tau);
                if (Math.abs(pos - r.x) < HIT_REACH + 0.04) {
                    c += 6 * (2 - enter);
                    break;
                }
            }
        }
        return c;
    };

    const think = () => {
        let best = targetX;
        let bestCost = cost(targetX) - 0.08; // a little stubborn, like a real thumb
        for (let i = 0; i <= 36; i++) {
            const x = MIN_X + i * 0.025;
            const c = cost(x);
            if (c < bestCost) {
                best = x;
                bestCost = c;
            }
        }
        targetX = best;
    };

    const advance = (dt: number, scoring: boolean) => {
        now += dt * 1000;
        flight += dt;
        untilThink -= dt;
        if (untilThink <= 0) {
            think();
            untilThink = 0.09 + rand() * 0.06;
        }
        const gap = targetX - rocketX;
        const move = Math.min(STEER_SPEED, Math.abs(gap) * 10) * dt;
        rocketX += move >= Math.abs(gap) ? gap : move * Math.sign(gap);

        untilSpawn -= dt;
        while (untilSpawn <= 0) {
            rocks.push(makeRock(rand, speedFactor()));
            untilSpawn += spawnInterval();
        }
        for (const r of rocks) {
            r.y += r.speed * dt;
            r.rotation += r.spin * dt;
        }
        const passed = rocks.filter((r) => r.y >= 1).length;
        if (passed) {
            rocks = rocks.filter((r) => r.y < 1);
            if (scoring) {
                for (let i = 0; i < passed; i++) {
                    streak++;
                    score += 10 + (streak % 5 === 0 ? 20 : 0);
                }
                onScore(score);
                const next = Math.floor(score / THEME_EVERY);
                if (next !== level) {
                    from = look();
                    level = next;
                    changedAt = flight;
                }
            }
        }
    };

    const reset = (startScore: number, seed: number) => {
        rand = mulberry32(seed);
        flight = START_FLIGHT - 4;
        now = 0;
        rocks = [];
        untilSpawn = 0;
        untilThink = 0;
        rocketX = targetX = 0.5;
        // Fly four seconds unscored so the sky is already busy.
        for (let i = 0; i < 240; i++) advance(1 / 60, false);
        score = startScore;
        streak = 0;
        level = Math.floor(score / THEME_EVERY);
        from = LOOKS[level % LOOKS.length];
        changedAt = null;
        onScore(score);
    };
    reset(START_SCORE, 7);

    /* ── drawing ── */

    const glowFill = (ctx: CanvasRenderingContext2D, path: Path2D, color: RGB, alpha: number, blur: number) => {
        const s = ctx.getTransform().a;
        ctx.save();
        ctx.shadowColor = rgba(color, alpha);
        ctx.shadowBlur = blur * s;
        ctx.fillStyle = rgba(color, alpha);
        ctx.fill(path);
        ctx.restore();
    };

    const drawNebula = (ctx: CanvasRenderingContext2D, L: Look) => {
        ctx.fillStyle = rgba(L.space);
        ctx.fillRect(0, 0, W, H);
        const glow = (x: number, y: number, r: number, c: RGB, a: number) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, rgba(c, a));
            g.addColorStop(1, rgba(c, 0));
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
        };
        glow(W * 0.15, H * 0.3, W * 0.9, L.glows[0], 0.1);
        glow(W * 0.9, H * 0.62, W * 0.8, L.glows[1], 0.09);
        glow(W * 0.45, H * 1.02, W * 0.7, L.glows[2], 0.06);
    };

    const drawPlanet = (ctx: CanvasRenderingContext2D, p: Planet, L: Look, t: number) => {
        const [cx, cy, r] = place(p, t);
        if (cy + r * 3 < 0 || cy - r * 3 > H) return;
        const tints = [L.planet, ...L.glows];
        const tint = tints[p.tint % tints.length];
        const dim = p.dim;
        const mix = (c: RGB, amount: number) => lerp(L.space, c, clamp(amount * dim, 0, 1));

        const atmosphere = () => {
            const g = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.5);
            g.addColorStop(0, rgba(tint, 0.16 * dim));
            g.addColorStop(1, rgba(tint, 0));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
            ctx.fill();
        };

        const along = (lat: number, q: number): [number, number] => {
            const half = r * Math.sqrt(Math.max(0, 1 - lat * lat));
            const y = cy + lat * r;
            const bow = r * 0.16 * Math.sqrt(Math.max(0, 1 - lat * lat));
            const a = [cx - half, y];
            const c = [cx, y + bow * 2];
            const b = [cx + half, y];
            const u = 1 - q;
            return [a[0] * u * u + c[0] * 2 * u * q + b[0] * q * q, a[1] * u * u + c[1] * 2 * u * q + b[1] * q * q];
        };

        const bands = (list: [number, number, boolean][], strength: number) => {
            for (const [lat, thick, light] of list) {
                const a = along(lat, 0);
                const b = along(lat, 1);
                const m = along(lat, 0.5);
                const c = [m[0] * 2 - (a[0] + b[0]) / 2, m[1] * 2 - (a[1] + b[1]) / 2];
                const width = r * thick;
                const color = light ? lerp(tint, L.hull, 0.45) : L.space;
                const alpha = (light ? 0.32 : 0.4) * strength * dim;
                // Two passes stand in for the app's blur: a wide faint stroke under a narrower one.
                for (const [wf, af] of [
                    [1.5, 0.45],
                    [0.8, 0.75],
                ]) {
                    ctx.beginPath();
                    ctx.moveTo(a[0] - width, a[1]);
                    ctx.quadraticCurveTo(c[0], c[1], b[0] + width, b[1]);
                    ctx.lineWidth = width * wf;
                    ctx.strokeStyle = rgba(color, alpha * af);
                    ctx.stroke();
                }
            }
        };

        const surface = () => {
            if (p.kind === 'gasGiant') {
                bands(
                    [
                        [-0.72, 0.14, false],
                        [-0.5, 0.18, true],
                        [-0.25, 0.12, false],
                        [-0.02, 0.22, true],
                        [0.24, 0.12, false],
                        [0.46, 0.18, true],
                        [0.7, 0.14, false],
                    ],
                    1,
                );
                for (const [lat, speed, size] of [
                    [-0.02, 0.018, 0.3],
                    [0.46, 0.012, 0.2],
                ]) {
                    const q = ((t * speed + lat * 0.7 + 0.5) % 1.4) - 0.2;
                    if (q <= 0.04 || q >= 0.96) continue;
                    const face = Math.sqrt(Math.max(0, 1 - Math.pow(2 * q - 1, 2)));
                    const [sx, sy] = along(lat, q);
                    ctx.fillStyle = rgba(L.space, 0.35 * dim);
                    ctx.beginPath();
                    ctx.ellipse(sx, sy, (r * size * face) / 2 + r * 0.03, (r * size * 0.42) / 2 + r * 0.03, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = rgba(mix(L.rock, 0.7));
                    ctx.beginPath();
                    ctx.ellipse(sx, sy, Math.max(0.1, (r * size * face) / 2), (r * size * 0.42) / 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (p.kind === 'ringed') {
                bands(
                    [
                        [-0.45, 0.2, true],
                        [-0.05, 0.16, false],
                        [0.35, 0.22, true],
                    ],
                    0.6,
                );
            } else if (p.kind === 'moonOrbit') {
                for (const [dx, dy, cr] of [
                    [-0.35, -0.2, 0.18],
                    [0.25, 0.1, 0.12],
                    [-0.05, 0.4, 0.1],
                ]) {
                    ctx.beginPath();
                    ctx.arc(cx + dx * r, cy + dy * r, r * cr, 0, Math.PI * 2);
                    ctx.fillStyle = rgba(mix(L.space, 0.5));
                    ctx.fill();
                    ctx.lineWidth = 0.8;
                    ctx.strokeStyle = rgba(tint, 0.25 * dim);
                    ctx.stroke();
                }
            } else {
                ctx.fillStyle = rgba(mix(L.rock, 0.55));
                for (const [offset, dy, w, h] of [
                    [0, -0.25, 0.7, 0.35],
                    [0.55, 0.2, 0.5, 0.4],
                    [1.1, -0.05, 0.4, 0.25],
                ]) {
                    const x = ((t * 0.01 + offset) % 1.6) - 0.3;
                    ctx.beginPath();
                    ctx.ellipse(cx - r + x * 2 * r, cy + dy * r, (r * w) / 2, (r * h) / 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = rgba(L.hull, 0.35 * dim);
                for (const [offset, dy, w] of [
                    [0.2, -0.45, 0.8],
                    [0.9, 0.35, 0.6],
                ]) {
                    const x = ((t * 0.02 + offset) % 1.6) - 0.3;
                    ctx.beginPath();
                    ctx.ellipse(cx - r + x * 2 * r, cy + dy * r, (r * w) / 2, r * 0.07, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        const sphere = () => {
            const lx = cx - 0.45 * r;
            const ly = cy - 0.45 * r;
            const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, r);
            g.addColorStop(0, rgba(mix(tint, 0.6)));
            g.addColorStop(0.55, rgba(mix(tint, 0.3)));
            g.addColorStop(1, rgba(mix(tint, 0.1)));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.save();
            ctx.clip();
            surface();
            const limb = ctx.createRadialGradient(cx - 0.2 * r, cy - 0.2 * r, 0, cx - 0.2 * r, cy - 0.2 * r, r);
            limb.addColorStop(0, rgba(L.space, 0));
            limb.addColorStop(0.6, rgba(L.space, 0));
            limb.addColorStop(1, rgba(L.space, 0.55));
            ctx.fillStyle = limb;
            ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
            const night = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
            night.addColorStop(0, rgba(L.space, 0));
            night.addColorStop(0.45, rgba(L.space, 0.15));
            night.addColorStop(0.8, rgba(L.space, 0.92));
            night.addColorStop(1, rgba(L.space, 0.92));
            ctx.fillStyle = night;
            ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
            ctx.restore();
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.lineWidth = 1;
            ctx.strokeStyle = rgba(tint, 0.4 * dim);
            ctx.stroke();
        };

        const ring = (back: boolean) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-0.35);
            for (const [scale, alpha, width] of [
                [1, 0.55, 2.2],
                [0.82, 0.3, 1.2],
            ]) {
                ctx.beginPath();
                ctx.ellipse(0, 0, (r * 3.3 * scale) / 2, (r * 0.8 * scale) / 2, 0, back ? Math.PI : 0, back ? Math.PI * 2 : Math.PI);
                ctx.lineWidth = width;
                ctx.strokeStyle = rgba(tint, alpha * dim);
                ctx.stroke();
            }
            ctx.restore();
        };

        const moon = (angle: number) => {
            const mx = cx + Math.cos(angle) * r * 1.8;
            const my = cy + Math.sin(angle) * r * 0.45;
            const mr = r * 0.22;
            const g = ctx.createRadialGradient(mx - 0.4 * mr, my - 0.4 * mr, 0, mx - 0.4 * mr, my - 0.4 * mr, mr);
            g.addColorStop(0, rgba(mix(L.hull, 0.75)));
            g.addColorStop(1, rgba(mix(L.hull, 0.25)));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(mx, my, mr, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = rgba(mix(L.space, 0.4));
            ctx.beginPath();
            ctx.arc(mx + mr * 0.2, my + mr * 0.1, mr * 0.25, 0, Math.PI * 2);
            ctx.fill();
        };

        if (p.kind === 'ringed') ring(true);
        const angle = t * 0.35;
        const behind = Math.sin(angle) < 0;
        if (p.kind === 'moonOrbit' && behind) moon(angle);
        atmosphere();
        sphere();
        if (p.kind === 'ringed') ring(false);
        if (p.kind === 'moonOrbit' && !behind) moon(angle);
    };

    const drawShootingStar = (ctx: CanvasRenderingContext2D, L: Look, t: number, stream: number) => {
        const { from, to, angle, start, duration, hitAt } = shootingStar(t, stream);
        const u = (t - start) / duration;
        if (u < 0) return;
        const at = (v: number): [number, number] => [from[0] + (to[0] - from[0]) * v, from[1] + (to[1] - from[1]) * v];
        const end = hitAt ?? 1;
        if (u <= end) {
            const head = at(u);
            const tail = at(Math.max(0, u - 0.28));
            const fade = hitAt === null ? Math.sin(u * Math.PI) : Math.min(1, u * 4);
            const g = ctx.createLinearGradient(tail[0], tail[1], head[0], head[1]);
            g.addColorStop(0, rgba(L.hull, 0));
            g.addColorStop(1, rgba(L.hull, 0.75 * fade));
            ctx.strokeStyle = g;
            ctx.lineWidth = 1.6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tail[0], tail[1]);
            ctx.lineTo(head[0], head[1]);
            ctx.stroke();
            ctx.fillStyle = rgba(L.hull, fade);
            ctx.beginPath();
            ctx.arc(head[0], head[1], 1.3, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        if (hitAt === null) return;
        const age = (t - start - hitAt * duration) / BURST;
        if (age >= 1) return;
        const [bx, by] = at(hitAt);
        const fade = 1 - age;
        const flash = ctx.createRadialGradient(bx, by, 0, bx, by, 4 * fade + 5);
        flash.addColorStop(0, rgba(L.flame, 0.8 * fade));
        flash.addColorStop(1, rgba(L.flame, 0));
        ctx.fillStyle = flash;
        ctx.beginPath();
        ctx.arc(bx, by, 4 * fade + 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rgba(L.hull, 0.6 * fade);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bx, by, 2 + age * 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = rgba(L.rock, fade);
        for (let i = 0; i < 6; i++) {
            const a = angle + Math.PI + (i - 2.5) * 0.45;
            ctx.beginPath();
            ctx.arc(bx + Math.cos(a) * (3 + age * 14), by + Math.sin(a) * (3 + age * 14), 1.1 * fade, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    const drawStars = (ctx: CanvasRenderingContext2D, t: number) => {
        for (const [speed, stars] of STAR_LAYERS) {
            const drift = t * speed;
            for (const star of stars) {
                ctx.fillStyle = star.color;
                ctx.beginPath();
                ctx.arc(star.x * W, ((star.y + drift) % 1) * H, star.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    };

    const drawRock = (ctx: CanvasRenderingContext2D, rock: Rock, tint: RGB) => {
        const shade = (v: number) => (v < 0 ? lerp(tint, TEXT_RGB, -v) : lerp(tint, BLACK, v));
        const cx = rock.x * W;
        const cy = rock.y * H;
        const r = rock.size / 2;
        const at = (angle: number, d: number): [number, number] => [
            cx + Math.cos(angle + rock.rotation) * d,
            cy + Math.sin(angle + rock.rotation) * d,
        ];
        const outline = new Path2D();
        rock.outline.forEach(([a, f], i) => {
            const [x, y] = at(a, r * f);
            if (i) outline.lineTo(x, y);
            else outline.moveTo(x, y);
        });
        outline.closePath();
        const lx = cx - 0.45 * r;
        const ly = cy - 0.45 * r;
        const body = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 1.8);
        body.addColorStop(0, rgba(shade(-0.25)));
        body.addColorStop(0.5, rgba(shade(0.2)));
        body.addColorStop(1, rgba(shade(0.55)));
        ctx.fillStyle = body;
        ctx.fill(outline);
        const rim = shade(-0.6);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = rgba(rim, 0.55);
        ctx.stroke(outline);
        const edge = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
        edge.addColorStop(0.1, rgba(rim, 0.7));
        edge.addColorStop(0.65, rgba(rim, 0));
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = edge;
        ctx.stroke(outline);
        const pit = rgba(shade(0.6), 0.85);
        const lip = rgba(shade(0.05));
        for (const [a, d, cr] of rock.craters) {
            const [x, y] = at(a, r * d);
            ctx.fillStyle = pit;
            ctx.beginPath();
            ctx.arc(x, y, r * cr, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = lip;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, r * cr, -Math.PI / 4, (3 * Math.PI) / 4);
            ctx.stroke();
        }
    };

    /** ShipPainter's Missile in its 56×92 box, nose up. */
    const drawMissile = (ctx: CanvasRenderingContext2D, L: Look) => {
        const tm = now;
        const cycle = (ms: number, phase = 0) => (tm / ms + phase) % 1;
        const flicker = 1 + 0.12 * Math.sin(tm / 40) + 0.06 * Math.sin(tm / 17);

        const body = new Path2D();
        body.moveTo(28, 0);
        body.bezierCurveTo(34, 8, 35, 16, 35, 24);
        body.lineTo(35, 62);
        body.lineTo(21, 62);
        body.lineTo(21, 24);
        body.bezierCurveTo(21, 16, 22, 8, 28, 0);
        body.closePath();
        const fins = new Path2D();
        for (const poly of [
            [21, 46, 10, 60, 10, 66, 21, 62],
            [35, 46, 46, 60, 46, 66, 35, 62],
            [21, 22, 16, 30, 21, 32],
            [35, 22, 40, 30, 35, 32],
        ]) {
            fins.moveTo(poly[0], poly[1]);
            for (let i = 2; i < poly.length; i += 2) fins.lineTo(poly[i], poly[i + 1]);
            fins.closePath();
        }

        // Smoke puffs behind the flame.
        for (let i = 0; i < 4; i++) {
            const q = cycle(700, i / 4);
            ctx.fillStyle = rgba(hex(MUTED), 0.28 * (1 - q));
            ctx.beginPath();
            ctx.arc(28 + 3 * Math.sin(i * 2.1 + tm / 300), 82 + q * 10, 2 + q * 5, 0, Math.PI * 2);
            ctx.fill();
        }
        glowFill(ctx, body, L.trim, 0.4, 20);

        // Layered exhaust (ShipPainter._flame).
        const length = 26 * (1 + 0.15 * Math.sin(tm / 60));
        const cone = (w: number, l: number) => {
            const p = new Path2D();
            p.moveTo(28 - w, 64);
            p.lineTo(28 + w, 64);
            p.lineTo(28, 64 + l * flicker);
            p.closePath();
            return p;
        };
        glowFill(ctx, cone(7, length + 2), L.trim, 0.5, 10);
        ctx.fillStyle = rgba(L.trim);
        ctx.fill(cone(5, length));
        ctx.fillStyle = rgba(L.flame);
        ctx.fill(cone(2.5, length * 0.58));
        ctx.fillStyle = TEXT;
        ctx.fill(cone(1, length / 4));

        ctx.fillStyle = rgba(L.trim);
        ctx.fill(fins);
        ctx.fillStyle = rgba(L.hull);
        ctx.fill(body);
        ctx.fillStyle = rgba(L.trim);
        ctx.fillRect(21, 36, 14, 4);
        const nose = new Path2D();
        nose.moveTo(28, 0);
        nose.bezierCurveTo(32, 5, 33.5, 10, 34, 14);
        nose.lineTo(22, 14);
        nose.bezierCurveTo(22.5, 10, 24, 5, 28, 0);
        nose.closePath();
        ctx.fillStyle = rgba(L.flame);
        ctx.fill(nose);
        // Spin: a light band sweeps across the body.
        const x = 21 + 14 * cycle(420);
        ctx.save();
        ctx.clip(body);
        ctx.fillStyle = rgba(TEXT_RGB, 0.45);
        ctx.fillRect(x - 2, 0, 4, 64);
        ctx.restore();
    };

    return {
        resize(width) {
            k = width / W;
        },
        step(dt) {
            advance(dt, true);
        },
        still() {
            reset(3930, 11);
            level = 3;
            from = LOOKS[3];
            changedAt = null;
        },
        draw(ctx) {
            ctx.save();
            ctx.scale(k, k);
            ctx.beginPath();
            ctx.rect(0, 0, W, H);
            ctx.clip();
            const L = look();
            drawNebula(ctx, L);
            for (const p of PLANETS) drawPlanet(ctx, p, L, flight);
            for (let i = 0; i < STREAMS.length; i++) drawShootingStar(ctx, L, flight, i);
            drawStars(ctx, flight);
            for (const r of rocks) drawRock(ctx, r, L.rock);

            // The ship: leaning into the turn while it chases the finger.
            const lean = clamp((targetX - rocketX) * 2, -0.3, 0.3);
            ctx.save();
            ctx.translate(rocketX * W, ROCKET_Y * H);
            ctx.rotate(lean);
            ctx.translate(-28, -46);
            drawMissile(ctx, L);
            ctx.restore();

            // The finger holding the ship's line, below it (Android "show taps").
            const fx = targetX * W;
            const fy = ROCKET_Y * H + 78;
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(fx, fy, 19, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // "Level N" for a moment after each change of space.
            const since = sinceChange();
            if (since !== null && since < LEVEL_BANNER) {
                const a = Math.min(1, Math.min(since, LEVEL_BANNER - since) / 300);
                ctx.globalAlpha = a;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = rgba(L.hull);
                ctx.font = `700 30px ${fonts.heading}`;
                ctx.letterSpacing = '0.9px';
                ctx.fillText(`LEVEL ${level + 1}`, W / 2, 28);
                ctx.fillStyle = rgba(L.flame);
                ctx.font = `500 11px ${fonts.mono}`;
                ctx.letterSpacing = '1.3px';
                ctx.fillText(`${level * THEME_EVERY} PTS`, W / 2, 62);
                ctx.letterSpacing = '0px';
                ctx.globalAlpha = 1;
            }
            ctx.restore();
        },
    };
}

export default function RocketLaunchDemo() {
    const rootRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scoreRef = useRef<HTMLElement>(null);
    const { active, reduced } = useDemoActive(rootRef);
    // The scene writes the score straight into the game bar: no React render per rock.
    const createScene = useCallback(
        (fonts: SceneFonts) =>
            createRocketScene(fonts, (score) => {
                if (scoreRef.current) scoreRef.current.textContent = String(score);
            }),
        [],
    );
    useCanvasScene(canvasRef, createScene, active, reduced);

    return (
        <div ref={rootRef} className="lsg-app lsg-rl">
            <GameBar accent={ACCENT} score={START_SCORE} scoreRef={scoreRef} />
            <div className="lsg-field">
                <canvas ref={canvasRef} className="lsg-canvas" />
            </div>
        </div>
    );
}

