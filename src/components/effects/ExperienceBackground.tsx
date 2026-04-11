"use client";
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useMousePosition } from '../../hooks/useMousePosition';

function FloatingCubes() {
    const groupRef = useRef<THREE.Group>(null);
    const mouse = useMousePosition();

    // Create random cubes
    const cubes = useMemo(() => {
        return new Array(40).fill(0).map(() => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40
            ),
            rotation: new THREE.Euler(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            ),
            scale: Math.random() * 2 + 0.5
        }));
    }, []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Base group rotation
        groupRef.current.rotation.x -= delta * 0.03;
        groupRef.current.rotation.y -= delta * 0.05;

        // Interactive tilt
        groupRef.current.position.x += (mouse.current.x * 3 - groupRef.current.position.x) * 0.1;
        groupRef.current.position.y += (mouse.current.y * 3 - groupRef.current.position.y) * 0.1;

        // Rotate individual cubes inside group
        groupRef.current.children.forEach((mesh) => {
            mesh.rotation.x += delta * 0.5;
            mesh.rotation.y += delta * 0.5;
        });
    });

    return (
        <group ref={groupRef}>
            {cubes.map((cube, i) => (
                <mesh key={i} position={cube.position} rotation={cube.rotation} scale={cube.scale}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial
                        color={i % 2 === 0 ? "#ef4444" : "#eab308"}
                        transparent
                        wireframe
                        opacity={0.3}
                    />
                </mesh>
            ))}
        </group>
    );
}

export default function ExperienceBackground() {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
            <Canvas camera={{ position: [0, 0, 30] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <FloatingCubes />
            </Canvas>
        </div>
    );
}
