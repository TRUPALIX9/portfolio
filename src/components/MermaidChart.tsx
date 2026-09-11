"use client";

import { useEffect, useId, useState } from 'react';
import { motion } from 'framer-motion';
import mermaid from 'mermaid';
import { EASE_OUT } from '@/components/motion/Reveal';

// Palette mirrors the site tokens (ink / surface / line) so diagrams read as part of the page.
// Mermaid derives colours from these with a colour parser, so they must be concrete hex values.
const INK_1 = '#F5F5F5';
const INK_2 = '#B4B4B4';
const INK_3 = '#8C8C8C';
const SURFACE_1 = '#0A0A0B';
const SURFACE_2 = '#111113';
const SURFACE_3 = '#18181B';
const LINE = '#3F3F46';
const ACCENT = '#4ADE80';

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    // Charts are static data from the repo; no click handlers or HTML labels needed.
    securityLevel: 'strict',
    fontFamily: 'inherit',
    themeVariables: {
        darkMode: true,
        fontFamily: 'inherit',
        fontSize: '14px',
        background: SURFACE_2,
        textColor: INK_1,
        titleColor: INK_1,
        lineColor: INK_3,
        // Flowchart nodes / clusters
        primaryColor: SURFACE_3,
        primaryTextColor: INK_1,
        primaryBorderColor: LINE,
        secondaryColor: SURFACE_2,
        secondaryTextColor: INK_1,
        secondaryBorderColor: LINE,
        tertiaryColor: SURFACE_1,
        tertiaryTextColor: INK_1,
        tertiaryBorderColor: LINE,
        mainBkg: SURFACE_3,
        nodeBorder: LINE,
        nodeTextColor: INK_1,
        clusterBkg: SURFACE_1,
        clusterBorder: LINE,
        edgeLabelBackground: SURFACE_2,
        // Sequence diagrams
        actorBkg: SURFACE_3,
        actorBorder: LINE,
        actorTextColor: INK_1,
        actorLineColor: INK_3,
        signalColor: INK_2,
        signalTextColor: INK_1,
        labelBoxBkgColor: SURFACE_3,
        labelBoxBorderColor: LINE,
        labelTextColor: INK_1,
        loopTextColor: INK_1,
        noteBkgColor: SURFACE_3,
        noteTextColor: INK_1,
        noteBorderColor: ACCENT,
    },
});

interface MermaidChartProps {
    chart: string;
}

type RenderResult = { chart: string; svg: string | null };

let renderCount = 0;

/** Flowchart-shaped placeholder so the figure keeps its height while mermaid lays out. */
function DiagramSkeleton() {
    return (
        <div role="status" className="flex min-h-[260px] w-full items-center justify-center py-6">
            <span className="sr-only">Loading diagram…</span>
            <div aria-hidden="true" className="flex w-full max-w-md animate-pulse flex-col items-center gap-3">
                <div className="h-10 w-40 rounded-lg border border-line-1 bg-surface-3" />
                <div className="h-6 w-px bg-line-2" />
                <div className="flex w-full justify-center gap-4">
                    <div className="h-10 max-w-[120px] flex-1 rounded-lg border border-line-1 bg-surface-3" />
                    <div className="h-10 max-w-[120px] flex-1 rounded-lg border border-line-1 bg-surface-3" />
                    <div className="h-10 max-w-[120px] flex-1 rounded-lg border border-line-1 bg-surface-3" />
                </div>
                <div className="h-6 w-px bg-line-2" />
                <div className="h-10 w-48 rounded-lg border border-line-1 bg-surface-3" />
            </div>
        </div>
    );
}

export default function MermaidChart({ chart }: MermaidChartProps) {
    const reactId = useId();
    // Tag the result with the chart it came from, so a changed `chart` prop shows the
    // skeleton again without a synchronous setState inside the effect.
    const [result, setResult] = useState<RenderResult | null>(null);

    useEffect(() => {
        let cancelled = false;
        const id = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}-${++renderCount}`;

        mermaid
            .render(id, chart)
            .then(({ svg }) => {
                if (!cancelled) setResult({ chart, svg });
            })
            .catch((error: unknown) => {
                console.error('Mermaid failed to render', error);
                if (!cancelled) setResult({ chart, svg: null });
            });

        return () => {
            cancelled = true;
        };
    }, [chart, reactId]);

    if (!result || result.chart !== chart) {
        return <DiagramSkeleton />;
    }

    if (!result.svg) {
        return <p className="m-0 py-10 text-center text-sm text-ink-3">The architecture diagram couldn&apos;t be rendered.</p>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="flex w-full items-center justify-center overflow-x-auto [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: result.svg }}
        />
    );
}
