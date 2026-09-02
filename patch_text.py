import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "useState('WATCH THE CHAIN, THEN REPEAT IT')",
    "useState('Press start to begin. Watch the tiles closely.')"
)
content = content.replace(
    "setStatusText('CALIBRATING MEMORY CHAMBER')",
    "setStatusText('Get ready...')"
)
content = content.replace(
    "setStatusText('LOCK IN THE FULL PATTERN')",
    "setStatusText('Memorize the flashing sequence...')"
)
content = content.replace(
    "setStatusText('REPLICATE THE SEQUENCE')",
    "setStatusText('Your turn! Tap the tiles in the exact order.')"
)
content = content.replace(
    "setStatusText('CHAIN STABLE. NEXT LINK LOADING.')",
    "setStatusText('Correct! Adding another tile...')"
)

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
