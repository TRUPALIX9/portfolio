import { ImageResponse } from 'next/og';

// Default link-preview card for portfolio pages. LogicSprint pages set their own image.
export const alt = 'Trupal Patel, Software Engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '80px 96px',
                    background: '#050505',
                    color: '#fafafa',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ fontSize: 28, letterSpacing: 6, textTransform: 'uppercase', color: '#4ADE80' }}>trupalpatel.com</div>
                <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -3, marginTop: 28 }}>Trupal Patel</div>
                <div style={{ fontSize: 42, color: '#a1a1aa', marginTop: 12 }}>Software Engineer</div>
                <div style={{ fontSize: 30, color: '#71717a', marginTop: 48 }}>Products: StoreDesk · LogicSprint</div>
            </div>
        ),
        size,
    );
}
