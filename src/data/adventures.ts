/**
 * Trupal's adventure log for the About page. Only what Trupal has told us: nothing is made up.
 * Add `where`, `when` and `photo` (a path under /public) once known.
 */
export type AdventureCategory = 'Air' | 'Water' | 'Land' | 'Thrills' | 'Sport';

export type Adventure = {
    activity: string;
    category: AdventureCategory;
    status: 'done' | 'planned';
    /** One-line context, e.g. "A basic session". */
    note?: string;
    /** Named places or parts, e.g. which treks or which parks. */
    items?: string[];
    where?: string;
    when?: string;
    photo?: string;
};

export const ADVENTURE_CATEGORIES: { id: AdventureCategory; label: string }[] = [
    { id: 'Air', label: 'Air' },
    { id: 'Water', label: 'Water' },
    { id: 'Land', label: 'Mountains & land' },
    { id: 'Thrills', label: 'Thrills' },
    { id: 'Sport', label: 'Sport & games' },
];

export const ADVENTURES: Adventure[] = [
    { activity: 'Paragliding', category: 'Air', status: 'done' },
    { activity: 'Bungee jumping', category: 'Air', status: 'done' },
    { activity: 'Zipline', category: 'Air', status: 'done' },
    { activity: 'Parasailing', category: 'Air', status: 'done' },
    { activity: 'Skydiving', category: 'Air', status: 'planned' },

    { activity: 'Scuba diving', category: 'Water', status: 'done' },
    { activity: 'Snorkelling', category: 'Water', status: 'done' },
    // Photos to come from Trupal.
    { activity: 'White-water rafting', category: 'Water', status: 'done', items: ['Rishikesh · Mar 2024', 'Ottawa · Jul 2025'] },
    { activity: 'Kayaking', category: 'Water', status: 'done' },
    { activity: 'Canoeing', category: 'Water', status: 'done' },
    { activity: 'Paddle boating', category: 'Water', status: 'done' },
    { activity: 'Jet ski', category: 'Water', status: 'done' },
    { activity: 'Surfing', category: 'Water', status: 'done', note: 'A basic session' },

    { activity: 'Trekking', category: 'Land', status: 'done', note: 'Backpacking treks and day hikes', items: ['Kedarkantha', 'Bhrigu Lake'] },
    { activity: 'Camping', category: 'Land', status: 'done' },
    { activity: 'Ice skating', category: 'Land', status: 'planned' },

    {
        activity: 'Theme parks',
        category: 'Thrills',
        status: 'done',
        items: ['Six Flags Over Georgia', 'Universal Orlando', 'Dreamworld, Australia', "Canada's Wonderland, Toronto", 'Hersheypark, PA'],
    },
    { activity: 'Escape room', category: 'Thrills', status: 'planned' },
    { activity: 'Shooting range', category: 'Thrills', status: 'planned' },

    { activity: 'Paintball', category: 'Sport', status: 'done' },
    { activity: 'Bowling', category: 'Sport', status: 'done', note: 'Loves it' },
    { activity: 'Marathon', category: 'Sport', status: 'planned', note: 'Some day' },
];
