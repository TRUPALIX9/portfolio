import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_KEY_HEADER = 'x-admin-key';
export const ADMIN_COOKIE_NAME = 'playground_admin';
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

type AdminSessionPayload = {
    exp: number;
    role: 'playground-admin';
    version: 1;
};

export function getAdminKey(request: Request, body?: { key?: string }) {
    return request.headers.get(ADMIN_KEY_HEADER) ?? body?.key ?? '';
}

function getAdminSecret() {
    return process.env.KEY || process.env.SHARE_LINK_SECRET || '';
}

function toBase64Url(value: string) {
    return Buffer.from(value).toString('base64url');
}

function fromBase64Url(value: string) {
    return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(value: string) {
    return crypto.createHmac('sha256', getAdminSecret()).update(value).digest('base64url');
}

// Constant-time string comparison. timingSafeEqual throws on length mismatch,
// so compare lengths first to turn malformed input into a clean `false`.
export function safeEqual(a: string, b: string) {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export function isAuthorized(request: Request, body?: { key?: string }) {
    const key = getAdminKey(request, body);
    const expected = process.env.KEY;
    return Boolean(expected) && typeof key === 'string' && safeEqual(key, expected as string);
}

export function createAdminSessionToken(ttlMs = ADMIN_SESSION_TTL_MS) {
    const secret = getAdminSecret();
    if (!secret) {
        throw new Error('Missing KEY or SHARE_LINK_SECRET environment variable.');
    }

    const payload: AdminSessionPayload = {
        version: 1,
        role: 'playground-admin',
        exp: Date.now() + ttlMs,
    };

    const encodedPayload = toBase64Url(JSON.stringify(payload));
    return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAdminSessionToken(token: string) {
    const secret = getAdminSecret();
    if (!secret) return false;

    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return false;

    if (!safeEqual(signature, sign(encodedPayload))) return false;

    try {
        const payload = JSON.parse(fromBase64Url(encodedPayload)) as AdminSessionPayload;
        return payload.version === 1 && payload.role === 'playground-admin' && payload.exp > Date.now();
    } catch {
        return false;
    }
}

export async function isAuthorizedRequest(request: Request, body?: { key?: string }) {
    if (isAuthorized(request, body)) return true;

    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value ?? '';
    return Boolean(token) && verifyAdminSessionToken(token);
}
