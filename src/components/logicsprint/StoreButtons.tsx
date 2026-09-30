import { APP } from '@/data/logicsprint';

/* Google Play (live) and the App Store (not yet), styled as the site's chamfered buttons. */

function PlayIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M3.6 1.8c-.3.3-.5.8-.5 1.4v17.6c0 .6.2 1.1.5 1.4l.1.1L13.5 12v-.2L3.7 1.7l-.1.1Z" />
            <path d="m16.8 15.3-3.3-3.3v-.2l3.3-3.3.1.1 3.9 2.2c1.1.6 1.1 1.7 0 2.3l-3.9 2.2h-.1Z" />
            <path d="M16.9 15.3 13.5 12 3.6 21.9c.4.4 1 .4 1.7.1l11.6-6.7" />
            <path d="M16.9 8.7 5.3 2c-.7-.4-1.3-.3-1.7.1L13.5 12l3.4-3.3Z" />
        </svg>
    );
}

function AppleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.7 1.3-2.7s-2.4-1-2.4-3.9ZM14.1 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4Z" />
        </svg>
    );
}

export default function StoreButtons() {
    return (
        <>
            <a href={APP.playUrl} className="ls-btn ls-btn-primary" target="_blank" rel="noopener noreferrer">
                <PlayIcon />
                Get it on Google Play
            </a>
            <span className="ls-btn ls-btn-ghost ls-btn-soon" aria-disabled="true">
                <AppleIcon />
                App Store · Coming soon
            </span>
        </>
    );
}
