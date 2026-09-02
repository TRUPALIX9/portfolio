import re

with open('src/components/HeroSection.tsx', 'r') as f:
    content = f.read()

magnetic_effect = """
    const textLayerRef = useRef<HTMLDivElement>(null);
    const mousePos = useRef({ x: -1000, y: -1000 });
    const repelVec = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            mousePos.current.x = e.clientX;
            mousePos.current.y = e.clientY;
        };
        window.addEventListener('mousemove', handleMove, { passive: true });
        
        let frameId: number;
        const loop = () => {
            if (textLayerRef.current) {
                // Diminish repel effect completely after scrolling 200px
                const scrollFactor = Math.max(0, 1 - (window.scrollY / 200));
                
                if (scrollFactor > 0) {
                    const rect = textLayerRef.current.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const dx = centerX - mousePos.current.x;
                    const dy = centerY - mousePos.current.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    const maxDist = 300; // Repel radius
                    if (dist < maxDist) {
                        const force = Math.pow((maxDist - dist) / maxDist, 2); // Non-linear force
                        const angle = Math.atan2(dy, dx);
                        const targetX = Math.cos(angle) * force * 100 * scrollFactor;
                        const targetY = Math.sin(angle) * force * 100 * scrollFactor;
                        repelVec.current.x += (targetX - repelVec.current.x) * 0.15;
                        repelVec.current.y += (targetY - repelVec.current.y) * 0.15;
                    } else {
                        repelVec.current.x += (0 - repelVec.current.x) * 0.1;
                        repelVec.current.y += (0 - repelVec.current.y) * 0.1;
                    }
                } else {
                    repelVec.current.x += (0 - repelVec.current.x) * 0.2;
                    repelVec.current.y += (0 - repelVec.current.y) * 0.2;
                }
                
                textLayerRef.current.style.transform = `translate(${repelVec.current.x}px, ${repelVec.current.y}px)`;
            }
            frameId = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            window.removeEventListener('mousemove', handleMove);
            cancelAnimationFrame(frameId);
        };
    }, []);

    // ── Timing map
"""

content = re.sub(
    r'// ── Timing map',
    magnetic_effect.strip(),
    content
)

# Attach ref to the question block
content = content.replace(
    "<div style={{ position: 'relative' }}>",
    "<div ref={textLayerRef} style={{ position: 'relative', willChange: 'transform' }}>"
)

with open('src/components/HeroSection.tsx', 'w') as f:
    f.write(content)
