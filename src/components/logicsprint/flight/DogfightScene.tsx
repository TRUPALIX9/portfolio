'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { buildShip, type ShipModel } from './ships';
import type { DogfightControls } from './themes';
import { SHIPS, THEMES, sideLooks, type FlightTheme } from './themes';

/**
 * The hero dogfight: one LogicSprint ship per side, each in its own Rocket Launch theme, circling
 * each other. The left ship fires bursts of − − −, the right ship + + +.
 */

export type { DogfightControls } from './themes';

type Props = {
    controls: RefObject<DogfightControls>;
    fonts: { mono: string; heading: string };
    paused: boolean;
};

/** What each side fires: left −, right +. */
const SIDE_OPS = ['−', '+'] as const;
type Op = (typeof SIDE_OPS)[number];
/** Shots per burst, and the gap between them. */
const BURST = 3;
const BURST_GAP = 0.09;

const FOV = 45;
const CAM_Z = 14;
const SHIP_SCALE = 0.32;
const SHOT_SPEED = 8;
const HIT_RADIUS = 0.3;
const { damp, clamp, randFloat } = THREE.MathUtils;
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

// ── Canvas textures ─────────────────────────────────────────────────────────────

function canvas2d(w: number, h: number) {
    const el = document.createElement('canvas');
    el.width = w;
    el.height = h;
    return { el, ctx: el.getContext('2d')! };
}

