import re

with open('src/components/Footer.tsx', 'r') as f:
    content = f.read()

# Add Image import if needed
if 'import Image from "next/image";' not in content:
    content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport Image from 'next/image';")

old_link = """
                        <Link 
                            href="/" 
                            onClick={handleSecretClick}
                            onPointerDown={handlePointerDown}
                            onPointerUp={handlePointerUpOrLeave}
                            onPointerLeave={handlePointerUpOrLeave}
                            onContextMenu={(e) => { e.preventDefault(); }} // Prevent mobile context menu from breaking hold
                            style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', textDecoration: 'none', color: '#fff' }}
                        >
                            TRUPAL PATEL<span style={{ color: 'var(--accent-primary)' }}>.</span>
                        </Link>
"""

new_link = """
                        <Link 
                            href="/" 
                            onClick={handleSecretClick}
                            onPointerDown={handlePointerDown}
                            onPointerUp={handlePointerUpOrLeave}
                            onPointerLeave={handlePointerUpOrLeave}
                            onContextMenu={(e) => { e.preventDefault(); }} // Prevent mobile context menu from breaking hold
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', textDecoration: 'none', color: '#fff' }}
                        >
                            <Image src="/favicon.svg" alt="Logo" width={26} height={26} style={{ objectFit: 'contain' }} />
                            <span>TRUPAL PATEL<span style={{ color: 'var(--accent-primary)' }}>.</span></span>
                        </Link>
"""
content = content.replace(old_link.strip(), new_link.strip())

with open('src/components/Footer.tsx', 'w') as f:
    f.write(content)
