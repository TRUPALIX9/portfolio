import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

# 1. Update text strings
content = content.replace("setStatusText('Memorize the flashing sequence...')", "setStatusText('Remember the flashing sequence...')")
content = content.replace(
    "setStatusText(isTouch ? 'Your turn! Tap the tiles in the exact order.' : 'Your turn! Click the tiles in the exact order.');",
    "setStatusText(isTouch ? 'Tap the tiles in the exact order.' : 'Click the tiles in the exact order.');"
)

# 2. Update Instruction Panel and remove MATCHED
old_instruction = """
            {/* Instruction Panel */}
            <div className="bg-white/[0.02] border border-white/[0.06] p-4 md:p-5 rounded-2xl flex flex-col gap-1.5 md:gap-2 text-center shadow-sm">
                <div className="flex justify-between items-center text-[0.65rem] md:text-[0.7rem] font-mono tracking-widest text-neutral-400">
                    <span className="text-[#4ADE80] font-black uppercase">{phaseLabel}</span>
                    <span>{playerProgress} / {sequenceLength || 1} MATCHED</span>
                </div>
                <p className="text-[0.7rem] md:text-xs text-white/80 font-medium leading-relaxed mt-1">
                    {statusText}
                </p>
            </div>
"""

new_instruction = """
            {/* Instruction Panel */}
            <div className={`bg-white/[0.02] border border-white/[0.06] p-4 md:p-5 rounded-2xl flex flex-col gap-1.5 md:gap-2 text-center shadow-sm transition-colors duration-300 ${
                phaseLabel === 'WATCH' ? 'bg-red-500/[0.02] border-red-500/20' : 
                phaseLabel === 'REPEAT' ? 'bg-emerald-500/[0.02] border-emerald-500/20' : ''
            }`}>
                <div className="flex justify-center items-center text-[0.7rem] md:text-[0.75rem] font-mono tracking-widest">
                    <span className={`font-black uppercase ${
                        phaseLabel === 'WATCH' ? 'text-red-400' : 
                        (phaseLabel === 'REPEAT' || phaseLabel === 'SUCCESS') ? 'text-emerald-400' : 
                        phaseLabel === 'GAME OVER' ? 'text-red-500' : 'text-neutral-400'
                    }`}>
                        {phaseLabel}
                    </span>
                </div>
                <p className={`text-[0.7rem] md:text-xs font-bold leading-relaxed mt-1 ${
                    phaseLabel === 'WATCH' ? 'text-red-400' : 
                    phaseLabel === 'REPEAT' ? 'text-emerald-400' : 'text-white/80'
                }`}>
                    {statusText}
                </p>
            </div>
"""
content = content.replace(old_instruction.strip(), new_instruction.strip())

# 3. Update Game Grid Container glow
old_grid_container = """
            {/* Game Grid Container */}
            <div className="relative aspect-square w-full bg-black/40 border border-white/[0.04] rounded-2xl p-4 md:p-6 flex items-center justify-center">
"""

new_grid_container = """
            {/* Game Grid Container */}
            <div className={`relative aspect-square w-full rounded-2xl p-4 md:p-6 flex items-center justify-center transition-all duration-300 ${
                phaseLabel === 'WATCH' 
                    ? 'bg-black/60 border-2 border-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.15)]' 
                    : phaseLabel === 'REPEAT' 
                    ? 'bg-black/60 border-2 border-emerald-500/60 shadow-[0_0_40px_rgba(52,211,153,0.15)]' 
                    : phaseLabel === 'SUCCESS'
                    ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_60px_rgba(52,211,153,0.4)]'
                    : phaseLabel === 'GAME OVER'
                    ? 'bg-red-900/30 border-2 border-red-600 shadow-[0_0_60px_rgba(220,38,38,0.4)]'
                    : 'bg-black/40 border border-white/[0.04]'
            }`}>
"""
content = content.replace(old_grid_container.strip(), new_grid_container.strip())

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
