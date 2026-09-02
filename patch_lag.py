import re

# 1. Update SpaceScene.tsx
with open('src/components/space/SpaceScene.tsx', 'r') as f:
    scene_content = f.read()

# Slower scroll speed
scene_content = scene_content.replace(
    'const targetZ = scrollYRef.current * 0.25;',
    'const targetZ = scrollYRef.current * 0.18;'
)

# Slower drift speed
scene_content = scene_content.replace(
    'const sweepZ = driftT * -70;',
    'const sweepZ = driftT * -40;'
)

# Star count
scene_content = scene_content.replace(
    '<StarField     count={2500} />',
    '<StarField     count={2000} />'
)

with open('src/components/space/SpaceScene.tsx', 'w') as f:
    f.write(scene_content)


# 2. Update StarField.tsx
with open('src/components/space/StarField.tsx', 'r') as f:
    star_content = f.read()

# Slower ambient rotation
star_content = star_content.replace(
    'pointsRef.current.rotation.y += delta * 0.04;',
    'pointsRef.current.rotation.y += delta * 0.02;'
)
star_content = star_content.replace(
    'pointsRef.current.rotation.x += delta * 0.02;',
    'pointsRef.current.rotation.x += delta * 0.01;'
)

# Bring stars closer (smaller bounding box)
star_content = star_content.replace(
    '* 2500; // X',
    '* 1200; // X'
)
star_content = star_content.replace(
    '* 2500; // Y',
    '* 1200; // Y'
)
star_content = star_content.replace(
    '* 2500; // Z',
    '* 1200; // Z'
)

# Make stars slightly larger to feel closer
star_content = star_content.replace(
    'gl_PointSize = (6.0 * (300.0 / -mvPosition.z));',
    'gl_PointSize = (9.0 * (300.0 / -mvPosition.z));'
)

with open('src/components/space/StarField.tsx', 'w') as f:
    f.write(star_content)

