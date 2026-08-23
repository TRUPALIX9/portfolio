"use client";

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const SpaceScene = dynamic(() => import('./space/SpaceScene'), { ssr: false });

interface HeroSectionProps {
    onScrollNext?: () => void;
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
}
function remap(v: number, inMin: number, inMax: number) {
    return Math.max(0, Math.min(1, (v - inMin) / (inMax - inMin)));
}

const CHARS = "!<>-_\\/[]{}—=+*^?#_";

function ScrambleChar({ fromChar, toChar, progress }: {
    fromChar: string; toChar: string; progress: number;
}) {
    if (progress <= 0) return <span>{fromChar}</span>;
    if (progress >= 1) return <span>{toChar}</span>;
    const scrambled = CHARS[Math.floor((Date.now() / 60 + progress * 100) % CHARS.length)];
    return <span style={{ color: '#4ADE80', filter: 'drop-shadow(0 0 8px rgba(74,222,128,0.8))' }}>{scrambled}</span>;
}

function AnimatedWord({ from, to, progress }: { from: string; to: string; progress: number }) {
    const len = Math.max(from.length, to.length);
    return (
        <>
            {Array.from({ length: len }).map((_, i) => {
                const cp = remap(progress, (i / len) * 0.5, (i / len) * 0.5 + 0.6);
                return <ScrambleChar key={i} fromChar={from[i] ?? ''} toChar={to[i] ?? ''} progress={cp} />;
            })}
        </>
    );
}

