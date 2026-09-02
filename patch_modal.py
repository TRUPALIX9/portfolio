import re

with open('src/components/MemoryArcade.tsx', 'r') as f:
    content = f.read()

old_modal = """
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
"""

new_modal = """
                            <h3 className="text-xl font-extrabold text-white mb-6">How to Play</h3>
                            
                            <div className="flex flex-col gap-4 text-sm text-neutral-300 text-left mb-6">
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs mt-0.5">1</span>
                                    <p>Watch the tiles flash in a specific order.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs mt-0.5">2</span>
                                    <p>Wait for the game board to glow <b className="text-emerald-400">GREEN</b>.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs mt-0.5">3</span>
                                    <p>Tap the tiles in the <b>exact same sequence</b>.</p>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 mb-8 text-left">
                                <p className="text-white/70 text-[0.75rem] font-medium leading-relaxed">
                                    <b className="text-white">Goal:</b> Each successful round adds one more tile to the sequence. One wrong tap, and it's over!
                                </p>
                            </div>

                            <button 
                                onClick={() => setShowHelp(false)}
                                className="w-full h-12 bg-white hover:bg-neutral-200 text-black font-black tracking-widest rounded-xl transition-colors"
                            >
                                GOT IT
                            </button>
"""

content = content.replace(old_modal.strip(), new_modal.strip())

with open('src/components/MemoryArcade.tsx', 'w') as f:
    f.write(content)
