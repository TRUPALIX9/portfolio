import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

hud_block = """
            {/* HUD Status Bar */}
            <div className="flex justify-between items-center gap-4 border-b border-white/5 pb-4">
                <div className="flex flex-col">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-neutral-500">Score</span>
                    <span className="text-xl md:text-2xl font-black text-white leading-tight">{score}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-neutral-500">High Score</span>
                    <span className="text-xl md:text-2xl font-black text-[#4ADE80] leading-tight">{highScore}</span>
                </div>
            </div>
"""

new_hud_block = """
            {/* HUD Status Bar */}
            <div className="flex justify-center items-center border-b border-white/5 pb-4">
                <div className="flex flex-col items-center">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-neutral-500">Current Score</span>
                    <span className="text-2xl md:text-3xl font-black text-white leading-tight">{score}</span>
                </div>
            </div>
"""

content = content.replace(hud_block.strip(), new_hud_block.strip())

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
