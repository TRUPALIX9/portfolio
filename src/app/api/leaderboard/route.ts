import { NextResponse } from 'next/server';
import { getDb } from '@/utils/mongodb';
import { isAuthorizedRequest } from '@/utils/admin';

type LeaderboardEntry = {
    id: number;
    name: string;
    score: number;
    game: string;
    date: string;
    deviceId?: string | null;
    sessionId?: string | null;
};

const DEFAULT_GAME = 'unknown';

function createInsights(entries: LeaderboardEntry[]) {
    const gameStats = new Map<string, { submissions: number; highestScore: number; totalScore: number }>();
    const dateStats = new Map<string, number>();

    for (const entry of entries) {
        const gameName = entry.game || DEFAULT_GAME;
        const currentGame = gameStats.get(gameName) ?? { submissions: 0, highestScore: 0, totalScore: 0 };
        currentGame.submissions += 1;
        currentGame.totalScore += entry.score;
        currentGame.highestScore = Math.max(currentGame.highestScore, entry.score);
        gameStats.set(gameName, currentGame);

        const day = new Date(entry.date).toISOString().slice(0, 10);
        dateStats.set(day, (dateStats.get(day) ?? 0) + entry.score);
    }

    const topGames = [...gameStats.entries()]
        .map(([game, stats]) => ({ game, ...stats }))
        .sort((a, b) => b.totalScore - a.totalScore || b.highestScore - a.highestScore);

    const topDates = [...dateStats.entries()]
        .map(([date, totalScore]) => ({ date, totalScore }))
        .sort((a, b) => b.totalScore - a.totalScore);

    return {
        totalScores: entries.length,
        gamesTracked: gameStats.size,
        topGames,
        topDates,
    };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const adminMode = searchParams.get('admin') === '1';
        const db = await getDb();

        const docs = await db.collection('leaderboard')
            .find({})
            .sort({ score: -1 })
            .limit(adminMode ? 500 : 200)
            .toArray();

        const leaderboard: LeaderboardEntry[] = docs.map((doc, idx) => ({
            id: doc.id ?? idx + 1,
            name: doc.name ?? 'Anonymous',
            score: Number(doc.score) || 0,
            game: doc.game ?? DEFAULT_GAME,
            date: doc.date ?? new Date().toISOString(),
            ...(adminMode && doc.deviceId ? { deviceId: doc.deviceId } : {}),
            ...(adminMode && doc.sessionId ? { sessionId: doc.sessionId } : {}),
        }));

        if (!adminMode) {
            return NextResponse.json(leaderboard);
        }

        if (!(await isAuthorizedRequest(request))) {
            return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
        }

        return NextResponse.json({
            scores: leaderboard,
            insights: createInsights(leaderboard),
        });
    } catch (error) {
        console.error('Leaderboard GET MongoDB Error, using local file backup:', error);
        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            const backupFile = path.join(process.cwd(), 'backups', 'leaderboard.json');
            let leaderboard: LeaderboardEntry[] = [];
            try {
                const content = await fs.readFile(backupFile, 'utf-8');
                leaderboard = JSON.parse(content);
            } catch (e) {
                // File does not exist, use mock defaults so the page loads successfully
                leaderboard = [
                    { id: 1, name: 'DeepMind AI', score: 32, game: 'memory', date: new Date().toISOString() },
                    { id: 2, name: 'Trupal Patel', score: 28, game: 'memory', date: new Date().toISOString() },
                    { id: 3, name: 'Guest Player', score: 20, game: 'memory', date: new Date().toISOString() }
                ];
            }
            
            // Sort by score desc
            leaderboard.sort((a, b) => b.score - a.score);

            const { searchParams } = new URL(request.url);
            const adminMode = searchParams.get('admin') === '1';

            if (!adminMode) {
                return NextResponse.json(leaderboard);
            }

            if (!(await isAuthorizedRequest(request))) {
                return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
            }

            return NextResponse.json({
                scores: leaderboard,
                insights: createInsights(leaderboard),
            });
        } catch (backupError) {
            console.error('Fatal: Leaderboard GET fallback failed:', backupError);
            return NextResponse.json({ error: 'Failed to read leaderboard' }, { status: 500 });
        }
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const db = await getDb();

        const game = body.game || DEFAULT_GAME;
        const incomingScore = Number(body.score) || 0;

        const topScores = await db.collection('leaderboard')
            .find({ game: game })
            .sort({ score: -1 })
            .limit(10)
            .toArray();

        let shouldInsert = true;
        if (topScores.length >= 10) {
            const tenthScore = Number(topScores[9].score);
            if (incomingScore <= tenthScore) {
                shouldInsert = false;
            }
        }

        const entry = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: body.name || 'Anonymous',
            score: incomingScore,
            game: game,
            date: new Date().toISOString(),
            deviceId: body.deviceId || null,
            sessionId: body.sessionId || null,
        };

        if (shouldInsert) {
            await db.collection('leaderboard').insertOne(entry);
        }

        const docs = await db.collection('leaderboard')
            .find({ game: entry.game })
            .sort({ score: -1 })
            .limit(20)
            .toArray();

        const leaderboard: LeaderboardEntry[] = docs.map((doc, idx) => ({
            id: doc.id ?? idx + 1,
            name: doc.name ?? 'Anonymous',
            score: Number(doc.score) || 0,
            game: doc.game ?? DEFAULT_GAME,
            date: doc.date ?? new Date().toISOString(),
            // Don't expose deviceId to public via POST response
        }));

        return NextResponse.json(leaderboard);
    } catch (error) {
        console.error('Leaderboard POST MongoDB Error, saving to local file backup:', error);
        try {
            const body = await request.json().catch(() => ({}));
            const fs = await import('fs/promises');
            const path = await import('path');
            const backupDir = path.join(process.cwd(), 'backups');
            await fs.mkdir(backupDir, { recursive: true });
            const backupFile = path.join(backupDir, 'leaderboard.json');

            let leaderboard: LeaderboardEntry[] = [];
            try {
                const content = await fs.readFile(backupFile, 'utf-8');
                leaderboard = JSON.parse(content);
            } catch (e) {
                leaderboard = [
                    { id: 1, name: 'DeepMind AI', score: 32, game: 'memory', date: new Date().toISOString() },
                    { id: 2, name: 'Trupal Patel', score: 28, game: 'memory', date: new Date().toISOString() },
                    { id: 3, name: 'Guest Player', score: 20, game: 'memory', date: new Date().toISOString() }
                ];
            }

            const entry = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: body.name || 'Anonymous',
                score: Number(body.score) || 0,
                game: body.game || DEFAULT_GAME,
                date: new Date().toISOString(),
                deviceId: body.deviceId || null,
                sessionId: body.sessionId || null,
            };

            leaderboard.push(entry);
            leaderboard.sort((a, b) => b.score - a.score);
            await fs.writeFile(backupFile, JSON.stringify(leaderboard, null, 2), 'utf-8');

            const filteredLeaderboard = leaderboard.filter(e => e.game === entry.game).slice(0, 20);
            return NextResponse.json(filteredLeaderboard);
        } catch (backupError) {
            console.error('Fatal: Leaderboard POST fallback failed:', backupError);
            return NextResponse.json({ error: 'Failed to update leaderboard' }, { status: 500 });
        }
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();

        if (!(await isAuthorizedRequest(request, body))) {
            return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
        }

        const db = await getDb();
        const deleteAll = body.deleteAll === true;

        if (!deleteAll && (body.id === undefined || body.id === null)) {
            return NextResponse.json({ error: 'Missing leaderboard id' }, { status: 400 });
        }

        if (deleteAll) {
            await db.collection('leaderboard').deleteMany({});
        } else {
            await db.collection('leaderboard').deleteOne({ id: body.id });
        }

        return NextResponse.json({ success: true, deletedAll: deleteAll });
    } catch (error) {
        console.error('Leaderboard DELETE Error:', error);
        return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();

        if (!(await isAuthorizedRequest(request, body))) {
            return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
        }

        const nextName = typeof body.name === 'string' ? body.name.trim() : '';
        if (!nextName) {
            return NextResponse.json({ error: 'Missing updated name' }, { status: 400 });
        }

        const db = await getDb();

        if (body.id !== undefined && body.id !== null) {
            await db.collection('leaderboard').updateOne({ id: body.id }, { $set: { name: nextName } });
        } else if (typeof body.playerName === 'string' && body.playerName.trim()) {
            await db.collection('leaderboard').updateMany({ name: body.playerName.trim() }, { $set: { name: nextName } });
        } else {
            return NextResponse.json({ error: 'Missing leaderboard target' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Leaderboard PATCH Error:', error);
        return NextResponse.json({ error: 'Failed to update leaderboard entry' }, { status: 500 });
    }
}
