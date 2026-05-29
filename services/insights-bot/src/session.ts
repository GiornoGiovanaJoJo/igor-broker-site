export type InsightCategory =
  | 'analytics'
  | 'jkReview'
  | 'case'
  | 'mortgage'
  | 'market'
  | 'tips';

export type WizardStep =
  | 'idle'
  | 'pin'
  | 'import'
  | 'category'
  | 'title'
  | 'excerpt'
  | 'body'
  | 'photo'
  | 'preview';

import type { DraftBlock } from './format.js';

export type PostDraft = {
  title?: string;
  excerpt?: string;
  body?: string;
  category?: InsightCategory;
  coverFileId?: string;
  galleryFileIds?: string[];
  blocks?: DraftBlock[];
  slug?: string;
  sourceMessageUrl?: string;
};

export type UserSession = {
  authenticated: boolean;
  step: WizardStep;
  draft: PostDraft;
  pinAttempts: number;
};

const sessions = new Map<number, UserSession>();

export function getSession(userId: number): UserSession {
  let session = sessions.get(userId);
  if (!session) {
    session = { authenticated: false, step: 'idle', draft: {}, pinAttempts: 0 };
    sessions.set(userId, session);
  }
  return session;
}

export function resetSession(userId: number): void {
  sessions.set(userId, { authenticated: false, step: 'idle', draft: {}, pinAttempts: 0 });
}

export function clearDraft(userId: number): void {
  const session = getSession(userId);
  session.draft = {};
  session.step = session.authenticated ? 'idle' : 'pin';
}

export const CATEGORY_LABELS: Record<InsightCategory, string> = {
  analytics: 'Аналитика',
  jkReview: 'Обзор ЖК',
  case: 'Кейс',
  mortgage: 'Ипотека',
  market: 'Рынок',
  tips: 'Практика',
};
