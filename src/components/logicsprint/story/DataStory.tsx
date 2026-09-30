'use client';

import './story.css';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import {
    Ban,
    Cloud,
    Fingerprint,
    Hash,
    Heart,
    History,
    ListOrdered,
    Lock,
    Megaphone,
    Settings,
    Trophy,
    User,
    WifiOff,
    type LucideIcon,
} from 'lucide-react';
import HiddenHeart from '@/components/logicsprint/hearts/HiddenHeart';

/*
 * "Where your data lives": a scroll-linked scene above the privacy policy. Every fact here comes
 * from src/content/logicsprint/privacy_policy.md; keep the two in step when the policy changes.
 *
 * Each chip is rendered in its destination (so no-JS and reduced motion show the final state) and
 * offset back to its ghost slot in the pile by (1 - t), where t follows the scroll.
 */

type Dest = 'phone' | 'cloud' | 'admob';
type Chip = { id: string; label: string; icon: LucideIcon; dest: Dest; note?: string };

const CHIPS: Chip[] = [
    { id: 'scores', label: 'High scores + run times', icon: Trophy, dest: 'phone' },
    { id: 'history', label: 'Run history', icon: History, dest: 'phone', note: 'never leaves' },
    { id: 'hearts', label: 'Hearts & revives', icon: Heart, dest: 'phone' },
    { id: 'settings', label: 'Settings', icon: Settings, dest: 'phone', note: 'sound, vibration' },
    { id: 'name', label: 'Display name', icon: User, dest: 'phone' },
    { id: 'cache', label: 'Leaderboard cache', icon: ListOrdered, dest: 'phone' },
    { id: 'tag', label: 'Display name + 4-digit code', icon: Hash, dest: 'cloud', note: 'NEON_FOX#0420' },
    { id: 'best', label: 'Best score per game', icon: Trophy, dest: 'cloud', note: '+ games played' },
    { id: 'adid', label: 'Advertising ID', icon: Fingerprint, dest: 'admob' },
];

const NEVER = ['Email', 'Phone number', 'Contacts', 'Photos', 'Camera', 'Microphone', 'Precise location', 'Analytics SDKs'];

/** Scroll windows: chip i travels during [start + i*step, start + i*step + span]; the bin strikes after. */
const START = 0.06;
const STEP = 0.07;
const SPAN = 0.2;
const STRIKE: [number, number] = [0.82, 0.95];

const STICKY_QUERY = '(min-width: 880px) and (min-height: 680px)';

