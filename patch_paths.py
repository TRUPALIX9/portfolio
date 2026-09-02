import re

with open('src/components/space/SpaceScene.tsx', 'r') as f:
    content = f.read()

presets_logic = """
const PATH_PRESETS = [
    { rx: 200, ry: 100, frx: 0.002, fry: 0.003, phx: 0, phy: Math.PI / 2 }, // Winding snake
    { rx: -250, ry: -150, frx: 0.0015, fry: 0.002, phx: Math.PI, phy: 0 }, // Wide left sweep
    { rx: 150, ry: -200, frx: 0.003, fry: 0.0015, phx: Math.PI / 4, phy: Math.PI }, // Corkscrew right
    { rx: -100, ry: 250, frx: 0.0025, fry: 0.0025, phx: 0, phy: Math.PI / 4 }, // Vertical drop curl
    { rx: 300, ry: 50, frx: 0.0015, fry: 0.004, phx: Math.PI / 2, phy: Math.PI * 1.5 } // Aggressive horizontal slalom
];

function CameraRig() {
"""

content = content.replace("function CameraRig() {", presets_logic.strip())

seed_logic = """
    const pathSeed = useRef(PATH_PRESETS[Math.floor(Math.random() * 5)]);
"""

content = re.sub(
    r'const pathSeed = useRef\(\{[\s\S]*?phy: Math.random\(\) \* Math.PI \* 2,\n\s*\}\);',
    seed_logic.strip(),
    content
)

with open('src/components/space/SpaceScene.tsx', 'w') as f:
    f.write(content)

with open('src/components/space/StarField.tsx', 'r') as f:
    star_content = f.read()

star_content = star_content.replace('* 4000; // X', '* 2000; // X')
star_content = star_content.replace('* 4000; // Y', '* 2000; // Y')
star_content = star_content.replace('* 4000; // Z', '* 2000; // Z')

with open('src/components/space/StarField.tsx', 'w') as f:
    f.write(star_content)

