import re

with open('src/components/MemoryArcade.tsx', 'r') as f:
    content = f.read()

old_btn = """
                    {/* How To Play Button */}
                    <motion.button
                        initial={{ opacity: 0, x: reduceMotion ? 0 : 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        onClick={() => setShowHelp(true)}
                        className="bg-neutral-900/[0.25] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 shadow-2xl flex items-center justify-between hover:bg-white/[0.05] transition-colors w-full text-left cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-white tracking-wide">How to play?</span>
                        </div>
                        <span className="text-white/50">→</span>
                    </motion.button>
"""

new_btn = """
                    {/* How To Play Button */}
                    <motion.button
                        initial={{ opacity: 0, x: reduceMotion ? 0 : 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        onClick={() => setShowHelp(true)}
                        className="bg-white rounded-2xl p-4 md:p-5 shadow-xl flex items-center justify-between hover:bg-neutral-200 transition-colors w-full text-left cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm md:text-base font-black text-black tracking-widest uppercase">How to play?</span>
                        </div>
                        <span className="text-black/40 group-hover:text-black/80 group-hover:translate-x-1 transition-all font-bold">→</span>
                    </motion.button>
"""

content = content.replace(old_btn.strip(), new_btn.strip())

with open('src/components/MemoryArcade.tsx', 'w') as f:
    f.write(content)
