import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Download } from 'lucide-react';
import { APP, FACTS, FAQ, FEATURES, GAMES, PRIVACY_POINTS, RUN_STEPS, SCREENSHOTS } from '@/data/logicsprint';
import { LOGICSPRINT_URL } from '@/data/site';
import { getBoards, getLogicSprintStats } from '@/utils/logicsprint-stats';
import ScreenshotCarousel from '@/components/logicsprint/ScreenshotCarousel';
import GamesShowcase from '@/components/logicsprint/games/GamesShowcase';
import HeroFlight from '@/components/logicsprint/flight/HeroFlight';

// Live stats are cached for an hour (the fetches also set revalidate: 3600).
export const revalidate = 3600;

export const metadata: Metadata = {
    title: APP.title,
    description: APP.tagline,
    // The subdomain is LogicSprint's only home; src/proxy.ts sends /logicsprint on the portfolio there.
    alternates: { canonical: LOGICSPRINT_URL },
    openGraph: {
        title: APP.title,
        description: APP.tagline,
        url: LOGICSPRINT_URL,
        siteName: APP.title,
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
    url: LOGICSPRINT_URL,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Android',
    image: `${LOGICSPRINT_URL}${APP.icon}`,
    downloadUrl: APP.apkUrl,
    author: { '@type': 'Person', name: 'Trupal Patel' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
};

/** Static constants only; "<" escaped so the JSON can never close the script tag. */
const toJsonLd = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c');

function SectionHeading({ id, label, title, lead }: { id: string; label?: string; title: string; lead?: string }) {
    return (
        <>
            {label && <p className="ls-label" style={{ marginBottom: '0.75rem' }}>{label}</p>}
            <h2 id={id} className="ls-heading ls-h2">{title}</h2>
            {lead && <p className="ls-lead">{lead}</p>}
        </>
    );
}

export default async function LogicSprintPage() {
    const [stats, boards] = await Promise.all([getLogicSprintStats(), getBoards()]);

    return (
        <main>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(faqJsonLd) }} />

            {/* ── Hero: full-screen dogfight under the title ── */}
            <HeroFlight />

            <div className="ls-container">
                {/* ── Intro ── */}
                <section id="intro" className="ls-intro" aria-label="About LogicSprint">
                    <Image src={APP.icon} alt="" width={88} height={88} priority className="ls-app-icon" />
                    <div>
                        <p style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.375rem)', lineHeight: 1.5, margin: '0 0 1rem', maxWidth: '40ch' }}>
                            {APP.tagline}
                        </p>
                        <p className="ls-muted" style={{ maxWidth: '60ch', marginBottom: '1.5rem' }}>{APP.pitch}</p>
                        <ul className="ls-facts" aria-label="At a glance">
                            {FACTS.map((fact) => <li key={fact}>{fact}</li>)}
                        </ul>
                        <div className="ls-hero-actions">
                            <a href={APP.apkUrl} className="ls-btn ls-btn-primary">
                                <Download size={20} aria-hidden="true" />
                                {APP.apkLabel}
                            </a>
                            <a href="#games" className="ls-btn ls-btn-ghost">See the games</a>
                        </div>
                        <p className="ls-label" style={{ marginTop: '1rem' }}>{APP.buildNote}</p>
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

            {/* ── Games: a live demo of each ── */}
            <GamesShowcase stats={stats?.byGame} boards={boards} />

            {/* ── How a run works ── */}
            <section id="how" className="ls-section" aria-labelledby="ls-how-title">
                <div className="ls-container">
                    <SectionHeading id="ls-how-title" label="The run" title="How a run works" lead="Every game follows the same simple loop." />
                    <ol className="ls-run">
                        {RUN_STEPS.map((step, i) => (
                            <li key={step.title} className="ls-card ls-run-step">
                                <span className="ls-num" style={{ color: 'var(--ls-teal)' }} aria-hidden="true">{pad(i + 1)}</span>
                                <h3 className="ls-heading" style={{ fontSize: '1.375rem' }}>{step.title}</h3>
                                <p className="ls-muted">{step.detail}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="ls-section" aria-labelledby="ls-features-title">
                <div className="ls-container">
                    <SectionHeading id="ls-features-title" label="Features" title="Built for quick sessions" lead="Open it, play a run, put it down. Everything else stays out of your way." />
                    <ul className="ls-features">
                        {FEATURES.map((feature) => (
                            <li key={feature.title} className="ls-card ls-feature">
                                <h3 className="ls-heading" style={{ fontSize: '1.375rem', marginBottom: '0.6rem' }}>{feature.title}</h3>
                                <p className="ls-muted">{feature.detail}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ── Screenshots ── */}
            <section id="screenshots" className="ls-section" aria-labelledby="ls-shots-title">
                <div className="ls-container">
                    <SectionHeading
                        id="ls-shots-title"
                        label={`Screenshots · ${pad(SCREENSHOTS.length)}`}
                        title="Take a look"
                        lead="The Play tab, a game sheet, all four games in action, a result screen, the global Top 10 and your profile."
                    />
                    <ScreenshotCarousel shots={SCREENSHOTS} labelledBy="ls-shots-title" />
                </div>
            </section>

            {/* ── Privacy summary ── */}
            <section id="your-privacy" className="ls-section" aria-labelledby="ls-privacy-title">
                <div className="ls-container">
                    <SectionHeading id="ls-privacy-title" label="Privacy" title="Your privacy, in short" />
                    <ul className="ls-privacy">
                        {PRIVACY_POINTS.map((point) => (
                            <li key={point.title} className="ls-card ls-feature">
                                <h3 className="ls-heading" style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>{point.title}</h3>
                                <p className="ls-muted">{point.detail}</p>
                            </li>
                        ))}
                    </ul>
                    <p style={{ marginTop: '1.5rem' }}>
                        <Link href="/privacy" className="ls-link">Read the full privacy policy</Link>
                    </p>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section id="faq" className="ls-section" aria-labelledby="ls-faq-title">
                <div className="ls-container">
                    <SectionHeading id="ls-faq-title" label="FAQ" title="Questions, answered" />
                    <div className="ls-faq">
                        {FAQ.map((item) => (
                            <details key={item.question}>
                                <summary>{item.question}</summary>
                                <p>{item.answer}</p>
                            </details>
                        ))}
                    </div>
                    <p className="ls-muted" style={{ marginTop: '1.5rem' }}>
                        Something else? Email <a href={`mailto:${APP.supportEmail}`} className="ls-link">{APP.supportEmail}</a>.
                    </p>
                </div>
            </section>

            {/* ── Download ── */}
            <section id="download" className="ls-section" aria-labelledby="ls-download-title">
                <div className="ls-container">
                    <div className="ls-card ls-cta">
                        <div>
                            <h2 id="ls-download-title" className="ls-heading ls-h2" style={{ marginBottom: '0.75rem' }}>Ready to sprint?</h2>
                            <p className="ls-muted" style={{ maxWidth: '46ch' }}>Install version 1.0.1 for Android today. Google Play is coming soon.</p>
                        </div>
                        <div>
                            <a href={APP.apkUrl} className="ls-btn ls-btn-primary">
                                <Download size={20} aria-hidden="true" />
                                {APP.apkLabel}
                            </a>
                            <p className="ls-label" style={{ marginTop: '0.75rem' }}>Free · contains ads · no login</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
