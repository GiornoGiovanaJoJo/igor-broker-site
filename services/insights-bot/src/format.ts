/**
 * Text normalizer for insight posts (mirrors app/lib/formatInsightText.ts).
 */

const NBSP = '\u00A0';

function applyRuTypography(text: string): string {
  return text
    .replace(/\s+(₽|руб\.?|%|м²|м2|г\.|ул\.|пр\.|д\.)/gi, `${NBSP}$1`)
    .replace(/(\d)\s+(₽|руб|%|м²|м2)/gi, `$1${NBSP}$2`);
}

export function normalizeLineBreaks(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
}

export type DraftBlock =
  | { _type: 'paragraph'; text: string }
  | { _type: 'heading'; level: 2 | 3; text: string }
  | { _type: 'bulletList'; items: string[] }
  | { _type: 'quote'; text: string; attribution?: string }
  | { _type: 'cta'; label: string; url: string }
  | { _type: 'divider' };

export function parseBodyToBlocks(raw: string): DraftBlock[] {
  const normalized = normalizeLineBreaks(raw);
  if (!normalized) return [];

  const sections = normalized.split(/\n\n+/);
  const blocks: DraftBlock[] = [];

  for (const section of sections) {
    const lines = section.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const allBullets = lines.every((l) => /^[-•*]\s+/.test(l) || /^\d+[.)]\s+/.test(l));
    if (allBullets) {
      blocks.push({
        _type: 'bulletList',
        items: lines.map((l) => applyRuTypography(l.replace(/^[-•*]\s+/, '').replace(/^\d+[.)]\s+/, ''))),
      });
      continue;
    }

    if (lines.length === 1 && lines[0].startsWith('>')) {
      blocks.push({ _type: 'quote', text: applyRuTypography(lines[0].replace(/^>\s?/, '')) });
      continue;
    }

    if (lines.length === 1 && /^#{2,3}\s+/.test(lines[0])) {
      const match = lines[0].match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        blocks.push({
          _type: 'heading',
          level: match[1].length === 2 ? 2 : 3,
          text: applyRuTypography(match[2]),
        });
        continue;
      }
    }

    blocks.push({
      _type: 'paragraph',
      text: applyRuTypography(lines.join(' ').replace(/\s+/g, ' ')),
    });
  }

  return blocks;
}

export function estimateReadingTimeMinutes(blocks: DraftBlock[]): number {
  let words = 0;
  for (const b of blocks) {
    if (b._type === 'paragraph') words += b.text.split(/\s+/).length;
    if (b._type === 'heading') words += b.text.split(/\s+/).length;
    if (b._type === 'bulletList') words += b.items.join(' ').split(/\s+/).length;
    if (b._type === 'quote') words += b.text.split(/\s+/).length;
  }
  return Math.max(1, Math.ceil(words / 200));
}

export function slugifyTitle(title: string): string {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return title
    .toLowerCase()
    .split('')
    .map((c) => map[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function normalizeDraftText(value: string): string {
  return applyRuTypography(normalizeLineBreaks(value));
}
