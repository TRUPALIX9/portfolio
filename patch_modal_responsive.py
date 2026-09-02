import re

with open('src/components/MemoryArcade.tsx', 'r') as f:
    content = f.read()

old_modal = r'<motion\.div\s*initial=\{\{ scale: 0\.95, opacity: 0, y: 20 \}\}[\s\S]*?<\/motion\.div>\s*<\/motion\.div>'

new_modal = """
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-neutral-900 border border-white/10 rounded-[2rem] p-7 md:p-10 max-w-md w-full shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setShowHelp(false)}
                                className="absolute top-5 right-5 md:top-6 md:right-6 w-9 h-9 flex items-center justify-center text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                ✕
                            </button>
                            
                            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-6 md:mb-8 text-left">How to Play</h3>
                            
                            <div className="flex flex-col gap-5 md:gap-6 text-[0.95rem] md:text-base text-neutral-300 text-left mb-8 md:mb-10">
                                <div className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm md:text-base mt-0.5 md:mt-0">1</span>
                                    <p className="leading-relaxed">Watch the tiles flash in a specific order.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm md:text-base mt-0.5 md:mt-0">2</span>
                                    <p className="leading-relaxed">Wait for the game board to glow <b className="text-emerald-400">GREEN</b>.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm md:text-base mt-0.5 md:mt-0">3</span>
                                    <p className="leading-relaxed">Tap the tiles in the <b>exact same sequence</b>.</p>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 md:mb-10 text-left">
                                <p className="text-white/80 text-[0.85rem] md:text-sm font-medium leading-relaxed">
                                    <b className="text-white">Goal:</b> Each successful round adds one more tile to the sequence. One wrong tap, and it's over!
                                </p>
                            </div>

                            <button 
                                onClick={() => setShowHelp(false)}
                                className="w-full h-14 bg-white hover:bg-neutral-200 text-black font-black text-sm md:text-base tracking-widest rounded-xl transition-colors"
                            >
                                GOT IT
                            </button>
                        </motion.div>
                    </motion.div>
"""

content = re.sub(old_modal, new_modal.strip(), content)

with open('src/components/MemoryArcade.tsx', 'w') as f:
    f.write(content)
