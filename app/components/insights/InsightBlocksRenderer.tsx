import React from 'react';
import { Link } from 'react-router-dom';
import type { InsightBlock } from '../../lib/insights/types';
import { RichInsightText } from './RichInsightText';

export function InsightBlocksRenderer({ blocks }: { blocks: InsightBlock[] }) {
  return (
    <div className="insights-body space-y-7 max-w-[680px] mx-auto">
      {blocks.map((block, i) => {
        switch (block._type) {
          case 'paragraph':
            return (
              <RichInsightText
                key={i}
                as="p"
                text={block.text}
                className="text-[17px] sm:text-[18px] leading-[1.8] text-insights-prose text-pretty"
              />
            );
          case 'heading':
            return block.level === 2 ? (
              <h2 key={i} className="insights-display pt-4 text-[26px] sm:text-[30px] font-semibold text-primary text-balance leading-snug">
                <RichInsightText text={block.text} />
              </h2>
            ) : (
              <h3 key={i} className="insights-display pt-2 text-[22px] sm:text-[24px] font-semibold text-primary text-balance leading-snug">
                <RichInsightText text={block.text} />
              </h3>
            );
          case 'bulletList':
            return (
              <ul key={i} className="space-y-4 pl-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 text-[17px] sm:text-[18px] leading-[1.8] text-insights-prose text-pretty">
                    <span className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/75" aria-hidden />
                    <RichInsightText text={item} />
                  </li>
                ))}
              </ul>
            );
          case 'quote':
            return (
              <blockquote
                key={i}
                className="border-l-2 border-accent/50 pl-5 py-1 text-[18px] italic leading-[1.8] text-insights-prose-muted text-pretty"
              >
                <RichInsightText text={block.text} />
                {block.attribution && (
                  <footer className="mt-2 text-[14px] not-italic text-insights-prose-muted">— {block.attribution}</footer>
                )}
              </blockquote>
            );
          case 'cta':
            return block.url.startsWith('http') ? (
              <a
                key={i}
                href={block.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-sm border border-accent/35 bg-accent/10 px-6 py-3 text-[14px] font-semibold tracking-wide text-accent hover:bg-accent/15 transition-colors"
              >
                {block.label}
              </a>
            ) : (
              <Link
                key={i}
                to={block.url}
                className="inline-flex items-center justify-center rounded-sm border border-accent/35 bg-accent/10 px-6 py-3 text-[14px] font-semibold tracking-wide text-accent hover:bg-accent/15 transition-colors"
              >
                {block.label}
              </Link>
            );
          case 'imageGallery':
            return (
              <figure key={i} className="-mx-4 sm:mx-0 sm:max-w-none">
                <div className={`grid gap-3 ${block.images.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                  {block.images.map((img, j) => (
                    <img
                      key={j}
                      src={img.url}
                      alt={img.alt ?? ''}
                      className="mx-auto block h-auto max-h-[min(60vh,640px)] w-full rounded-sm border border-border object-contain bg-insights-image-bg"
                      loading="lazy"
                    />
                  ))}
                </div>
                {block.caption && (
                  <figcaption className="mt-2 text-center text-[13px] text-muted-foreground">{block.caption}</figcaption>
                )}
              </figure>
            );
          case 'divider':
            return <hr key={i} className="border-border/60 my-8" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
