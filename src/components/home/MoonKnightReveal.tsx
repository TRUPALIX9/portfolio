"use client";

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import './moonknight.css';

/**
 * Full-screen reveal: night falls, the moon rises and a white-cloaked vigilante drops in.
 * An original SVG drawing (hood, cape, crescent emblem), not studio artwork.
 */
export default function MoonKnightReveal({ guessedRight, guess, onClose }: { guessedRight: boolean; guess: string; onClose: () => void }) {
    const reduce = useReducedMotion();
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        closeRef.current?.focus();
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    const t = (d: number) => (reduce ? 0 : d);

    return createPortal(
        <motion.div
            className="mk-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Favourite Marvel character: Moon Knight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: t(0.4) }}
            onClick={onClose}
        >
            {/* Stars */}
            <div className="mk-stars" aria-hidden="true" />

            {/* Moon rises */}
            <motion.div
                className="mk-moon"
                aria-hidden="true"
                initial={{ y: reduce ? 0 : 260, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: t(1.4), ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Crescent darts fly across */}
            {!reduce && [0, 1, 2].map((i) => (
                <motion.svg
                    key={i}
                    className="mk-dart"
                    viewBox="0 0 40 40"
                    aria-hidden="true"
                    style={{ top: `${22 + i * 17}%` }}
                    initial={{ x: '-15vw', rotate: 0, opacity: 0 }}
                    animate={{ x: '115vw', rotate: 1080, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.3, delay: 1.5 + i * 0.22, ease: 'easeIn' }}
                >
                    <path d="M20 2a18 18 0 1 0 0 36a14 14 0 1 1 0-36z" fill="#e9eef5" />
                </motion.svg>
            ))}

            <div className="mk-stage" onClick={(e) => e.stopPropagation()}>
                {/* The figure drops in */}
                <motion.svg
                    className="mk-figure"
                    viewBox="0 0 240 340"
                    aria-hidden="true"
                    initial={{ y: reduce ? 0 : -520, opacity: reduce ? 0 : 1 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={reduce ? { duration: 0.3 } : { type: 'spring', stiffness: 70, damping: 11, delay: 0.7 }}
                >
                    <defs>
                        <linearGradient id="mk-cape" x1="0" x2="1">
                            <stop offset="0" stopColor="#b9c2cf" />
                            <stop offset="0.45" stopColor="#f4f6fa" />
                            <stop offset="1" stopColor="#9fa9b8" />
                        </linearGradient>
                        <linearGradient id="mk-body" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0" stopColor="#f7f8fb" />
                            <stop offset="1" stopColor="#c9d0db" />
                        </linearGradient>
                        <radialGradient id="mk-eye">
                            <stop offset="0" stopColor="#ffffff" />
                            <stop offset="1" stopColor="#9fd6ff" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Cape: unfurls after landing */}
                    <motion.path
                        d="M120 70 C70 78 40 120 22 330 L52 314 L74 334 L98 316 L120 336 L142 316 L166 334 L188 314 L218 330 C200 120 170 78 120 70Z"
                        fill="url(#mk-cape)"
                        style={{ transformOrigin: '120px 70px' }}
                        initial={{ scaleX: reduce ? 1 : 0.35, scaleY: reduce ? 1 : 0.8 }}
                        animate={{ scaleX: 1, scaleY: 1, skewX: reduce ? 0 : [0, -3, 2, -1, 0] }}
                        transition={reduce ? { duration: 0 } : { delay: 1.15, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                    {/* Body */}
                    <path d="M92 100 Q120 90 148 100 L156 230 Q120 244 84 230Z" fill="url(#mk-body)" />
                    {/* Belt */}
                    <rect x="88" y="196" width="64" height="9" rx="2" fill="#8b95a5" />
                    {/* Crescent emblem */}
                    <path d="M120 122a20 20 0 1 0 0 40a15.5 15.5 0 1 1 0-40z" fill="#7d8798" />
                    {/* Legs */}
                    <path d="M92 232 L100 318 L116 318 L118 240Z M148 232 L140 318 L124 318 L122 240Z" fill="#dfe4ec" />
                    {/* Hood */}
                    <path d="M120 14 C96 24 88 52 92 82 Q106 98 120 100 Q134 98 148 82 C152 52 144 24 120 14Z" fill="#f4f6fa" />
                    <path d="M120 14 C110 22 104 34 102 44 L120 30 L138 44 C136 34 130 22 120 14Z" fill="#c4ccd8" />
                    {/* Face, in shadow */}
                    <path d="M104 50 Q120 42 136 50 L134 82 Q120 92 106 82Z" fill="#0b0e14" />
                    {/* Glowing eyes */}
                    <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: reduce ? 1 : [0, 1, 0.55, 1] }}
                        transition={{ delay: t(1.9), duration: t(1.2) }}
                    >
                        <circle cx="112" cy="62" r="9" fill="url(#mk-eye)" />
                        <circle cx="128" cy="62" r="9" fill="url(#mk-eye)" />
                        <path d="M106 61 L117 59 L116 64 Z M134 61 L123 59 L124 64 Z" fill="#ffffff" />
                    </motion.g>
                </motion.svg>

                <motion.div
                    className="mk-caption"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: t(2.1), duration: t(0.6) }}
                >
                    <p className="mk-verdict">
                        {guessedRight ? 'Correct.' : `Not ${guess}.`} It&apos;s
                    </p>
                    <h3 className="mk-name">Moon Knight</h3>
                    <p className="mk-line">
                        Marc Spector, Steven Grant, Jake Lockley: three identities, one cape, and the best
                        suit in the MCU.
                    </p>
                    <button ref={closeRef} type="button" className="mk-close" onClick={onClose}>Back to the paper</button>
                </motion.div>
            </div>
        </motion.div>,
        document.body,
    );
}
