"use client";
import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useMousePosition } from '../hooks/useMousePosition';
import Link from 'next/link';

function StarBackground(props: any) {
    const ref = useRef<THREE.Points>(null!);
    const mouse = useMousePosition();

    // Generate random points in a sphere
    const sphere = useMemo(() => {
        const pointCount = 1500;
        const points = new Float32Array(pointCount * 3);
        for (let i = 0; i < pointCount * 3; i += 3) {
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const r = Math.cbrt(Math.random()) * 1.5;
            points[i] = r * Math.sin(phi) * Math.cos(theta);
            points[i + 1] = r * Math.sin(phi) * Math.sin(theta);
            points[i + 2] = r * Math.cos(phi);
        }
        return points;
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;

            // Add interactive mouse follow
            const targetX = mouse.current.x * 0.4;
            const targetY = mouse.current.y * 0.4;

            ref.current.position.x += (targetX - ref.current.position.x) * 0.1;
            ref.current.position.y += (targetY - ref.current.position.y) * 0.1;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial transparent color="#4ade80" size={0.005} sizeAttenuation={true} depthWrite={false} />
            </Points>
        </group>
    );
}

export default function HeroSection() {
    return (
        <section className="section" style={{ position: 'relative', padding: 0, justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <Canvas camera={{ position: [0, 0, 1] }}>
                    <StarBackground />
                </Canvas>
            </div>

            <div className="container" style={{ position: 'relative', zIndex: 10, pointerEvents: 'none' }}>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{ pointerEvents: 'auto' }}
                >
                    <div style={{ display: 'inline-block', padding: '0.5rem 1.25rem', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', borderRadius: '9999px', marginBottom: '2rem', color: 'var(--accent-primary)', fontWeight: 500, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Available for new opportunities
                    </div>
                    <h1 className="heading-xl" style={{ marginBottom: '1.5rem' }}>
                        Building digital <br />
                        experiences that <br />
                        <span className="gradient-text">leave a mark.</span>
                    </h1>
                    <p className="text-body" style={{ maxWidth: '600px', marginBottom: '3rem', fontSize: '1.25rem' }}>
                        Hi, I'm Trupal Patel. A Full-Stack Software Engineer specializing in building scalable SaaS platforms, real-time systems, and AI-enabled applications.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link href="/projects" className="btn-primary">View My Work</Link>
                        <Link href="/resume" className="btn-outline">View Resume</Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
