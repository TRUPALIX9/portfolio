import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { APP } from '@/data/logicsprint';

// logicsprint.*/download (src/proxy.ts rewrites it here): one link to share. iPhones and iPads go to
// the App Store, Android phones to Google Play, and everything else (desktops, and iPads that report
// themselves as a Mac) to the download section, which shows both stores.
export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
    const ua = request.headers.get('user-agent') ?? '';
    const target = /Android/i.test(ua)
        ? APP.playUrl
        : /iPhone|iPad|iPod/.test(ua)
          ? APP.appStoreUrl
          : new URL('/#download', `${request.nextUrl.protocol}//${request.headers.get('host')}`);
    // request.url is the rewritten internal path, so the fallback is built from the visited host.
    // 302 so a shared link keeps checking the device instead of being cached as one store.
    return NextResponse.redirect(target, 302);
}
