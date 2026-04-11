import EndlessGame from '../../components/EndlessGame';

export const metadata = {
    title: 'Break Room | Trupal Patel',
};

export default function GamePage() {
    return (
        <main className="container section" style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '4rem', minHeight: '100vh' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="heading-lg" style={{ marginBottom: '1rem' }}>
                    Take a <span style={{ color: 'var(--accent-primary)' }}>break.</span>
                </h1>
                <p className="text-body" style={{ fontSize: '1.15rem' }}>
                    Drag your ship to dodge the red blocks. Prove you have the reaction time to make the board.
                </p>
            </div>

            <EndlessGame />
        </main>
    );
}
