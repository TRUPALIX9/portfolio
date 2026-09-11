import type { ReactNode } from 'react';

/**
 * Renders the LogicSprint privacy policy markdown without changing its wording.
 * Supports the subset the policy uses: #/##/### headings, paragraphs, - lists,
 * **bold**, _italic_, [text](url), bare URLs and email addresses.
 */

type Block =
    | { kind: 'heading'; level: 1 | 2 | 3; text: string }
    | { kind: 'paragraph'; text: string }
    | { kind: 'list'; items: string[] };

function parseBlocks(source: string): Block[] {
    const blocks: Block[] = [];
    let paragraph: string[] = [];
    let list: string[] | null = null;

    const flush = () => {
        if (paragraph.length) blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
        if (list) blocks.push({ kind: 'list', items: list });
        paragraph = [];
        list = null;
    };

    for (const raw of source.split(/\r?\n/)) {
        const line = raw.trim();
        const heading = /^(#{1,3})\s+(.*)$/.exec(line);
        const item = /^[-*]\s+(.*)$/.exec(line);
        if (!line) {
            flush();
        } else if (heading) {
            flush();
            blocks.push({ kind: 'heading', level: heading[1].length as 1 | 2 | 3, text: heading[2] });
        } else if (item) {
            if (paragraph.length) flush();
            (list ??= []).push(item[1]);
        } else if (list) {
            list[list.length - 1] += ` ${line}`;
        } else {
            paragraph.push(line);
        }
    }
    flush();
    return blocks;
}

const INLINE =
    /\*\*(.+?)\*\*|(?<!\w)_(.+?)_(?!\w)|\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<]*[^\s<.,;:!?)])|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

function renderInline(text: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    let last = 0;
    for (const match of text.matchAll(INLINE)) {
        const index = match.index ?? 0;
        if (index > last) nodes.push(text.slice(last, index));
        const [whole, bold, italic, linkText, linkHref, url, email] = match;
        const key = `${index}-${whole}`;
        if (bold) nodes.push(<strong key={key}>{renderInline(bold)}</strong>);
        else if (italic) nodes.push(<em key={key}>{renderInline(italic)}</em>);
        else if (linkText) nodes.push(<a key={key} href={linkHref} className="ls-link" rel="noreferrer">{renderInline(linkText)}</a>);
        else if (url) nodes.push(<a key={key} href={url} className="ls-link" rel="noreferrer">{url}</a>);
        else if (email) nodes.push(<a key={key} href={`mailto:${email}`} className="ls-link">{email}</a>);
        last = index + whole.length;
    }
    if (last < text.length) nodes.push(text.slice(last));
    return nodes;
}

const LAST_UPDATED = /^_(Last updated:.*)_$/i;

export default function PolicyMarkdown({ source }: { source: string }) {
    return (
        <div className="ls-prose">
            {parseBlocks(source).map((block, i) => {
                if (block.kind === 'heading') {
                    if (block.level === 1) {
                        return (
                            <h1 key={i} className="ls-heading" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: '1rem' }}>
                                {renderInline(block.text)}
                            </h1>
                        );
                    }
                    const Tag = block.level === 2 ? 'h2' : 'h3';
                    return <Tag key={i}>{renderInline(block.text)}</Tag>;
                }
                if (block.kind === 'list') {
                    return <ul key={i}>{block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}</ul>;
                }
                // The "Last updated" line sits at the top of the policy; give it label styling.
                const updated = LAST_UPDATED.exec(block.text);
                if (updated) {
                    return (
                        <p key={i} className="ls-label" style={{ color: 'var(--ls-teal)', marginBottom: '2rem' }}>
                            {updated[1]}
                        </p>
                    );
                }
                return <p key={i}>{renderInline(block.text)}</p>;
            })}
        </div>
    );
}
