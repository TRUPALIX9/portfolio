import type { Metadata } from 'next';
import DilemmaQuiz from '@/components/quiz/DilemmaQuiz';

export const metadata: Metadata = {
    title: 'What would you do? · Trupal Patel',
    description: 'Ten everyday situations with no right or wrong answers. Answer anonymously and see how other people chose.',
    alternates: { canonical: '/quiz' },
};

export default function QuizPage() {
    return (
        <main className="qz-page">
            <DilemmaQuiz />
        </main>
    );
}
