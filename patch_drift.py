import re

with open('src/components/space/SpaceScene.tsx', 'r') as f:
    content = f.read()

# Increase target bounds, decrease lerp speed
content = content.replace(
    'const targetX = mx * 70;',
    'const targetX = mx * 150;'
)
content = content.replace(
    'const targetY = my * 70;',
    'const targetY = my * 150;'
)

# Position lerp
content = content.replace(
    'camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 3.5 * delta);',
    'camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.8 * delta);'
)
content = content.replace(
    'camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 3.5 * delta);',
    'camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.8 * delta);'
)

# Rotation lerp
content = content.replace(
    'camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -mx * 0.08, 3 * delta);',
    'camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -mx * 0.15, 1.0 * delta);'
)
content = content.replace(
    'camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x,  my * 0.06, 3 * delta);',
    'camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x,  my * 0.10, 1.0 * delta);'
)

# Sweep overrides
content = content.replace(
    'camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX + sweepX, 3.5 * delta);',
    'camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX + sweepX, 0.8 * delta);'
)

content = content.replace(
    'camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + sweepY, 2 * delta);',
    'camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + sweepY, 0.8 * delta);'
)
content = content.replace(
    'camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, my * 0.03 + targetPitch, 2.5 * delta);',
    'camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, my * 0.10 + targetPitch, 1.0 * delta);'
)


with open('src/components/space/SpaceScene.tsx', 'w') as f:
    f.write(content)
