import re

with open('src/components/MemoryArcade.tsx', 'r') as f:
    content = f.read()

goal_block = r'<div className="bg-white\/5 border border-white\/10 rounded-2xl p-5 mb-8 md:mb-10 text-left">[\s\S]*?<\/div>'

content = re.sub(goal_block, '', content)

with open('src/components/MemoryArcade.tsx', 'w') as f:
    f.write(content)
