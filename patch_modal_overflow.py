import re

with open('src/components/MemoryArcade.tsx', 'r') as f:
    content = f.read()

old_wrapper = 'className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"'
new_wrapper = 'className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"'
content = content.replace(old_wrapper, new_wrapper)

old_modal = 'className="bg-neutral-900 border border-white/10 rounded-[2rem] p-7 md:p-10 max-w-md w-full shadow-2xl relative"'
new_modal = 'className="bg-neutral-900 border border-white/10 rounded-[2rem] p-7 md:p-10 max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl relative custom-scrollbar"'
content = content.replace(old_modal, new_modal)

old_title = 'className="text-2xl md:text-3xl font-extrabold text-white mb-6 md:mb-8 text-left"'
new_title = 'className="text-2xl md:text-3xl font-extrabold text-white mb-6 md:mb-8 text-left pr-10"'
content = content.replace(old_title, new_title)

with open('src/components/MemoryArcade.tsx', 'w') as f:
    f.write(content)
