import type { InsightCategory } from './types';

export const CATEGORY_STYLES: Record<
  InsightCategory,
  { label: string; badge: string; dot: string }
> = {
  analytics: {
    label: 'Аналитика',
    badge: 'border-[color:var(--cat-analytics)]/35 bg-[color:var(--cat-analytics)]/12 text-[color:var(--cat-analytics)]',
    dot: 'bg-[color:var(--cat-analytics)]',
  },
  jkReview: {
    label: 'Обзор ЖК',
    badge: 'border-[color:var(--cat-jk-review)]/35 bg-[color:var(--cat-jk-review)]/12 text-[color:var(--cat-jk-review)]',
    dot: 'bg-[color:var(--cat-jk-review)]',
  },
  case: {
    label: 'Кейс',
    badge: 'border-[color:var(--cat-case)]/35 bg-[color:var(--cat-case)]/12 text-[color:var(--cat-case)]',
    dot: 'bg-[color:var(--cat-case)]',
  },
  mortgage: {
    label: 'Ипотека',
    badge: 'border-[color:var(--cat-mortgage)]/35 bg-[color:var(--cat-mortgage)]/12 text-[color:var(--cat-mortgage)]',
    dot: 'bg-[color:var(--cat-mortgage)]',
  },
  market: {
    label: 'Рынок',
    badge: 'border-[color:var(--cat-market)]/35 bg-[color:var(--cat-market)]/12 text-[color:var(--cat-market)]',
    dot: 'bg-[color:var(--cat-market)]',
  },
  tips: {
    label: 'Практика',
    badge: 'border-[color:var(--cat-tips)]/35 bg-[color:var(--cat-tips)]/12 text-[color:var(--cat-tips)]',
    dot: 'bg-[color:var(--cat-tips)]',
  },
};
