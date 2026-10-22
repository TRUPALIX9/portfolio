'use client';

import { useSyncExternalStore } from 'react';
import { APP } from '@/data/logicsprint';

/* Black App Store and Google Play badges. The visitor's phone (or the platform they pick) gets the
   big primary badge; desktops with no pick show both at the same size. */

type Platform = 'ios' | 'android';

// The platform shared by every StoreButtons on the page: undefined until first read in the browser.
let platform: Platform | null | undefined;
const listeners = new Set<() => void>();

function detectPlatform(): Platform | null {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) return 'android';
    // iPadOS reports itself as a Mac, so a Mac with a touch screen is an iPad.
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
    return null;
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getPlatform() {
    if (platform === undefined) platform = detectPlatform();
    return platform;
}

function setPlatform(next: Platform) {
    platform = next;
    listeners.forEach((listener) => listener());
}

const usePlatform = () => useSyncExternalStore(subscribe, getPlatform, () => null);

function PlayLogo({ size = 26 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#2BA7F5" d="M3.6 1.8c-.3.3-.5.8-.5 1.4v17.6c0 .6.2 1.1.5 1.4l.1.1L13.5 12v-.2L3.7 1.7l-.1.1Z" />
            <path fill="#FFC81E" d="m16.8 15.3-3.3-3.3v-.2l3.3-3.3.1.1 3.9 2.2c1.1.6 1.1 1.7 0 2.3l-3.9 2.2h-.1Z" />
            <path fill="#F2434A" d="M16.9 15.3 13.5 12 3.6 21.9c.4.4 1 .4 1.7.1l11.6-6.7" />
            <path fill="#2BC46E" d="M16.9 8.7 5.3 2c-.7-.4-1.3-.3-1.7.1L13.5 12l3.4-3.3Z" />
        </svg>
    );
}

function AppleLogo({ size = 26 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.7 1.3-2.7s-2.4-1-2.4-3.9ZM14.1 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4Z" />
        </svg>
    );
}

function AndroidLogo({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M17.6 9.48 19.44 6.3a.38.38 0 0 0-.66-.38l-1.87 3.23a11.43 11.43 0 0 0-9.82 0L5.22 5.92a.38.38 0 0 0-.66.38L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52ZM7 15.25A1.25 1.25 0 1 1 8.25 14 1.25 1.25 0 0 1 7 15.25Zm10 0A1.25 1.25 0 1 1 18.25 14 1.25 1.25 0 0 1 17 15.25Z" />
        </svg>
    );
}

const STORES = {
    ios: { href: APP.appStoreUrl, kicker: 'Download on the', name: 'App Store', Logo: AppleLogo },
    android: { href: APP.playUrl, kicker: 'GET IT ON', name: 'Google Play', Logo: PlayLogo },
} as const;

function StoreBadge({ store, rank }: { store: Platform; rank: 'primary' | 'secondary' | 'equal' }) {
    const { href, kicker, name, Logo } = STORES[store];
    return (
        <a href={href} className={`ls-badge ls-badge-${rank}`} target="_blank" rel="noopener noreferrer" aria-label={`${kicker} ${name}`}>
            <Logo />
            <span className="ls-badge-text">
                <small>{kicker}</small>
                <strong>{name}</strong>
            </span>
        </a>
    );
}

const PLATFORM_OPTIONS = [
    { id: 'ios', label: 'iPhone & iPad', Logo: AppleLogo },
    { id: 'android', label: 'Android', Logo: AndroidLogo },
] as const;

export default function StoreButtons({ picker = false }: { picker?: boolean }) {
    const current = usePlatform();
    const order: Platform[] = current === 'android' ? ['android', 'ios'] : ['ios', 'android'];

    return (
        <div className="ls-stores">
            {picker && (
                <div className="ls-platform" role="group" aria-label="Choose your phone">
                    {PLATFORM_OPTIONS.map(({ id, label, Logo }) => (
                        <button key={id} type="button" aria-pressed={current === id} onClick={() => setPlatform(id)}>
                            <Logo size={18} />
                            {label}
                        </button>
                    ))}
                </div>
            )}
            <div className="ls-badges">
                {order.map((store) => (
                    <StoreBadge key={store} store={store} rank={current === null ? 'equal' : store === current ? 'primary' : 'secondary'} />
                ))}
            </div>
        </div>
    );
}

/** Top bar Download: straight to the visitor's store on a phone, to the download section elsewhere. */
export function DownloadButton() {
    const current = usePlatform();
    const store = current ? STORES[current] : null;
    return (
        <a
            href={store ? store.href : '/#download'}
            className="ls-btn ls-btn-primary ls-topbar-download"
            {...(store && { target: '_blank', rel: 'noopener noreferrer' })}
        >
            Download
        </a>
    );
}