function toTexture(el: HTMLCanvasElement) {
    const tex = new THREE.CanvasTexture(el);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function glyphTexture(op: Op, color: string, font: string) {
    const { el, ctx } = canvas2d(128, 128);
    ctx.font = `700 104px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 26;
    ctx.fillStyle = color;
    ctx.fillText(op, 64, 70);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.55;
    ctx.fillText(op, 64, 70);
    return toTexture(el);
}

function glowTexture() {
    const { el, ctx } = canvas2d(128, 128);
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return toTexture(el);
}

function ringTexture() {
    const { el, ctx } = canvas2d(128, 128);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(64, 64, 50, 0, Math.PI * 2);
    ctx.stroke();
    return toTexture(el);
}

// ── Scene ──────────────────────────────────────────────────────────────────────

type Pilot = {
    model: ShipModel | null;
    kind: number;
    theme: FlightTheme;
    look: string;
    shotTexture: THREE.CanvasTexture | null;
    shield: THREE.Sprite;
    glow: THREE.Sprite;
    pos: THREE.Vector2;
    vel: THREE.Vector2;
    heading: number;
    turn: number;
    speed: number;
    orbit: number;
    orbitFlipAt: number;
    /** Engage (chase and fire) or extend (break away to a point on its own side, then turn back in). */
    mode: 'engage' | 'extend';
    modeUntil: number;
    waypoint: THREE.Vector2;
    cooldown: number;
    /** Shots left in the current burst, and time to the next one. */
    burstLeft: number;
    burstIn: number;
    flash: number;
    shieldT: number;
};

type Shot = { sprite: THREE.Sprite; vel: THREE.Vector2; life: number; owner: number; active: boolean };
const SPARKS = 160;

function buildWorld() {
    const root = new THREE.Group();
    const glowMap = glowTexture();
    const ring = ringTexture();

    // Space: deep stars and soft nebula glows in the two sides' colours.
    const starCount = 900;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        starPos[i * 3] = randFloat(-32, 32);
        starPos[i * 3 + 1] = randFloat(-14, 14);
        starPos[i * 3 + 2] = randFloat(-30, -3);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#EAF2F7', size: 0.07, transparent: true, opacity: 0.85, depthWrite: false }));
    root.add(stars);

    const nebula = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color: '#8C8CFF', transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false }));
    nebula.scale.setScalar(16);
    nebula.position.set(0, 2, -16);
    root.add(nebula);

    root.add(new THREE.AmbientLight('#ffffff', 0.55));
    const key = new THREE.DirectionalLight('#ffffff', 1.7);
    key.position.set(3, 5, 8);
    root.add(key);

    const pilots: Pilot[] = [0, 1].map((side) => {
        const shield = new THREE.Sprite(new THREE.SpriteMaterial({ map: ring, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
        root.add(shield);
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
        glow.scale.setScalar(14);
        glow.position.set(side === 0 ? -9 : 9, side === 0 ? -2 : 2, -14);
        root.add(glow);
        const dir = side === 0 ? 1 : -1;
        return {
            model: null, kind: -1, theme: THEMES[0], look: '', shotTexture: null,
            shield, glow,
            pos: new THREE.Vector2(-dir * 5, dir * -1),
            vel: new THREE.Vector2(),
            heading: side === 0 ? 0.3 : Math.PI + 0.3,
            turn: 0,
            speed: side === 0 ? 3.1 : 2.9,
            orbit: dir * 0.9,
            orbitFlipAt: randFloat(4, 8),
            mode: 'engage',
            modeUntil: randFloat(3, 5),
            waypoint: new THREE.Vector2(),
            cooldown: randFloat(0.5, 1.2),
            burstLeft: 0,
            burstIn: 0,
            flash: 0, shieldT: 1,
        };
    });

    const shots: Shot[] = Array.from({ length: 40 }, () => {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        sprite.scale.setScalar(0.45);
        sprite.visible = false;
        root.add(sprite);
        return { sprite, vel: new THREE.Vector2(), life: 0, owner: 0, active: false };
    });

    // Sparks: one Points cloud; additive, so fading = darkening the vertex colour.
    const sparkPos = new Float32Array(SPARKS * 3);
    const sparkCol = new Float32Array(SPARKS * 3);
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkCol, 3));
    root.add(new THREE.Points(sparkGeo, new THREE.PointsMaterial({ size: 0.14, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
    const sparkState = Array.from({ length: SPARKS }, () => ({ vx: 0, vy: 0, life: 0, max: 1, color: new THREE.Color() }));

    return {
        root, stars, starPos, nebula, pilots, shots, sparkPos, sparkCol, sparkGeo, sparkState, nextSpark: 0,
        sim: { t: 0 },
    };
}

type World = ReturnType<typeof buildWorld>;

function Dogfight({ controls, fonts }: Omit<Props, 'paused'>) {
    const scene = useThree((state) => state.scene);
    const worldRef = useRef<World | null>(null);

    useEffect(() => {
        const world = buildWorld();
        worldRef.current = world;
        scene.add(world.root);
        return () => {
            scene.remove(world.root);
            worldRef.current = null;
        };
    }, [scene]);

    useFrame(({ camera, size, pointer }, rawDt) => {
        const world = worldRef.current;
        if (!world) return;
        const dt = Math.min(rawDt, 1 / 20);
        world.sim.t += dt;
        const t = world.sim.t;
        const ctl = controls.current;
        const aspect = size.width / Math.max(size.height, 1);
        const halfH = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z;
        const halfW = halfH * aspect;
        const bx = halfW - 1;
        const by = halfH - 1.2;

        camera.position.x = damp(camera.position.x, pointer.x * 0.8, 1.5, dt);
        camera.position.y = damp(camera.position.y, pointer.y * 0.5, 1.5, dt);
        camera.lookAt(0, 0, 0);

        // ── Space drift ──
        const sp = world.starPos;
        for (let i = 0; i < sp.length; i += 3) {
            sp[i] -= dt * (0.2 + (sp[i + 2] + 30) * 0.025);
            if (sp[i] < -32) sp[i] += 64;
        }
        world.stars.geometry.attributes.position.needsUpdate = true;
        world.nebula.material.opacity = 0.08 + Math.sin(t * 0.3) * 0.03;

        const pilots = world.pilots;
        const looks = sideLooks(ctl);
        const kinds = [ctl.left, ctl.right];

        const burst = (x: number, y: number, color: THREE.ColorRepresentation, count: number, force = 3) => {
            for (let n = 0; n < count; n++) {
                const i = world.nextSpark;
                world.nextSpark = (i + 1) % SPARKS;
                const s = world.sparkState[i];
                const a = Math.random() * Math.PI * 2;
                const v = randFloat(0.4, 1) * force;
                s.vx = Math.cos(a) * v;
                s.vy = Math.sin(a) * v;
                s.life = s.max = randFloat(0.35, 0.8);
                s.color.set(color);
                world.sparkPos[i * 3] = x;
                world.sparkPos[i * 3 + 1] = y;
                world.sparkPos[i * 3 + 2] = 0.1;
            }
        };

        const fire = (owner: number) => {
            const shot = world.shots.find((s) => !s.active);
            const p = pilots[owner];
            if (!shot || !p.model || !p.shotTexture) return;
            shot.owner = owner;
            shot.active = true;
            shot.life = 1.8;
            shot.vel.set(Math.cos(p.heading), Math.sin(p.heading)).multiplyScalar(SHOT_SPEED).addScaledVector(p.vel, 0.4);
            const nose = p.model.nose * SHIP_SCALE;
            shot.sprite.position.set(p.pos.x + Math.cos(p.heading) * nose, p.pos.y + Math.sin(p.heading) * nose, 0);
            shot.sprite.material.map = p.shotTexture;
            shot.sprite.material.needsUpdate = true;
            shot.sprite.visible = true;
        };

        // ── Pilots ──
        pilots.forEach((p, i) => {
            const theme = looks[i];
            const kind = kinds[i];
            const look = `${kind}:${theme.name}`;
            if (look !== p.look) {
                p.look = look;
                if (p.kind !== kind || !p.model) {
                    if (p.model) world.root.remove(p.model.root);
                    p.model = buildShip(SHIPS[kind].kind, theme);
                    p.model.root.scale.setScalar(SHIP_SCALE);
                    world.root.add(p.model.root);
                    p.kind = kind;
                    burst(p.pos.x, p.pos.y, theme.trim, 30, 4);
                } else {
                    p.model.setTheme(theme);
                }
                p.theme = theme;
                p.shotTexture = glyphTexture(SIDE_OPS[i], theme.trim, fonts.mono);
                p.shield.material.color.set(theme.trim);
                p.glow.material.color.set(theme.trim);
            }
            const model = p.model!;
            const foe = pilots[1 - i];

            // Chase the other ship, circling when close so it reads as a dogfight, not a ram.
            if (t > p.orbitFlipAt) {
                p.orbit = -p.orbit;
                p.orbitFlipAt = t + randFloat(4, 8);
            }
            const toFoe = foe.pos.clone().addScaledVector(foe.vel, 0.35).sub(p.pos);
            const dist = toFoe.length();
            // Alternate passes: engage for a few seconds, then extend to a random point on this
            // ship's own half of the screen, so the fight sweeps the full width instead of knotting up.
            if (t > p.modeUntil) {
                if (p.mode === 'engage') {
                    const side = i === 0 ? -1 : 1;
                    p.mode = 'extend';
                    p.modeUntil = t + randFloat(1.6, 2.6);
                    p.waypoint.set(side * randFloat(bx * 0.35, bx * 0.85), randFloat(-by * 0.7, by * 0.7));
                } else {
                    p.mode = 'engage';
                    p.modeUntil = t + randFloat(3, 5);
                }
            }
            const desired = p.mode === 'extend'
                ? p.waypoint.clone().sub(p.pos).normalize()
                : toFoe.clone().rotateAround(new THREE.Vector2(), dist < 4.5 ? p.orbit : 0).normalize();
            // A gentle pull toward the middle keeps both ships off the edges.
            desired.addScaledVector(p.pos, -0.04);
            if (dist < 2.2) desired.addScaledVector(p.pos.clone().sub(foe.pos).normalize(), (2.2 - dist) * 1.4);
            if (p.pos.x > bx - 1.5) desired.x -= (p.pos.x - (bx - 1.5)) * 1.2;
            if (p.pos.x < -bx + 1.5) desired.x += (-bx + 1.5 - p.pos.x) * 1.2;
            if (p.pos.y > by - 1) desired.y -= (p.pos.y - (by - 1)) * 1.5;
            if (p.pos.y < -by + 1) desired.y += (-by + 1 - p.pos.y) * 1.5;

            const diff = wrapAngle(Math.atan2(desired.y, desired.x) - p.heading);
            p.turn = damp(p.turn, clamp(diff * 3, -2.6, 2.6), 8, dt);
            p.heading = wrapAngle(p.heading + p.turn * dt);
            p.vel.set(Math.cos(p.heading), Math.sin(p.heading)).multiplyScalar(p.speed);
            p.pos.addScaledVector(p.vel, dt);
            p.pos.set(clamp(p.pos.x, -bx, bx), clamp(p.pos.y, -by, by));

            p.cooldown -= dt;
            const aimError = Math.abs(wrapAngle(Math.atan2(toFoe.y, toFoe.x) - p.heading));
            if (p.mode === 'engage' && p.cooldown <= 0 && dist < 12 && aimError < 0.32) {
                p.burstLeft = BURST;
                p.burstIn = 0;
                p.cooldown = randFloat(0.9, 1.6);
            }
            p.burstIn -= dt;
            if (p.burstLeft > 0 && p.burstIn <= 0) {
                fire(i);
                p.burstLeft--;
                p.burstIn = BURST_GAP;
            }

            const isUfo = SHIPS[kind].kind === 'ufo';
            model.root.position.set(p.pos.x, p.pos.y, Math.sin(t * 1.3 + i * 2) * 0.25);
            model.root.rotation.z = isUfo ? -p.turn * 0.12 : p.heading - Math.PI / 2;
            if (!isUfo && SHIPS[kind].kind !== 'missile') model.body.rotation.y = damp(model.body.rotation.y, -p.turn * 0.35, 6, dt);
            model.animate(t, dt);

            p.flash = Math.max(0, p.flash - dt * 3);
            model.mats.hull.emissive.setScalar(p.flash * 0.9);
            p.shieldT = Math.min(1, p.shieldT + dt * 2.2);
            p.shield.position.set(p.pos.x, p.pos.y, 0.2);
            p.shield.scale.setScalar(0.6 + p.shieldT * 0.45);
            p.shield.material.opacity = (1 - p.shieldT) * 0.9;
        });

        // ── Shots ──
        world.shots.forEach((shot) => {
            if (!shot.active) return;
            shot.life -= dt;
            const sPos = shot.sprite.position;
            sPos.x += shot.vel.x * dt;
            sPos.y += shot.vel.y * dt;
            shot.sprite.material.rotation = Math.atan2(shot.vel.y, shot.vel.x);
            shot.sprite.material.opacity = Math.min(1, shot.life * 3);
            let done = shot.life <= 0 || Math.abs(sPos.x) > halfW + 1 || Math.abs(sPos.y) > halfH + 1;

            const foe = pilots[1 - shot.owner];
            if (!done && Math.hypot(foe.pos.x - sPos.x, foe.pos.y - sPos.y) < HIT_RADIUS) {
                foe.flash = 1;
                foe.shieldT = 0;
                burst(sPos.x, sPos.y, pilots[shot.owner].theme.trim, 16);
                done = true;
            }
            if (done) {
                shot.active = false;
                shot.sprite.visible = false;
            }
        });

        // ── Sparks ──
        for (let i = 0; i < SPARKS; i++) {
            const s = world.sparkState[i];
            if (s.life <= 0) {
                world.sparkCol[i * 3] = world.sparkCol[i * 3 + 1] = world.sparkCol[i * 3 + 2] = 0;
                continue;
            }
            s.life -= dt;
            world.sparkPos[i * 3] += s.vx * dt;
            world.sparkPos[i * 3 + 1] += s.vy * dt;
            s.vx *= 0.96;
            s.vy *= 0.96;
            const k = Math.max(0, s.life / s.max);
            world.sparkCol[i * 3] = s.color.r * k;
            world.sparkCol[i * 3 + 1] = s.color.g * k;
            world.sparkCol[i * 3 + 2] = s.color.b * k;
        }
        world.sparkGeo.attributes.position.needsUpdate = true;
        world.sparkGeo.attributes.color.needsUpdate = true;
    });

    return null;
}

export default function DogfightScene({ paused, ...props }: Props) {
    return (
        <Canvas
            frameloop={paused ? 'demand' : 'always'}
            dpr={[1, 1.75]}
            camera={{ position: [0, 0, CAM_Z], fov: FOV }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            style={{ position: 'absolute', inset: 0, touchAction: 'pan-y' }}
        >
            <color attach="background" args={['#000000']} />
            <Dogfight {...props} />
        </Canvas>
    );
}
