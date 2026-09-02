import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function StarField({ count = 6000 }) {
    const pointsRef = useRef<THREE.Points>(null);
    const depth = 600; 

    // Generate initial star positions
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 4000; // X
            pos[i * 3 + 1] = (Math.random() - 0.5) * 4000; // Y
            pos[i * 3 + 2] = (Math.random() - 0.5) * 4000; // Z
        }
        return pos;
    }, [count]);

    useFrame((state, delta) => {
        if (!pointsRef.current) return;
        // Gentle rotation for the entire galaxy
        pointsRef.current.rotation.y += delta * 0.02;
        pointsRef.current.rotation.x += delta * 0.01;
    });

    const vertexShader = `
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            // Even smaller stars
            gl_PointSize = (9.0 * (300.0 / -mvPosition.z));
            gl_Position = projectionMatrix * mvPosition;
        }
    `;

    const fragmentShader = `
        void main() {
            // Extremely cheap distance falloff without using discard or smoothstep
            // Discard destroys early-Z hardware optimizations on the GPU
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            float r = dot(cxy, cxy);
            
            // Fast fading alpha for soft square (looks like circle at small sizes)
            float alpha = max(0.0, 1.0 - r);
            gl_FragColor = vec4(1.0, 1.0, 1.0, alpha); 
        }
    `;

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
