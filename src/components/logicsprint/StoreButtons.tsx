'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { APP } from '@/data/logicsprint';
import { LOGICSPRINT_URL } from '@/data/site';

/* Black App Store and Google Play badges, always the same size, optionally with share buttons. When the
   visitor is clearly on an iPhone, iPad or Android phone, that store comes first and is marked as
   theirs, and the top bar shows a Download button straight to it. */

/** Sends each device to its own store (src/app/logicsprint/download/route.ts). */
const SHARE_LINK = `${LOGICSPRINT_URL}/download`;

type Platform = 'ios' | 'android';

// Detected once, on first read in the browser.
let platform: Platform | null | undefined;

function detectPlatform(): Platform | null {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) return 'android';
    // iPadOS reports itself as a Mac, so a Mac with a touch screen is an iPad.
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
    return null;
}

// The platform never changes after detection, so there is nothing to subscribe to.
const subscribe = () => () => {};

function getPlatform() {
    if (platform === undefined) platform = detectPlatform();
    return platform;
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

const STORES = {
    ios: { href: APP.appStoreUrl, kicker: 'Download on the', name: 'App Store', Logo: AppleLogo },
    android: { href: APP.playUrl, kicker: 'GET IT ON', name: 'Google Play', Logo: PlayLogo },
} as const;

/** The phone's share sheet where there is one; otherwise copy the link. */
async function shareOrCopy(url: string, title: string): Promise<'shared' | 'copied' | 'failed'> {
    if (navigator.share) {
        try {
            await navigator.share({ title, url });
            return 'shared';
        } catch (error) {
            // Closing the share sheet isn't a failure, so don't fall back to copying.
            if (error instanceof DOMException && error.name === 'AbortError') return 'shared';
        }
    }
    try {
        await navigator.clipboard.writeText(url);
        return 'copied';
    } catch {
        return 'failed';
    }
}

/** Shows a tick for a moment after a copy. */
function useCopied() {
    const [copied, setCopied] = useState(false);
    const timer = useRef<number | undefined>(undefined);
    useEffect(() => () => window.clearTimeout(timer.current), []);
    const flash = () => {
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1800);
    };
    return [copied, flash] as const;
}

function ShareButton({ url, label }: { url: string; label: string }) {
    const [copied, flash] = useCopied();
    return (
        <button
            type="button"
            className="ls-share"
            aria-label={copied ? 'Link copied' : label}
            title={copied ? 'Link copied' : label}
            onClick={async () => {
                if ((await shareOrCopy(url, APP.title)) === 'copied') flash();
            }}
        >
            {copied ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}
        </button>
    );
}

function StoreBadge({ store, yours, share }: { store: Platform; yours: boolean; share: boolean }) {
    const { href, kicker, name, Logo } = STORES[store];
    return (
        <div className="ls-badge-group">
            <a
                href={href}
                className={`ls-badge${yours ? ' ls-badge-yours' : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${kicker} ${name}${yours ? ', for your device' : ''}`}
            >
                {yours && <span className="ls-badge-tag" aria-hidden="true">✓ Your device</span>}
                <Logo />
                <span className="ls-badge-text">
                    <small>{kicker}</small>
                    <strong>{name}</strong>
                </span>
            </a>
            {share && <ShareButton url={href} label={`Share the ${name} link`} />}
        </div>
    );
}

/** `share` adds a share button beside each badge (the download section only). */
export default function StoreButtons({ share = false }: { share?: boolean }) {
    const current = usePlatform();
    const order: Platform[] = current === 'android' ? ['android', 'ios'] : ['ios', 'android'];

    return (
        <div className="ls-badges">
            {order.map((store) => (
                <StoreBadge key={store} store={store} yours={store === current} share={share} />
            ))}
        </div>
    );
}

/** Top bar Download: only when we know the phone, and straight to its store. */
export function DownloadButton() {
    const current = usePlatform();
    if (!current) return null;
    return (
        <a href={STORES[current].href} className="ls-btn ls-btn-primary ls-topbar-download" target="_blank" rel="noopener noreferrer">
            Download
        </a>
    );
}

/** The one link to share: copy it, or send it with the phone's share sheet. */
export function ShareLink() {
    const [copied, flash] = useCopied();
    const inputRef = useRef<HTMLInputElement>(null);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(SHARE_LINK);
            flash();
        } catch {
            // Clipboard API blocked: select the field and use the older copy command; if that fails
            // too, the link stays selected, ready to copy by hand.
            inputRef.current?.select();
            if (document.execCommand('copy')) flash();
        }
    };

    return (
        <div className="ls-share-link">
            <p className="ls-label">Share one link · opens the right store on each phone</p>
            <div className="ls-link-row">
                <input ref={inputRef} readOnly value={SHARE_LINK} aria-label="Download link" onFocus={(e) => e.currentTarget.select()} />
                <button
                    type="button"
                    className="ls-btn ls-btn-ghost"
                    onClick={copy}
                >
                    {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
                <ShareButton url={SHARE_LINK} label="Share the download link" />
            </div>
        </div>
    );
}
