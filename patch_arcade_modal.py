import re

with open('src/components/MemoryArcade.tsx', 'r') as f:
    content = f.read()

# 1. Add showHelp state
content = content.replace(
    "const [isLoadingBoard, setIsLoadingBoard] = useState(true);",
    "const [isLoadingBoard, setIsLoadingBoard] = useState(true);\n    const [showHelp, setShowHelp] = useState(false);"
)

# 2. Replace the static How To Play panel with a button
old_panel = """
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
"""

new_btn = """
                    {/* How To Play Button */}
                    <motion.button
                        initial={{ opacity: 0, x: reduceMotion ? 0 : 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        onClick={() => setShowHelp(true)}
                        className="bg-neutral-900/[0.25] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 shadow-2xl flex items-center justify-between hover:bg-white/[0.05] transition-colors w-full text-left cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm">
                                🧠
                            </div>
                            <span className="text-sm font-bold text-white tracking-wide">How to play?</span>
                        </div>
                        <span className="text-white/50">→</span>
                    </motion.button>
"""
content = content.replace(old_panel.strip(), new_btn.strip())

# 3. Add Modal to the bottom
modal_html = """
            {/* HOW TO PLAY MODAL */}
            <AnimatePresence>
                {showHelp && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowHelp(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-neutral-900 border border-white/10 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setShowHelp(false)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white bg-white/5 rounded-full"
                            >
                                ✕
                            </button>
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl mb-4">
                                🧠
                            </div>
                            <h3 className="text-xl font-extrabold text-white mb-2">How to Play</h3>
                            <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                                1. Watch the tiles flash in a specific order.<br/>
                                2. Wait for the <b>GREEN BORDER</b> signal.<br/>
                                3. Tap the tiles in the <b>exact same sequence</b>.<br/>
                                4. Each successful round adds one more tile to the sequence!
                            </p>
                            <button 
                                onClick={() => setShowHelp(false)}
                                className="w-full h-12 bg-white text-black font-bold rounded-xl"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
"""
content = content.replace("</div>\n    );\n}", modal_html.strip() + "\n    );\n}")

with open('src/components/MemoryArcade.tsx', 'w') as f:
    f.write(content)

