import { ImageResponse } from 'next/og';

// Default link-preview card for portfolio pages: the datasheet cover.
export const alt = 'Trupal Patel, Software Development Engineer at Aetna (CVS Health) and member of trueorfalse.dev';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INK = '#111111';
const PAPER = '#fafaf7';
const ACCENT = '#ea580c';

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '56px 72px',
                    background: PAPER,
                    backgroundImage: 'linear-gradient(rgba(17,17,17,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,0.06) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    color: INK,
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: INK, color: PAPER, padding: '14px 20px', fontSize: 26, fontFamily: 'monospace', letterSpacing: 2 }}>
                    <span>TP-SDE-2026 · DATASHEET</span>
                    <span style={{ color: ACCENT }}>REV 4</span>
                </div>
                <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: -4, marginTop: 60 }}>Trupal Patel</div>
                <div style={{ fontSize: 42, color: '#444444', marginTop: 12 }}>Software Development Engineer · Aetna (CVS Health)</div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 32, color: '#444444', marginTop: 14 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 8, background: ACCENT, marginRight: 14 }} />
                    Member of trueorfalse.dev
                </div>
                <div style={{ display: 'flex', marginTop: 'auto', fontSize: 24, fontFamily: 'monospace', color: '#666666', borderTop: `2px solid ${INK}`, paddingTop: 18 }}>
                    GCP · BigQuery · Python · TypeScript · Flutter · GenAI · MCP
                </div>
            </div>
        ),
        size,
    );
}
