import Link from 'next/link';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import type { Product } from '@/data/products';

/** Product card for the home section and /products. The whole card opens the product page. */
export default function ProductCard({ product, headingLevel = 'h3' }: { product: Product; headingLevel?: 'h2' | 'h3' }) {
    const Heading = headingLevel;
    return (
        <article className="card card-interactive spotlight group relative flex h-full flex-col overflow-hidden rounded-2xl">
            <div className="relative aspect-[2/1] overflow-hidden border-b border-line-1 bg-surface-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={product.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={`h-full w-full transition-transform duration-500 ease-out-expo group-hover:scale-[1.03] ${product.imageIsLogo ? 'object-contain p-10 sm:p-12' : 'object-cover'}`}
                />
            </div>

            <div className="flex flex-1 flex-col p-6 sm:p-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-3">{product.kicker}</p>
                <div className="mb-2.5 flex items-start justify-between gap-4">
                    <Heading className="text-2xl font-bold tracking-tight text-ink-1">{product.name}</Heading>
                    <ArrowUpRight
                        size={20}
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-ink-3 transition-[color,transform] duration-200 ease-out-expo group-hover:text-accent group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                </div>
                <p className="mb-6 text-[0.975rem] leading-[1.7] text-ink-2">{product.tagline}</p>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line-1 pt-5 text-[0.8125rem] font-medium">
                    <span className="inline-flex items-center gap-2 text-ink-2">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {product.status}
                    </span>
                    {/* Sits above the card overlay link so it stays clickable on its own. */}
                    <a
                        href={product.site.url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative z-20 inline-flex items-center gap-1.5 text-ink-2 transition-colors duration-150 hover:text-ink-1"
                    >
                        {product.site.label}
                        <ExternalLink size={13} aria-hidden="true" />
                    </a>
                </div>
            </div>

            <Link href={product.href} className="absolute inset-0 z-10 rounded-2xl">
                <span className="sr-only">View {product.name}</span>
            </Link>
        </article>
    );
}
