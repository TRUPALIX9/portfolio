import { NextResponse } from 'next/server';
import { getDb } from '@/utils/mongodb';
import { isAuthorizedRequest } from '@/utils/admin';

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
        const db = await getDb();
        const docs = await db.collection('contact_submissions')
            .find({})
            .sort({ created_at: -1 })
            .limit(200)
            .toArray();

        const submissions: ContactSubmission[] = docs.map((doc) => ({
            id: doc._id.toString(),
            name: doc.name ?? '',
            email: doc.email ?? '',
            message: doc.message ?? '',
            status: doc.status ?? 'new',
            created_at: doc.created_at ?? new Date().toISOString(),
            source: doc.source ?? '/contact',
            user_agent: doc.user_agent ?? null,
        }));

        return NextResponse.json(submissions);
    } catch (error) {
        console.error('Contact Submission GET MongoDB Error, using local file backup:', error);
        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            const backupFile = path.join(process.cwd(), 'backups', 'contact_submissions.json');
            let submissions: ContactSubmission[] = [];
            try {
                const content = await fs.readFile(backupFile, 'utf-8');
                submissions = JSON.parse(content);
            } catch (e) {
                // File does not exist yet
            }
            return NextResponse.json(submissions);
        } catch (backupError) {
            console.error('Fatal: Contact Submission GET fallback failed:', backupError);
            return NextResponse.json({ error: 'Failed to read contact submissions' }, { status: 500 });
        }
    }
}

export async function POST(request: Request) {
    let name = '';
    let email = '';
    let message = '';
    let source = '/contact';
    let userAgent = '';

    try {
        const body = await request.json();
        name = normalizeString(body.name);
        email = normalizeString(body.contact || body.email);
        message = normalizeString(body.message);
        source = normalizeString(body.source) || '/contact';
        userAgent = request.headers.get('user-agent') || '';

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
        }

        const db = await getDb();
        await db.collection('contact_submissions').insertOne({
            name,
            email,
            message,
            source,
            status: 'new',
            user_agent: userAgent,
            created_at: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact Submission POST MongoDB Error, saving to local file backup:', error);
        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            const backupDir = path.join(process.cwd(), 'backups');
            await fs.mkdir(backupDir, { recursive: true });
            const backupFile = path.join(backupDir, 'contact_submissions.json');

            let existing: any[] = [];
            try {
                const content = await fs.readFile(backupFile, 'utf-8');
                existing = JSON.parse(content);
            } catch (e) {
                // File does not exist yet
            }

            const newSubmission = {
                id: Date.now().toString(),
                name,
                email,
                message,
                source,
                status: 'new',
                user_agent: userAgent,
                created_at: new Date().toISOString(),
                backup: true
            };
            existing.push(newSubmission);
            await fs.writeFile(backupFile, JSON.stringify(existing, null, 2), 'utf-8');

            return NextResponse.json({ success: true, backup: true });
        } catch (backupError) {
            console.error('Fatal: Contact Submission POST fallback failed:', backupError);
            return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
        }
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

        const db = await getDb();
        const { ObjectId } = await import('mongodb');
        await db.collection('contact_submissions').updateOne(
            { _id: new ObjectId(id) },
            { $set: { status } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact Submission PATCH Error:', error);
        return NextResponse.json({ error: 'Failed to update contact submission' }, { status: 500 });
    }
}
