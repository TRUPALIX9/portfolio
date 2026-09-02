import re

with open('src/components/HeroSection.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "height: '400vh'",
    "height: '700vh'"
)
content = content.replace(
    "{/* 400vh spacer */}",
    "{/* 700vh spacer */}"
)

with open('src/components/HeroSection.tsx', 'w') as f:
    f.write(content)
