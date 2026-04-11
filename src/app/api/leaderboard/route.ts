import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'data', 'leaderboard.json');

export async function GET() {
    try {
        if (!fs.existsSync(filePath)) {
            return NextResponse.json([]);
        }
        const data = fs.readFileSync(filePath, 'utf8');
        const leaderboard = JSON.parse(data);
        return NextResponse.json(leaderboard);
    } catch (e: any) {
        return NextResponse.json({ error: 'Failed to read leaderboard' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        let leaderboard = [];
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            leaderboard = JSON.parse(data);
        }

        leaderboard.push({
            name: body.name || 'Anonymous',
            score: Number(body.score) || 0,
            date: new Date().toISOString()
        });

        // Sort descending
        leaderboard.sort((a: any, b: any) => b.score - a.score);

        // Retain Top 20
        const top20 = leaderboard.slice(0, 20);

        fs.writeFileSync(filePath, JSON.stringify(top20, null, 2));
        return NextResponse.json(top20);
    } catch (e: any) {
        return NextResponse.json({ error: 'Failed to update leaderboard' }, { status: 500 });
    }
}
