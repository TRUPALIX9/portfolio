import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

old_block = """
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

new_block = """
                        <motion.h3 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                            className="text-3xl md:text-4xl font-black text-red-500 mb-6 tracking-widest uppercase drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                        >
                            Wrong
                        </motion.h3>

                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col gap-3 w-full max-w-[240px]"
                        >
"""

content = content.replace(old_block.strip(), new_block.strip())

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
