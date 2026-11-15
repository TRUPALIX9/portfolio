"use client";

import { useEffect, useMemo, useRef } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { TravelGeo } from '../geo';
import { INK, land, landFit, ownerOf } from './shared';
import { COUNTRIES } from '@/data/travel';
import { TOTAL_REGIONS } from '../geo';

const W = 1200, H = 620;

/** 1 · A gold scratch-off poster: visited places are already scratched, and you can scratch more. */
export default function Scratch({ geo }: { geo: TravelGeo }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const projection = useMemo(() => geoNaturalEarth1().fitExtent([[20, 20], [W - 20, H - 20]], landFit(geo)), [geo]);
    const path = useMemo(() => geoPath(projection), [projection]);

    useEffect(() => {
        const c = canvasRef.current!;
        const ctx = c.getContext('2d')!;
        c.width = W * 2;
        c.height = H * 2;
        ctx.scale(2, 2);
        const p = geoPath(projection, ctx);
        // Gold foil over the land
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#c9a227'); g.addColorStop(0.3, '#f5e08a'); g.addColorStop(0.55, '#b8860b'); g.addColorStop(0.8, '#f1d77a'); g.addColorStop(1, '#a87b12');
        ctx.fillStyle = g;
        land(geo).forEach((f) => { ctx.beginPath(); p(f); ctx.fill(); });
        // Foil grain
        for (let i = 0; i < 9000; i++) {
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.18})`;
            ctx.fillRect(Math.random() * W, Math.random() * H, 1.2, 1.2);
        }
        ctx.globalCompositeOperation = 'source-atop';
        ctx.strokeStyle = 'rgba(90,60,0,0.35)';
        ctx.lineWidth = 0.6;
        land(geo).forEach((f) => { ctx.beginPath(); p(f); ctx.stroke(); });
        // Scratch off what's been visited, with rough edges
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#000';
        geo.lit.forEach((f) => {
            ctx.beginPath(); p(f); ctx.fill();
            ctx.lineWidth = 2.5; ctx.stroke();
        });

        let down = false;
        const scratch = (e: PointerEvent) => {
            if (!down) return;
            const r = c.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
            ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
        };
        const on = (e: PointerEvent) => { down = true; scratch(e); };
        const off = () => { down = false; };
        c.addEventListener('pointerdown', on);
        c.addEventListener('pointermove', scratch);
        window.addEventListener('pointerup', off);
        return () => { c.removeEventListener('pointerdown', on); c.removeEventListener('pointermove', scratch); window.removeEventListener('pointerup', off); };
    }, [geo, projection]);

    return (
        <div className="lab-scratch">
            <header>
                <p className="lab-eyebrow">The scratch map</p>
                <h1>Scratched so far: <em>{COUNTRIES.length} countries</em>, {TOTAL_REGIONS} regions.</h1>
                <p className="lab-note">Go on, scratch somewhere new ↓</p>
            </header>
            <div className="lab-scratch__poster">
                <svg viewBox={`0 0 ${W} ${H}`} className="lab-scratch__under" aria-hidden="true">
                    {land(geo).map((f, i) => <path key={i} d={path(f) ?? ''} fill="#f4efe6" stroke="#d8cfbf" strokeWidth={0.6} />)}
                    {geo.lit.map((f, i) => <path key={i} d={path(f) ?? ''} fill={INK[ownerOf(f)] ?? '#ff6b35'} stroke="#fff" strokeWidth={0.6} />)}
                </svg>
                <canvas ref={canvasRef} className="lab-scratch__foil" />
                <ul className="lab-scratch__legend">
                    {COUNTRIES.map((c) => <li key={c.name}><i style={{ background: INK[c.label] }} />{c.label}</li>)}
                </ul>
            </div>
        </div>
    );
}
