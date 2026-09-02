import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useRef, useEffect, RefObject } from 'react';
import * as THREE from 'three';
import StarField     from './StarField';

// ── CameraRig ────────────────────────────────────────────────────────────────
function CameraRig({ scrollProgress }: { scrollProgress: number }) {
    const { camera } = useThree();
    const mouse       = useRef({ x: 0, y: 0, vx: 0, vy: 0 }); // include velocity
    const scrollYRef  = useRef(0);
    const progressRef = useRef(0);

    useEffect(() => {
        let prevX = 0, prevY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = -(e.clientY / window.innerHeight) * 2 + 1;
            mouse.current.vx = nx - prevX;
            mouse.current.vy = ny - prevY;
            mouse.current.x  = nx;
            mouse.current.y  = ny;
            prevX = nx; prevY = ny;
        };
        const handleScroll = () => { scrollYRef.current = window.scrollY; };
        scrollYRef.current = window.scrollY;

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('scroll',    handleScroll,    { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll',    handleScroll);
        };
    }, []);

    useEffect(() => { progressRef.current = scrollProgress; }, [scrollProgress]);

    useFrame((_, delta) => {
        const sp = progressRef.current;
        const mx = mouse.current.x;
        const my = mouse.current.y;

        // ── Mouse parallax ───────────────────────────────────────────────────
        const targetX = mx * 150;
        const targetY = my * 150;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.8 * delta);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.8 * delta);

        // Camera head-tilt from mouse
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -mx * 0.15, 1.0 * delta);
        camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x,  my * 0.10, 1.0 * delta);

        // Z zoom from page scroll
        const targetZ = scrollYRef.current * 0.18;
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 2 * delta);

        // ── Scroll-phase: drift arc (words splitting apart then assembling, 0.05→0.55)
        // driftArc goes 0 -> 1, so driftT goes 0 -> 1 -> 0 (sine wave)
        const driftArc = sp < 0.05 ? 0 : (sp > 0.55 ? 0 : THREE.MathUtils.mapLinear(sp, 0.05, 0.55, 0, 1));
        const driftT = Math.sin(driftArc * Math.PI);

        // Lateral sweep — camera pans right as SO/ARE split (stars stream left)
        const sweepX = driftT * 30;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX + sweepX, 0.8 * delta);

        // Z push — camera rushes forward into the star field during drift
        // (creates a "flying through space" sensation)
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
        camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, my * 0.10 + targetPitch, 1.0 * delta);

        // ── Answer phase (0.55→0.85): camera stays centered since driftT is 0 ────────
        // (no extra logic needed because driftT smoothly returned to 0)
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
                    <CameraRig scrollProgress={scrollProgress} />
                    <StarField     count={1500} />
                </Suspense>
            </Canvas>

            {/* Cinematic overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/80 pointer-events-none" />
        </div>
    );
}
