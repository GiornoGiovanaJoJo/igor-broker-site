import type { InsightBlock } from './types';

function normalizeComparable(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();
}

/** Drop a leading heading that repeats the page title. */
export function dedupeTitleHeading(blocks: InsightBlock[], title: string): InsightBlock[] {
  if (!blocks.length || blocks[0]._type !== 'heading') return blocks;

  const heading = normalizeComparable(blocks[0].text);
  const docTitle = normalizeComparable(title);
  if (!heading || !docTitle) return blocks;

  if (heading === docTitle || docTitle.startsWith(heading) || heading.startsWith(docTitle)) {
    return blocks.slice(1);
  }

  return blocks;
}
