import re

with open('src/components/MemoryArcade.tsx', 'r') as f:
    content = f.read()

emoji_block_1 = """
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm">
                                🧠
                            </div>
"""
content = content.replace(emoji_block_1.strip() + "\n", "")

# The gap was `gap-3` between emoji and text. Now that emoji is gone, the gap doesn't matter, but we can leave it.

emoji_block_2 = """
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl mb-4">
                                🧠
                            </div>
"""
content = content.replace(emoji_block_2.strip() + "\n", "")

with open('src/components/MemoryArcade.tsx', 'w') as f:
    f.write(content)
