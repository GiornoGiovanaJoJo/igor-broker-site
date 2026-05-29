export const INSIGHT_CATEGORIES = {
  analytics: 'Аналитика',
  jkReview: 'Обзор ЖК',
  case: 'Кейс',
  mortgage: 'Ипотека',
  market: 'Рынок',
  tips: 'Практика',
} as const;

export type InsightCategory = keyof typeof INSIGHT_CATEGORIES;

export type InsightBlock =
  | { _type: 'paragraph'; text: string }
  | { _type: 'heading'; level: 2 | 3; text: string }
  | { _type: 'bulletList'; items: string[] }
  | { _type: 'quote'; text: string; attribution?: string }
  | { _type: 'cta'; label: string; url: string }
  | { _type: 'imageGallery'; images: { url: string; alt?: string }[]; caption?: string }
  | { _type: 'divider' };

export type InsightImage = {
  url: string;
  alt?: string;
};

export type InsightPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  seoTitle?: string;
  seoDescription?: string;
  category: InsightCategory;
  coverImage: InsightImage;
  publishedAt: string;
  readingTimeMinutes: number;
  blocks: InsightBlock[];
};

export type InsightListResult = {
  posts: InsightPost[];
  hasMore: boolean;
  nextCursor: string | null;
};
