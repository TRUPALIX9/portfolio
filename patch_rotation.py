import re

with open('src/components/space/StarField.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'pointsRef.current.rotation.y += delta * 0.02;',
    'pointsRef.current.rotation.y += delta * 0.04;'
)
content = content.replace(
    'pointsRef.current.rotation.x += delta * 0.01;',
    'pointsRef.current.rotation.x += delta * 0.02;'
)

with open('src/components/space/StarField.tsx', 'w') as f:
    f.write(content)

