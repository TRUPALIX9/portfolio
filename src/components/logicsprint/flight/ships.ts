import * as THREE from 'three';
import type { FlightTheme, ShipKind } from './themes';

/**
 * Low-poly 3D versions of the four Rocket Launch ships (lib/games/rocket_launch/rocket_look.dart).
 * Every model is built nose-up (+y), about 1.7 units tall, centred on the origin, and moves its
 * own way like in the app: the rocket's flame flickers, the UFO hovers with chasing rim lights and
 * a tractor beam, the spaceship pulses twin engines and blinks red/green wing lights, and the
 * missile spins with a smoke trail.
 */
export type ShipMaterials = {
    hull: THREE.MeshStandardMaterial;
    trim: THREE.MeshStandardMaterial;
    flame: THREE.MeshBasicMaterial;
    core: THREE.MeshBasicMaterial;
    glass: THREE.MeshStandardMaterial;
};

export type ShipModel = {
    /** Positioned and headed by the scene. */
    root: THREE.Group;
    /** Banked (or spun) inside the root. */
    body: THREE.Group;
    mats: ShipMaterials;
    /** Distance from the centre to the nose, where shots leave. */
    nose: number;
    animate: (t: number, dt: number) => void;
    setTheme: (theme: FlightTheme) => void;
};

const additive = (color: THREE.ColorRepresentation, opacity: number) =>
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });

function makeMaterials(theme: FlightTheme): ShipMaterials {
    return {
        hull: new THREE.MeshStandardMaterial({ color: theme.hull, metalness: 0.35, roughness: 0.35, emissive: '#000000' }),
        trim: new THREE.MeshStandardMaterial({ color: theme.trim, emissive: theme.trim, emissiveIntensity: 0.45, metalness: 0.2, roughness: 0.4, side: THREE.DoubleSide }),
        flame: additive(theme.flame, 0.9),
        core: additive('#ffffff', 0.9),
        glass: new THREE.MeshStandardMaterial({ color: theme.planet, emissive: theme.planet, emissiveIntensity: 0.55, transparent: true, opacity: 0.8, roughness: 0.1 }),
    };
}

/** Exhaust pointing down from its origin: an outer cone in the flame colour and a white core. */
function makeFlame(mats: ShipMaterials, radius: number, length: number) {
    const cone = (r: number, l: number) => {
        const geo = new THREE.ConeGeometry(r, l, 16);
        geo.rotateX(Math.PI);
        geo.translate(0, -l / 2, 0);
        return geo;
    };
    const group = new THREE.Group();
    group.add(new THREE.Mesh(cone(radius, length), mats.flame));
    group.add(new THREE.Mesh(cone(radius * 0.45, length * 0.55), mats.core));
    return group;
}

function finGeometry(points: [number, number][], depth = 0.05) {
    const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geo.translate(0, 0, -depth / 2);
    return geo;
}

const flicker = (t: number, seed: number) => 1 + Math.sin(t * 31 + seed) * 0.12 + Math.sin(t * 47 + seed * 2) * 0.08;

function buildRocket(body: THREE.Group, mats: ShipMaterials) {
    const add = (mesh: THREE.Mesh, x = 0, y = 0, z = 0) => { mesh.position.set(x, y, z); body.add(mesh); return mesh; };
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.9, 24), mats.hull));
    add(new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.55, 24), mats.trim), 0, 0.725);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), mats.glass), 0, 0.18, 0.22);
    add(new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 8, 24), mats.trim), 0, 0.18, 0.24);
    const fin = finGeometry([[0, 0.2], [0.3, -0.2], [0.3, -0.36], [0, -0.22]]);
    for (const angle of [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]) {
        const pivot = new THREE.Group();
        pivot.rotation.y = angle + Math.PI / 2;
        const mesh = new THREE.Mesh(fin, mats.trim);
        mesh.position.set(0.26, -0.28, 0);
        pivot.add(mesh);
        body.add(pivot);
    }
    const flame = makeFlame(mats, 0.2, 0.65);
    flame.position.y = -0.45;
    body.add(flame);
    return (t: number) => { flame.scale.set(1, flicker(t, 0), 1); };
}

