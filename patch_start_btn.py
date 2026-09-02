import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

old_overlay = """
                        <p className="text-neutral-400 text-[0.65rem] md:text-xs leading-relaxed max-w-[220px] mb-4 md:mb-6">
                            A sequence of flashing tiles will play. Repeat it exactly. Each round adds one more tile.
                        </p>
                        <button
                            onClick={startGame}
                            className="h-10 md:h-11 px-6 hover:bg-neutral-200 font-bold rounded-xl text-[0.8rem] md:text-sm transition-all duration-300 shadow-md"
                            style={{ backgroundColor: '#ffffff', color: '#000000' }}
                        >
                            Start Test
                        </button>
"""

new_overlay = """
                        <p className="text-neutral-400 text-[0.7rem] md:text-xs font-medium leading-relaxed max-w-[220px] mb-6">
                            Memorize the pattern. Tap it back.
                        </p>
                        <button
                            onClick={startGame}
                            className="h-12 md:h-14 hover:bg-neutral-200 font-black tracking-widest rounded-xl text-sm md:text-base w-full max-w-[180px] transition-all duration-300 shadow-xl"
                            style={{ backgroundColor: '#ffffff', color: '#000000' }}
                        >
                            START
                        </button>
"""

content = content.replace(old_overlay.strip(), new_overlay.strip())

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
