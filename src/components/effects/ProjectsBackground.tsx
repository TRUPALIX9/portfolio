"use client";
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { useMousePosition } from '../../hooks/useMousePosition';

const BASE_TILT = -Math.PI / 3;

function RipplingGrid({ animate }: { animate: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const mouse = useMousePosition();

    useFrame((state) => {
        if (!meshRef.current || !animate) return;
        const time = state.clock.getElapsedTime();

        const geometry = meshRef.current.geometry;
        const positionAttribute = geometry.attributes.position;

        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);

            // Slow, low-amplitude swell — ambient texture, not a focal point
            let z = Math.sin(x * 0.5 + time * 0.6) * 1.2 + Math.cos(y * 0.5 + time * 0.6) * 1.2;

            // Interactivity: lift points gently near the cursor
            const distX = x - (mouse.current.x * 20);
            const distY = y - (mouse.current.y * 20);
            const dist = Math.sqrt(distX * distX + distY * distY);
            if (dist < 5) {
                z += (5 - dist) * 1.5;
            }

            positionAttribute.setZ(i, z);
        }

        // Basic material ignores lighting, so no per-frame normal recomputation is needed.
        positionAttribute.needsUpdate = true;

        // Slight tilt based on mouse mapping
        meshRef.current.rotation.x = BASE_TILT + (mouse.current.y * 0.1);
        meshRef.current.rotation.y = (mouse.current.x * 0.1);
    });

    return (
        <mesh ref={meshRef} position={[0, -5, -10]} rotation={[BASE_TILT, 0, 0]}>
            <planeGeometry args={[60, 60, 30, 30]} />
            {/* Brand green at low opacity so the grid sits well behind the cards */}
            <meshBasicMaterial color="#4ADE80" wireframe transparent opacity={0.1} />
        </mesh>
    );
}

export default function ProjectsBackground() {
    const reduceMotion = useReducedMotion();

    return (
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
            <Canvas
                camera={{ position: [0, 0, 30] }}
                dpr={[1, 1.5]}
                // Reduced motion: render one static frame instead of a continuous loop
                frameloop={reduceMotion ? 'demand' : 'always'}
            >
                <RipplingGrid animate={!reduceMotion} />
            </Canvas>
            {/* Vignette: fades the grid out toward the edges and under the header copy */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse 85% 65% at 50% 70%, transparent 0%, rgba(0,0,0,0.6) 70%, #000 100%)',
                }}
            />
        </div>
    );
}
