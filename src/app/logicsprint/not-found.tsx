import type { Metadata } from 'next';
import NotFoundGameOver, { GAME_OVER_TITLE } from '@/components/logicsprint/story/NotFoundGameOver';

export const metadata: Metadata = {
    title: GAME_OVER_TITLE,
    robots: { index: false },
};

export default function LogicSprintNotFound() {
    return <NotFoundGameOver />;
}
