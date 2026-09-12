import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import ProjectsBackground from '@/components/effects/ProjectsBackground';
import Reveal, { Stagger, StaggerItem } from '@/components/motion/Reveal';

export const metadata: Metadata = {
    title: 'Live Products | Trupal Patel',
    description: 'StoreDesk and LogicSprint: software Trupal Patel builds, ships and supports for real users.',
    alternates: { canonical: '/products' },
};

export default function ProductsPage() {
    return (
        <main>
            <ProjectsBackground />
            <section className="section container">
                <Reveal>
                    <div style={{ marginBottom: '2rem' }}>
                        <Link href="/#products" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                            <ArrowLeft size={15} aria-hidden="true" /> Back to Home
                        </Link>
                    </div>

                    <p className="eyebrow mb-3">Live Products</p>
                    <h1 className="heading-lg text-ink-1" style={{ marginBottom: '3.5rem' }}>
                        Things I <span className="gradient-text">ship.</span>
                    </h1>
                </Reveal>

                <Stagger role="list" className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {products.map((product) => (
                        <StaggerItem key={product.slug} role="listitem" className="h-full">
                            <ProductCard product={product} headingLevel="h2" />
                        </StaggerItem>
                    ))}
                </Stagger>
            </section>
        </main>
    );
}