export default function HeroSection({ onScrollNext: _onScrollNext }: HeroSectionProps) {
    const sectionRef            = useRef<HTMLDivElement>(null);
    const [p, setP]             = useState(0);
    const [show, setShow]       = useState(true);
    const [entered, setEntered] = useState(false);
    const [driftScale, setDriftScale] = useState(1);

    useEffect(() => {
        setEntered(true);
        const onScroll = () => {
            if (!sectionRef.current) return;
            const rect       = sectionRef.current.getBoundingClientRect();
            const scrollable = sectionRef.current.offsetHeight - window.innerHeight;
            const progress   = Math.max(0, Math.min(1, -rect.top / scrollable));
            setP(progress);
            setShow(rect.bottom > -80);
        };
        const onResize = () => {
            setDriftScale(window.innerWidth < 640 ? 0.45 : window.innerWidth < 1024 ? 0.75 : 1);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });
        onScroll();
        onResize();
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    // ── Timing map (spread over 400vh for a slow, hooky feel) ───────────────

    // Phase 1: name fades 0→0.05
    const nameOpacity = lerp(1, 0, remap(p, 0, 0.05));

    // Phase 2: words drift OUT then BACK IN (0.05→0.55)
    // driftArc goes 0 -> 1, so driftT goes 0 -> 1 -> 0 (sine wave)
    const driftArc = remap(p, 0.05, 0.55);
    const driftT = Math.sin(driftArc * Math.PI);

    // Phase 2 progress (0.05→0.45): controls scramble, spacing, question mark
    const progressT = remap(p, 0.05, 0.45);

    // Words drift positions
    const soDriftX  = lerp(0, -160 * driftScale, driftT);
    const soDriftY  = lerp(0, -70 * driftScale,  driftT);
    const soRotate  = lerp(0, -18,  driftT);

    const areDriftX = lerp(0,  165 * driftScale, driftT);
    const areDriftY = lerp(0,   85 * driftScale, driftT);
    const areRotate = lerp(0,   12, driftT);

    const wtfDriftY = lerp(0, -35 * driftScale, driftT);
    const wtfScale  = lerp(1, 1.06, driftT);

    const engDriftX = lerp(0, -25 * driftScale, driftT);
    const engDriftY = lerp(0,  45 * driftScale, driftT);

    const qDriftX   = lerp(0,  55 * driftScale, driftT);
    const qDriftY   = lerp(0, -65 * driftScale, driftT);
    const qRotate   = lerp(0,  25, driftT);

    // Scramble and appearance
    const ftwProgress = progressT;
    const questionOpacity = progressT;
    const questionScale   = lerp(0.3, 1, progressT);
    
    // Create spaces between SO, WTF, ARE only as we scroll
    // 0.35em creates a natural space size for large text
    const spaceOffsetEm = progressT * 0.35;

    // Phase 3: Answer appears and question yields the center (0.55→0.75)
    const answerFadeIn = remap(p, 0.55, 0.65);
    const questionPushUp = lerp(0, -240 * driftScale, remap(p, 0.55, 0.75)); // Push question much higher
    
    // Answer rises from below (+280px) up to a staggered position (+80px)
    const answerRisePhase1 = lerp(280 * driftScale, 80 * driftScale, remap(p, 0.55, 0.75));

    // Phase 4: Question fades out, answer takes true center (0.75→0.85)
    const questionFadeOut = lerp(1, 0, remap(p, 0.75, 0.85));
    const questionBlockOpacity = questionFadeOut;
    
    // Answer settles from the staggered position (+80px) to true center (0px)
    const answerRisePhase2 = lerp(answerRisePhase1, 0, remap(p, 0.75, 0.85));
    const finalAnswerY = p < 0.75 ? answerRisePhase1 : answerRisePhase2;

    // Whole-panel exit (0.87→1.0)
    const panelOpacity = lerp(1, 0, remap(p, 0.87, 1.0));

    const textSize = "text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-none";

    return (
        <>
            {/* 400vh spacer */}
            <section
                ref={sectionRef}
                id="hero"
                style={{ position: 'relative', height: '400vh', width: '100%' }}
            />

            {show && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 5,
                    overflow: 'hidden',
                    opacity: panelOpacity,
                    transition: 'opacity 0.3s ease-out',
                    pointerEvents: panelOpacity < 0.05 ? 'none' : 'auto',
                }}>
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                        <SpaceScene scrollProgress={p} />
                    </div>

                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent 40%, rgba(0,0,0,0.8))',
                    }} />

                    {/* ── QUESTION LAYER ──────────────────────────────────────── */}
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 10,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        textAlign: 'center',
                        padding: '0 1.5rem',
                        opacity: questionBlockOpacity,
                        transform: `translateY(${questionPushUp}px)`,
                        pointerEvents: questionBlockOpacity < 0.1 ? 'none' : 'auto',
                    }}>
                        {/* NAME */}
                        <motion.h2
                            initial={{ opacity: 0, y: 14 }}
                            animate={entered ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                opacity: nameOpacity,
                                marginBottom: '1.25rem',
                                visibility: nameOpacity < 0.01 ? 'hidden' : 'visible',
                                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                                fontWeight: 800,
                                color: '#ffffff',
                                letterSpacing: '0.25em',
                                textTransform: 'uppercase',
                            }}
                        >
                            TRUPAL PATEL
                        </motion.h2>

                        {/* QUESTION TEXT */}
                        <div style={{ position: 'relative' }}>
                            {/* Line 1: SO  WTF  ARE */}
                            {/* Note: Empty comments prevent JSX from inserting physical spaces */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={entered ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'visible',
                                    height: 'clamp(60px, 13vw, 140px)',
                                }}
                            >
                                <span className={textSize} style={{
                                    color: '#EDEDED', display: 'inline-block', whiteSpace: 'nowrap',
                                    marginRight: `${spaceOffsetEm}em`,
                                    transform: `translate(${soDriftX}px, ${soDriftY}px) rotate(${soRotate}deg)`,
                                    transformOrigin: 'center center',
                                }}>SO</span>{/*
                                */}<span className={textSize} style={{
                                    display: 'inline-block',
                                    marginRight: `${spaceOffsetEm}em`,
                                    transform: `translateY(${wtfDriftY}px) scale(${wtfScale})`,
                                }}>
                                    <AnimatedWord from="FTW" to="WTF" progress={ftwProgress} />
                                </span>{/*
                                */}<span className={textSize} style={{
                                    color: '#EDEDED', display: 'inline-block', whiteSpace: 'nowrap',
                                    transform: `translate(${areDriftX}px, ${areDriftY}px) rotate(${areRotate}deg)`,
                                    transformOrigin: 'center center',
                                }}>ARE</span>
                            </motion.div>

                            {/* Line 2: ENGINEER + ? */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={entered ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'visible',
                                    height: 'clamp(60px, 13vw, 140px)',
                                    position: 'relative',
                                }}
                            >
                                <span className={textSize} style={{
                                    color: '#EDEDED', display: 'inline-block',
                                    transform: `translate(${engDriftX}px, ${engDriftY}px)`,
                                }}>ENGINEER</span>{/*
                                */}<span className={textSize} style={{
                                    color: '#4ADE80',
                                    filter: 'drop-shadow(0 0 16px rgba(74,222,128,0.7))',
                                    display: 'inline-block',
                                    opacity: questionOpacity,
                                    transform: `translate(${qDriftX}px, ${qDriftY}px) rotate(${qRotate}deg) scale(${questionScale})`,
                                    transformOrigin: 'center center',
                                }}>?</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* ── ANSWER LAYER ───────────────────────────────────────── */}
                    <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: `translate(-50%, calc(-50% + ${finalAnswerY}px))`,
                        zIndex: 11,
                        opacity: answerFadeIn,
                        pointerEvents: answerFadeIn > 0.3 ? 'auto' : 'none',
                        transition: 'opacity 0.15s ease-out',
                        width: 'min(900px, calc(100vw - 2rem))', // Wider container
                        textAlign: 'center',
                    }}>
                        <p style={{
                            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
                            color: '#4ADE80',
                            fontWeight: 800,
                            lineHeight: 1.3,
                            marginBottom: '2rem', // Increased space before the final text
                            letterSpacing: '0.08em', // Wide cinematic tracking
                            textTransform: 'uppercase',
                        }}>
                            Who doesn&apos;t just write code,<br />
                            but solves real-world problems.
                        </p>
                        <p style={{
                            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
                            color: '#4ADE80',
                            fontWeight: 800,
                            lineHeight: 1.3,
                            letterSpacing: '0.08em', // Wide cinematic tracking
                            textTransform: 'uppercase',
                        }}>
                            Not just a developer. An engineer.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
