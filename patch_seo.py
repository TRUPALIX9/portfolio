import re

with open('src/app/layout.tsx', 'r') as f:
    content = f.read()

# Update title to include Trupal Patel
content = re.sub(
    r"title: 'True Pal',",
    "title: 'Trupal Patel (True Pal) | Software Engineer',",
    content
)

# Update keywords to include TrupalIX9
content = re.sub(
    r"keywords: 'True Pal, TruePal, Trupal Patel,",
    "keywords: 'Trupal Patel, True Pal, TruePal, TrupalIX9, Trupal Patel Portfolio,",
    content
)

with open('src/app/layout.tsx', 'w') as f:
    f.write(content)
