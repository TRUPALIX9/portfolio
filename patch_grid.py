import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

# Replace the grid container layout to remove gap and make it a clean #
old_grid = """
                {/* 3x3 Tile Grid */}
                <div className="grid grid-cols-3 gap-2 md:gap-3 w-full h-full max-w-[280px] max-h-[280px]">
"""

new_grid = """
                {/* 3x3 Tile Grid - Tic Tac Toe Style */}
                <div className="grid grid-cols-3 w-full h-full max-w-[280px] max-h-[280px]">
"""
content = content.replace(old_grid.strip(), new_grid.strip())

# Replace the button rendering to have tic-tac-toe borders and !bg-white
old_button = """
                    {Array.from({ length: TILE_COUNT }).map((_, tileId) => {
                        const isActive = activeTile === tileId;
                        return (
                            <button
                                key={tileId}
                                type="button"
                                onClick={() => handleTilePress(tileId)}
                                disabled={!playing}
                                aria-label={`Memory tile ${tileId + 1}`}
                                className={`aspect-square rounded-2xl border transition-all duration-150 relative flex items-center justify-center ${
                                    isActive 
                                    ? 'bg-white border-white shadow-[0_0_30px_rgba(255,255,255,0.7)] scale-[1.04] z-10' 
                                    : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] active:scale-95 disabled:pointer-events-none'
                                }`}
                            >
                            </button>
                        );
                    })}
"""

new_button = """
                    {Array.from({ length: TILE_COUNT }).map((_, tileId) => {
                        const isActive = activeTile === tileId;
                        
                        // Tic-Tac-Toe border logic
                        const isRightEdge = tileId % 3 === 2;
                        const isBottomEdge = tileId >= 6;
                        
                        const borderClasses = `${!isRightEdge ? 'border-r-4 border-white/60' : ''} ${!isBottomEdge ? 'border-b-4 border-white/60' : ''}`;
                        
                        return (
                            <button
                                key={tileId}
                                type="button"
                                onClick={() => handleTilePress(tileId)}
                                disabled={!playing}
                                aria-label={`Memory tile ${tileId + 1}`}
                                className={`aspect-square transition-all duration-100 relative ${borderClasses} ${
                                    isActive 
                                    ? '!bg-white shadow-[0_0_40px_rgba(255,255,255,0.9)] z-10 scale-[1.02]' 
                                    : 'bg-transparent hover:bg-white/10 active:bg-white/20 disabled:pointer-events-none'
                                }`}
                            >
                            </button>
                        );
                    })}
"""

content = content.replace(old_button.strip(), new_button.strip())

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
