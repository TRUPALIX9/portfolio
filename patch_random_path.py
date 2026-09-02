import re

with open('src/components/space/SpaceScene.tsx', 'r') as f:
    content = f.read()

# Add seed ref
seed_ref = """
    const scrollYRef = useRef(0);
    const pathSeed = useRef({
        rx: (Math.random() - 0.5) * 350, // wide arc X
        ry: (Math.random() - 0.5) * 250, // wide arc Y
        frx: 0.0015 + Math.random() * 0.002, // frequency X
        fry: 0.0015 + Math.random() * 0.002, // frequency Y
        phx: Math.random() * Math.PI * 2, // phase X
        phy: Math.random() * Math.PI * 2, // phase Y
    });
"""
content = content.replace('const scrollYRef = useRef(0);', seed_ref.strip())

# Add path logic
path_logic = """
        // ── Random Winding Path ──────────────────────────────────────────────
        const seed = pathSeed.current;
        // Deterministic procedural path based purely on Z-depth (allows "time travel" reverse tracking)
        const scrollPathX = Math.sin(targetZ * seed.frx + seed.phx) * seed.rx - Math.sin(seed.phx) * seed.rx;
        const scrollPathY = Math.cos(targetZ * seed.fry + seed.phy) * seed.ry - Math.cos(seed.phy) * seed.ry;

        // ── Mouse parallax + Path combination ────────────────────────────────
        const targetX = mx * 150 + scrollPathX;
        const targetY = my * 150 + scrollPathY;
"""
content = re.sub(
    r'// ── Mouse parallax ───────────────────────────────────────────────────\n\s*const targetX = mx \* 150;\n\s*const targetY = my \* 150;',
    path_logic.strip(),
    content
)

# Also update the camera rotation to slightly lean into the curves
# To get the derivative of the path (the tangent), we derive the sin/cos:
# tangentX = Math.cos(targetZ * seed.frx + seed.phx) * seed.rx * seed.frx;
lean_logic = """
        // Camera head-tilt from mouse + path curve leaning
        const tangentX = Math.cos(targetZ * seed.frx + seed.phx) * seed.rx * seed.frx;
        const tangentY = -Math.sin(targetZ * seed.fry + seed.phy) * seed.ry * seed.fry;
        
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -mx * 0.15 - tangentX * 0.4, 1.0 * delta);
        camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x,  my * 0.10 + tangentY * 0.4, 1.0 * delta);
"""
content = re.sub(
    r'// Camera head-tilt from mouse\n\s*camera.rotation.y = THREE.MathUtils.lerp\(camera.rotation.y, -mx \* 0.15, 1.0 \* delta\);\n\s*camera.rotation.x = THREE.MathUtils.lerp\(camera.rotation.x,  my \* 0.10, 1.0 \* delta\);',
    lean_logic.strip(),
    content
)
# Update Sweep Overrides to include curve leaning
sweep_lean_logic = """
        camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, my * 0.10 + tangentY * 0.4 + targetPitch, 1.0 * delta);
"""
content = re.sub(
    r'camera.rotation.x = THREE.MathUtils.lerp\(camera.rotation.x, my \* 0.10 \+ targetPitch, 1.0 \* delta\);',
    sweep_lean_logic.strip(),
    content
)

# Increase star count slightly to compensate for massive 4000 box
content = content.replace('<StarField     count={1500} />', '<StarField     count={3000} />')

with open('src/components/space/SpaceScene.tsx', 'w') as f:
    f.write(content)

with open('src/components/space/StarField.tsx', 'r') as f:
    star_content = f.read()

# Increase bounding box to 4000 to cover the long winding path
star_content = star_content.replace('* 1000; // X', '* 4000; // X')
star_content = star_content.replace('* 1000; // Y', '* 4000; // Y')
star_content = star_content.replace('* 1000; // Z', '* 4000; // Z')

with open('src/components/space/StarField.tsx', 'w') as f:
    f.write(star_content)

