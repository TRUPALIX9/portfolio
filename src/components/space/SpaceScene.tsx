import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useRef, useEffect } from 'react';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';
import StarField     from './StarField';

// Frame-rate independent smoothing: the same feel at 30, 60 or 120 fps, and no overshoot
// when a long frame (tab switch, resume after pause) produces a big delta.
const { damp } = THREE.MathUtils;

// ── CameraRig ────────────────────────────────────────────────────────────────
const PATH_PRESETS = [
    { rx: 200, ry: 100, frx: 0.002, fry: 0.003, phx: 0, phy: Math.PI / 2 }, // Winding snake
    { rx: -250, ry: -150, frx: 0.0015, fry: 0.002, phx: Math.PI, phy: 0 }, // Wide left sweep
    { rx: 150, ry: -200, frx: 0.003, fry: 0.0015, phx: Math.PI / 4, phy: Math.PI }, // Corkscrew right
    { rx: -100, ry: 250, frx: 0.0025, fry: 0.0025, phx: 0, phy: Math.PI / 4 }, // Vertical drop curl
    { rx: 300, ry: 50, frx: 0.0015, fry: 0.004, phx: Math.PI / 2, phy: Math.PI * 1.5 } // Aggressive horizontal slalom
];

function CameraRig({ progress }: { progress: MotionValue<number> }) {
    const { camera } = useThree();
    // Raw pointer position (-1..1); smoothed per frame so parallax doesn't depend on event rate.
    const pointer = useRef({ x: 0, y: 0 });
    const smoothed = useRef({ x: 0, y: 0 });
    const pathSeed = useRef(PATH_PRESETS[Math.floor(Math.random() * PATH_PRESETS.length)]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        // Pick a new flight path after a trip to the bottom of the page, and apply it only back
        // at the very top: every preset evaluates to exactly (0,0) at depth 0, so there's no jump.
        let pendingSeed: typeof PATH_PRESETS[0] | null = null;
        const handleScroll = () => {
            const currentY = window.scrollY;
            if (!pendingSeed && currentY >= document.documentElement.scrollHeight - window.innerHeight - 80) {
                pendingSeed = PATH_PRESETS[Math.floor(Math.random() * PATH_PRESETS.length)];
            }
            if (currentY === 0 && pendingSeed) {
                pathSeed.current = pendingSeed;
                pendingSeed = null;
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useFrame((_, delta) => {
        // Hero scroll progress, 0 → 1.
        const sp = progress.get();

        smoothed.current.x = damp(smoothed.current.x, pointer.current.x, 4, delta);
        smoothed.current.y = damp(smoothed.current.y, pointer.current.y, 4, delta);
        const mx = smoothed.current.x;
        const my = smoothed.current.y;

        // Depth: the whole hero flies the camera ~1.08 viewport heights deep into the field.
        const targetZ = sp * window.innerHeight * 1.08;

        // ── Random Winding Path ──────────────────────────────────────────────
        const seed = pathSeed.current;
        // Deterministic procedural path based purely on Z-depth (allows "time travel" reverse tracking)
        const scrollPathX = Math.sin(targetZ * seed.frx + seed.phx) * seed.rx - Math.sin(seed.phx) * seed.rx;
        const scrollPathY = Math.cos(targetZ * seed.fry + seed.phy) * seed.ry - Math.cos(seed.phy) * seed.ry;
        const tangentX = Math.cos(targetZ * seed.frx + seed.phx) * seed.rx * seed.frx;
        const tangentY = -Math.sin(targetZ * seed.fry + seed.phy) * seed.ry * seed.fry;

        // ── Scroll-phase: drift arc (words splitting apart then assembling, 0.05→0.55)
        const driftArc = sp < 0.05 || sp > 0.55 ? 0 : (sp - 0.05) / 0.5;
        const driftT = Math.sin(driftArc * Math.PI);

        // Mouse parallax + path, with a lateral sweep and a dip while the words drift.
        camera.position.x = damp(camera.position.x, mx * 150 + scrollPathX + driftT * 30, 1.6, delta);
        camera.position.y = damp(camera.position.y, my * 150 + scrollPathY - driftT * 25, 1.6, delta);
        // Depth tracks scroll tightly, so the fly-through never trails the wheel.
        camera.position.z = damp(camera.position.z, targetZ - driftT * 40, 6, delta);

        // Head-tilt from mouse and path curve, plus roll and pitch during the drift.
        camera.rotation.y = damp(camera.rotation.y, -mx * 0.15 - tangentX * 0.4, 1.5, delta);
        camera.rotation.z = damp(camera.rotation.z, driftT * 0.35, 3, delta);
        camera.rotation.x = damp(camera.rotation.x, my * 0.10 + tangentY * 0.4 + driftT * 0.15, 1.5, delta);
    });

    return null;
}

// ── SpaceScene ────────────────────────────────────────────────────────────────
/**
 * The star field behind the hero. `progress` is the hero's scroll progress (read every frame,
 * no React renders); `active` pauses rendering entirely once the hero has scrolled away, while
 * keeping the WebGL context alive so coming back up is instant.
 */
export default function SpaceScene({ active, progress }: { active: boolean; progress: MotionValue<number> }) {
    return (
        <div className="absolute inset-0 w-full h-full z-0 bg-black">
            <Canvas
                camera={{ position: [0, 0, 0], fov: 45 }}
                dpr={[1, 1.5]}
                frameloop={active ? 'always' : 'never'}
                gl={{ powerPreference: 'high-performance', antialias: false, alpha: false }}
            >
                <color attach="background" args={['#030303']} />
                <fog   attach="fog"        args={['#030303', 15, 60]} />

                <Suspense fallback={null}>
                    <CameraRig progress={progress} />
                    <StarField count={3000} />
                </Suspense>
            </Canvas>

            {/* Cinematic overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/80 pointer-events-none" />
        </div>
    );
}
