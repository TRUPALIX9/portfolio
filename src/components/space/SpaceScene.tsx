import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useRef, useEffect, RefObject } from 'react';
import * as THREE from 'three';
import StarField     from './StarField';

// ── CameraRig ────────────────────────────────────────────────────────────────
const PATH_PRESETS = [
    { rx: 200, ry: 100, frx: 0.002, fry: 0.003, phx: 0, phy: Math.PI / 2 }, // Winding snake
    { rx: -250, ry: -150, frx: 0.0015, fry: 0.002, phx: Math.PI, phy: 0 }, // Wide left sweep
    { rx: 150, ry: -200, frx: 0.003, fry: 0.0015, phx: Math.PI / 4, phy: Math.PI }, // Corkscrew right
    { rx: -100, ry: 250, frx: 0.0025, fry: 0.0025, phx: 0, phy: Math.PI / 4 }, // Vertical drop curl
    { rx: 300, ry: 50, frx: 0.0015, fry: 0.004, phx: Math.PI / 2, phy: Math.PI * 1.5 } // Aggressive horizontal slalom
];

function CameraRig() {
    const { camera } = useThree();
    const mouse = useRef({ x: 0, y: 0, nx: 0, ny: 0, vx: 0, vy: 0 });
    const scrollYRef = useRef(0);
    const pathSeed = useRef(PATH_PRESETS[Math.floor(Math.random() * 5)]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = -(e.clientY / window.innerHeight) * 2 + 1;
            const prevX = mouse.current.nx;
            const prevY = mouse.current.ny;
            mouse.current.vx = nx - prevX;
            mouse.current.vy = ny - prevY;
            mouse.current.nx = nx;
            mouse.current.ny = ny;
            mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, nx, 0.1);
            mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, ny, 0.1);
        };

        // Track scroll direction for cycle detection
        let lastScrollY = window.scrollY;
        let reachedBottom = false;
        const handleScroll = () => {
            const currentY = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const atBottom = currentY >= maxScroll - 50;
            const atTop = currentY <= 50;
            const goingUp = currentY < lastScrollY;

            // Phase 1: user scrolls to bottom
            if (atBottom) reachedBottom = true;

            // Phase 2: after hitting bottom, user scrolls back to top → full cycle done → re-roll
            if (reachedBottom && atTop && goingUp) {
                reachedBottom = false;
                const nextIdx = Math.floor(Math.random() * PATH_PRESETS.length);
                pathSeed.current = PATH_PRESETS[nextIdx];
            }

            lastScrollY = currentY;
            scrollYRef.current = currentY;
        };
        scrollYRef.current = window.scrollY;
        
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    

    useFrame((_, delta) => {
        const sp = Math.max(0, Math.min(1, scrollYRef.current / (window.innerHeight * 6)));
        const mx = mouse.current.x;
        const my = mouse.current.y;
        
        // Z zoom from page scroll
        const targetZ = scrollYRef.current * 0.18;

        // ── Random Winding Path ──────────────────────────────────────────────
        const seed = pathSeed.current;
        // Deterministic procedural path based purely on Z-depth (allows "time travel" reverse tracking)
        const scrollPathX = Math.sin(targetZ * seed.frx + seed.phx) * seed.rx - Math.sin(seed.phx) * seed.rx;
        const scrollPathY = Math.cos(targetZ * seed.fry + seed.phy) * seed.ry - Math.cos(seed.phy) * seed.ry;

        // ── Mouse parallax + Path combination ────────────────────────────────
        const targetX = mx * 150 + scrollPathX;
        const targetY = my * 150 + scrollPathY;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.8 * delta);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.8 * delta);

        // Camera head-tilt from mouse + path curve leaning
        const tangentX = Math.cos(targetZ * seed.frx + seed.phx) * seed.rx * seed.frx;
        const tangentY = -Math.sin(targetZ * seed.fry + seed.phy) * seed.ry * seed.fry;
        
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -mx * 0.15 - tangentX * 0.4, 1.0 * delta);
        
        // ── Scroll-phase: drift arc (words splitting apart then assembling, 0.05→0.55)
        const driftArc = sp < 0.05 ? 0 : (sp > 0.55 ? 0 : THREE.MathUtils.mapLinear(sp, 0.05, 0.55, 0, 1));
        const driftT = Math.sin(driftArc * Math.PI);

        // Lateral sweep — camera pans right as SO/ARE split (stars stream left)
        const sweepX = driftT * 30;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX + sweepX, 0.8 * delta);

        // Z push — camera rushes forward into the star field during drift
        const sweepZ = driftT * -40;
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ + sweepZ, 2 * delta);

        // Y dip — camera dips then rises again
        const sweepY = driftT * -25;
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + sweepY, 0.8 * delta);

        // Roll — starfield tilts during drift
        const targetRoll = driftT * 0.35;
        camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetRoll, 2.5 * delta);

        // Pitch — camera nose-dips slightly during drift (adds depth)
        const targetPitch = driftT * 0.15;
        camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, my * 0.10 + tangentY * 0.4 + targetPitch, 1.0 * delta);
    });

    return null;
}

// ── SpaceScene ────────────────────────────────────────────────────────────────
export default function SpaceScene({ scrollProgress = 0 }: { scrollProgress?: number }) {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full z-0 bg-black"
        >
            <Canvas
                camera={{ position: [0, 0, 0], fov: 45 }}
                dpr={[1, 1.5]}
                gl={{ powerPreference: 'high-performance', antialias: false, alpha: false }}
            >
                <color attach="background" args={['#030303']} />
                <fog   attach="fog"        args={['#030303', 15, 60]} />

                <ambientLight   intensity={1.5} color="#052e16" />
                <directionalLight position={[10, 20, 5]} intensity={2.0} color="#ffffff" />
                <pointLight     position={[-10, -10, -10]} intensity={1.0} color="#4ade80" />

                <Suspense fallback={null}>
                    <CameraRig />
                    <StarField     count={3000} />
                </Suspense>
            </Canvas>

            {/* Cinematic overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/80 pointer-events-none" />
        </div>
    );
}
