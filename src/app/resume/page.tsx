import { Download } from 'lucide-react';

export default function ResumePage() {
    return (
        <main className="container" style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '4rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className="heading-lg" style={{ color: 'var(--text-primary)' }}>Resume</h1>
                <a href="/RESUME.pdf" download="Trupal_Patel_Resume.pdf" target="_blank" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Download PDF <Download size={18} />
                </a>
            </div>

            <div className="glass-card" style={{ flexGrow: 1, padding: '2rem', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <p className="text-body" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    Below is my resume. You can read it digitally here or download it using the button above.
                </p>
                <div style={{ flexGrow: 1, minHeight: '80vh', width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#333' }}>
                    <iframe
                        src="/RESUME.pdf"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="Trupal Patel Resume"
                    />
                </div>
            </div>
        </main>
    );
}
