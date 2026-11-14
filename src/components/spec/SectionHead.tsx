export const PART_NO = 'TP-SDE-2026';

/** The black header strip each datasheet section starts with. */
export default function SectionHead({ no, title, page }: { no: number; title: string; page?: string }) {
    return (
        <h2 className="sp-head">
            <b><span>{no}</span>{title}</b>
            <span>{PART_NO}{page ? ` · ${page}` : ''}</span>
        </h2>
    );
}