// The app draws each ship in a 56×92 box, y down. S maps its pixels to scene units around (28, 40).
const S = 0.03;
const px = (x: number, y: number) => new THREE.Vector2((x - 28) * S, -(y - 40) * S);

/** A flat shape from app-pixel points, extruded a little so it catches the light. */
function flatShape(points: [number, number][], depth: number) {
    const shape = new THREE.Shape(points.map(([x, y]) => px(x, y)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2 });
    geo.translate(0, 0, -depth / 2);
    return geo;
}

function ellipseShape(cx: number, cy: number, w: number, h: number, depth: number) {
    const shape = new THREE.Shape();
    const c = px(cx, cy);
    shape.absellipse(c.x, c.y, (w / 2) * S, (h / 2) * S, 0, Math.PI * 2, false, 0);
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 32 });
    geo.translate(0, 0, -depth / 2);
    return geo;
}

/** Soft halo behind a ship, like the app's blurred trim-coloured glow. */
let haloTexture: THREE.CanvasTexture | null = null;
function makeHalo(mats: ShipMaterials, scale: number) {
    if (!haloTexture) {
        const el = document.createElement('canvas');
        el.width = el.height = 64;
        const ctx = el.getContext('2d')!;
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, 'rgba(255,255,255,0.9)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
        haloTexture = new THREE.CanvasTexture(el);
    }
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture, color: mats.trim.color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(scale);
    halo.position.z = -0.2;
    return halo;
}

/** A vertical fade (opaque at the top) for beams. */
let fadeTexture: THREE.CanvasTexture | null = null;
function verticalFade() {
    if (!fadeTexture) {
        const el = document.createElement('canvas');
        el.width = 4;
        el.height = 64;
        const ctx = el.getContext('2d')!;
        const g = ctx.createLinearGradient(0, 0, 0, 64);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(1, '#000000');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 4, 64);
        fadeTexture = new THREE.CanvasTexture(el);
    }
    return fadeTexture;
}

