/** Content for the LogicSprint: Brain Games product pages (/logicsprint). */

export type GameType = 'rocketLaunch' | 'memoryLane' | 'quickMath' | 'guessColor';

export type LogicSprintGame = {
    type: GameType;
    name: string;
    skill: string;
    accent: string;
    description: string;
    /** Difficulty breakdown shown as a small table under the description. */
    modes?: { level: string; detail: string }[];
};

export const APP = {
    name: 'LogicSprint',
    title: 'LogicSprint: Brain Games',
    tagline: 'Endless brain games for reflexes, memory, math and focus.',
    apkUrl: 'https://github.com/TRUPALIX9/logic-sprint/releases/download/v1.0.0-rc.1/LogicSprint-1.0.0-rc.1.apk',
    apkLabel: 'Download APK (RC 1)',
    buildNote: 'Android · test build · Google Play coming soon',
    supportEmail: 'trupal.work@gmail.com',
    icon: '/logicsprint/icon.png',
    featureGraphic: '/logicsprint/feature-graphic.png',
} as const;

export const GAMES: LogicSprintGame[] = [
    {
        type: 'rocketLaunch',
        name: 'Rocket Launch',
        skill: 'Reflex',
        accent: '#3B7BF0',
        description: 'Steer through a green asteroid storm that keeps speeding up. One hit ends the run.',
    },
    {
        type: 'memoryLane',
        name: 'Memory Lane',
        skill: 'Memory',
        accent: '#2BB3D6',
        description: 'Repeat the pattern, one tile longer each level.',
        modes: [
            { level: 'Easy', detail: '3×3' },
            { level: 'Medium', detail: '4×4' },
            { level: 'Hard', detail: '5×5' },
        ],
    },
    {
        type: 'quickMath',
        name: 'Quick Math',
        skill: 'Arithmetic',
        accent: '#34C29A',
        description: 'Problems get harder every 10.',
        modes: [
            { level: 'Easy', detail: '+ −' },
            { level: 'Medium', detail: '+ − ×' },
            { level: 'Hard', detail: '+ − × ÷' },
        ],
    },
    {
        type: 'guessColor',
        name: 'Guess Color',
        skill: 'Focus',
        accent: '#8C8CFF',
        description:
            'A COLOR | TEXT switch tells you whether to tap the color the word is painted in or the color it names. The rule flips, buttons shuffle and the clock shrinks.',
    },
];

export const HOW_IT_WORKS = [
    'Endless runs that end on your first mistake.',
    'One extra life per run from an optional ad.',
    'Global Top 10 per game.',
    'Pick a display name once.',
    'No login.',
];

/** Store screenshots (1080×2400), in store order. */
export const SCREENSHOTS = [
    { src: '/logicsprint/screenshots/01_home.png', label: 'Play tab', alt: 'Play tab: a "Jump back in" card for the last game played, above four game tiles showing each game’s best score.' },
    { src: '/logicsprint/screenshots/02_game_sheet.png', label: 'Game sheet', alt: 'Memory Lane game sheet: the rules, Easy 3×3, Medium 4×4 and Hard 5×5 difficulty options with your best score for each, and a Start button.' },
    { src: '/logicsprint/screenshots/03_rocket_launch.png', label: 'Rocket Launch', alt: 'Rocket Launch in play: a white rocket at the bottom of a starfield with green asteroids falling toward it, and the hint "Touch and drag to steer".' },
    { src: '/logicsprint/screenshots/04_memory_lane.png', label: 'Memory Lane', alt: 'Memory Lane on Medium: a 4×4 grid with one tile lit under the prompt "Watch the pattern", level 1.' },
    { src: '/logicsprint/screenshots/05_quick_math.png', label: 'Quick Math', alt: 'Quick Math on Medium: the problem 15 + 47 with four answer buttons, 72, 62, 59 and 61.' },
    { src: '/logicsprint/screenshots/06_guess_color.png', label: 'Guess Color', alt: 'Guess Color in play: the COLOR | TEXT switch set to COLOR, the word BLUE painted red, and red, blue, green and yellow answer buttons.' },
    { src: '/logicsprint/screenshots/07_result.png', label: 'Result', alt: 'Game over screen for Quick Math Medium: a score of 420 marked as a new best, 38 correct in 1:24, global rank #5, with Home and Play Again buttons.' },
    { src: '/logicsprint/screenshots/08_ranks.png', label: 'Global Top 10', alt: 'Global Top 10: the Quick Math medium leaderboard with ten ranked players, their run times and scores, with your own row highlighted.' },
    { src: '/logicsprint/screenshots/09_profile.png', label: 'Profile', alt: 'Profile screen: the display name NEON_FOX with 124 runs played and an Edit button, above your best score and play count for each game and difficulty.' },
];
