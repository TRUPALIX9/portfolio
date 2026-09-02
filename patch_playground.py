import re

with open('src/app/playground/page.tsx', 'r') as f:
    content = f.read()

old_btn = """                    <Link
                        href="/"
                        style={{
                            padding: "0.8rem 1rem",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.14)",
                            color: "#e2e8f0",
                            fontWeight: 800,
                            textDecoration: "none",
                            background: "rgba(255,255,255,0.04)",
                        }}
                    >
                        Back to Website
                    </Link>"""
new_btn = """                    <a
                        href="/"
                        style={{
                            padding: "0.8rem 1rem",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.14)",
                            color: "#e2e8f0",
                            fontWeight: 800,
                            textDecoration: "none",
                            background: "rgba(255,255,255,0.04)",
                        }}
                    >
                        Back to Website
                    </a>"""
content = content.replace(old_btn, new_btn)

with open('src/app/playground/page.tsx', 'w') as f:
    f.write(content)
