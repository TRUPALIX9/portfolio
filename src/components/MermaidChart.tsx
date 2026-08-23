"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'inherit',
});

interface MermaidChartProps {
    chart: string;
}

export default function MermaidChart({ chart }: MermaidChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgCode, setSvgCode] = useState<string>('');

    useEffect(() => {
        const renderChart = async () => {
            if (containerRef.current) {
                try {
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    const { svg } = await mermaid.render(id, chart);
                    setSvgCode(svg);
                } catch (error) {
                    console.error("Mermaid failed to render", error);
                }
            }
        };
        renderChart();
    }, [chart]);

    return (
        <div 
            ref={containerRef} 
            className="w-full overflow-x-auto p-4 rounded-xl bg-neutral-900/50 border border-[rgba(255,255,255,0.05)] flex justify-center items-center"
            dangerouslySetInnerHTML={{ __html: svgCode }}
        />
    );
}
