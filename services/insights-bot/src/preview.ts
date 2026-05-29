import type { DraftBlock } from './format.js';
import { CATEGORY_LABELS, type InsightCategory, type PostDraft } from './session.js';

const CATEGORY_EMOJI: Record<InsightCategory, string> = {
  analytics: '📊',
  jkReview: '🏢',
  case: '✅',
  mortgage: '🏦',
  market: '📈',
  tips: '💡',
};

function blockToText(block: DraftBlock): string {
  switch (block._type) {
    case 'paragraph':
      return block.text;
    case 'heading':
      return `${'#'.repeat(block.level)} ${block.text}`;
    case 'bulletList':
      return block.items.map((i) => `• ${i}`).join('\n');
    case 'quote':
      return `> ${block.text}`;
    case 'cta':
      return `[${block.label}](${block.url})`;
    case 'divider':
      return '— — —';
    default:
      return '';
  }
}

export function buildPreviewMessage(draft: PostDraft): string {
  const lines: string[] = ['📄 Предпросмотр', ''];

  if (draft.category) {
    lines.push(`${CATEGORY_EMOJI[draft.category]} ${CATEGORY_LABELS[draft.category]}`);
  }
  if (draft.title) {
    lines.push('');
    lines.push(draft.title);
  }
  if (draft.excerpt) {
    lines.push('');
    lines.push(draft.excerpt);
  }
  if (draft.blocks?.length) {
    lines.push('');
    lines.push('---');
    for (const block of draft.blocks) {
      lines.push('');
      lines.push(blockToText(block));
    }
  }

  return lines.join('\n').slice(0, 4000);
}
