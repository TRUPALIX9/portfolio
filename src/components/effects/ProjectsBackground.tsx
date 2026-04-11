"use client";
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useMousePosition } from '../../hooks/useMousePosition';

function RipplingGrid() {
    const meshRef = useRef<THREE.Mesh>(null);
    const mouse = useMousePosition();

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();

        const geometry = meshRef.current.geometry;
        const positionAttribute = geometry.attributes.position;

        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);

            // Add a wave effect based on time
            let z = Math.sin(x * 0.5 + time) * 1.5 + Math.cos(y * 0.5 + time) * 1.5;

            // Add interactivity: repel points from mouse X/Y slightly
            const distX = x - (mouse.current.x * 20);
            const distY = y - (mouse.current.y * 20);
            const dist = Math.sqrt(distX * distX + distY * distY);
            if (dist < 5) {
                z += (5 - dist) * 2;
            }

            positionAttribute.setZ(i, z);
        }

        geometry.computeVertexNormals();
        positionAttribute.needsUpdate = true;

        // Slight tilt based on mouse mapping
        meshRef.current.rotation.x = -Math.PI / 3 + (mouse.current.y * 0.1);
        meshRef.current.rotation.y = (mouse.current.x * 0.1);
    });

    return (
        <mesh ref={meshRef} position={[0, -5, -10]}>
            <planeGeometry args={[60, 60, 30, 30]} />
            <meshStandardMaterial
                color="#6366f1"
                wireframe={true}
                transparent
                opacity={0.2}
            />
        </mesh>
    );
}

export default function ProjectsBackground() {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
            <Canvas camera={{ position: [0, 0, 30] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <RipplingGrid />
            </Canvas>
        </div>
    );
}
