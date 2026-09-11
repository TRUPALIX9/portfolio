import { APP, FAQ, FEATURES, GAMES, RUN_STEPS } from '@/data/logicsprint';
import { LOGICSPRINT_URL, SITE_URL } from '@/data/site';

// llms.txt for logicsprint.* (src/proxy.ts rewrites /llms.txt there to this route).
// Built from the same data as the product page, so it can't drift from it.
export const dynamic = 'force-static';

export function GET() {
    const body = [
        `# ${APP.title}`,
        '',
        `> ${APP.tagline}`,
        '',
        APP.pitch,
        '',
        `- Platform: Android (${APP.buildNote})`,
        `- Download: ${APP.apkUrl}`,
        `- Price: free, contains ads (Google AdMob)`,
        `- Developer: Trupal Patel (${SITE_URL})`,
        `- Support: ${APP.supportEmail}`,
        '',
        '## Games',
        ...GAMES.map((game) => `- ${game.name} (${game.skill}): ${game.description}`),
        '',
        '## How a run works',
        ...RUN_STEPS.map((step, i) => `${i + 1}. ${step.title}: ${step.detail}`),
        '',
        '## Features',
        ...FEATURES.map((feature) => `- ${feature.title}: ${feature.detail}`),
        '',
        '## FAQ',
        ...FAQ.flatMap((item) => [`### ${item.question}`, item.answer, '']),
        '## Pages',
        `- [Home](${LOGICSPRINT_URL}): games, leaderboard, screenshots, FAQ and download`,
        `- [Privacy policy](${LOGICSPRINT_URL}/privacy)`,
        '',
    ].join('\n');
    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
