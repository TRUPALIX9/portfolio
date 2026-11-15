/** Sports and games Trupal plays. Only what Trupal has told us. */
export type Sport = { name: string; kind: 'Team' | 'Racket' | 'Indian classic' | 'Screen'; icon: string };

export const SPORTS: Sport[] = [
    { name: 'Soccer', kind: 'Team', icon: 'soccer' },
    { name: 'Cricket', kind: 'Team', icon: 'cricket' },
    { name: 'Volleyball', kind: 'Team', icon: 'volleyball' },
    { name: 'Badminton', kind: 'Racket', icon: 'badminton' },
    { name: 'Tennis', kind: 'Racket', icon: 'tennis' },
    { name: 'Kho kho', kind: 'Indian classic', icon: 'khokho' },
    { name: 'Kabaddi', kind: 'Indian classic', icon: 'kabaddi' },
    { name: 'Video games', kind: 'Screen', icon: 'games' },
];
