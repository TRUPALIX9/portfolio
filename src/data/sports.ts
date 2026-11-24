/** Sports and games Trupal plays. Only what Trupal has told us. */
export type Sport = {
    name: string;
    kind: 'Team' | 'Racket' | 'Indian classic' | 'Combat' | 'Track' | 'Field' | 'Screen';
    icon: string;
    /** Played on a field or court, or on a screen. */
    world: 'real' | 'virtual';
};

export const SPORTS: Sport[] = [
    { name: 'Soccer', kind: 'Team', icon: 'soccer', world: 'real' },
    { name: 'Cricket', kind: 'Team', icon: 'cricket', world: 'real' },
    { name: 'Volleyball', kind: 'Team', icon: 'volleyball', world: 'real' },
    { name: 'Badminton', kind: 'Racket', icon: 'badminton', world: 'real' },
    { name: 'Tennis', kind: 'Racket', icon: 'tennis', world: 'real' },
    { name: 'Kho kho', kind: 'Indian classic', icon: 'khokho', world: 'real' },
    { name: 'Kabaddi', kind: 'Indian classic', icon: 'kabaddi', world: 'real' },
    { name: 'Wrestling', kind: 'Combat', icon: 'wrestling', world: 'real' },
    { name: 'Track running', kind: 'Track', icon: 'track', world: 'real' },
    { name: 'High jump', kind: 'Field', icon: 'highjump', world: 'real' },
    { name: 'Long jump', kind: 'Field', icon: 'longjump', world: 'real' },
    { name: 'Discus throw', kind: 'Field', icon: 'discus', world: 'real' },
    { name: 'Hammer throw', kind: 'Field', icon: 'hammer', world: 'real' },
    { name: 'Shot put', kind: 'Field', icon: 'shotput', world: 'real' },
    { name: 'Javelin throw', kind: 'Field', icon: 'javelin', world: 'real' },
    // The video game list is coming from Trupal; until then, one card for the lot.
    { name: 'Video games', kind: 'Screen', icon: 'games', world: 'virtual' },
];
