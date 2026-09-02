import re

with open('src/components/games/MemoryGame.tsx', 'r') as f:
    content = f.read()

content = content.replace("const [round, setRound] = useState(1);", "")
content = content.replace("setRound(nextSequence.length);", "")
content = content.replace("setRound(1);", "")

with open('src/components/games/MemoryGame.tsx', 'w') as f:
    f.write(content)
