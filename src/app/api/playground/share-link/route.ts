import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createArcadeShareToken } from '@/utils/arcade-share';
import { isAuthorizedRequest } from '@/utils/admin';

function getOrigin(headerList: Headers, request: Request) {
    const forwardedProto = headerList.get('x-forwarded-proto');
    const forwardedHost = headerList.get('x-forwarded-host');

    if (forwardedProto && forwardedHost) {
        return `${forwardedProto}://${forwardedHost}`;
    }

    return new URL(request.url).origin;
}

export async function POST(request: Request) {
    if (!(await isAuthorizedRequest(request))) {
        return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
    }

    try {
        const headerList = await headers();
        const token = createArcadeShareToken();
        const origin = getOrigin(headerList, request);

        return NextResponse.json({
            url: `${origin}/arcade/${token}`,
        });
    } catch (error) {
        console.error('Share Link Error:', error);
        return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
    }
}