/** The app's UFO: a flat saucer, a glass dome, a trim band, five chasing rim lights and a tractor beam. */
function buildUfo(body: THREE.Group, mats: ShipMaterials) {
    const saucer = new THREE.Group();
    body.add(saucer);
    const halo = makeHalo(mats, 2.4);
    saucer.add(halo);

    // Tractor beam: a trapezoid from under the saucer (20..36, 55) down to (14..42, 85), fading out.
    const beamMat = new THREE.MeshBasicMaterial({ color: mats.flame.color, alphaMap: verticalFade(), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const beamGeo = new THREE.PlaneGeometry(1, 1);
    const pos = beamGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const top = pos.getY(i) > 0;
        pos.setX(i, Math.sign(pos.getX(i)) * (top ? 8 : 14) * S);
        pos.setY(i, top ? 0 : -30 * S);
    }
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.copy(new THREE.Vector3(0, px(28, 55).y, -0.05));
    saucer.add(beam);

    // Dome: the upper half of a 26×30 ellipse at (28, 44), trim-tinted glass with a hull rim.
    const domeMat = new THREE.MeshStandardMaterial({ color: mats.trim.color, emissive: mats.trim.color, emissiveIntensity: 0.35, transparent: true, opacity: 0.6, roughness: 0.15 });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
    dome.scale.set(13 * S, 15 * S, 9 * S);
    dome.position.set(0, px(28, 44).y, 0);
    saucer.add(dome);

    // Saucer: a 54×18 oval at (28, 48), and a 40×7 trim band at (28, 51).
    saucer.add(new THREE.Mesh(ellipseShape(28, 48, 54, 18, 0.34), mats.hull));
    const band = new THREE.Mesh(ellipseShape(28, 51, 40, 7, 0.36), mats.trim);
    saucer.add(band);

    // Running lights at x = 10 + 9i on the rim, chasing every 150 ms.
    const dim = new THREE.Color('#1E2A36');
    const lights = Array.from({ length: 5 }, (_, i) => {
        const mat = new THREE.MeshBasicMaterial({ color: mats.flame.color.clone() });
        const light = new THREE.Mesh(new THREE.SphereGeometry(2 * S, 10, 8), mat);
        const p = px(10 + i * 9, 48);
        light.position.set(p.x, p.y, 0.19);
        saucer.add(light);
        return mat;
    });

    return (t: number) => {
        const ms = t * 1000;
        // Hover: a slow bob and a gentle wobble, as in the app.
        saucer.position.y = 3 * S * Math.sin(ms / 320);
        saucer.rotation.z = 0.07 * Math.sin(ms / 540);
        const flick = flicker(t, 1);
        beam.scale.y = flick;
        beamMat.color.copy(mats.flame.color);
        beamMat.opacity = 0.35 + 0.25 * Math.abs(Math.sin(ms / 180));
        domeMat.color.copy(mats.trim.color);
        domeMat.emissive.copy(mats.trim.color);
        halo.material.color.copy(mats.trim.color);
        const step = Math.floor(ms / 150);
        lights.forEach((mat, i) => mat.color.copy((i + step) % 2 === 0 ? mats.flame.color : dim));
    };
}

/** The app's spaceship: an arrow hull with trim stripes, a dark cockpit, twin engines and wing lights. */
function buildSpaceship(body: THREE.Group, mats: ShipMaterials) {
    const halo = makeHalo(mats, 2.6);
    body.add(halo);
    body.add(new THREE.Mesh(flatShape([[28, 4], [36, 30], [54, 54], [54, 62], [36, 58], [28, 62], [20, 58], [2, 62], [2, 54], [20, 30]], 0.16), mats.hull));
    for (const stripe of [
        [[36, 40], [50, 56], [40, 56], [34, 48]],
        [[20, 40], [6, 56], [16, 56], [22, 48]],
    ] as [number, number][][]) {
        const mesh = new THREE.Mesh(flatShape(stripe, 0.04), mats.trim);
        mesh.position.z = 0.1;
        body.add(mesh);
    }

    // Cockpit: a 10×18 oval at (28, 30), filled with the space colour and ringed in the flame colour.
    const cockpitMat = new THREE.MeshStandardMaterial({ color: '#05080C', roughness: 0.2, metalness: 0.4 });
    const cockpit = new THREE.Mesh(ellipseShape(28, 30, 10, 18, 0.04), cockpitMat);
    cockpit.position.z = 0.11;
    body.add(cockpit);
    const ringShape = new THREE.Shape();
    const c = px(28, 30);
    ringShape.absellipse(c.x, c.y, 6 * S, 10 * S, 0, Math.PI * 2, false, 0);
    const hole = new THREE.Path();
    hole.absellipse(c.x, c.y, 4.5 * S, 8.5 * S, 0, Math.PI * 2, true, 0);
    ringShape.holes.push(hole);
    const ring = new THREE.Mesh(new THREE.ShapeGeometry(ringShape, 32), mats.flame);
    ring.position.z = 0.14;
    body.add(ring);

    // Twin engines at x = 18 and 38, pulsing out of step.
    const flames = [18, 38].map((x) => {
        const flame = makeFlame(mats, 4 * S, 20 * S);
        const p = px(x, 60);
        flame.position.set(p.x, p.y, 0);
        body.add(flame);
        return flame;
    });

    // Wing-tip navigation lights at (4, 57) and (52, 57): red port, green starboard, blinking in turn.
    const lights = ([[4, '#FF4D5E'], [52, '#3DDC84']] as const).map(([x, color]) => {
        const mat = new THREE.MeshBasicMaterial({ color });
        const glow = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false });
        const p = px(x, 57);
        const dot = new THREE.Mesh(new THREE.SphereGeometry(2 * S, 10, 8), mat);
        const bloom = new THREE.Mesh(new THREE.SphereGeometry(5 * S, 12, 8), glow);
        dot.position.set(p.x, p.y, 0.12);
        bloom.position.copy(dot.position);
        body.add(dot, bloom);
        return { mat, glow, base: new THREE.Color(color) };
    });

    return (t: number) => {
        const ms = t * 1000;
        const beat = Math.sin(ms / 110);
        flames[0].scale.set(1, (1 + 0.22 * beat) * flicker(t, 0), 1);
        flames[1].scale.set(1, (1 - 0.22 * beat) * flicker(t, 2), 1);
        halo.material.color.copy(mats.trim.color);
        const portOn = (ms / 900) % 1 < 0.5;
        lights.forEach((light, i) => {
            const on = i === 0 ? portOn : !portOn;
            light.mat.color.copy(light.base).multiplyScalar(on ? 1 : 0.3);
            light.glow.opacity = on ? 0.45 : 0;
        });
    };
}

