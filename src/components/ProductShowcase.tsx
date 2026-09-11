"use client";

import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import Reveal, { Stagger, StaggerItem } from '@/components/motion/Reveal';

export default function ProductShowcase() {
    return (
        <div className="container mx-auto py-32 w-full border-t border-line-1">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
                <Reveal className="text-center flex flex-col items-center">
                    <p className="eyebrow mb-3">Products</p>
                    <h2
                        className="text-ink-1"
                        style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}
                    >
                        things i <span className="text-accent">ship.</span>
                    </h2>
                    <p className="measure mt-5 text-[1.0625rem] leading-[1.7] text-ink-2">
                        Software I build, ship and support for real users. Each one has its own home.
                    </p>
                </Reveal>

                <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 w-full">
                    {products.map((product) => (
                        <StaggerItem key={product.slug} className="h-full">
                            <ProductCard product={product} />
                        </StaggerItem>
                    ))}
                </Stagger>
            </div>
        </div>
    );
}
