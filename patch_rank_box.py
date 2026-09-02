import re

with open('src/components/MemoryArcade.tsx', 'r') as f:
    content = f.read()

old_rank = "text-[0.75rem] font-black min-w-[28px] h-7 px-1.5 rounded-lg flex-shrink-0 flex items-center justify-center bg-black/40 border"
new_rank = "text-[0.75rem] font-black min-w-[32px] md:min-w-[36px] h-7 px-2 rounded-lg flex-shrink-0 flex items-center justify-center bg-black/40 border"

content = content.replace(old_rank, new_rank)

with open('src/components/MemoryArcade.tsx', 'w') as f:
    f.write(content)
