/**
 * Everyday dilemmas for the /quiz survey. There are no right or wrong answers: each option carries a
 * neutral trait tag, used only to describe a visitor's instincts at the end.
 */

export type Trait = 'principled' | 'diplomatic' | 'pragmatic' | 'loyal' | 'cautious' | 'generous';

export const TRAITS: Record<Trait, { label: string; line: string }> = {
    principled: { label: 'Principled', line: 'You tend to follow a clear rule, even when bending it would be easier.' },
    diplomatic: { label: 'Diplomatic', line: 'You look for the answer that keeps people talking and relationships intact.' },
    pragmatic: { label: 'Pragmatic', line: 'You weigh what actually works in the situation in front of you.' },
    loyal: { label: 'Loyal', line: 'The people close to you come first when choices pull in different directions.' },
    cautious: { label: 'Cautious', line: 'You prefer to pause, gather more information, and avoid making things worse.' },
    generous: { label: 'Generous', line: 'You lean toward giving more than you take, of time, money or credit.' },
};

export type DilemmaOption = { id: string; text: string; trait: Trait };
export type Dilemma = { id: string; title: string; situation: string; options: DilemmaOption[] };

export const DILEMMAS: Dilemma[] = [
    {
        id: 'wallet',
        title: 'The wallet',
        situation: 'You find a wallet on the sidewalk with $200 in cash and an ID card. Nobody is around.',
        options: [
            { id: 'return-all', text: 'Find the owner and return everything, cash included.', trait: 'principled' },
            { id: 'police', text: 'Hand it in to the police or a nearby shop and let them handle it.', trait: 'cautious' },
            { id: 'reward', text: 'Return it, and accept a reward if they offer one.', trait: 'pragmatic' },
            { id: 'post', text: 'Post about it online so the owner can find you.', trait: 'diplomatic' },
        ],
    },
    {
        id: 'credit',
        title: 'Credit at work',
        situation: 'In a meeting, a coworker presents your idea as their own. Your manager loves it.',
        options: [
            { id: 'speak-now', text: 'Say, politely, in the meeting that it was your idea.', trait: 'principled' },
            { id: 'talk-later', text: 'Talk to the coworker privately afterwards.', trait: 'diplomatic' },
            { id: 'tell-manager', text: 'Mention it to your manager later, with your notes.', trait: 'pragmatic' },
            { id: 'let-go', text: 'Let it go. The idea moving forward matters more.', trait: 'generous' },
        ],
    },
    {
        id: 'bill',
        title: 'The undercharge',
        situation: 'At a restaurant you notice the bill is missing one of your dishes. It is about $25.',
        options: [
            { id: 'tell', text: 'Tell the server and pay the full amount.', trait: 'principled' },
            { id: 'tip', text: 'Say nothing, but leave a bigger tip.', trait: 'generous' },
            { id: 'keep', text: 'Pay what the bill says. Their mistake, not yours.', trait: 'pragmatic' },
            { id: 'ask-friends', text: 'Check what your friends at the table think first.', trait: 'diplomatic' },
        ],
    },
    {
        id: 'feedback',
        title: 'Honest feedback',
        situation: 'A close friend is excited about a business idea you think will not work. They ask what you honestly think.',
        options: [
            { id: 'honest', text: 'Tell them plainly why you think it will not work.', trait: 'principled' },
            { id: 'questions', text: 'Ask questions that help them spot the problems themselves.', trait: 'diplomatic' },
            { id: 'support', text: 'Encourage them. It is their call, and they will learn either way.', trait: 'loyal' },
            { id: 'test', text: 'Suggest a small, cheap test before they commit.', trait: 'pragmatic' },
        ],
    },
    {
        id: 'late-call',
        title: 'The 2 a.m. message',
        situation: 'A friend texts at 2 a.m. They are stuck across town and need a ride. You have an early start tomorrow.',
        options: [
            { id: 'go', text: 'Get up and go pick them up.', trait: 'loyal' },
            { id: 'pay-ride', text: 'Order and pay for a ride for them.', trait: 'generous' },
            { id: 'call-first', text: 'Call them first to understand how serious it is.', trait: 'cautious' },
            { id: 'someone-closer', text: 'Help them find someone closer who can get there sooner.', trait: 'pragmatic' },
        ],
    },
    {
        id: 'ai-work',
        title: 'Quietly automated',
        situation: 'An AI tool can do most of your weekly report. Nobody would notice, and it saves you five hours.',
        options: [
            { id: 'use-tell', text: 'Use it, and tell your team how you did it.', trait: 'principled' },
            { id: 'use-quiet', text: 'Use it and spend the time on other work.', trait: 'pragmatic' },
            { id: 'check-policy', text: 'Check the company policy before using it.', trait: 'cautious' },
            { id: 'share', text: 'Use it and set it up for your coworkers too.', trait: 'generous' },
        ],
    },
    {
        id: 'stranger',
        title: 'In line at the counter',
        situation: 'Ahead of you in line, a staff member is being rude to a customer who is struggling with the language.',
        options: [
            { id: 'step-in', text: 'Step in and speak up for the customer.', trait: 'principled' },
            { id: 'help-customer', text: 'Quietly offer to help the customer translate.', trait: 'generous' },
            { id: 'manager', text: 'Ask for a manager once it is your turn.', trait: 'pragmatic' },
            { id: 'stay-out', text: 'Stay out of it. You do not know the full story.', trait: 'cautious' },
        ],
    },
    {
        id: 'promotion',
        title: 'The promotion',
        situation: 'You are offered a promotion with a big raise, but it means working most weekends for a year.',
        options: [
            { id: 'take', text: 'Take it. A year is short for what it opens up.', trait: 'pragmatic' },
            { id: 'negotiate', text: 'Ask whether the weekend work can be reduced first.', trait: 'diplomatic' },
            { id: 'family', text: 'Talk it through with family before deciding.', trait: 'loyal' },
            { id: 'decline', text: 'Turn it down. Weekends are not for sale.', trait: 'principled' },
        ],
    },
    {
        id: 'split',
        title: 'Splitting the bill',
        situation: 'Dinner with six friends. You had a salad and water; others had drinks and mains. Someone suggests splitting evenly.',
        options: [
            { id: 'even', text: 'Split evenly. It is not worth the awkwardness.', trait: 'generous' },
            { id: 'pay-mine', text: 'Ask to pay only for what you ordered.', trait: 'principled' },
            { id: 'joke', text: 'Make a light joke about it, then go along.', trait: 'diplomatic' },
            { id: 'next-time', text: 'Split it now, and suggest separate bills next time.', trait: 'pragmatic' },
        ],
    },
    {
        id: 'secret',
        title: 'A friend’s secret',
        situation: 'A friend tells you, in confidence, that they are about to quit a project. Another friend is planning around that project.',
        options: [
            { id: 'keep', text: 'Keep the secret. It was told in confidence.', trait: 'loyal' },
            { id: 'encourage', text: 'Urge the first friend to tell the other one soon.', trait: 'diplomatic' },
            { id: 'hint', text: 'Hint to the second friend to keep a backup plan.', trait: 'pragmatic' },
            { id: 'tell', text: 'Tell the second friend. They should not be caught out.', trait: 'principled' },
        ],
    },
];

export const AGE_RANGES = ['Under 18', '18–24', '25–34', '35–44', '45–54', '55+'] as const;
export const REGIONS = ['North America', 'South America', 'Europe', 'Africa', 'Middle East', 'South Asia', 'East Asia', 'Southeast Asia', 'Oceania'] as const;
export const ROLES = ['Student', 'Working', 'Other'] as const;

export type QuizProfile = { age?: string; region?: string; role?: string };

export function findOption(questionId: string, optionId: string) {
    return DILEMMAS.find((d) => d.id === questionId)?.options.find((o) => o.id === optionId) ?? null;
}
