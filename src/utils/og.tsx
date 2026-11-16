import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

const INK = '#111111';
const PAPER = '#fafaf7';
const ACCENT = '#ea580c';

type Card = {
    /** Strip label, e.g. "ABOUT". */
    section: string;
    title: string;
    subtitle: string;
    /** Bottom line, monospace. */
    footer: string;
    /** Optional coloured chips under the subtitle. */
    chips?: { label: string; color: string }[];
};

/** The datasheet link-preview card, shared by every page so shared links look like one site. */
export function ogCard({ section, title, subtitle, footer, chips }: Card) {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '56px 72px',
                    background: PAPER,
                    backgroundImage: 'linear-gradient(rgba(17,17,17,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,0.06) 1px, transparent 1px)',
                    backgroundSize: '24px 24px', color: INK, fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: INK, color: PAPER, padding: '14px 20px', fontSize: 26, fontFamily: 'monospace', letterSpacing: 2 }}>
                    <span>TRUPAL PATEL · {section}</span>
                    <span style={{ color: ACCENT }}>trupalpatel.com</span>
                </div>
                <div style={{ fontSize: title.length > 22 ? 84 : 104, fontWeight: 700, letterSpacing: -3, marginTop: 56, lineHeight: 1 }}>{title}</div>
                <div style={{ fontSize: 38, color: '#444444', marginTop: 20, lineHeight: 1.25 }}>{subtitle}</div>
                {chips && chips.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 26 }}>
                        {chips.map((c) => (
                            <div key={c.label} style={{ display: 'flex', alignItems: 'center', fontSize: 26, padding: '8px 16px', marginRight: 12, marginBottom: 10, border: `2px solid ${INK}`, background: '#ffffff' }}>
                                <div style={{ width: 14, height: 14, borderRadius: 7, background: c.color, marginRight: 10 }} />
                                {c.label}
                            </div>
                        ))}
                    </div>
                )}
                <div style={{ display: 'flex', marginTop: 'auto', fontSize: 24, fontFamily: 'monospace', color: '#666666', borderTop: `2px solid ${INK}`, paddingTop: 18 }}>{footer}</div>
            </div>
        ),
        OG_SIZE,
    );
}
