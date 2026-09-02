import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

content = content.replace('const TILE_COUNT = 4;', 'const TILE_COUNT = 9;')

old_grid = """
                {/* 2x2 Tile Grid */}
                <div className="grid grid-cols-2 gap-4 md:gap-6 w-full h-full max-w-[320px] max-h-[320px]">
"""
new_grid = """
                {/* 3x3 Tile Grid */}
                <div className="grid grid-cols-3 gap-2 md:gap-3 w-full h-full max-w-[280px] max-h-[280px]">
"""
content = content.replace(old_grid.strip(), new_grid.strip())

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
