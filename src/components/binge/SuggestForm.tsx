"use client";

import { useState, type FormEvent } from 'react';

/** Visitor suggestion: a title plus an optional note and name. Lands in the playground's Binge tab. */
export default function SuggestForm({ initialTitle = '' }: { initialTitle?: string }) {
    const [title, setTitle] = useState(initialTitle);
    const [note, setNote] = useState('');
    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [titleError, setTitleError] = useState('');

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (title.trim().length < 2) {
            setTitleError('Add the title first.');
            return;
        }
        setState('sending');
        setMessage('');
        try {
            const res = await fetch('/api/binge/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, note, name, website }),
            });
            if (res.status === 429) throw new Error("That's plenty for now, thank you.");
            const data = await res.json().catch(() => null) as { error?: string } | null;
            if (!res.ok) throw new Error(data?.error ?? 'That did not go through. Try again in a moment.');
            setState('done');
        } catch (err) {
            setState('error');
            setMessage(err instanceof Error ? err.message : 'That did not go through.');
        }
    };

    if (state === 'done') {
        return (
            <div className="bx-suggest bx-suggest--done" role="status">
                <p className="bx-suggest__big">Added to the queue.</p>
                <p>Thanks for the suggestion. It goes straight to Trupal&apos;s list to review.</p>
            </div>
        );
    }

    return (
        <form className="bx-suggest" onSubmit={submit} noValidate>
            <h2 className="bx-suggest__h">Suggest a title</h2>
            <p className="bx-suggest__sub">A film or series Trupal should watch next.</p>
            <label className="bx-field">
                <span>Title</span>
                <input value={title} onChange={(e) => { setTitle(e.target.value); setTitleError(''); }} maxLength={150} placeholder="The Leftovers" aria-invalid={!!titleError} />
                {titleError && <em className="bx-field__err">{titleError}</em>}
            </label>
            <label className="bx-field">
                <span>Why this one? (optional)</span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} rows={3} placeholder="Watch it for the season 2 finale." />
            </label>
            <label className="bx-field">
                <span>Your name (optional)</span>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" />
            </label>
            {/* Honeypot: hidden from people, filled by bots. */}
            <label className="bx-hp" aria-hidden="true">
                Website
                <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
            <div className="bx-suggest__foot">
                <button type="submit" className="bx-btn bx-btn--primary" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send suggestion'}</button>
                {state === 'error' && <span className="bx-field__err" role="alert">{message}</span>}
            </div>
        </form>
    );
}
