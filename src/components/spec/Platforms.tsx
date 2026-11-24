"use client";

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { STUDIO_TREE } from '@/data/studio';
import { APP as LOGICSPRINT } from '@/data/logicsprint';
import AppIcon from './AppIcon';

/** Brand glyphs, single colour so they sit in the datasheet. */
const GLYPH: Record<string, React.ReactNode> = {
    iOS: <path d="M16.4 12.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-1.9-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.1 2.5 1.3-.1 1.7-.8 3.3-.8s1.9.8 3.3.8c1.4 0 2.2-1.2 3-2.5.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-4.1zM14 5.2c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" fill="currentColor" />,
    Android: <path d="M4 3.5v17l9-8.5zM14.2 13l2.6 2.5L5.5 21.8zM14.2 11 5.5 2.2l11.3 6.3zM17.8 9.1 20.5 10.6c.8.5.8 1.3 0 1.8l-2.7 1.5-2.8-2.4z" fill="currentColor" />,
    Windows: <path d="M3 5.5 10.5 4.4v7.1H3zM11.5 4.3 21 3v8.5h-9.5zM3 12.5h7.5v7.1L3 18.5zM11.5 12.5H21V21l-9.5-1.3z" fill="currentColor" />,
    Web: <g fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9S14.6 18.4 12 21c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z" /></g>,
};

/** Store listings that really exist; everything else links to the app's own site. */
const STORE_LINK: Record<string, Record<string, { label: string; href: string; pre?: string }>> = {
    iOS: {
        logicsprint: { label: 'App Store', href: LOGICSPRINT.appStoreUrl },
        storedesk: { label: 'App Store', href: 'https://apps.apple.com/us/app/storedesk-mobile/id6835249805' },
    },
    Android: {
        logicsprint: { label: 'Google Play', href: LOGICSPRINT.playUrl },
        'contact-convoy': { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.ayushtech.contactconvoy' },
        storedesk: { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.storedesk' },
    },
    Windows: { storedesk: { label: 'Windows', href: 'https://storedesk.net/download', pre: 'Download for' } },
};

const PLATFORMS = ['iOS', 'Android', 'Windows', 'Web'] as const;
type Platform = (typeof PLATFORMS)[number];

const Glyph = ({ p, size = 18 }: { p: Platform; size?: number }) => <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">{GLYPH[p]}</svg>;

/** Where the studio's live apps run: a folder with one tab per platform. */
export default function Platforms() {
    const [tab, setTab] = useState<Platform>('iOS');
    // Products only, so the tab counts add up with the hero's "Live products".
    const live = STUDIO_TREE.filter((n) => n.live && n.group === 'products');
    const appsOn = (p: Platform) => live.filter((n) => n.platforms.split('·').map((s) => s.trim()).includes(p));
    const apps = appsOn(tab);

    return (
        <div className="sp-folder">
            <div className="sp-folder__tabs" role="tablist" aria-label="Platforms">
                {PLATFORMS.map((p) => (
                    <button key={p} type="button" role="tab" id={`plat-tab-${p}`} aria-selected={tab === p} aria-controls="plat-panel" className="sp-folder__tab" onClick={() => setTab(p)}>
                        <Glyph p={p} />
                        <span>{p}</span>
                        <b>{appsOn(p).length}</b>
                    </button>
                ))}
            </div>
            <div className="sp-folder__sheet" role="tabpanel" id="plat-panel" aria-labelledby={`plat-tab-${tab}`}>
                <p className="sp-folder__label"><Glyph p={tab} size={14} /> {tab} · {apps.length} live</p>
                <ul className="sp-folder__apps" key={tab}>
                    {apps.map((a, i) => {
                        const store = STORE_LINK[tab]?.[a.id];
                        const link = store ?? { label: a.links[0].label.replace(/^https?:\/\//, ''), href: a.links[0].href };
                        const external = link.href.startsWith('http');
                        return (
                            <li key={a.id} style={{ ['--d' as string]: `${i * 50}ms` }}>
                                <AppIcon id={a.id} name={a.name} />
                                <span className="sp-folder__name"><b>{a.name}</b><small>{a.tagline}</small></span>
                                <a href={link.href} className={store ? 'sp-folder__store' : 'sp-folder__link'} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                                    {store && <Glyph p={tab} size={13} />}
                                    {store ? <span><small>{store.pre ?? 'Get it on'}</small>{store.label}</span> : <>{link.label}<ArrowUpRight size={13} aria-hidden="true" /></>}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
