export type DraftBlock =
  | { _type: 'paragraph'; text: string }
  | { _type: 'heading'; level: 2 | 3; text: string }
  | { _type: 'bulletList'; items: string[] }
  | { _type: 'quote'; text: string; attribution?: string }
  | { _type: 'cta'; label: string; url: string }
  | { _type: 'divider' };

function newKey(): string {
  return crypto.randomUUID();
}

export function toSanityBlocks(blocks: DraftBlock[]): Record<string, unknown>[] {
  return blocks.map((block) => {
    const key = newKey();
    switch (block._type) {
      case 'paragraph':
        return { _type: 'insightBlockParagraph', _key: key, text: block.text };
      case 'heading':
        return { _type: 'insightBlockHeading', _key: key, level: block.level, text: block.text };
      case 'bulletList':
        return { _type: 'insightBlockBulletList', _key: key, items: block.items };
      case 'quote':
        return {
          _type: 'insightBlockQuote',
          _key: key,
          text: block.text,
          ...(block.attribution ? { attribution: block.attribution } : {}),
        };
      case 'cta':
        return { _type: 'insightBlockCta', _key: key, label: block.label, url: block.url };
      case 'divider':
        return { _type: 'insightBlockDivider', _key: key };
      default:
        return { _type: 'insightBlockParagraph', _key: key, text: '' };
    }
  });
}

export function estimateReadingTimeMinutes(blocks: DraftBlock[]): number {
  let words = 0;
  for (const block of blocks) {
    if (block._type === 'paragraph') words += block.text.split(/\s+/).length;
    if (block._type === 'heading') words += block.text.split(/\s+/).length;
    if (block._type === 'bulletList') words += block.items.join(' ').split(/\s+/).length;
    if (block._type === 'quote') words += block.text.split(/\s+/).length;
  }
  return Math.max(1, Math.ceil(words / 200));
}
