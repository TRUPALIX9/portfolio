import re

with open('src/components/HeroSection.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { useState, useRef, useEffect } from 'react';", "import { useState, useRef, useEffect, useMemo } from 'react';")

with open('src/components/HeroSection.tsx', 'w') as f:
    f.write(content)
