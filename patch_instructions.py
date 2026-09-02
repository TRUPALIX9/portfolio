import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

hud_pattern = r'\{\/\* HUD Status Bar \*\/\}[\s\S]*?<\/p>\s*<\/div>'

new_hud = """
            {/* HUD Status Bar & Instructions */}
            <div className="flex flex-col items-center justify-center border-b border-white/5 pb-5 gap-3">
                {/* Score */}
                <div className="flex flex-col items-center">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-neutral-500 mb-0.5">Current Score</span>
                    <span className="text-3xl md:text-4xl font-black text-white leading-none">{score}</span>
                </div>

                {/* Instructions */}
                <div className="flex flex-col items-center text-center gap-0.5">
                    <span className={`text-[0.65rem] md:text-[0.7rem] font-black uppercase tracking-widest ${
                        phaseLabel === 'WATCH' ? 'text-red-400' : 
                        (phaseLabel === 'REPEAT' || phaseLabel === 'SUCCESS') ? 'text-emerald-400' : 
                        phaseLabel === 'GAME OVER' ? 'text-red-500' : 'text-neutral-400'
                    }`}>
                        {phaseLabel}
                    </span>
                    <p className={`text-[0.7rem] md:text-xs font-bold leading-none ${
                        phaseLabel === 'WATCH' ? 'text-red-400' : 
                        phaseLabel === 'REPEAT' ? 'text-emerald-400' : 'text-white/70'
                    }`}>
                        {statusText}
                    </p>
                </div>
            </div>
"""

content = re.sub(hud_pattern, new_hud.strip(), content)

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
