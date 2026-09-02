import re

# 1. Update SpaceScene.tsx
with open('src/components/space/SpaceScene.tsx', 'r') as f:
    scene_content = f.read()

# Remove scrollProgress prop
scene_content = scene_content.replace(
    'export default function SpaceScene({ scrollProgress }: { scrollProgress: number }) {',
    'export default function SpaceScene() {'
)
scene_content = scene_content.replace(
    '<CameraRig scrollProgress={scrollProgress} />',
    '<CameraRig />'
)
scene_content = scene_content.replace(
    'function CameraRig({ scrollProgress }: { scrollProgress: number }) {',
    'function CameraRig() {'
)
scene_content = re.sub(
    r'const progressRef = useRef\(scrollProgress\);\n\s*const scrollYRef = useRef\(0\);',
    'const scrollYRef = useRef(0);',
    scene_content
)
scene_content = re.sub(
    r"useEffect\(\(\) => \{ progressRef.current = scrollProgress; \}, \[scrollProgress\]\);",
    '',
    scene_content
)

# Compute sp internally
scene_content = scene_content.replace(
    'const sp = progressRef.current;',
    'const sp = Math.max(0, Math.min(1, scrollYRef.current / (window.innerHeight * 6)));'
)

with open('src/components/space/SpaceScene.tsx', 'w') as f:
    f.write(scene_content)


# 2. Update HeroSection.tsx
with open('src/components/HeroSection.tsx', 'r') as f:
    hero_content = f.read()

# Add useMemo import if needed
if 'useMemo' not in hero_content:
    hero_content = hero_content.replace("import { useState, useEffect, useRef }", "import { useState, useEffect, useRef, useMemo }")

# Memoize SpaceScene
memo_logic = """
    const [driftScale, setDriftScale] = useState(1);

    const spaceSceneMemo = useMemo(() => <SpaceScene />, []);
"""
hero_content = hero_content.replace(
    'const [driftScale, setDriftScale] = useState(1);',
    memo_logic.strip()
)

hero_content = hero_content.replace(
    '<SpaceScene scrollProgress={p} />',
    '{spaceSceneMemo}'
)

with open('src/components/HeroSection.tsx', 'w') as f:
    f.write(hero_content)

