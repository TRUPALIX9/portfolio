import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

# 1. Animate Game Grid Container shake
old_grid_start = """
            {/* Game Grid Container */}
            <div className={`relative aspect-square w-full rounded-2xl p-4 md:p-6 flex items-center justify-center transition-all duration-300 ${
"""

new_grid_start = """
            {/* Game Grid Container */}
            <motion.div 
                animate={phaseLabel === 'GAME OVER' ? { x: [-12, 12, -10, 10, -6, 6, -3, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`relative aspect-square w-full rounded-2xl p-4 md:p-6 flex items-center justify-center transition-all duration-300 ${
"""
content = content.replace(old_grid_start.strip(), new_grid_start.strip())

# Need to change the closing div for Game Grid Container to </motion.div>
# Since there's multiple divs, I can't just replace </div>.
# Let's replace the block for GAME OVER OVERLAY first.

old_game_over = """
                {/* GAME OVER OVERLAY */}
                {gameOver && (
                    <div className="absolute inset-0 backdrop-blur-md bg-black/80 flex flex-col items-center justify-center p-4 text-center rounded-2xl z-20 overflow-hidden">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-2xl md:text-3xl mb-2 md:mb-4">
                            💥
                        </div>
                        <h3 className="text-lg md:text-xl font-extrabold text-white mb-1">Signal Lost</h3>
                        <p className="text-neutral-400 text-[0.7rem] md:text-xs mb-3 md:mb-4">
                            You scored <span className="text-white font-bold">{score}</span> points.
                        </p>

                        <div className="flex flex-col gap-2.5 w-full max-w-[240px]">
"""

new_game_over = """
                {/* GAME OVER OVERLAY */}
                <AnimatePresence>
                {gameOver && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute inset-0 backdrop-blur-lg bg-red-950/90 flex flex-col items-center justify-center p-4 text-center rounded-2xl z-20 overflow-hidden"
                    >
                        <motion.div 
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: [-10, 10, -10, 10, 0] }}
                            transition={{ type: "spring", bounce: 0.6, delay: 0.1, duration: 0.6 }}
                            className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center text-3xl mb-4 shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                        >
                            💥
                        </motion.div>
                        <motion.h3 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl font-black text-red-500 mb-1 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                        >
                            System Failure
                        </motion.h3>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-red-200/70 text-xs font-medium mb-5"
                        >
                            You survived for <span className="text-white font-black text-sm">{score}</span> rounds.
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col gap-2.5 w-full max-w-[240px]"
                        >
"""
content = content.replace(old_game_over.strip(), new_game_over.strip())

# Need to close AnimatePresence and motion.div properly
old_end = """
                            </div>
                        </div>
                    </div>
                )}
            </div>
"""

new_end = """
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                </AnimatePresence>
            </motion.div>
"""
content = content.replace(old_end.strip(), new_end.strip())

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
