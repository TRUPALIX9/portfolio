import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

# Replace the grid wrapper and buttons
old_grid = r'\{\/\* 3x3 Tile Grid - Tic Tac Toe Style \*\/\}[\s\S]*?<\/button>\s*\);\s*\}\)\}\s*<\/div>'

new_grid = """
                {/* 3x3 Tile Grid - Tic Tac Toe Style */}
                <div className="grid grid-cols-3 gap-1.5 w-full h-full max-w-[280px] max-h-[280px] bg-white/30">
                    {Array.from({ length: TILE_COUNT }).map((_, tileId) => {
                        const isActive = activeTile === tileId;
                        return (
                            <button
                                key={tileId}
                                type="button"
                                onClick={() => handleTilePress(tileId)}
                                disabled={!playing}
                                aria-label={`Memory tile ${tileId + 1}`}
                                className={`aspect-square transition-all duration-100 relative ${
                                    isActive 
                                    ? 'bg-white shadow-[0_0_40px_rgba(255,255,255,0.9)] z-10 scale-105' 
                                    : 'bg-[#111] hover:bg-[#222] active:bg-[#333] disabled:pointer-events-none'
                                }`}
                            >
                            </button>
                        );
                    })}
                </div>
"""

content = re.sub(old_grid, new_grid.strip(), content)

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
