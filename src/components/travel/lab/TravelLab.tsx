"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTravelGeo } from '../geo';
import Scratch from './Scratch';
import Stickers from './Stickers';
import Stamps from './Stamps';
import Postcards from './Postcards';
import PaperCut from './PaperCut';
import Pins from './Pins';
import Doodle from './Doodle';
import Hexes from './Hexes';
import './lab.css';

const DESIGNS = [
    { id: 1, name: 'Scratch map', C: Scratch },
    { id: 2, name: 'Sticker album', C: Stickers },
    { id: 3, name: 'Passport stamps', C: Stamps },
    { id: 4, name: 'Postcards', C: Postcards },
    { id: 5, name: 'Paper pop-up', C: PaperCut },
    { id: 6, name: 'Pin board', C: Pins },
    { id: 7, name: 'Doodle map', C: Doodle },
    { id: 8, name: 'Region bingo', C: Hexes },
];

/** Side-by-side prototypes for the travel page. Pick one with ?v=1..8. */
export default function TravelLab() {
    const params = useSearchParams();
    const router = useRouter();
    const v = Number(params.get('v') ?? 1);
    const design = DESIGNS.find((d) => d.id === v) ?? DESIGNS[0];
    const geo = useTravelGeo();
    return (
        <main className="lab" data-design={design.id}>
            <nav className="lab-switch" aria-label="Designs">
                <Link href="/about" className="lab-switch__home">← Trupal</Link>
                {DESIGNS.map((d) => (
                    <button key={d.id} type="button" aria-pressed={d.id === design.id} onClick={() => router.replace(`/travel/lab?v=${d.id}`, { scroll: false })}>
                        <b>{d.id}</b>{d.name}
                    </button>
                ))}
                <Link href="/travel/flight" className="lab-switch__dark">9 · Night flight ↗</Link>
            </nav>
            <div className="lab-stage">{geo ? <design.C geo={geo} /> : <p className="lab-loading">Unfolding the map…</p>}</div>
        </main>
    );
}
