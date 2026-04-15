import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, createAdminSessionToken, isAuthorized, isAuthorizedRequest } from '@/utils/admin';

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
};

export async function GET(request: Request) {
    const authorized = await isAuthorizedRequest(request);
    return NextResponse.json({ authenticated: authorized });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!isAuthorized(request, body)) {
            return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
        }

        const cookieStore = await cookies();
        cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), cookieOptions);

        return NextResponse.json({ authenticated: true });
    } catch (error) {
        console.error('Playground Session POST Error:', error);
        return NextResponse.json({ error: 'Failed to create admin session' }, { status: 500 });
    }
}

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
    return NextResponse.json({ authenticated: false });
}