function subscribeSticky(cb: () => void) {
    const mq = window.matchMedia(STICKY_QUERY);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

type Delta = { dx: number; dy: number };

function ChipBody({ chip, locked }: { chip: Chip; locked?: boolean }) {
    const Icon = chip.icon;
    return (
        <>
            <Icon size={15} aria-hidden="true" className="lss-chip-icon" />
            <span className="lss-chip-label">{chip.label}</span>
            {chip.dest === 'phone' && <Lock size={13} aria-hidden="true" className="lss-chip-lock" data-on={locked || undefined} />}
        </>
    );
}

function MovingChip({
    chip,
    index,
    progress,
    delta,
    still,
    slotRef,
}: {
    chip: Chip;
    index: number;
    progress: MotionValue<number>;
    delta: Delta | undefined;
    still: boolean;
    slotRef: (el: HTMLSpanElement | null) => void;
}) {
    const a = START + index * STEP;
    const t = useTransform(progress, [a, a + SPAN], [0, 1], { clamp: true });
    // A little lift mid-flight so chips arc into place rather than slide.
    const arc = useTransform(t, (v) => Math.sin(v * Math.PI) * 28);
    const style = (still || !delta
        ? {}
        : { '--t': t, '--arc': arc, '--dx': `${delta.dx}px`, '--dy': `${delta.dy}px` }) as unknown as CSSProperties;

    return (
        <motion.span ref={slotRef} className="lss-slot" data-moving={still || !delta ? undefined : ''} style={style}>
            <span className={`lss-chip lss-chip-${chip.dest}`}>
                <ChipBody chip={chip} locked />
            </span>
            {chip.note && <span className="lss-chip-note">{chip.note}</span>}
        </motion.span>
    );
}

function Strike({ progress, still, i }: { progress: MotionValue<number>; still: boolean; i: number }) {
    const a = STRIKE[0] + (i * (STRIKE[1] - STRIKE[0])) / (NEVER.length + 2);
    const s = useTransform(progress, [a, a + 0.04], [0, 1], { clamp: true });
    return <motion.span className="lss-strike" style={still ? undefined : { scaleX: s }} />;
}

export default function DataStory() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const ghosts = useRef<Record<string, HTMLSpanElement | null>>({});
    const slots = useRef<Record<string, HTMLSpanElement | null>>({});
    const [deltas, setDeltas] = useState<Record<string, Delta> | null>(null);

    const reduced = useReducedMotion() ?? false;
    const sticky = useSyncExternalStore(subscribeSticky, () => window.matchMedia(STICKY_QUERY).matches, () => false);

    const { scrollYProgress } = useScroll({
        target: wrapRef,
        offset: sticky ? ['start start', 'end end'] : ['start 0.7', 'end 0.9'],
    });

    const measure = useCallback(() => {
        const next: Record<string, Delta> = {};
        for (const chip of CHIPS) {
            const g = ghosts.current[chip.id];
            const s = slots.current[chip.id];
            if (!g || !s) return;
            const gr = g.getBoundingClientRect();
            const sr = s.getBoundingClientRect();
            next[chip.id] = { dx: gr.left - sr.left, dy: gr.top - sr.top };
        }
        setDeltas(next);
    }, []);

    useIsoLayoutEffect(() => {
        if (reduced) return;
        const stage = stageRef.current;
        if (!stage) return;
        measure();
        const ro = new ResizeObserver(() => measure());
        ro.observe(stage);
        document.fonts?.ready.then(measure).catch(() => {});
        return () => ro.disconnect();
    }, [reduced, sticky, measure]);

    const still = reduced;
    const ready = still || deltas !== null;
    const byDest = (dest: Dest) => CHIPS.map((chip, i) => ({ chip, i })).filter((c) => c.chip.dest === dest);

    const renderDest = (dest: Dest) =>
        byDest(dest).map(({ chip, i }) => (
            <MovingChip
                key={chip.id}
                chip={chip}
                index={i}
                progress={scrollYProgress}
                delta={deltas?.[chip.id]}
                still={still}
                slotRef={(el) => {
                    slots.current[chip.id] = el;
                }}
            />
        ));

    return (
        <section className="lss-story" aria-labelledby="lss-title">
            <p className="ls-label" style={{ color: 'var(--ls-teal)' }}>At a glance</p>
            <h2 id="lss-title" className="ls-heading lss-title">Where your data lives</h2>
            <p className="ls-muted lss-lead">
                Most of it never leaves your phone. Two things go to the leaderboard, one to Google AdMob, and some are never collected at all.
                {!still && <span aria-hidden="true"> Scroll to sort it.</span>}
            </p>

            <div ref={wrapRef} className="lss-track" data-sticky={sticky && !still ? '' : undefined}>
                <div ref={stageRef} className="lss-stage" data-ready={ready ? '' : undefined}>
                    <div className="lss-pile" aria-hidden="true">
                        <span className="ls-label lss-pile-label">Your data</span>
                        <div className="lss-pile-chips">
                            {CHIPS.map((chip) => (
                                <span
                                    key={chip.id}
                                    ref={(el) => {
                                        ghosts.current[chip.id] = el;
                                    }}
                                    className={`lss-chip lss-ghost lss-chip-${chip.dest}`}
                                >
                                    <ChipBody chip={chip} />
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="lss-dests">
                        <div className="lss-phone">
                            <div className="lss-phone-bar">
                                <span className="ls-label" aria-hidden="true">Your phone</span>
                                <HiddenHeart id="privacy" className="lss-phone-heart" />
                            </div>
                            <div className="lss-phone-body" aria-hidden="true">{renderDest('phone')}</div>
                            <p className="ls-label lss-phone-foot" aria-hidden="true">
                                <Lock size={12} /> On device · uninstall deletes it all
                            </p>
                        </div>

                        <div className="lss-side" aria-hidden="true">
                            <div className="lss-box lss-cloud">
                                <p className="lss-box-head">
                                    <Cloud size={18} /> <span className="ls-heading">Leaderboard</span>
                                    <span className="ls-label">Supabase</span>
                                </p>
                                <div className="lss-box-chips">{renderDest('cloud')}</div>
                                <p className="lss-box-note">Anonymous account. No email, password or login. Your name is public on the Top 10.</p>
                            </div>

                            <div className="lss-box lss-admob">
                                <p className="lss-box-head">
                                    <Megaphone size={18} /> <span className="ls-heading">Ads</span>
                                    <span className="ls-label">Google AdMob</span>
                                </p>
                                <div className="lss-box-chips">{renderDest('admob')}</div>
                                <p className="lss-box-note">
                                    <WifiOff size={13} /> No internet connection, no ads at all.
                                </p>
                            </div>
                        </div>

                        <div className="lss-box lss-bin" aria-hidden="true">
                            <p className="lss-box-head">
                                <Ban size={18} /> <span className="ls-heading">Never collected</span>
                            </p>
                            <ul className="lss-bin-list">
                                {NEVER.map((item, i) => (
                                    <li key={item}>
                                        <span>{item}</span>
                                        <Strike progress={scrollYProgress} still={still} i={i} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Text equivalent of the scene for screen readers. */}
            <div className="lss-sr">
                <h3>Stored only on your phone</h3>
                <ul>
                    <li>High scores and their run times</li>
                    <li>Run history, which never leaves your device</li>
                    <li>Hearts and revives, never sold or linked to your identity</li>
                    <li>Settings (sound, vibration)</li>
                    <li>Your display name</li>
                    <li>A cached copy of the leaderboard</li>
                </ul>
                <p>Uninstalling the app deletes all of this.</p>
                <h3>Sent to the global leaderboard (Supabase)</h3>
                <ul>
                    <li>Your display name and its 4-digit code, shown publicly on the Top 10</li>
                    <li>Your best score per game, and how many times you have played each game</li>
                </ul>
                <p>The app uses an anonymous account for your device. No email, password or login. Delete it any time in Settings → Delete leaderboard data.</p>
                <h3>Shared with Google AdMob for ads</h3>
                <ul>
                    <li>Your device&apos;s advertising ID (Google may also process your IP address, approximate location, device and app information, and ad interactions)</li>
                </ul>
                <p>On iPhone, the app asks for permission (Apple&apos;s App Tracking Transparency prompt) before the advertising ID can be used for personalized ads. With no internet connection the app shows no ads at all.</p>
                <h3>Never collected</h3>
                <ul>
                    {NEVER.map((item) => <li key={item}>{item}</li>)}
                </ul>
            </div>
            <noscript>
                <style>{'.ls-root .lss-stage .lss-chip{opacity:1!important}'}</style>
            </noscript>
        </section>
    );
}
