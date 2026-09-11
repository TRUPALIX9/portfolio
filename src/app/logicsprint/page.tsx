import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Download } from 'lucide-react';
import { APP, GAMES, HOW_IT_WORKS, SCREENSHOTS } from '@/data/logicsprint';
import { getLogicSprintStats, getTopThreeByGame } from '@/utils/logicsprint-stats';
import ScreenshotCarousel from '@/components/logicsprint/ScreenshotCarousel';

// Live stats are cached for an hour (the fetches also set revalidate: 3600).
export const revalidate = 3600;

export const metadata: Metadata = {
    title: APP.title,
    description: APP.tagline,
    alternates: { canonical: '/logicsprint' },
    openGraph: {
        title: APP.title,
        description: APP.tagline,
        url: '/logicsprint',
        siteName: 'Trupal Patel Portfolio',
        type: 'website',
        images: [{ url: APP.featureGraphic, width: 1024, height: 500, alt: 'LogicSprint: Reflex, Memory, Math, Focus' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: APP.title,
        description: APP.tagline,
        images: [APP.featureGraphic],
    },
};

const formatNumber = new Intl.NumberFormat('en-US').format;
const pad = (n: number) => String(n).padStart(2, '0');

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: APP.title,
    description: APP.tagline,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Android',
    image: `https://true-pal.vercel.app${APP.icon}`,
    downloadUrl: APP.apkUrl,
    author: { '@type': 'Person', name: 'Trupal Patel' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default async function LogicSprintPage() {
    const [stats, topThree] = await Promise.all([getLogicSprintStats(), getTopThreeByGame()]);

    return (
        <main>
            {/* Static constants only; "<" escaped so the JSON can never close the script tag. */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

            {/* ── Hero ── */}
            <div className="ls-container">
                <section className="ls-hero" aria-labelledby="ls-title">
                    <div>
                        <Image src={APP.icon} alt="" width={88} height={88} priority className="ls-app-icon" />
                        <p className="ls-label" style={{ marginTop: '1.75rem', marginBottom: '0.75rem' }}>Brain games · Android</p>
                        <h1 id="ls-title" className="ls-heading ls-h1">
                            Logic<span style={{ color: 'var(--ls-teal)' }}>Sprint</span>
                        </h1>
                        <p style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.375rem)', lineHeight: 1.5, margin: '1.25rem 0 2rem', maxWidth: '32ch' }}>
                            {APP.tagline}
                        </p>
                        <a href={APP.apkUrl} className="ls-btn ls-btn-primary">
                            <Download size={20} aria-hidden="true" />
                            {APP.apkLabel}
                        </a>
                        <p className="ls-label" style={{ marginTop: '1rem' }}>{APP.buildNote}</p>
                    </div>

                    <div className="ls-card" style={{ padding: 1 }}>
                        <Image
                            src={APP.featureGraphic}
                            alt="LogicSprint logo with its four skills: Reflex, Memory, Math and Focus"
                            width={1024}
                            height={500}
                            priority
                            sizes="(min-width: 1120px) 560px, (min-width: 960px) 50vw, 100vw"
                            className="ls-chamfer"
                            style={{ display: 'block', width: '100%', height: 'auto' }}
                        />
                    </div>
                </section>

                {/* ── Live stats: hidden entirely when the request fails or returns nothing ── */}
                {stats && (
                    <section aria-labelledby="ls-stats-title" style={{ paddingBottom: 'clamp(3rem, 8vw, 5rem)' }}>
                        <h2 id="ls-stats-title" className="ls-label" style={{ marginBottom: '0.75rem' }}>Live stats · updated hourly</h2>
                        <dl className="ls-stats">
                            <div className="ls-stat">
                                <dt className="ls-label">Players</dt>
                                <dd className="ls-num ls-stat-value">{formatNumber(stats.players)}</dd>
                            </div>
                            <div className="ls-stat">
                                <dt className="ls-label">Runs played</dt>
                                <dd className="ls-num ls-stat-value">{formatNumber(stats.plays)}</dd>
                            </div>
                            <div className="ls-stat">
                                <dt className="ls-label">Games</dt>
                                <dd className="ls-num ls-stat-value">{pad(GAMES.length)}</dd>
                            </div>
                        </dl>
                    </section>
                )}
            </div>

            {/* ── Games ── */}
            <section className="ls-section" aria-labelledby="ls-games-title">
                <div className="ls-container">
                    <p className="ls-label" style={{ marginBottom: '0.75rem' }}>Games · {pad(GAMES.length)}</p>
                    <h2 id="ls-games-title" className="ls-heading ls-h2">Four ways to sprint</h2>
                    <ul className="ls-games">
                        {GAMES.map((game) => {
                            const stat = stats?.byGame[game.type];
                            const leaders = topThree[game.type];
                            const hasTopScore = Boolean(stat && stat.topScore > 0);
                            return (
                                <li key={game.type} className="ls-card ls-game">
                                    <span className="ls-game-bar" style={{ background: game.accent }} aria-hidden="true" />
                                    <p className="ls-label" style={{ color: game.accent }}>{game.skill}</p>
                                    <h3 className="ls-heading ls-h3" style={{ margin: '0.4rem 0 0.75rem' }}>{game.name}</h3>
                                    <p className="ls-muted">{game.description}</p>

                                    {game.modes && (
                                        <dl className="ls-modes">
                                            {game.modes.map((mode) => (
                                                <div key={mode.level} className="ls-mode">
                                                    <dt className="ls-label">{mode.level}</dt>
                                                    <dd className="ls-num" style={{ marginTop: '0.2rem' }}>{mode.detail}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    )}

                                    {(hasTopScore || leaders) && (
                                        <div className="ls-game-footer">
                                            <div className="ls-game-footer-inner">
                                                {hasTopScore && stat && (
                                                    <div>
                                                        <p className="ls-label">Top score</p>
                                                        <p className="ls-num" style={{ color: game.accent, fontSize: '1.625rem', lineHeight: 1.2 }}>
                                                            {formatNumber(stat.topScore)}
                                                        </p>
                                                    </div>
                                                )}
                                                {leaders && (
                                                    <div style={{ flex: '1 1 12rem' }}>
                                                        <p className="ls-label" style={{ marginBottom: '0.4rem' }}>Top 3 right now · Medium</p>
                                                        <ol className="ls-top3">
                                                            {leaders.map((entry, i) => (
                                                                <li key={`${entry.name}-${i}`}>
                                                                    <span className="ls-num ls-muted">{pad(i + 1)}</span>
                                                                    <span style={{ flex: 1, overflowWrap: 'anywhere' }}>{entry.name}</span>
                                                                    <span className="ls-num">{formatNumber(entry.score)}</span>
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="ls-section" aria-labelledby="ls-how-title">
                <div className="ls-container">
                    <h2 id="ls-how-title" className="ls-heading ls-h2">How it works</h2>
                    <ol className="ls-steps">
                        {HOW_IT_WORKS.map((step, i) => (
                            <li key={step} className="ls-card ls-step">
                                <span className="ls-num" style={{ color: 'var(--ls-teal)' }} aria-hidden="true">{pad(i + 1)}</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ── Screenshots ── */}
            <section className="ls-section" aria-labelledby="ls-shots-title">
                <div className="ls-container">
                    <h2 id="ls-shots-title" className="ls-heading ls-h2">Screenshots</h2>
                    <ScreenshotCarousel shots={SCREENSHOTS} labelledBy="ls-shots-title" />
                </div>
            </section>

            {/* ── Product footer ── */}
            <footer className="ls-footer">
                <div className="ls-container">
                    <ul>
                        <li className="ls-label">Contains ads</li>
                        <li><Link href="/logicsprint/privacy" className="ls-link">Privacy policy</Link></li>
                        <li>
                            Support: <a href={`mailto:${APP.supportEmail}`} className="ls-link">{APP.supportEmail}</a>
                        </li>
                    </ul>
                </div>
            </footer>
        </main>
    );
}
