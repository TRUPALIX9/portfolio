import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

old_btn = """
            <button
              type="button"
              onClick={() => scrollToSection('hero')}
              style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit' }}
            >
              TRUPAL PATEL<span style={{ color: 'var(--accent-primary)' }}>.</span>
            </button>
"""

new_btn = """
            <button
              type="button"
              onClick={() => scrollToSection('hero')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit' }}
            >
              <Image src="/favicon.svg" alt="Logo" width={28} height={28} priority style={{ objectFit: 'contain' }} />
              <span>TRUPAL PATEL<span style={{ color: 'var(--accent-primary)' }}>.</span></span>
            </button>
"""

content = content.replace(old_btn.strip(), new_btn.strip())

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
