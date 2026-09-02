import re

with open('src/components/space/SpaceScene.tsx', 'r') as f:
    content = f.read()

content = content.replace('<StarField     count={2000} />', '<StarField     count={1500} />')

with open('src/components/space/SpaceScene.tsx', 'w') as f:
    f.write(content)

with open('src/components/space/StarField.tsx', 'r') as f:
    content = f.read()

content = content.replace('* 1200; // X', '* 1000; // X')
content = content.replace('* 1200; // Y', '* 1000; // Y')
content = content.replace('* 1200; // Z', '* 1000; // Z')

with open('src/components/space/StarField.tsx', 'w') as f:
    f.write(content)