function buildMissile(root: THREE.Group, body: THREE.Group, mats: ShipMaterials) {
    body.add(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.1, 20), mats.hull));
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 20), mats.trim);
    nose.position.y = 0.75;
    body.add(nose);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.147, 0.147, 0.12, 20), mats.trim);
    band.position.y = 0.15;
    body.add(band);
    const fin = finGeometry([[0, 0.1], [0.18, -0.12], [0.18, -0.22], [0, -0.16]], 0.04);
    for (let i = 0; i < 4; i++) {
        const pivot = new THREE.Group();
        pivot.rotation.y = (i * Math.PI) / 2;
        const mesh = new THREE.Mesh(fin, mats.trim);
        mesh.position.set(0.13, -0.42, 0);
        pivot.add(mesh);
        body.add(pivot);
    }
    const flame = makeFlame(mats, 0.12, 0.5);
    flame.position.y = -0.55;
    body.add(flame);

    // Smoke puffs sit in the root so they don't spin with the body.
    const puffs = Array.from({ length: 6 }, (_, i) => {
        const mat = new THREE.MeshBasicMaterial({ color: '#8C9DAD', transparent: true, opacity: 0, depthWrite: false });
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), mat);
        root.add(puff);
        return { puff, mat, phase: i / 6 };
    });

    return (t: number, dt: number) => {
        body.rotation.y += dt * 5;
        flame.scale.set(1, flicker(t, 3), 1);
        for (const p of puffs) {
            const k = (t * 1.4 + p.phase) % 1;
            p.puff.position.set(Math.sin((p.phase + k) * 9) * 0.06, -0.9 - k * 1.1, -0.05);
            p.puff.scale.setScalar(0.6 + k * 1.8);
            p.mat.opacity = (1 - k) * 0.35;
        }
    };
}

export function buildShip(kind: ShipKind, theme: FlightTheme): ShipModel {
    const root = new THREE.Group();
    const body = new THREE.Group();
    root.add(body);
    const mats = makeMaterials(theme);

    const animate =
        kind === 'rocket' ? buildRocket(body, mats)
        : kind === 'ufo' ? buildUfo(body, mats)
        : kind === 'spaceship' ? buildSpaceship(body, mats)
        : buildMissile(root, body, mats);

    return {
        root,
        body,
        mats,
        nose: kind === 'ufo' ? 0.3 : kind === 'spaceship' ? 1.1 : 0.95,
        animate,
        setTheme: (next) => {
            mats.hull.color.set(next.hull);
            mats.trim.color.set(next.trim);
            mats.trim.emissive.set(next.trim);
            mats.flame.color.set(next.flame);
            mats.glass.color.set(next.planet);
            mats.glass.emissive.set(next.planet);
        },
    };
}
