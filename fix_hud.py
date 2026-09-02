import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

hud_pattern = r'\{\/\* HUD Status Bar \*\/\}[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>'

new_hud = """
            {/* HUD Status Bar */}
            <div className="flex justify-center items-center border-b border-white/5 pb-4">
                <div className="flex flex-col items-center">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-neutral-500">Current Score</span>
                    <span className="text-2xl md:text-3xl font-black text-white leading-tight">{score}</span>
                </div>
            </div>
"""

content = re.sub(hud_pattern, new_hud.strip(), content)

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
