/** Content for the LogicSprint: Brain Games product site (logicsprint.trueorfalse.dev). */

export type GameType = 'rocketLaunch' | 'memoryLane' | 'quickMath' | 'guessColor' | 'angleSense' | 'lineSplit';

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
    tagline: 'Six brain games for memory, math, reflexes, focus and angles. How far can you go?',
    pitch: 'Train your brain in a minute a day. Six endless mini games for reflexes, memory, mental math, focus, angles and fractions, and every run gets harder until your first mistake. Play for a minute or keep chasing your best: your top scores go up against everyone on a daily global Top 10, and a Sprint Score shows where you stand across all six. No sign-up, no login.',
    version: '1.1.0',
    playUrl: 'https://play.google.com/store/apps/details?id=com.trupal.logicsprint',
    appStoreUrl: 'https://apps.apple.com/us/app/logicsprint-brain-games/id6817549079',
    buildNote: 'Android on Google Play · iPhone and iPad on the App Store',
    supportEmail: 'hello@trueorfalse.dev',
    icon: '/logicsprint/icon.png',
    featureGraphic: '/logicsprint/feature-graphic.png',
    trailer: '/logicsprint/trailer.mp4',
    trailerPoster: '/logicsprint/trailer-poster.jpg',
} as const;

/** Hero chips. */
export const FACTS = ['6 games', 'Sprint Score', 'Up to 3 revives', 'Daily global Top 10', 'No login', 'Plays offline'];

export const GAMES: LogicSprintGame[] = [
    {
        type: 'rocketLaunch',
        name: 'Rocket Launch',
        skill: 'Reflex',
        accent: '#3B7BF0',
        description:
            'Pick a Rocket, UFO, Spaceship or Missile and steer through an asteroid storm with one finger. Space changes colour every 1250 points and the storm speeds up little by little. One hit ends the run. Can you reach 10,000?',
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
            'Watch tiles light up on a 3×3, 4×4 or 5×5 grid, then tap them back in the same order. Every level replays the pattern with one more tile, a little faster. Red corners mean watch, teal means your turn.',
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
        description: 'Addition, subtraction, multiplication and division against the clock. Pick the right answer of four; the numbers grow every 10 problems, and your time is saved with your best.',
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
            'A Stroop color test: the COLOR | TEXT switch says whether to tap the color a word is painted in or the color it names. The rule flips, the buttons shuffle, their labels stop matching and the clock shrinks from 3 s to 1 s.',
    },
    {
        type: 'angleSense',
        name: 'Angle Sense',
        skill: 'Spatial',
        accent: '#F5C542',
        description:
            'Read an angle and lock it in on the degree tape, or drag the arm to match. Flat angles first, then upright and crossed lines, with clocks, pies and a compass round on Medium. Within 3° counts as Sharp. Two shields per run.',
        modes: [
            { level: 'Easy', detail: 'No timer' },
            { level: 'Medium', detail: 'Clocks · pies' },
            { level: 'Hard', detail: 'Any angle' },
        ],
    },
    {
        type: 'lineSplit',
        name: 'Line Split',
        skill: 'Estimation',
        accent: '#F472B6',
        description:
            'Touch where a number falls on the line: ½, then ⅓, ⅜, 0.43 and fractions like 11/5. Slide to adjust and let go. The lines get longer and the middle numbers disappear as you go, and you see exactly how close you were. Two shields per run.',
        modes: [
            { level: 'Shields', detail: '2' },
            { level: 'Stages', detail: '7' },
            { level: 'Sharp', detail: '≤ 2%' },
        ],
    },
];

export type Point = { title: string; detail: string };

/** "How a run works", in order. */
export const RUN_STEPS: Point[] = [
    { title: 'Pick a game', detail: 'Choose one of six games on the Play tab, then a difficulty or, for Rocket Launch, your ship.' },
    { title: 'Play until you slip', detail: 'Runs are endless and ramp up as you go. Pause any time; your first mistake ends the run. In Angle Sense and Line Split a miss breaks one of 2 shields instead.' },
    { title: 'Come back up to 3 times', detail: 'Spend a heart or watch a short video to revive, up to three times per run, with a 3-2-1 countdown to get ready. Game Over gives you a tip for the next run.' },
    { title: 'Climb the board', detail: 'Your best for each game and difficulty goes up on the global Top 10, which updates every day at 00:00 UTC. Play them all for a Sprint Score.' },
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
        title: 'Fair leaderboards',
        detail: 'Names carry a 4-digit code, like NEON_FOX#0420. Offensive names are blocked, you can report one with a long-press on Ranks, and impossible scores don’t count. Delete your name and scores any time in Settings.',
    },
    {
        title: 'Sprint Score',
        detail: 'One Top X% across all six games, on your Profile. Each game you’ve played 3+ times counts, so steady skill beats one lucky run. It shows once enough players are rated.',
    },
    {
        title: 'Hearts and revives',
        detail: 'Go down and come back up to 3 times per run with a heart or a short video, then a 3-2-1 countdown. Skip it and the run simply ends.',
    },
    {
        title: 'Pause any time',
        detail: 'A one-row top bar with pause, a banner and your score. The back button pauses too, and runs pause themselves when you leave the app.',
    },
    {
        title: 'Music for every game',
        detail: 'Each game has its own calm loop: space ambience, piano, marimba, bells, a music box and kalimba. It plays only during a run and turns off in Settings → Music.',
    },
    {
        title: 'Your stats, offline too',
        detail: 'Each card on the Play tab shows your best, and your Profile has every game’s best with its board rank, your run history and a Share button. It plays offline and your runs sync when you’re back.',
    },
];

