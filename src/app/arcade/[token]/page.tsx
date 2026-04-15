import { notFound } from 'next/navigation';
import TrackedGameHub from '@/components/TrackedGameHub';
import { verifyArcadeShareToken } from '@/utils/arcade-share';

export default async function ArcadeSharePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    if (!verifyArcadeShareToken(token)) {
        notFound();
    }

    return (
        <main className="container section" style={{ paddingTop: '2rem', minHeight: '100vh' }}>
            <TrackedGameHub route={`/arcade/${token}`} shareToken={token} source="signed-share-link" />
        </main>
    );
}
