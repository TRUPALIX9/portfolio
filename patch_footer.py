import re

with open('src/components/Footer.tsx', 'r') as f:
    content = f.read()

old_logo = """                        <Link 
                            href="/" 
                            onClick={(e) => {
                                if (window.location.pathname === '/') {
                                    e.preventDefault();
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', textDecoration: 'none', color: '#fff' }}
                        >
                            <Image src="/favicon.svg" alt="Logo" width={26} height={26} style={{ objectFit: 'contain' }} />
                            <span>TRUPAL PATEL<span style={{ color: 'var(--accent-primary)' }}>.</span></span>
                        </Link>"""
new_logo = """                        <a 
                            href="/" 
                            onClick={(e) => {
                                if (window.location.pathname === '/') {
                                    e.preventDefault();
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', textDecoration: 'none', color: '#fff' }}
                        >
                            <Image src="/favicon.svg" alt="Logo" width={26} height={26} style={{ objectFit: 'contain' }} className="animate-[spin_8s_linear_infinite]" />
                            <span>TRUPAL PATEL<span style={{ color: 'var(--accent-primary)' }}>.</span></span>
                        </a>"""
content = content.replace(old_logo, new_logo)

with open('src/components/Footer.tsx', 'w') as f:
    f.write(content)
