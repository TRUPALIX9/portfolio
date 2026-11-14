/**
 * Marvel Studios films and series, for the Marvel section: release order, in-story (chronological)
 * order, and which branch of reality each one sits on.
 *
 * - `chrono`: position in the in-story order (Marvel's own "timeline order", lightly simplified).
 * - `storyYear`: roughly when it takes place in-universe.
 * - `branch`: 'sacred' = the main Earth-616 timeline; 'multiverse' = another universe or the TVA.
 * - `seen`: Trupal's status. Films default to seen ("mostly seen everything"); series follow his own list.
 *   Fix any of these here (or, later, from the playground).
 * Dates are as of November 2026; `upcoming` items have not been released yet.
 */

export type MarvelTitle = {
    id: string;
    title: string;
    kind: 'film' | 'series' | 'special';
    phase: number;
    released: string; // YYYY-MM
    chrono: number;
    storyYear: string;
    branch: 'sacred' | 'multiverse';
    universe?: string;
    seen: boolean;
    upcoming?: boolean;
};

export const MARVEL: MarvelTitle[] = [
    // ── Phase 1 ──
    { id: 'iron-man', title: 'Iron Man', kind: 'film', phase: 1, released: '2008-05', chrono: 4, storyYear: '2008', branch: 'sacred', seen: true },
    { id: 'incredible-hulk', title: 'The Incredible Hulk', kind: 'film', phase: 1, released: '2008-06', chrono: 6, storyYear: '2010', branch: 'sacred', seen: true },
    { id: 'iron-man-2', title: 'Iron Man 2', kind: 'film', phase: 1, released: '2010-05', chrono: 5, storyYear: '2010', branch: 'sacred', seen: true },
    { id: 'thor', title: 'Thor', kind: 'film', phase: 1, released: '2011-05', chrono: 7, storyYear: '2010', branch: 'sacred', seen: true },
    { id: 'first-avenger', title: 'Captain America: The First Avenger', kind: 'film', phase: 1, released: '2011-07', chrono: 2, storyYear: '1943–45', branch: 'sacred', seen: true },
    { id: 'avengers', title: 'The Avengers', kind: 'film', phase: 1, released: '2012-05', chrono: 8, storyYear: '2012', branch: 'sacred', seen: true },

    // ── Phase 2 ──
    { id: 'iron-man-3', title: 'Iron Man 3', kind: 'film', phase: 2, released: '2013-05', chrono: 9, storyYear: '2012', branch: 'sacred', seen: true },
    { id: 'dark-world', title: 'Thor: The Dark World', kind: 'film', phase: 2, released: '2013-11', chrono: 10, storyYear: '2013', branch: 'sacred', seen: true },
    { id: 'winter-soldier', title: 'Captain America: The Winter Soldier', kind: 'film', phase: 2, released: '2014-04', chrono: 11, storyYear: '2014', branch: 'sacred', seen: true },
    { id: 'guardians', title: 'Guardians of the Galaxy', kind: 'film', phase: 2, released: '2014-08', chrono: 12, storyYear: '2014', branch: 'sacred', seen: true },
    { id: 'age-of-ultron', title: 'Avengers: Age of Ultron', kind: 'film', phase: 2, released: '2015-05', chrono: 15, storyYear: '2015', branch: 'sacred', seen: true },
    { id: 'ant-man', title: 'Ant-Man', kind: 'film', phase: 2, released: '2015-07', chrono: 16, storyYear: '2015', branch: 'sacred', seen: true },

    // ── Phase 3 ──
    { id: 'civil-war', title: 'Captain America: Civil War', kind: 'film', phase: 3, released: '2016-05', chrono: 17, storyYear: '2016', branch: 'sacred', seen: true },
    { id: 'doctor-strange', title: 'Doctor Strange', kind: 'film', phase: 3, released: '2016-11', chrono: 21, storyYear: '2016–17', branch: 'sacred', seen: true },
    { id: 'guardians-2', title: 'Guardians of the Galaxy Vol. 2', kind: 'film', phase: 3, released: '2017-05', chrono: 13, storyYear: '2014', branch: 'sacred', seen: true },
    { id: 'homecoming', title: 'Spider-Man: Homecoming', kind: 'film', phase: 3, released: '2017-07', chrono: 20, storyYear: '2016', branch: 'sacred', seen: true },
    { id: 'ragnarok', title: 'Thor: Ragnarok', kind: 'film', phase: 3, released: '2017-11', chrono: 22, storyYear: '2017', branch: 'sacred', seen: true },
    { id: 'black-panther', title: 'Black Panther', kind: 'film', phase: 3, released: '2018-02', chrono: 19, storyYear: '2016', branch: 'sacred', seen: true },
    { id: 'infinity-war', title: 'Avengers: Infinity War', kind: 'film', phase: 3, released: '2018-04', chrono: 24, storyYear: '2018', branch: 'sacred', seen: true },
    { id: 'ant-man-wasp', title: 'Ant-Man and the Wasp', kind: 'film', phase: 3, released: '2018-07', chrono: 23, storyYear: '2018', branch: 'sacred', seen: true },
    { id: 'captain-marvel', title: 'Captain Marvel', kind: 'film', phase: 3, released: '2019-03', chrono: 3, storyYear: '1995', branch: 'sacred', seen: true },
    { id: 'endgame', title: 'Avengers: Endgame', kind: 'film', phase: 3, released: '2019-04', chrono: 25, storyYear: '2018–23', branch: 'sacred', seen: true },
    { id: 'far-from-home', title: 'Spider-Man: Far From Home', kind: 'film', phase: 3, released: '2019-07', chrono: 31, storyYear: '2024', branch: 'sacred', seen: true },

    // ── Phase 4 ──
    { id: 'wandavision', title: 'WandaVision', kind: 'series', phase: 4, released: '2021-01', chrono: 27, storyYear: '2023', branch: 'sacred', seen: true },
    { id: 'falcon-winter-soldier', title: 'The Falcon and the Winter Soldier', kind: 'series', phase: 4, released: '2021-03', chrono: 29, storyYear: '2024', branch: 'sacred', seen: true },
    { id: 'loki-1', title: 'Loki (Season 1)', kind: 'series', phase: 4, released: '2021-06', chrono: 26, storyYear: 'Outside time', branch: 'multiverse', universe: 'TVA', seen: true },
    { id: 'black-widow', title: 'Black Widow', kind: 'film', phase: 4, released: '2021-07', chrono: 18, storyYear: '2016', branch: 'sacred', seen: true },
    { id: 'what-if-1', title: 'What If…? (Season 1)', kind: 'series', phase: 4, released: '2021-08', chrono: 28, storyYear: 'Many Earths', branch: 'multiverse', universe: 'The Watcher', seen: true },
    { id: 'shang-chi', title: 'Shang-Chi and the Legend of the Ten Rings', kind: 'film', phase: 4, released: '2021-09', chrono: 30, storyYear: '2024', branch: 'sacred', seen: true },
    { id: 'eternals', title: 'Eternals', kind: 'film', phase: 4, released: '2021-11', chrono: 32, storyYear: '7000 BCE–2024', branch: 'sacred', seen: true },
    { id: 'hawkeye', title: 'Hawkeye', kind: 'series', phase: 4, released: '2021-11', chrono: 34, storyYear: '2024', branch: 'sacred', seen: true },
    { id: 'no-way-home', title: 'Spider-Man: No Way Home', kind: 'film', phase: 4, released: '2021-12', chrono: 33, storyYear: '2024', branch: 'sacred', seen: true },
    { id: 'moon-knight', title: 'Moon Knight', kind: 'series', phase: 4, released: '2022-03', chrono: 35, storyYear: '2025', branch: 'sacred', seen: true },
    { id: 'multiverse-of-madness', title: 'Doctor Strange in the Multiverse of Madness', kind: 'film', phase: 4, released: '2022-05', chrono: 36, storyYear: '2024', branch: 'sacred', seen: true },
    { id: 'ms-marvel', title: 'Ms. Marvel', kind: 'series', phase: 4, released: '2022-06', chrono: 37, storyYear: '2025', branch: 'sacred', seen: true },
    { id: 'love-and-thunder', title: 'Thor: Love and Thunder', kind: 'film', phase: 4, released: '2022-07', chrono: 38, storyYear: '2025', branch: 'sacred', seen: true },
    { id: 'i-am-groot', title: 'I Am Groot', kind: 'series', phase: 4, released: '2022-08', chrono: 14, storyYear: '2014', branch: 'sacred', seen: false },
    { id: 'she-hulk', title: 'She-Hulk: Attorney at Law', kind: 'series', phase: 4, released: '2022-08', chrono: 41, storyYear: '2025', branch: 'sacred', seen: true },
    { id: 'werewolf-by-night', title: 'Werewolf by Night', kind: 'special', phase: 4, released: '2022-10', chrono: 42, storyYear: 'Unknown', branch: 'sacred', seen: false },
    { id: 'wakanda-forever', title: 'Black Panther: Wakanda Forever', kind: 'film', phase: 4, released: '2022-11', chrono: 39, storyYear: '2025', branch: 'sacred', seen: true },
    { id: 'holiday-special', title: 'The Guardians of the Galaxy Holiday Special', kind: 'special', phase: 4, released: '2022-11', chrono: 43, storyYear: '2025', branch: 'sacred', seen: false },

    // ── Phase 5 ──
    { id: 'quantumania', title: 'Ant-Man and the Wasp: Quantumania', kind: 'film', phase: 5, released: '2023-02', chrono: 47, storyYear: '2026', branch: 'sacred', seen: true },
    { id: 'guardians-3', title: 'Guardians of the Galaxy Vol. 3', kind: 'film', phase: 5, released: '2023-05', chrono: 44, storyYear: '2026', branch: 'sacred', seen: true },
    { id: 'secret-invasion', title: 'Secret Invasion', kind: 'series', phase: 5, released: '2023-06', chrono: 45, storyYear: '2026', branch: 'sacred', seen: false },
    { id: 'loki-2', title: 'Loki (Season 2)', kind: 'series', phase: 5, released: '2023-10', chrono: 51, storyYear: 'Outside time', branch: 'multiverse', universe: 'TVA', seen: false },
    { id: 'the-marvels', title: 'The Marvels', kind: 'film', phase: 5, released: '2023-11', chrono: 46, storyYear: '2026', branch: 'sacred', seen: true },
    { id: 'what-if-2', title: 'What If…? (Season 2)', kind: 'series', phase: 5, released: '2023-12', chrono: 52, storyYear: 'Many Earths', branch: 'multiverse', universe: 'The Watcher', seen: false },
    { id: 'echo', title: 'Echo', kind: 'series', phase: 5, released: '2024-01', chrono: 40, storyYear: '2025', branch: 'sacred', seen: false },
    { id: 'x-men-97', title: "X-Men '97", kind: 'series', phase: 5, released: '2024-03', chrono: 53, storyYear: '1997', branch: 'multiverse', universe: 'Earth-97161', seen: false },
    { id: 'deadpool-wolverine', title: 'Deadpool & Wolverine', kind: 'film', phase: 5, released: '2024-07', chrono: 54, storyYear: '2024', branch: 'multiverse', universe: 'Earth-10005 · the Void', seen: true },
    { id: 'agatha', title: 'Agatha All Along', kind: 'series', phase: 5, released: '2024-09', chrono: 48, storyYear: '2026', branch: 'sacred', seen: false },
    { id: 'what-if-3', title: 'What If…? (Season 3)', kind: 'series', phase: 5, released: '2024-12', chrono: 55, storyYear: 'Many Earths', branch: 'multiverse', universe: 'The Watcher', seen: false },
    { id: 'friendly-neighborhood', title: 'Your Friendly Neighborhood Spider-Man', kind: 'series', phase: 5, released: '2025-01', chrono: 56, storyYear: 'Alt. high school', branch: 'multiverse', universe: 'Alternate Earth', seen: false },
    { id: 'brave-new-world', title: 'Captain America: Brave New World', kind: 'film', phase: 5, released: '2025-02', chrono: 49, storyYear: '2027', branch: 'sacred', seen: true },
    { id: 'daredevil-born-again', title: 'Daredevil: Born Again', kind: 'series', phase: 5, released: '2025-03', chrono: 50, storyYear: '2026–27', branch: 'sacred', seen: false },
    { id: 'thunderbolts', title: 'Thunderbolts*', kind: 'film', phase: 5, released: '2025-05', chrono: 57, storyYear: '2027', branch: 'sacred', seen: true },
    { id: 'ironheart', title: 'Ironheart', kind: 'series', phase: 5, released: '2025-06', chrono: 58, storyYear: '2026', branch: 'sacred', seen: false },

    // ── Phase 6 ──
    { id: 'fantastic-four', title: 'The Fantastic Four: First Steps', kind: 'film', phase: 6, released: '2025-07', chrono: 59, storyYear: '1960s retro-future', branch: 'multiverse', universe: 'Earth-828', seen: true },
    { id: 'eyes-of-wakanda', title: 'Eyes of Wakanda', kind: 'series', phase: 6, released: '2025-08', chrono: 1, storyYear: '1260 BCE–1896', branch: 'sacred', seen: false },
    { id: 'marvel-zombies', title: 'Marvel Zombies', kind: 'series', phase: 6, released: '2025-09', chrono: 60, storyYear: 'Zombie Earth', branch: 'multiverse', universe: 'What If…? branch', seen: false },
    { id: 'wonder-man', title: 'Wonder Man', kind: 'series', phase: 6, released: '2026-01', chrono: 61, storyYear: '2027', branch: 'sacred', seen: false },
    { id: 'daredevil-born-again-2', title: 'Daredevil: Born Again (Season 2)', kind: 'series', phase: 6, released: '2026-03', chrono: 62, storyYear: '2027', branch: 'sacred', seen: false },
    { id: 'brand-new-day', title: 'Spider-Man: Brand New Day', kind: 'film', phase: 6, released: '2026-07', chrono: 63, storyYear: '2027', branch: 'sacred', seen: false },
    { id: 'doomsday', title: 'Avengers: Doomsday', kind: 'film', phase: 6, released: '2026-12', chrono: 64, storyYear: 'TBA', branch: 'sacred', seen: false, upcoming: true },
    { id: 'secret-wars', title: 'Avengers: Secret Wars', kind: 'film', phase: 6, released: '2027-12', chrono: 65, storyYear: 'TBA', branch: 'multiverse', universe: 'Every universe', seen: false, upcoming: true },
];

