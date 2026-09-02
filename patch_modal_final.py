import re

with open('src/components/MemoryArcade.tsx', 'r') as f:
    content = f.read()

# Force GOT IT button to be aggressively white/black
old_got_it = 'className="w-full h-14 bg-white hover:bg-neutral-200 text-black font-black text-sm md:text-base tracking-widest rounded-xl transition-colors"'
new_got_it = 'className="w-full h-14 !bg-white hover:!bg-neutral-200 !text-black font-black text-sm md:text-base tracking-widest rounded-xl transition-colors"'
content = content.replace(old_got_it, new_got_it)

# Increase gap between leaderboard and How To Play button
old_col = 'className="w-full lg:w-96 flex flex-col gap-5 md:gap-6"'
new_col = 'className="w-full lg:w-96 flex flex-col gap-6 md:gap-8"'
content = content.replace(old_col, new_col)

# Increase modal padding
old_wrapper = 'className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"'
new_wrapper = 'className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-8 bg-black/80 backdrop-blur-sm"'
content = content.replace(old_wrapper, new_wrapper)

with open('src/components/MemoryArcade.tsx', 'w') as f:
    f.write(content)
