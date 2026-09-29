import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, createAdminSessionToken, isAuthorized, isAuthorizedRequest } from '@/utils/admin';
import { OWNER_COOKIE, VISITOR_COOKIE } from '@/utils/analytics/shared';
import { claimOwnerDevice, getClientIp } from '@/utils/analytics/server';

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
};

// Marks this browser as the site owner so its visits are excluded from analytics.
// It outlives the admin session on purpose: locking the dashboard doesn't make you a visitor.
const ownerCookieOptions = { ...cookieOptions, maxAge: 60 * 60 * 24 * 400 };

/** Signing in means "this device and network are mine": tag them so they're excluded from reports. */
async function claimOwner(request: Request) {
    const cookieStore = await cookies();
    cookieStore.set(OWNER_COOKIE, '1', ownerCookieOptions);
    try {
        await claimOwnerDevice(cookieStore.get(VISITOR_COOKIE)?.value ?? '', getClientIp(request));
    } catch (error) {
        // Analytics tagging must never block signing in.
        console.error('Owner tagging failed:', error);
    }
}

export async function GET(request: Request) {
    const authorized = await isAuthorizedRequest(request);
    if (authorized) await claimOwner(request);
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
        await claimOwner(request);

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
