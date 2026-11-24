export const PART_NO = 'TP-SDE-2026';

/**
 * The black header strip each datasheet section starts with. The part number and page used to sit on
 * the right; they're no longer shown, but `page` stays so callers don't have to change.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function SectionHead({ no, title, page }: { no: number; title: string; page?: string }) {
    return (
        <h2 className="sp-head">
            <b><span>{no}</span>{title}</b>
        </h2>
    );
}