/** Marvel Television shows outside Marvel Studios (Netflix, ABC, Hulu), from Trupal's own list. */
export const MARVEL_TV_LEGACY: { title: string; network: string; seen: boolean }[] = [
    { title: 'Daredevil', network: 'Netflix', seen: true },
    { title: 'Jessica Jones', network: 'Netflix', seen: true },
    { title: 'Luke Cage', network: 'Netflix', seen: true },
    { title: 'Iron Fist', network: 'Netflix', seen: true },
    { title: 'The Defenders', network: 'Netflix', seen: true },
    { title: 'The Punisher', network: 'Netflix', seen: true },
    { title: 'Inhumans', network: 'ABC', seen: true },
    { title: 'Agents of S.H.I.E.L.D.', network: 'ABC', seen: true },
    { title: 'Agent Carter', network: 'ABC', seen: false },
    { title: 'Runaways', network: 'Hulu', seen: false },
    { title: 'Cloak & Dagger', network: 'Freeform', seen: false },
    { title: 'Legion', network: 'FX', seen: false },
    { title: 'Helstrom', network: 'Hulu', seen: false },
];

export const byRelease = () => [...MARVEL].sort((a, b) => a.released.localeCompare(b.released));
export const byChrono = () => [...MARVEL].sort((a, b) => a.chrono - b.chrono);
