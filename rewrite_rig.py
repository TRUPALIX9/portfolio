import re

with open('src/components/space/SpaceScene.tsx', 'r') as f:
    content = f.read()

# Extract CameraRig code and replace it
camera_rig_code = """
function CameraRig({ scrollProgress }: { scrollProgress: number }) {
    const { camera } = useThree();
    const mouse = useRef({ x: 0, y: 0, nx: 0, ny: 0, vx: 0, vy: 0 });
    const progressRef = useRef(scrollProgress);
    const scrollYRef = useRef(0);
    const pathSeed = useRef({
        rx: (Math.random() - 0.5) * 350,
        ry: (Math.random() - 0.5) * 250,
        frx: 0.0015 + Math.random() * 0.002,
        fry: 0.0015 + Math.random() * 0.002,
        phx: Math.random() * Math.PI * 2,
        phy: Math.random() * Math.PI * 2,
    });

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
        const handleScroll = () => { scrollYRef.current = window.scrollY; };
        scrollYRef.current = window.scrollY;
        
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => { progressRef.current = scrollProgress; }, [scrollProgress]);

    useFrame((_, delta) => {
        const sp = progressRef.current;
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
"""

content = re.sub(
    r'function CameraRig\(\{ scrollProgress \}: \{ scrollProgress: number \}\) \{[\s\S]*?return null;\n\}',
    camera_rig_code.strip(),
    content
)

with open('src/components/space/SpaceScene.tsx', 'w') as f:
    f.write(content)

