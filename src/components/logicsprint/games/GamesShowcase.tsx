import './games.css';
import type { CSSProperties } from 'react';
import { GAMES, type GameType } from '@/data/logicsprint';
import type { Boards } from '@/utils/logicsprint-stats';
import GamesStage, { GamePhone } from './GamesStage';
import HighScores from './HighScores';

/* "Four ways to sprint": one tall section per game (what it trains, how it plays, its modes, live
   stats and top 5), with a phone playing a scripted recording of the real app. Wide screens get one
   sticky phone that follows the scroll; phones get a phone per section. Server component; the
   stage, phones and high-score toggles are client islands. */

const formatNumber = new Intl.NumberFormat('en-US').format;
const pad = (n: number) => String(n).padStart(2, '0');

export default function GamesShowcase({
    stats,
    boards,
}: {
    stats?: Partial<Record<GameType, { plays: number; topScore: number }>>;
    boards?: Boards;
}) {
    return (
        <section id="games" className="ls-section lsg-section" aria-labelledby="ls-games-title">
            <div className="ls-container">
                <p className="ls-label" style={{ marginBottom: '0.75rem' }}>
                    Games · {pad(GAMES.length)}
                </p>
                <h2 id="ls-games-title" className="ls-heading ls-h2">
                    Four ways to sprint
                </h2>
                <p className="ls-lead">Each game trains one skill, and each one keeps getting harder until you slip.</p>
                <p className="lsg-live">
                    <i aria-hidden="true" />
                    High scores update live · the app&apos;s boards refresh daily at 00:00 UTC
                </p>
            </div>

            <GamesStage>
                {GAMES.map((game, i) => {
                    const stat = stats?.[game.type];
                    return (
                        <article
                            key={game.type}
                            id={`game-${game.type}`}
                            className="lsg-game"
                            data-game={game.type}
                            aria-labelledby={`lsg-name-${game.type}`}
                            style={{ '--lsg-accent': game.accent } as CSSProperties}
                        >
                            <GamePhone type={game.type} />
                            <div className="lsg-copy">
                                <p className="ls-label lsg-skill">
                                    <span className="ls-num">{pad(i + 1)}</span> · {game.skill}
                                </p>
                                <h3 id={`lsg-name-${game.type}`} className="ls-heading lsg-name">
                                    {game.name}
                                </h3>
                                <p className="lsg-desc">{game.description}</p>

                                {game.modes && (
                                    <dl className="lsg-modes">
                                        {game.modes.map((mode) => (
                                            <div key={mode.level}>
                                                <dt className="ls-label">{mode.level}</dt>
                                                <dd className="ls-num">{mode.detail}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                )}

                                {stat && stat.plays > 0 && (
                                    <dl className="lsg-stats">
                                        <div>
                                            <dt className="ls-label">Runs played</dt>
                                            <dd className="ls-num">{formatNumber(stat.plays)}</dd>
                                        </div>
                                        {stat.topScore > 0 && (
                                            <div>
                                                <dt className="ls-label">Top score</dt>
                                                <dd className="ls-num lsg-accent">{formatNumber(stat.topScore)}</dd>
                                            </div>
                                        )}
                                    </dl>
                                )}

                                <HighScores
                                    type={game.type}
                                    name={game.name}
                                    modes={game.modes}
                                    boards={{
                                        easy: boards?.[`${game.type}:easy`],
                                        medium: boards?.[`${game.type}:medium`],
                                        hard: boards?.[`${game.type}:hard`],
                                    }}
                                />
                            </div>
                        </article>
                    );
                })}
            </GamesStage>
        </section>
    );
}
