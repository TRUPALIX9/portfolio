import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data: leaderboard, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .limit(200);

        if (error) {
            console.error("Supabase GET Error:", error);
            // Fallback for missing table during deployment/testing if needed
            return NextResponse.json([]);
        }

        return NextResponse.json(leaderboard || []);
    } catch (e: any) {
        console.error("Leaderboard GET Error:", e);
        return NextResponse.json({ error: 'Failed to read leaderboard' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const entry = {
            name: body.name || 'Anonymous',
            score: Number(body.score) || 0,
            game: body.game || 'unknown',
            date: new Date().toISOString()
        };

        const { error: insertError } = await supabase
            .from('leaderboard')
            .insert([entry]);

        if (insertError) {
            console.error("Supabase POST Error:", insertError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // Fetch top 20 to return
        const { data: leaderboard, error: selectError } = await supabase
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .limit(20);
            
        if (selectError) {
            console.error("Supabase POST Select Error:", selectError);
        }

        return NextResponse.json(leaderboard || []);
    } catch (e: any) {
        console.error("Leaderboard POST Error:", e);
        return NextResponse.json({ error: 'Failed to update leaderboard' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { id, key } = body;
        
        if (key !== process.env.KEY) {
            return NextResponse.json({ error: 'Unauthorized Key' }, { status: 401 });
        }

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { error } = await supabase
            .from('leaderboard')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Supabase DELETE Error:", error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Leaderboard DELETE Error:", e);
        return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }
}
