import re

with open('src/components/MemoryArcade.tsx', 'r') as f:
    content = f.read()

# 1. Remove the Close X button
close_btn_regex = r'<button[\s\S]*?✕\s*<\/button>'
content = re.sub(close_btn_regex, '', content)

# 2. Change modal container from w-full max-w-md to w-full sm:w-auto
old_container = 'className="bg-neutral-900 border border-white/10 rounded-[2rem] p-7 md:p-10 max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl relative custom-scrollbar"'
new_container = 'className="bg-neutral-900 border border-white/10 rounded-[2rem] p-7 md:p-10 max-w-[360px] w-full max-h-[85vh] overflow-y-auto shadow-2xl relative custom-scrollbar mx-auto"'
content = content.replace(old_container, new_container)

# 3. Center the header
old_header = 'className="text-2xl md:text-3xl font-extrabold text-white mb-6 md:mb-8 text-left pr-10"'
new_header = 'className="text-2xl md:text-3xl font-extrabold text-white mb-6 md:mb-8 text-center"'
content = content.replace(old_header, new_header)

with open('src/components/MemoryArcade.tsx', 'w') as f:
    f.write(content)
