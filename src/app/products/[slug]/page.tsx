import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Reveal from '@/components/motion/Reveal';
import { products } from '@/data/products';
import { SITE_URL } from '@/data/site';

export const dynamicParams = false;

export function generateStaticParams() {
    return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = products.find((p) => p.slug === slug);
    if (!product) return {};
    return {
        title: `${product.name} | Trupal Patel`,
        description: product.tagline,
        alternates: { canonical: `/products/${product.slug}` },
        openGraph: {
            title: product.name,
            description: product.tagline,
            url: `/products/${product.slug}`,
            siteName: 'Trupal Patel Portfolio',
            type: 'website',
            // Setting openGraph here drops the inherited card, so name an image explicitly.
            images: [product.previewImage ?? { url: '/opengraph-image', width: 1200, height: 630 }],
        },
    };
}

const buttonStyle = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem', fontSize: '0.925rem' } as const;
const cardLabel = 'text-xs font-bold uppercase tracking-[0.14em] text-ink-3 mb-4';

/** One summary section per product; the full story lives on the product's own site. */
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = products.find((p) => p.slug === slug);
    if (!product) notFound();

    const facts = [
        { label: 'Platform', value: product.platform },
        { label: 'Status', value: product.status },
        { label: 'Product site', value: product.site.label },
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: product.name,
        description: product.tagline,
        url: product.site.url,
        operatingSystem: product.platform.replaceAll(' · ', ', '),
        applicationCategory: product.slug === 'logicsprint' ? 'GameApplication' : 'BusinessApplication',
        author: { '@type': 'Person', name: 'Trupal Patel', url: SITE_URL },
    };

    return (
        <main className="container" style={{ paddingTop: 'calc(var(--nav-height) + 2.5rem)', paddingBottom: '6rem', minHeight: '100vh' }}>
            {/* Static data only; "<" escaped so the JSON can never close the script tag. */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
            <div className="mx-auto w-full max-w-[1000px]">
                <div className="mb-8">
                    <Link href="/products" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                        <ArrowLeft size={15} aria-hidden="true" /> All Products
                    </Link>
                </div>

                <Reveal>
                    <section aria-labelledby="product-title" className="card relative isolate overflow-hidden rounded-3xl p-6 sm:p-10">
                        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

                        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
                            <div>
                                <p className="eyebrow mb-4">{product.kicker}</p>
                                <div className="mb-4 flex items-center gap-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={product.icon} alt="" className="h-11 w-11 shrink-0 rounded-[10px] object-contain" />
                                    <h1 id="product-title" className="m-0 text-3xl sm:text-[2.75rem] font-extrabold leading-tight tracking-tight text-ink-1">{product.name}</h1>
                                </div>
                                <p className="mb-4 text-lg sm:text-xl leading-[1.5] text-ink-1 text-balance">{product.tagline}</p>
                                <p className="measure mb-8 text-base leading-[1.75] text-ink-2">{product.summary}</p>

                                <a href={product.site.url} target="_blank" rel="noopener" className="btn-primary" style={buttonStyle}>
                                    Visit product site <ArrowUpRight size={16} aria-hidden="true" />
                                </a>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="overflow-hidden rounded-2xl border border-line-1 bg-surface-1">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={product.image}
                                        alt=""
                                        className={`aspect-[2/1] h-auto w-full ${product.imageIsLogo ? 'object-contain p-8' : 'object-cover'}`}
                                    />
                                </div>
                                <dl className="flex flex-col divide-y divide-line-1 rounded-2xl border border-line-1 bg-surface-1 px-5">
                                    {facts.map((fact) => (
                                        <div key={fact.label} className="flex items-baseline justify-between gap-4 py-3">
                                            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-ink-3">{fact.label}</dt>
                                            <dd className="m-0 text-right text-[0.9375rem] font-medium text-ink-1">{fact.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        </div>

                        <div className="mt-10 grid gap-8 border-t border-line-1 pt-8 md:grid-cols-[1.2fr_1fr]">
                            <div>
                                <h2 className={cardLabel}>Highlights</h2>
                                <ul className="flex flex-col gap-3">
                                    {product.highlights.map((highlight) => (
                                        <li key={highlight} className="flex gap-3 text-[0.9375rem] leading-[1.65] text-ink-2">
                                            <CheckCircle2 size={17} aria-hidden="true" className="mt-1 shrink-0 text-accent" />
                                            <span>{highlight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h2 className={cardLabel}>Built with</h2>
                                <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
                                    {product.tech.map((t) => (
                                        <li key={t.name} className="flex items-center gap-1.5 rounded-full border border-line-1 bg-surface-3 px-3 py-1.5 text-[0.8125rem] font-medium text-ink-2">
                                            <i className={t.icon} aria-hidden="true" style={{ fontSize: '1rem' }} />
                                            {t.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                </Reveal>
            </div>
        </main>
    );
}
