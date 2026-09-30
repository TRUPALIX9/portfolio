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
    pitch: 'Four quick games, each training one skill. Every run is endless and ends on your first mistake, so you can play for a minute or keep chasing your best, and your top scores go up against everyone on a daily global Top 10. No sign-up, no login.',
    version: '1.0.1',
    playUrl: 'https://play.google.com/store/apps/details?id=com.trupal.logicsprint',
    buildNote: 'Android on Google Play · iPhone and iPad coming soon to the App Store',
    supportEmail: 'trupal.work@gmail.com',
    icon: '/logicsprint/icon.png',
    featureGraphic: '/logicsprint/feature-graphic.png',
} as const;

/** Hero chips. */
export const FACTS = ['4 games', 'Up to 3 revives', 'Daily global Top 10', 'No login'];

export const GAMES: LogicSprintGame[] = [
    {
        type: 'rocketLaunch',
        name: 'Rocket Launch',
        skill: 'Reflex',
        accent: '#3B7BF0',
        description:
            'Pick a Rocket, UFO, Spaceship or Missile and steer through an asteroid storm. Planets drift past, shooting stars streak by, and space changes colour every 1250 points. It speeds up gently, and one hit ends the run. Can you reach 10,000?',
        modes: [
            { level: 'Ships', detail: '4' },
            { level: 'Themes', detail: '5' },
            { level: 'New theme', detail: '1250 pts' },
        ],
    },
    {
        type: 'memoryLane',
        name: 'Memory Lane',
        skill: 'Memory',
        accent: '#2BB3D6',
        description:
            'Watch the tiles light up, then tap them back in order. Each level replays the same pattern with one more tile, a little faster. Red corners mean watch, teal means your turn.',
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
        description: 'Pick the right answer of four. Problems get harder every 10, and your time is saved with your best.',
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
            'A COLOR | TEXT switch tells you whether to tap the color the word is painted in or the color it names. The rule flips, buttons shuffle, their labels stop matching and the clock shrinks from 3 s to 1 s.',
    },
];

export type Point = { title: string; detail: string };

/** "How a run works", in order. */
export const RUN_STEPS: Point[] = [
    { title: 'Pick a game', detail: 'Choose one of four games, then a difficulty or, for Rocket Launch, your ship.' },
    { title: 'Play until you slip', detail: 'Runs are endless and ramp up as you go. Pause any time; your first mistake ends the run.' },
    { title: 'Come back up to 3 times', detail: 'Spend a heart or watch a short video to revive, up to three times per run.' },
    { title: 'Climb the board', detail: 'Your best for each game and difficulty goes up on the global Top 10, which updates every day at 00:00 UTC.' },
];

export const FEATURES: Point[] = [
    {
        title: 'No login, ever',
        detail: 'No email, password or sign-up. The app creates an anonymous profile for your device the first time it talks to the leaderboard.',
    },
    {
        title: 'Daily global Top 10',
        detail: 'Every game and difficulty has its own worldwide Top 10, updated for everyone at 00:00 UTC. Your own new best shows right away, and a short video refreshes the boards early.',
    },
    {
        title: 'Your name, your code',
        detail: 'Names carry a 4-digit code, like NEON_FOX#0420, so two players can share a name. "Find a free code" picks one for you.',
    },
    {
        title: 'Hearts and revives',
        detail: 'Go down and come back up to 3 times per run with a heart or a short video. Skip it and the run simply ends.',
    },
    {
        title: 'Pause any time',
        detail: 'A one-row top bar with pause, a banner and your score. The back button pauses too, and runs pause themselves when you leave the app.',
    },
    {
        title: 'Your stats, offline too',
        detail: 'Your profile tracks your rank, bests, play counts and run history. It plays offline and your runs sync when you’re back.',
    },
];

