import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

# Fix logo
content = content.replace(
    '<Link href="/" style={{ display: \'flex\', alignItems: \'center\', gap: \'12px\', fontSize: \'1.5rem\', fontWeight: 800, letterSpacing: \'-0.02em\', textDecoration: \'none\', color: \'inherit\' }}>',
    '<a href="/" style={{ display: \'flex\', alignItems: \'center\', gap: \'12px\', fontSize: \'1.5rem\', fontWeight: 800, letterSpacing: \'-0.02em\', textDecoration: \'none\', color: \'inherit\' }}>'
)
# Note: we need to replace the closing </Link> for this specifically.
old_logo_block = """            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', textDecoration: 'none', color: 'inherit' }}>
              <Image src="/favicon.svg" alt="Logo" width={28} height={28} priority style={{ objectFit: 'contain' }} />
              <span>TRUPAL PATEL<span style={{ color: 'var(--accent-primary)' }}>.</span></span>
            </Link>"""
new_logo_block = """            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', textDecoration: 'none', color: 'inherit' }}>
              <Image src="/favicon.svg" alt="Logo" width={28} height={28} priority style={{ objectFit: 'contain' }} />
              <span>TRUPAL PATEL<span style={{ color: 'var(--accent-primary)' }}>.</span></span>
            </a>"""
content = content.replace(old_logo_block, new_logo_block)

# Fix "Back to Home" button
old_back = """                <Link href="/" className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                  &larr; Back to Home
                </Link>"""
new_back = """                <a href="/" className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                  &larr; Back to Home
                </a>"""
content = content.replace(old_back, new_back)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
