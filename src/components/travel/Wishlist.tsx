"use client";

import { useEffect, useState } from 'react';

type Wish = { id: string; place: string; country?: string; state?: string; city?: string; note?: string; name?: string };

/** Travel ideas from visitors that Trupal approved in the playground. Hidden until there is at least one. */
export default function Wishlist() {
    const [wishes, setWishes] = useState<Wish[]>([]);
    useEffect(() => {
        let alive = true;
        fetch('/api/travel/wishlist').then((r) => (r.ok ? r.json() : [])).then((w: Wish[]) => alive && setWishes(Array.isArray(w) ? w : [])).catch(() => {});
        return () => { alive = false; };
    }, []);
    if (!wishes.length) return null;
    return (
        <section className="tv-wish" aria-labelledby="tv-wish-h">
            <p className="tv-eyebrow">From visitors</p>
            <h2 id="tv-wish-h">Visitors say go here</h2>
            <ul>
                {wishes.map((w, i) => (
                    <li key={w.id} style={{ ['--r' as string]: `${((i * 37) % 9) - 4}deg` }}>
                        <b>📍 {[w.city, w.state, w.country].filter(Boolean).join(', ') || w.place}</b>
                        {w.note && <p>“{w.note}”</p>}
                        {w.name && <small>— {w.name}</small>}
                    </li>
                ))}
            </ul>
        </section>
    );
}
