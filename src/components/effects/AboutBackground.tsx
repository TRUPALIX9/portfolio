"use client";
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useMousePosition } from '../../hooks/useMousePosition';

function FloatingKnot() {
    const meshRef = useRef<THREE.Mesh>(null);
    const mouse = useMousePosition();

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Base idle rotation
        meshRef.current.rotation.x += delta * 0.2;
        meshRef.current.rotation.y += delta * 0.3;

        // Interactive Mouse Follow mapped to position
        const targetX = mouse.current.x * 2;
        const targetY = mouse.current.y * 2;

        meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.1;
        meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;
    });

    return (
        <mesh ref={meshRef}>
            <torusKnotGeometry args={[9, 1.5, 128, 32]} />
            <meshStandardMaterial
                color="#10b981"
                wireframe={true}
                transparent
                opacity={0.15}
            />
        </mesh>
    );
}

export default function AboutBackground() {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
            <Canvas camera={{ position: [0, 0, 30] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <FloatingKnot />
            </Canvas>
        </div>
    );
}
