import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

# Change Wrong to Failed
content = content.replace(
    """
                        <motion.h3 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                            className="text-3xl md:text-4xl font-black text-red-500 mb-6 tracking-widest uppercase drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                        >
                            Wrong
                        </motion.h3>
""",
    """
                        <motion.h3 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                            className="text-3xl md:text-4xl font-black text-red-500 mb-6 tracking-widest uppercase drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                        >
                            FAILED
                        </motion.h3>
"""
)

# Replace grid rendering
old_grid = r'\{\/\* 3x3 Tile Grid - Tic Tac Toe Style \*\/\}[\s\S]*?<\/button>\s*\);\s*\}\)\}\s*<\/div>'

new_grid = """
                {/* 3x3 Tile Grid - Tic Tac Toe Style */}
                <div className="grid grid-cols-3 w-full h-full max-w-[280px] max-h-[280px]">
                    {Array.from({ length: TILE_COUNT }).map((_, tileId) => {
                        const isActive = activeTile === tileId;
                        
                        const isRightEdge = tileId % 3 === 2;
                        const isBottomEdge = tileId >= 6;
                        
                        // Solid white 4px inner borders to create the # grid
                        let borderClasses = "border-solid border-white ";
                        if (!isRightEdge) borderClasses += "border-r-[4px] ";
                        else borderClasses += "border-r-0 ";
                        
                        if (!isBottomEdge) borderClasses += "border-b-[4px] ";
                        else borderClasses += "border-b-0 ";
                        
                        return (
                            <button
                                key={tileId}
                                type="button"
                                onClick={() => handleTilePress(tileId)}
                                disabled={!playing}
                                aria-label={`Memory tile ${tileId + 1}`}
                                className={`aspect-square transition-all duration-75 relative ${borderClasses} ${
                                    isActive 
                                    ? '!bg-white shadow-[0_0_40px_rgba(255,255,255,1)] z-10 scale-105' 
                                    : 'bg-transparent hover:bg-white/10 active:bg-white/20 disabled:pointer-events-none'
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
