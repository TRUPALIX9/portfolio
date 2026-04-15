import { NextResponse } from 'next/server';
import { getSupabaseServerClient, isAuthorizedRequest } from '@/utils/admin';

type ContactSubmission = {
    id: string;
    name: string;
    email: string;
    message: string;
    status?: string | null;
    created_at: string;
    source?: string | null;
    user_agent?: string | null;
};

function normalizeString(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

export async function GET(request: Request) {
    if (!(await isAuthorizedRequest(request))) {
        return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
    }

    try {
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);

        if (error) {
            console.error('Contact Submission GET Error:', error);
            return NextResponse.json([]);
        }

        return NextResponse.json((data ?? []) as ContactSubmission[]);
    } catch (error) {
        console.error('Contact Submission GET Error:', error);
        return NextResponse.json({ error: 'Failed to read contact submissions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const name = normalizeString(body.name);
        const email = normalizeString(body.contact || body.email);
        const message = normalizeString(body.message);
        const source = normalizeString(body.source) || '/contact';
        const userAgent = request.headers.get('user-agent');

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
        }

        const supabase = await getSupabaseServerClient();
        const { error } = await supabase.from('contact_submissions').insert([
            {
                name,
                email,
                message,
                source,
                status: 'new',
                user_agent: userAgent,
                created_at: new Date().toISOString(),
            },
        ]);

        if (error) {
            console.error('Contact Submission POST Error:', error);
            return NextResponse.json({ error: 'Failed to save contact submission' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact Submission POST Error:', error);
        return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();

        if (!(await isAuthorizedRequest(request, body))) {
            return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
        }

        const id = normalizeString(body.id);
        const status = normalizeString(body.status);

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing contact submission target or status' }, { status: 400 });
        }

        const supabase = await getSupabaseServerClient();
        const { error } = await supabase
            .from('contact_submissions')
            .update({ status })
            .eq('id', id);

        if (error) {
            console.error('Contact Submission PATCH Error:', error);
            return NextResponse.json({ error: 'Failed to update contact submission' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact Submission PATCH Error:', error);
        return NextResponse.json({ error: 'Failed to update contact submission' }, { status: 500 });
    }
}
