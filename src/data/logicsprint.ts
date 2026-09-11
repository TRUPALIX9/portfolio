/** Content for the LogicSprint: Brain Games product site (logicsprint.trupalpatel.com). */

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
    pitch: 'Four quick games, each training one skill. Every run is endless and ends on your first mistake, so you can play for a minute or keep chasing your best, and your top scores go up against everyone on a global Top 10. No sign-up, no login.',
    apkUrl: 'https://github.com/TRUPALIX9/logic-sprint/releases/download/v1.0.0-rc.1/LogicSprint-1.0.0-rc.1.apk',
    apkLabel: 'Download APK (RC 1)',
    buildNote: 'Android · test build · Google Play coming soon',
    supportEmail: 'trupal.work@gmail.com',
    icon: '/logicsprint/icon.png',
    featureGraphic: '/logicsprint/feature-graphic.png',
} as const;

/** Hero chips. */
export const FACTS = ['4 games', 'Easy · Medium · Hard', 'Global Top 10', 'No login'];

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

export type Point = { title: string; detail: string };

/** "How a run works", in order. */
export const RUN_STEPS: Point[] = [
    { title: 'Pick a game', detail: 'Choose one of four games and a difficulty: Easy, Medium or Hard.' },
    { title: 'Play until you slip', detail: 'Runs are endless and ramp up as you go. Your first mistake ends the run.' },
    { title: 'Take one more shot', detail: 'Watch an optional ad for one extra life, once per run.' },
    { title: 'Climb the board', detail: 'Your best score for each game and difficulty goes up against everyone on the global Top 10.' },
];

export const FEATURES: Point[] = [
    {
        title: 'No login, ever',
        detail: 'No email, password or sign-up. The app creates an anonymous profile for your device the first time it talks to the leaderboard.',
    },
    {
        title: 'Global Top 10',
        detail: 'Every game and difficulty has its own worldwide Top 10. Pick a display name once and it appears next to your best scores.',
    },
    {
        title: 'Three real difficulties',
        detail: 'Easy, Medium and Hard change the game itself: bigger Memory Lane grids, more operators in Quick Math.',
    },
    {
        title: 'Your stats',
        detail: 'Your profile tracks your best score and play count for every game and difficulty. Run history stays on your phone.',
    },
    {
        title: 'An extra life, if you want it',
        detail: 'One optional video ad per run brings you back after a mistake. Skip it and the run simply ends.',
    },
    {
        title: 'Sound and vibration',
        detail: 'Switch sound and vibration on or off in Settings, and reset your high scores any time.',
    },
];

/** Plain-language summary of src/content/logicsprint/privacy_policy.md; keep the two in sync. */
export const PRIVACY_POINTS: Point[] = [
    { title: 'No account needed', detail: 'No email, phone number or password. Your device gets an anonymous player profile.' },
    { title: 'Kept on your phone', detail: 'High scores, run history, settings and your display name live on your device. Run history never leaves it.' },
    { title: 'Ads by Google AdMob', detail: 'In the EEA, UK and Switzerland the app asks before showing personalized ads.' },
    { title: 'Never collected', detail: 'Contacts, photos, camera, microphone or precise location. No analytics SDKs.' },
];

export const FAQ: { question: string; answer: string }[] = [
    {
        question: 'Is LogicSprint free?',
        answer: 'Yes. It’s free to play and shows ads through Google AdMob, including an optional video ad for an extra life.',
    },
    {
        question: 'Do I need an account?',
        answer: 'No. There’s no email, password or login. The app creates an anonymous profile for your device automatically.',
    },
    {
        question: 'Is it on Google Play?',
        answer: 'Not yet. The Google Play release is coming soon. Until then you can install the Android test build (RC 1) directly.',
    },
    {
        question: 'How do I install the APK?',
        answer: 'Download the APK on your Android phone and open it. If Android asks, allow your browser to install apps, then tap Install.',
    },
    {
        question: 'How does the leaderboard work?',
        answer: 'Each game and difficulty has a global Top 10 ranked by best score. Choose a display name to appear on it, and don’t use your real name.',
    },
    {
        question: 'Can I reset or delete my data?',
        answer: 'Reset your high scores in Settings → Reset High Scores. Uninstalling deletes everything on your device. To remove your profile and scores from the leaderboard, email support with your display name.',
    },
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
