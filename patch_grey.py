import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

# Change the default bg of the game container from bg-black/40 to bg-black/90 or solid bg-black
old_bg = "bg-black/40 border border-white/[0.04]"
new_bg = "bg-black border border-white/[0.04]"
content = content.replace(old_bg, new_bg)

# Ensure the watch/repeat states also use deeper black instead of /60
old_watch = "bg-black/60 border-2 border-red-500/60"
new_watch = "bg-black border-2 border-red-500/60"
content = content.replace(old_watch, new_watch)

old_repeat = "bg-black/60 border-2 border-emerald-500/60"
new_repeat = "bg-black border-2 border-emerald-500/60"
content = content.replace(old_repeat, new_repeat)

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
