"use client";

import Image from 'next/image';
import { hueFor } from './data';
import { isAllowedImage, useArtwork } from './artwork';

type Props = {
    kind: 'series' | 'film';
    title: string;
    year: number | null;
    /** A stored image (from the playground), used before asking for artwork. */
    image?: string | null;
    /** Use the large poster (details view). */
    large?: boolean;
    sizes?: string;
    eager?: boolean;
    label?: string;
};

/** A 2:3 poster: real artwork when found, a generated typographic poster otherwise. */
export default function Poster({ kind, title, year, image, large = false, sizes = '(max-width: 720px) 124px, 160px', eager = false, label }: Props) {
    const stored = isAllowedImage(image) ? image : null;
    const { ref, art } = useArtwork<HTMLSpanElement>(kind, title, year, { skip: !!stored && !large, eager });
    const src = large ? (art?.posterLarge ?? stored ?? art?.poster) : (stored ?? art?.poster);
    const h = hueFor(title);

    return (
        <span ref={ref} className="bx-poster__art">
            {isAllowedImage(src) ? (
                <Image src={src} alt="" fill sizes={sizes} quality={70} className="bx-poster__img" priority={eager} />
            ) : (
                <span className="bx-poster__type" style={{ background: `linear-gradient(160deg, hsl(${h} 55% 34%), hsl(${(h + 40) % 360} 60% 14%))` }} data-loading={art === null}>
                    <span className="bx-poster__kind">{label ?? (kind === 'series' ? 'Series' : 'Film')}</span>
                    <span className="bx-poster__title">{title}</span>
                    {(year ?? art?.year) && <span className="bx-poster__year">{year ?? art?.year}</span>}
                </span>
            )}
        </span>
    );
}
