"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { geoEquirectangular, geoInterpolate, geoPath } from 'd3-geo';
import { COUNTRIES, HOMES, PLACES } from '@/data/travel';
import { loadTravelGeo, TOTAL_REGIONS } from './geo';
import './flight.css';

const ACCENT = '#ff7a2f';
const R = 1;

/** [lon, lat] → point on the sphere, matching three's SphereGeometry UVs. */
function toVec([lon, lat]: [number, number], r = R) {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lon + 180) * Math.PI) / 180;
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/** A soft round sprite texture for glowing dots. */
function dotTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.25, 'rgba(255,190,140,0.9)');
    grd.addColorStop(1, 'rgba(255,122,47,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
}

type Label = { name: string; note?: string; pos: THREE.Vector3; home?: boolean; country?: string };

export default function FlightLog() {
    const mountRef = useRef<HTMLDivElement>(null);
    const labelsRef = useRef<HTMLDivElement>(null);
    const flyRef = useRef<(c: [number, number]) => void>(() => {});
    const activeRef = useRef<string | null>(null);
    const [ready, setReady] = useState(false);
    const [active, setActive] = useState<string | null>(null);

    useEffect(() => {
        const mount = mountRef.current!;
        const W = () => mount.clientWidth;
        const H = () => mount.clientHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W(), H());
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, W() / H(), 0.1, 200);
        camera.position.copy(toVec([-40, 28], 4.2));

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.minDistance = 1.7;
        controls.maxDistance = 7;
        controls.rotateSpeed = 0.5;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        controls.autoRotate = !reduce;
        controls.autoRotateSpeed = 0.35;

        // Stars
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(2400 * 3);
        for (let i = 0; i < 2400; i++) {
            const v = new THREE.Vector3().randomDirection().multiplyScalar(40 + Math.random() * 40);
            starPos.set([v.x, v.y, v.z], i * 3);
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x9fb4ff, size: 0.08, transparent: true, opacity: 0.7 })));

        // Earth: painted from the map data once it loads (dot-matrix land on a deep ocean).
        const earthMat = new THREE.MeshPhongMaterial({ color: 0x0a1430, shininess: 8, specular: new THREE.Color(0x1a2a55) });
        const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 128, 128), earthMat);
        scene.add(earth);

        // Atmosphere rim
        const atmo = new THREE.Mesh(
            new THREE.SphereGeometry(R * 1.1, 64, 64),
            new THREE.ShaderMaterial({
                side: THREE.BackSide,
                transparent: true,
                blending: THREE.AdditiveBlending,
                uniforms: { c: { value: new THREE.Color(0x3d7bff) } },
                vertexShader: 'varying vec3 n; void main(){ n = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
                fragmentShader: 'uniform vec3 c; varying vec3 n; void main(){ float i = pow(0.6 - dot(n, vec3(0,0,1.0)), 4.0); gl_FragColor = vec4(c, 1.0) * i * 1.1; }',
            }),
        );
        scene.add(atmo);

        scene.add(new THREE.AmbientLight(0x8899cc, 0.55));
        const sun = new THREE.DirectionalLight(0xffffff, 1.4);
        sun.position.set(-4, 2, 3);
        camera.add(sun);
        scene.add(camera);

        const group = new THREE.Group();
        scene.add(group);
        const disposables: { dispose: () => void }[] = [renderer, starGeo, earthMat];
        const labels: Label[] = [];
        const arcs: { line: THREE.Line; pts: THREE.Vector3[]; head: THREE.Sprite; delay: number }[] = [];
        const pulses: THREE.Sprite[] = [];
        const dot = dotTexture();

        loadTravelGeo().then((geo) => {
            // Paint the whole Earth texture: ocean, dot-matrix land, borders, lit regions.
            const cw = 4096, ch = 2048;
            const proj = geoEquirectangular().scale(cw / (2 * Math.PI)).translate([cw / 2, ch / 2]);
            const mask = document.createElement('canvas');
            mask.width = cw;
            mask.height = ch;
            const mctx = mask.getContext('2d', { willReadFrequently: true })!;
            const mpath = geoPath(proj, mctx);
            mctx.fillStyle = '#fff';
            geo.countries.forEach((f) => { mctx.beginPath(); mpath(f); mctx.fill(); });
            mctx.fillStyle = '#f00';
            geo.lit.forEach((f) => { mctx.beginPath(); mpath(f); mctx.fill(); });
            const px = mctx.getImageData(0, 0, cw, ch).data;

            const canvas = document.createElement('canvas');
            canvas.width = cw;
            canvas.height = ch;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#060d22';
            ctx.fillRect(0, 0, cw, ch);
            const step = 14;
            for (let y = step / 2; y < ch; y += step) {
                // Wider spacing toward the poles keeps dots evenly spread on the sphere.
                const lat = 90 - (y / ch) * 180;
                const sx = step / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
                for (let x = (y / step) % 2 ? sx / 2 : 0; x < cw; x += sx) {
                    const i = (Math.floor(y) * cw + Math.floor(x)) * 4;
                    if (px[i + 3] === 0) continue;
                    const lit = px[i + 1] === 0;
                    ctx.fillStyle = lit ? '#ff8a45' : '#3b5591';
                    ctx.beginPath();
                    ctx.arc(x, y, lit ? 4.2 : 3.2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            const path = geoPath(proj, ctx);
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = 'rgba(140,170,240,0.22)';
            geo.countries.forEach((f) => { ctx.beginPath(); path(f); ctx.stroke(); });
            ctx.fillStyle = 'rgba(255,122,47,0.22)';
            ctx.strokeStyle = 'rgba(255,170,120,0.9)';
            ctx.lineWidth = 2;
            geo.lit.forEach((f) => { ctx.beginPath(); path(f); ctx.fill(); ctx.stroke(); });
            const earthTex = new THREE.CanvasTexture(canvas);
            earthTex.colorSpace = THREE.SRGBColorSpace;
            earthTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            earthMat.map = earthTex;
            earthMat.color.set(0xffffff);
            earthMat.needsUpdate = true;
            disposables.push(earthTex);

            // Arcs from the nearest home base to every named place.
            PLACES.forEach((p, i) => {
                if (HOMES.some((h) => h.name === p.name)) return;
                const home = p.country === 'India' || p.country === 'Nepal' ? HOMES[0] : p.country === 'Australia' ? HOMES[0] : HOMES[1];
                const interp = geoInterpolate(home.coords, p.coords);
                const dist = toVec(home.coords).distanceTo(toVec(p.coords));
                const pts = Array.from({ length: 81 }, (_, k) => {
                    const t = k / 80;
                    return toVec(interp(t) as [number, number], R + Math.sin(Math.PI * t) * (0.04 + dist * 0.22));
                });
                const g = new THREE.BufferGeometry().setFromPoints(pts);
                g.setDrawRange(0, 0);
                const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.9 }));
                group.add(line);
                const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
                head.scale.setScalar(0.05);
                group.add(head);
                arcs.push({ line, pts, head, delay: i * 0.12 });
                disposables.push(g);
            });

            // Glowing markers and labels.
            const marks = [...HOMES.map((h) => ({ name: h.name, coords: h.coords, home: true, note: 'Home base' })), ...PLACES.filter((p) => !HOMES.some((h) => h.name === p.name))];
            marks.forEach((m) => {
                const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
                s.position.copy(toVec(m.coords as [number, number], R * 1.01));
                s.scale.setScalar('home' in m && m.home ? 0.12 : 0.06);
                group.add(s);
                if ('home' in m && m.home) pulses.push(s);
                labels.push({ name: m.name, note: m.note, pos: s.position.clone(), home: 'home' in m && m.home, country: 'country' in m ? m.country : undefined });
            });

            // Label DOM nodes
            const host = labelsRef.current!;
            host.replaceChildren();
            labels.forEach((l) => {
                const el = document.createElement('div');
                el.className = `fl-label${l.home ? ' fl-label--home' : ''}`;
                const b = document.createElement('b');
                b.textContent = l.name;
                el.appendChild(b);
                if (l.note) {
                    const s = document.createElement('span');
                    s.textContent = l.note;
                    el.appendChild(s);
                }
                host.appendChild(el);
            });
            setReady(true);
        });

        // Fly the camera to face a point.
        let flight: { from: THREE.Vector3; to: THREE.Vector3; t0: number } | null = null;
        flyRef.current = (c) => {
            const dist = camera.position.length();
            flight = { from: camera.position.clone(), to: toVec(c, Math.min(dist, 2.6)), t0: performance.now() };
            controls.autoRotate = false;
        };

        const clock = new THREE.Clock();
        const tmp = new THREE.Vector3();
        let frame = 0;
        const loop = () => {
            const t = clock.getElapsedTime();
            if (flight) {
                const k = Math.min(1, (performance.now() - flight.t0) / 1400);
                const e = 1 - Math.pow(1 - k, 3);
                camera.position.copy(flight.from).normalize().lerp(flight.to.clone().normalize(), e).normalize()
                    .multiplyScalar(THREE.MathUtils.lerp(flight.from.length(), flight.to.length(), e));
                if (k >= 1) flight = null;
            }
            controls.update();

            arcs.forEach((a) => {
                const grow = THREE.MathUtils.clamp((t - 0.6 - a.delay) / 1.2, 0, 1);
                a.line.geometry.setDrawRange(0, Math.floor(grow * a.pts.length));
                const run = ((t - a.delay) * 0.35) % 1;
                const idx = grow < 1 ? Math.floor(grow * (a.pts.length - 1)) : Math.floor(run * (a.pts.length - 1));
                a.head.position.copy(a.pts[idx]);
                a.head.visible = grow > 0;
            });
            pulses.forEach((p, i) => p.scale.setScalar(0.11 + Math.sin(t * 2.4 + i) * 0.025));

            // Project labels; hide those on the far side.
            const host = labelsRef.current;
            if (host) {
                const camDir = camera.position.clone().normalize();
                labels.forEach((l, i) => {
                    const el = host.children[i] as HTMLElement | undefined;
                    if (!el) return;
                    const facing = l.pos.clone().normalize().dot(camDir);
                    tmp.copy(l.pos).project(camera);
                    const x = (tmp.x * 0.5 + 0.5) * W();
                    const y = (-tmp.y * 0.5 + 0.5) * H();
                    el.style.transform = `translate(${x}px, ${y}px)`;
                    const shown = l.home || (activeRef.current !== null && l.country === activeRef.current);
                    el.style.opacity = shown && facing > 0.25 ? String(Math.min(1, (facing - 0.25) * 4)) : '0';
                });
            }
            renderer.render(scene, camera);
            frame = requestAnimationFrame(loop);
        };
        loop();

        // On wide screens, shift the globe right so the panel sits beside it.
        const onResize = () => {
            camera.aspect = W() / H();
            if (W() > 760) camera.setViewOffset(W(), H(), -W() * 0.16, 0, W(), H());
            else camera.clearViewOffset();
            camera.updateProjectionMatrix();
            renderer.setSize(W(), H());
        };
        onResize();
        window.addEventListener('resize', onResize);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', onResize);
            controls.dispose();
            disposables.forEach((d) => d.dispose());
            mount.removeChild(renderer.domElement);
        };
    }, []);

    const regionsTotal = TOTAL_REGIONS;

    return (
        <main className="fl">
            <div ref={mountRef} className="fl-stage" data-ready={String(ready)} aria-hidden="true" />
            <div ref={labelsRef} className="fl-labels" aria-hidden="true" />

            <header className="fl-top">
                <Link href="/about" className="fl-back">← Trupal Patel</Link>
                <span className="fl-code">FLIGHT LOG · AMD ⇄ ATL</span>
            </header>

            <section className="fl-hud">
                <p className="fl-kicker">Travel log</p>
                <h1 className="fl-title">Ground<br />covered.</h1>
                <dl className="fl-stats">
                    <div><dt>Countries</dt><dd>{COUNTRIES.length}</dd></div>
                    <div><dt>Regions</dt><dd>{regionsTotal}</dd></div>
                    <div><dt>Places</dt><dd>{PLACES.length}</dd></div>
                </dl>
                <ul className="fl-countries">
                    {COUNTRIES.map((c) => (
                        <li key={c.name}>
                            <button type="button" aria-pressed={active === c.name} onClick={() => { setActive(c.name); activeRef.current = c.label === 'United States' ? 'United States' : c.label; flyRef.current(c.center); }}>
                                <span>{c.label}</span>
                                <small>{c.regions ? `${c.regions.visited.length} / ${c.regions.total}` : 'whole country'}</small>
                            </button>
                        </li>
                    ))}
                </ul>
                <p className="fl-hint">Drag to spin · scroll to zoom</p>
            </section>
        </main>
    );
}
