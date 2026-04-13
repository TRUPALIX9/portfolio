import crypto from 'crypto';

type ArcadeSharePayload = {
    exp: number;
    mode: 'arcade-only';
    version: 1;
};

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function getSecret() {
    return process.env.SHARE_LINK_SECRET || process.env.KEY || '';
}

function toBase64Url(value: string) {
    return Buffer.from(value).toString('base64url');
}

function fromBase64Url(value: string) {
    return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(encodedPayload: string) {
    return crypto.createHmac('sha256', getSecret()).update(encodedPayload).digest('base64url');
}

export function createArcadeShareToken(ttlMs = DEFAULT_TTL_MS) {
    const secret = getSecret();
    if (!secret) {
        throw new Error('Missing SHARE_LINK_SECRET or KEY environment variable.');
    }

    const payload: ArcadeSharePayload = {
        version: 1,
        mode: 'arcade-only',
        exp: Date.now() + ttlMs,
    };

    const encodedPayload = toBase64Url(JSON.stringify(payload));
    const signature = sign(encodedPayload);
    return `${encodedPayload}.${signature}`;
}

export function verifyArcadeShareToken(token: string) {
    const secret = getSecret();
    if (!secret) return false;

    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return false;

    const expectedSignature = sign(encodedPayload);
    const signatureMatches = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    if (!signatureMatches) return false;

    try {
        const payload = JSON.parse(fromBase64Url(encodedPayload)) as ArcadeSharePayload;
        return payload.version === 1 && payload.mode === 'arcade-only' && payload.exp > Date.now();
    } catch {
        return false;
    }
}
