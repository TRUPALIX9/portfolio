import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

# Remove the Round block from the HUD
round_block = """
                <div className="flex flex-col items-center">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-neutral-500">Round</span>
                    <span className="text-xl md:text-2xl font-black text-white leading-tight">{round}</span>
                </div>
"""
content = content.replace(round_block.strip() + "\n", "")

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
