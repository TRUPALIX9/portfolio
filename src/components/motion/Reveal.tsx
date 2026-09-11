"use client";

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

/** Shared easing: fast start, long gentle settle. Used for every entrance on the site. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type RevealProps = HTMLMotionProps<'div'> & {
    delay?: number;
    /** Rise distance in px. Keep it small — motion should hint, not travel. */
    y?: number;
};

/** Fades and lifts its content into place once, when it scrolls into view. */
export default function Reveal({ delay = 0, y = 16, children, ...rest }: RevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay }}
            {...rest}
        >
            {children}
        </motion.div>
    );
}

const staggerContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const staggerChild: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

/** Parent for a group of items that should enter one after another (cards, lists). */
export function Stagger({ children, ...rest }: HTMLMotionProps<'div'>) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            {...rest}
        >
            {children}
        </motion.div>
    );
}

/** Child of <Stagger>. Inherits the parent's timing automatically. */
export function StaggerItem({ children, ...rest }: HTMLMotionProps<'div'>) {
    return (
        <motion.div variants={staggerChild} {...rest}>
            {children}
        </motion.div>
    );
}
