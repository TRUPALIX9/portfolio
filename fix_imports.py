with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'import { useRouter } from \'next/navigation\';',
    'import { useRouter } from \'next/navigation\';\nimport { HelpCircle } from \'lucide-react\';\nimport { AnimatePresence, motion } from \'framer-motion\';'
)

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
