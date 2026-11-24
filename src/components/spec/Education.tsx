import { ArrowUpRight } from 'lucide-react';
import { EDUCATION } from '@/data/education';

/** Degrees as a short list: school, degree and the month it was finished. */
export default function Education() {
    return (
        <ol className="sp-edu">
            {EDUCATION.map((e, i) => (
                <li key={e.school} className="sp-edu__row">
                    <span className="sp-tim__rev">E{EDUCATION.length - i}</span>
                    <span className="sp-tim__logo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={e.logo} alt="" width={28} height={28} loading="lazy" />
                    </span>
                    <span className="sp-tim__name">
                        <b><a href={e.url} target="_blank" rel="noreferrer" className="sp-link">{e.school}<ArrowUpRight size={12} aria-hidden="true" /></a></b>
                        <small>{e.degree}</small>
                    </span>
                    <span className="sp-edu__grad"><small>Graduated</small>{e.graduated}</span>
                </li>
            ))}
        </ol>
    );
}
