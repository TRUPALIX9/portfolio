import './gameover.css';
import Link from 'next/link';
import { Ghost } from 'lucide-react';
import { HeartGlyph } from '@/components/logicsprint/hearts/HiddenHeart';
import GameOverDocument from './GameOverDocument';

export const GAME_OVER_TITLE = 'Game over · LogicSprint';

/** The LogicSprint 404, styled like the app's Result screen. */
export default function NotFoundGameOver() {
    return (
        <main className="ls-container lss-go">
            <GameOverDocument title={GAME_OVER_TITLE} />
            <div className="lss-go-head">
                <span className="lss-go-icon" aria-hidden="true"><Ghost size={26} /></span>
                <div>
                    <h1 className="ls-heading lss-go-title">Game over</h1>
                    <p className="ls-label">Page not found · 404</p>
                </div>
            </div>

            <div className="ls-card lss-go-score">
                <p className="ls-label">Score</p>
                <p className="ls-num lss-go-num" aria-label="Error 404">404</p>
                <p className="ls-label lss-go-badge">This page ended the run</p>
            </div>

            <div className="lss-go-stats">
                <div className="ls-card lss-go-stat">
                    <p className="ls-label">Lives left</p>
                    <p className="ls-num lss-go-stat-val" style={{ color: 'var(--lsh-red, #FF5468)' }}>
                        1 <HeartGlyph size={20} />
                    </p>
                </div>
                <div className="ls-card lss-go-stat">
                    <p className="ls-label">Links found</p>
                    <p className="ls-num lss-go-stat-val">0</p>
                </div>
            </div>

            <nav className="lss-go-actions" aria-label="Continue">
                <Link href="/privacy" className="ls-btn ls-btn-ghost">Privacy</Link>
                <Link href="/" className="ls-btn ls-btn-primary lss-go-revive" aria-label="Revive: back to home">
                    Revive <HeartGlyph size={18} /> <span aria-hidden="true">→</span> Home
                </Link>
            </nav>
        </main>
    );
}
