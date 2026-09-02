import re

with open('src/components/ContactSection.tsx', 'r') as f:
    content = f.read()

# Make the form header text-center
old_header = """                        <div className="flex flex-col gap-1.5 relative z-10 shrink-0">
                            <h3 className="text-lg font-bold text-white tracking-wide">
                                Send a Message
                            </h3>
                            <p className="text-neutral-400 text-sm font-light">
                                Fill out the form below for instant dispatch.
                            </p>
                        </div>"""

new_header = """                        <div className="flex flex-col gap-1.5 relative z-10 shrink-0 text-center">
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-wide">
                                Send a Message
                            </h3>
                            <p className="text-neutral-400 text-sm md:text-base font-light">
                                Fill out the form below for instant dispatch.
                            </p>
                        </div>"""
content = content.replace(old_header, new_header)

with open('src/components/ContactSection.tsx', 'w') as f:
    f.write(content)