/** Plain-language summary of src/content/logicsprint/privacy_policy.md; keep the two in sync. */
export const PRIVACY_POINTS: Point[] = [
    { title: 'No account needed', detail: 'No email, phone number or password. Your device gets an anonymous player profile.' },
    { title: 'Kept on your phone', detail: 'High scores, run history, hearts, settings, your display name and which ads you’ve seen live on your device. Run history and ad counts never leave it.' },
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
        answer: 'LogicSprint is on Google Play for Android and on the App Store for iPhone and iPad.',
    },
    {
        question: 'How does the leaderboard work?',
        answer: 'Each game and difficulty has a global Top 10 ranked by best score. Boards update for everyone daily at 00:00 UTC, and your own new best shows right away. Pick a name with a 4-digit code (like NEON_FOX#0420) to appear on it, and don’t use your real name. Offensive names are refused, and you can long-press a name to report it.',
    },
    {
        question: 'What is the Sprint Score?',
        answer: 'One “Top X%” across all six games, shown on your Profile. Each game you’ve played 3 or more times counts its best board, and steady play across games beats one big score. It appears once enough players are rated; until then Profile says “Play more games to get your score”.',
    },
    {
        question: 'What are hearts?',
        answer: 'Hearts let you revive after a mistake without watching a video. You can come back up to 3 times per run, with a heart or a short video.',
    },
    {
        question: 'Can I turn the music off?',
        answer: 'Yes. Each game has its own quiet music that plays only during a run. Turn it off in Settings → Music. It also follows your phone’s silent switch.',
    },
    {
        question: 'Can I reset or delete my data?',
        answer: 'Reset your high scores in Settings → Reset High Scores. Uninstalling deletes everything on your device. To remove your profile and scores from the leaderboard, open Settings → Delete leaderboard data, or email support with your display name and its 4-digit code.',
    },
];

/** App Store screenshots from 1.1 (store frames with a caption), cropped to 1080×2400, in store order. */
export const SCREENSHOTS = [
    { src: '/logicsprint/screenshots/01_home.png', label: 'Play tab', alt: 'Play tab under the caption "6 games · 1 mistake. Train your brain in a sprint": three hearts, and six game cards, each with its name, your best score, its skill and a large icon.' },
    { src: '/logicsprint/screenshots/02_rocket_launch.png', label: 'Rocket Launch', alt: 'Rocket Launch under the caption "Dodge the asteroid storm": a white rocket near the bottom of a starry field with asteroids and two planets, score 20.' },
    { src: '/logicsprint/screenshots/03_guess_color.png', label: 'Guess Color', alt: 'Guess Color under the caption "Color or word? Keep up": the COLOR | TEXT switch set to COLOR, the word GREEN painted red, and red, blue, green and yellow answer buttons.' },
    { src: '/logicsprint/screenshots/04_angle_sense.png', label: 'Angle Sense', alt: 'Angle Sense, marked new, under the caption "Read the angle. Lock it.": READ mode on Medium, question 1, an angle on the card, two shields, and a degree tape set to 90 with −1, Lock and +1 buttons.' },
    { src: '/logicsprint/screenshots/05_line_split.png', label: 'Line Split', alt: 'Line Split, marked new, under the caption "Guess. See how close.": the target ½ from the 0 end on a 0 to 1 line, a "Miss −42.3%" chip, and one of two shields left.' },
    { src: '/logicsprint/screenshots/06_memory_lane.png', label: 'Memory Lane', alt: 'Memory Lane under the caption "Repeat the pattern": level 1 on a 4×4 grid framed by red corners, one tile lit, under the banner "Watch · don’t tap".' },
    { src: '/logicsprint/screenshots/07_quick_math.png', label: 'Quick Math', alt: 'Quick Math under the caption "Do the math, fast": the problem 21 − 8 with four answer buttons, 13, 18, 16 and 3.' },
    { src: '/logicsprint/screenshots/08_revive.png', label: 'Revive', alt: 'The revive offer in Rocket Launch under the caption "Slip up? Revive and go": Game Over at a score of 110 with a 4-second countdown, a "Use heart · 3 left" button and End run.' },
    { src: '/logicsprint/screenshots/09_ranks.png', label: 'Daily Top 10', alt: 'Global Top 10 for Rocket Launch under the caption "Climb the daily leaderboard": updated daily at 00:00 UTC with a Refresh button, arrows to switch games, and your row NEON_FOX#0420 highlighted at #2.' },
    { src: '/logicsprint/screenshots/10_profile.png', label: 'Profile', alt: 'Profile under the caption "Sprint Score · no login. One score for all six": NEON_FOX#0420 with a Top 5% Sprint Score gauge, your best in each of the six games, and the start of your run history.' },
];
