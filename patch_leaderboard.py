import re

with open('src/components/MemoryArcade.tsx', 'r') as f:
    content = f.read()

# 1. Center the title
old_title = """
                    <div>
                        <span className="text-[#4ADE80] font-bold text-xs uppercase tracking-[0.2em] mb-1 block">Hall of Fame</span>
                        <h2 className="text-xl font-bold text-white tracking-wide">Global Rankings</h2>
                    </div>
"""
new_title = """
                    <div className="text-center">
                        <span className="text-[#4ADE80] font-bold text-xs uppercase tracking-[0.2em] mb-1 block">Hall of Fame</span>
                        <h2 className="text-xl font-bold text-white tracking-wide">Global Rankings</h2>
                    </div>
"""
content = content.replace(old_title.strip(), new_title.strip())

# 2. Fix the rank badge and name truncation
old_row = """
                                    <span className="text-sm font-medium tracking-wide flex gap-3 items-center text-white">
                                        <span className={`text-[0.75rem] font-black w-6 h-6 rounded-lg flex items-center justify-center bg-black/40 border ${
"""
new_row = """
                                    <span className="text-sm font-medium tracking-wide flex gap-3 items-center text-white truncate pr-4">
                                        <span className={`text-[0.75rem] font-black min-w-[28px] h-7 px-1.5 rounded-lg flex-shrink-0 flex items-center justify-center bg-black/40 border ${
"""
content = content.replace(old_row.strip(), new_row.strip())

with open('src/components/MemoryArcade.tsx', 'w') as f:
    f.write(content)
