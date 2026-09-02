import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

emoji_block = """
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl md:text-3xl mb-3 md:mb-4 shadow-inner">
                            🧠
                        </div>
"""
content = content.replace(emoji_block.strip() + "\n", "")

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
