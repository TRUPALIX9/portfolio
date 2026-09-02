import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "setStatusText(isTouch ? 'TAP THE TILES IN THE SAME ORDER' : 'CLICK THE TILES IN THE SAME ORDER');",
    "setStatusText(isTouch ? 'Your turn! Tap the tiles in the exact order.' : 'Your turn! Click the tiles in the exact order.');"
)
content = content.replace(
    "setStatusText('WRONG TILE. SIGNAL LOST.')",
    "setStatusText('Wrong tile! Sequence broken.')"
)
content = content.replace(
    "endGame('BROKEN', 'WRONG TILE. SIGNAL LOST.')",
    "endGame('BROKEN', 'Wrong tile! Sequence broken.')"
)
content = content.replace(
    "setPhaseLabel('BROKEN')",
    "setPhaseLabel('GAME OVER')"
)
content = content.replace(
    "setPhaseLabel('LOCKED')",
    "setPhaseLabel('SUCCESS')"
)
content = content.replace(
    "setPhaseLabel('BOOT')",
    "setPhaseLabel('STARTING')"
)

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
