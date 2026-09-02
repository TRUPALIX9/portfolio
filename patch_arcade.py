import re

with open('src/components/MemoryArcade.tsx', 'r') as f:
    content = f.read()

# Replace the right side motion.div with a wrapper div containing both panels
old_right_side = """
                {/* Leaderboard panel: Right Side */}
                <motion.div
                    initial={{ opacity: 0, x: reduceMotion ? 0 : 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.14 }}
                    className="bg-neutral-900/[0.25] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl sticky top-24"
                >
"""

new_right_side = """
                {/* Right Side Column */}
                <div className="flex flex-col gap-6 sticky top-24">
                    {/* Leaderboard panel */}
                    <motion.div
                        initial={{ opacity: 0, x: reduceMotion ? 0 : 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.14 }}
                        className="bg-neutral-900/[0.25] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl"
                    >
"""

content = content.replace(old_right_side.strip(), new_right_side.strip())

# Find the end of the leaderboard panel and insert the How to Play panel
old_end = """
                        </div>
                    )}
                </motion.div>
            </div>
"""

new_end = """
                        </div>
                    )}
                    </motion.div>

                    {/* How To Play Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: reduceMotion ? 0 : 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-neutral-900/[0.25] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 shadow-2xl flex flex-col gap-3"
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm">
                                🧠
                            </div>
                            <h2 className="text-base font-bold text-white tracking-wide">How to Play</h2>
                        </div>
                        <ul className="text-neutral-400 text-[0.8rem] space-y-2 leading-relaxed ml-1">
                            <li><strong className="text-white">1.</strong> Watch the tiles flash in order.</li>
                            <li><strong className="text-white">2.</strong> Wait for the "YOUR TURN" signal.</li>
                            <li><strong className="text-white">3.</strong> Tap the tiles in the exact same sequence.</li>
                        </ul>
                        <div className="mt-2 pt-3 border-t border-white/5 text-[0.7rem] text-emerald-400/80 font-medium italic">
                            Tip: This is a tapping game, not a swipe-to-unlock screen!
                        </div>
                    </motion.div>
                </div>
            </div>
"""

content = content.replace(old_end.strip(), new_end.strip())

with open('src/components/MemoryArcade.tsx', 'w') as f:
    f.write(content)
