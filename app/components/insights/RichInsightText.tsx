import React from 'react';

type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'bold'; value: string }
  | { kind: 'italic'; value: string }
  | { kind: 'mention'; value: string };

function tokenizeInline(text: string): Segment[] {
  const segments: Segment[] = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|@([a-zA-Z0-9_]{4,})/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', value: text.slice(lastIndex, match.index) });
    }

    if (match[1]) segments.push({ kind: 'bold', value: match[1] });
    else if (match[2]) segments.push({ kind: 'italic', value: match[2] });
    else if (match[3]) segments.push({ kind: 'mention', value: match[3] });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ kind: 'text', value: text.slice(lastIndex) });
  }

  return segments.length ? segments : [{ kind: 'text', value: text }];
}

function isPsOrLegal(text: string): boolean {
  const trimmed = text.trim();
  return /^p\.?\s*s\./i.test(trimmed) || /^в части юридического/i.test(trimmed);
}

export function RichInsightText({
  text,
  as: Tag = 'span',
  className = '',
}: {
  text: string;
  as?: 'span' | 'p' | 'li';
  className?: string;
}) {
  const italicBlock = Tag !== 'span' && isPsOrLegal(text);
  const segments = tokenizeInline(text);

  const content = segments.map((segment, index) => {
    switch (segment.kind) {
      case 'bold':
        return (
          <strong key={index} className="font-semibold text-insights-prose">
            {segment.value}
          </strong>
        );
      case 'italic':
        return (
          <em key={index} className="italic text-insights-prose/90">
            {segment.value}
          </em>
        );
      case 'mention':
        return (
          <a
            key={index}
            href={`https://t.me/${segment.value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-insights-link hover:underline"
          >
            @{segment.value}
          </a>
        );
      default:
        return <React.Fragment key={index}>{segment.value}</React.Fragment>;
    }
  });

  return (
    <Tag className={`${italicBlock ? 'italic text-insights-prose-muted' : ''} ${className}`.trim()}>{content}</Tag>
  );
}
