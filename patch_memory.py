import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

# Change TILE_COUNT
content = content.replace('const TILE_COUNT = 9;', 'const TILE_COUNT = 4;')

# Import HelpCircle and AnimatePresence if not present
if 'import { HelpCircle }' not in content:
    content = content.replace("import { useState, useRef, useEffect } from 'react';", "import { useState, useRef, useEffect } from 'react';\nimport { HelpCircle } from 'lucide-react';\nimport { AnimatePresence, motion } from 'framer-motion';")
    
# Add showHelp state
if 'const [showHelp, setShowHelp]' not in content:
    content = content.replace('const [nameError, setNameError] = useState(false);', 'const [nameError, setNameError] = useState(false);\n    const [showHelp, setShowHelp] = useState(false);')

# Update HUD Status Bar to include Help icon
old_hud = """
            {/* HUD Status Bar */}
            <div className="flex justify-between items-center gap-4 border-b border-white/5 pb-4">
"""
new_hud = """
            {/* HUD Status Bar */}
            <div className="flex justify-between items-center gap-4 border-b border-white/5 pb-4 relative">
                <button 
                    onClick={() => setShowHelp(true)}
                    className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors z-20"
                    title="How to Play"
                >
                    <HelpCircle size={14} />
                </button>
"""
content = content.replace(old_hud.strip(), new_hud.strip())

# Add How To Play Modal right before the end of the main div
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
                                2. Wait for the <b>"YOUR TURN"</b> signal.<br/>
                                3. Tap the tiles in the <b>exact same sequence</b>.<br/>
                                4. Each successful round adds one more tile to the sequence!<br/><br/>
                                <i>Tip: It's a tapping game, not a swipe-to-unlock!</i>
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

# Fix grid layout and inner dot
old_grid = """
                {/* 3x3 Tile Grid */}
                <div className="grid grid-cols-3 gap-2 md:gap-3 w-full h-full max-w-[280px] max-h-[280px]">
"""
new_grid = """
                {/* 2x2 Tile Grid */}
                <div className="grid grid-cols-2 gap-4 md:gap-6 w-full h-full max-w-[320px] max-h-[320px]">
"""
content = content.replace(old_grid.strip(), new_grid.strip())

old_tile = """
                            >
                                <div className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full transition-all duration-150 ${isActive ? 'bg-black scale-110 shadow-[0_0_10px_rgba(0,0,0,0.5)]' : 'bg-white/10'}`} />
                            </button>
"""
new_tile = """
                            >
                            </button>
"""
content = content.replace(old_tile.strip(), new_tile.strip())

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)


with open('src/components/MemoryArcade.tsx', 'r') as f:
    arcade = f.read()

arcade = arcade.replace('className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start relative z-10"', 'className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 items-start relative z-10"')
with open('src/components/MemoryArcade.tsx', 'w') as f:
    f.write(arcade)

