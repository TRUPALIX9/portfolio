import re

with open('src/components/space/SpaceScene.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<StarField     count={2200} />',
    '<StarField     count={2500} />'
)

with open('src/components/space/SpaceScene.tsx', 'w') as f:
    f.write(content)
