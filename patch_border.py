import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

old_classes = "className={`aspect-square transition-all duration-100 relative ${borderClasses} ${"
new_classes = "className={`aspect-square transition-all duration-100 relative border-solid ${borderClasses} ${"

content = content.replace(old_classes, new_classes)

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
