import Link from 'next/link';
import type { CareerEntry } from '@/data/career';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Jan 2023" → months since year 0; "now" → this month. */
function toMonth(s: string, now: Date) {
    const t = s.trim();
    if (/now/i.test(t)) return now.getFullYear() * 12 + now.getMonth();
    const [m, y] = t.split(/\s+/);
    return Number(y) * 12 + MONTHS.indexOf(m.slice(0, 3));
}

function span(months: number) {
    const y = Math.floor(months / 12), m = months % 12;
    return [y ? `${y} yr${y > 1 ? 's' : ''}` : '', m ? `${m} mo` : ''].filter(Boolean).join(' ');
}

/** Career as a timing diagram: one row per job, a bar for the months it ran, newest on top. */
export default function CareerTiming({ rows, tag = 'R' }: { rows: CareerEntry[]; tag?: string }) {
    const now = new Date();
    const jobs = rows.map((r) => {
        const [a, b] = r.period.split('–');
        const start = toMonth(a, now), end = toMonth(b, now) + 1;
        return { ...r, start, end };
    });
    const first = Math.min(...jobs.map((j) => j.start));
    const startYear = Math.floor(first / 12);
    const endYear = now.getFullYear() + 1;
    const lo = startYear * 12, hi = endYear * 12;
    const at = (m: number) => `${((m - lo) / (hi - lo)) * 100}%`;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    const nowM = now.getFullYear() * 12 + now.getMonth() + 0.5;

    // Gaps between one job ending and the next starting.
    const ordered = [...jobs].sort((a, b) => a.start - b.start);
    const gaps = ordered.slice(1).map((j, i) => ({ from: ordered[i].end, to: j.start })).filter((g) => g.to > g.from);

    return (
        <div className="sp-tim">
            <div className="sp-tim__axis" aria-hidden="true">
                <span className="sp-tim__lane-label" />
                <div className="sp-tim__scale">
                    {years.map((y) => <span key={y} style={{ left: at(y * 12) }}>{y}</span>)}
                </div>
            </div>
            <ol className="sp-tim__rows">
                {jobs.map((j, i) => (
                    <li key={j.company} className="sp-tim__row" data-current={String(!!j.current)} style={{ ['--d' as string]: `${(jobs.length - 1 - i) * 120}ms` }}>
                        <div className="sp-tim__who">
                            <span className="sp-tim__rev">{tag}{jobs.length - i}</span>
                            <span className="sp-tim__logo">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                {j.logo ? <img src={j.logo} alt="" width={28} height={28} loading="lazy" /> : j.company.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('').slice(0, 3)}
                            </span>
                            <span className="sp-tim__name">
                                <b>{j.href ? <Link href={j.href} className="sp-link">{j.company}</Link> : j.company}</b>
                                <small>{j.role}</small>
                            </span>
                        </div>
                        <div className="sp-tim__lane">
                            {years.map((y) => <span key={y} className="sp-tim__grid" style={{ left: at(y * 12) }} aria-hidden="true" />)}
                            {gaps.map((g) => <span key={`${g.from}`} className="sp-tim__gap" style={{ left: at(g.from), width: `calc(${at(g.to)} - ${at(g.from)})` }} aria-hidden="true" />)}
                            <span className="sp-tim__bar" style={{ left: at(j.start), width: `calc(${at(j.end)} - ${at(j.start)})` }} title={j.period}>
                                <span className="sp-tim__len">{span(j.end - j.start)}</span>
                                {j.current && <span className="sp-tim__live" aria-hidden="true" />}
                            </span>
                            <span className="sp-tim__dates">{j.period}</span>
                        </div>
                    </li>
                ))}
            </ol>
            <div className="sp-tim__now" aria-hidden="true">
                <span className="sp-tim__lane-label" />
                <div className="sp-tim__scale"><span className="sp-tim__nowmark" style={{ left: at(nowM) }}>now</span></div>
            </div>
        </div>
    );
}
