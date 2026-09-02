import re

with open('src/components/ContactSection.tsx', 'r') as f:
    content = f.read()

# Update Form Container
old_form = 'className="w-full h-auto bg-neutral-900/[0.25] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 md:p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden"'
new_form = 'className="w-full h-auto bg-neutral-900/[0.25] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 md:p-10 flex flex-col gap-6 md:gap-8 shadow-2xl relative overflow-hidden"'
content = content.replace(old_form, new_form)

# Update Textarea height
old_textarea = 'className={`w-full h-32 rounded-xl border bg-black/40 text-white p-4 text-sm outline-none resize-none transition-all duration-300 shrink-0 ${'
new_textarea = 'className={`w-full h-40 md:h-48 rounded-xl border bg-black/40 text-white p-4 text-sm outline-none resize-none transition-all duration-300 shrink-0 ${'
content = content.replace(old_textarea, new_textarea)

with open('src/components/ContactSection.tsx', 'w') as f:
    f.write(content)

