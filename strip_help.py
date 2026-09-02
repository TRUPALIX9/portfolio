import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

# Strip state
content = content.replace("const [showHelp, setShowHelp] = useState(false);", "")

# Strip HUD button
hud_pattern = r'<button\s*onClick=\{[^}]*\}\s*className="absolute[^"]*"\s*title="How to Play"\s*>\s*<HelpCircle size=\{14\} />\s*</button>'
content = re.sub(hud_pattern, '', content)

# Remove relative from HUD container if it exists
content = content.replace('pb-4 relative"', 'pb-4"')

# Strip modal
modal_pattern = r'\{\/\* HOW TO PLAY MODAL \*\/\}[\s\S]*?<\/AnimatePresence>'
content = re.sub(modal_pattern, '', content)

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