/** Plain-language summary of src/content/logicsprint/privacy_policy.md; keep the two in sync. */
export const PRIVACY_POINTS: Point[] = [
    { title: 'No account needed', detail: 'No email, phone number or password. Your device gets an anonymous player profile.' },
    { title: 'Kept on your phone', detail: 'High scores, run history, hearts, settings and your display name live on your device. Run history never leaves it.' },
    { title: 'Ads by Google AdMob', detail: 'Banners outside gameplay and optional videos. No internet, no ads. In the EEA, UK and Switzerland the app asks before showing personalized ads, and on iPhone it asks before tracking.' },
    { title: 'Never collected', detail: 'Contacts, photos, camera, microphone or precise location. No analytics SDKs.' },
];

export const FAQ: { question: string; answer: string }[] = [
    {
        question: 'Is LogicSprint free?',
        answer: 'Yes. It’s free to play and shows ads through Google AdMob: banners outside gameplay, plus optional videos for a revive, hearts or an early leaderboard refresh.',
    },
    {
        question: 'Do I need an account?',
        answer: 'No. There’s no email, password or login. The app creates an anonymous profile for your device automatically.',
    },
    {
        question: 'Where can I get it?',
        answer: 'LogicSprint is on Google Play for Android. The iPhone and iPad version is coming soon to the App Store.',
    },
    {
        question: 'How does the leaderboard work?',
        answer: 'Each game and difficulty has a global Top 10 ranked by best score. Boards update for everyone daily at 00:00 UTC, and your own new best shows right away. Pick a name with a 4-digit code (like NEON_FOX#0420) to appear on it, and don’t use your real name. Offensive names are refused, and you can long-press a name to report it.',
    },
    {
        question: 'What are hearts?',
        answer: 'Hearts let you revive after a mistake without watching a video. You can come back up to 3 times per run, with a heart or a short video.',
    },
    {
        question: 'Can I reset or delete my data?',
        answer: 'Reset your high scores in Settings → Reset High Scores. Uninstalling deletes everything on your device. To remove your profile and scores from the leaderboard, open Settings → Delete leaderboard data, or email support with your display name and its 4-digit code.',
    },
];

/** Store screenshots (1080×2400), in store order. */
export const SCREENSHOTS = [
    { src: '/logicsprint/screenshots/01_home.png', label: 'Play tab', alt: 'Play tab: two hearts in the corner, a "Jump back in" card for Quick Math, and four game tiles showing each game’s best score.' },
    { src: '/logicsprint/screenshots/02_game_sheet.png', label: 'Ship picker', alt: 'Rocket Launch game sheet: the rules, your best score, and a ship picker with Rocket, UFO, Spaceship and Missile, above a Start button.' },
    { src: '/logicsprint/screenshots/03_rocket_launch.png', label: 'Rocket Launch', alt: 'Rocket Launch at 3930 points in the purple theme: a pink missile weaves between gold asteroids past a moon world and a gas giant as a shooting star streaks by.' },
    { src: '/logicsprint/screenshots/04_memory_lane.png', label: 'Memory Lane', alt: 'Memory Lane on Medium: a 4×4 grid framed by red corners with one tile lit, under the banner "Watch · don’t tap".' },
    { src: '/logicsprint/screenshots/05_quick_math.png', label: 'Quick Math', alt: 'Quick Math: the problem 8 × 5 with four answer buttons, 45, 40, 37 and 38, under a pause button and the score.' },
    { src: '/logicsprint/screenshots/06_guess_color.png', label: 'Guess Color', alt: 'Guess Color in play: the COLOR | TEXT switch set to COLOR, the word GREEN painted red, and red, blue, green and yellow answer buttons.' },
    { src: '/logicsprint/screenshots/07_result.png', label: 'Result', alt: 'Game over screen for Quick Math Medium: a score of 420 marked as a new best, 38 correct in 1:24, global rank #5, with Home and Play Again buttons.' },
    { src: '/logicsprint/screenshots/08_ranks.png', label: 'Daily Top 10', alt: 'Global Top 10 for Quick Math Medium, updated daily at 00:00 UTC with a Refresh button: ten players with 4-digit name codes, and your row NEON_FOX#0420 highlighted at #5.' },
    { src: '/logicsprint/screenshots/09_profile.png', label: 'Profile', alt: 'Profile screen: the display name NEON_FOX#0420 with 124 runs played and an Edit button, above your best score, time and play count for each game and difficulty.' },
];
