import type { Context } from 'telegraf';
import type { Message } from 'telegraf/types';
import { env } from './env.js';
import { normalizeLineBreaks } from './format.js';
import type { InsightCategory, PostDraft } from './session.js';

type ChannelMessage = Message & {
  text?: string;
  caption?: string;
  photo?: NonNullable<Message.PhotoMessage['photo']>;
  forward_from_chat?: { type?: string; username?: string };
  forward_origin?: { type?: string; chat?: { username?: string } };
};

function asChannelMessage(message: Message): ChannelMessage {
  return message as ChannelMessage;
}

const CHANNEL_LINK_RE = /(?:https?:\/\/)?t\.me\/([a-zA-Z0-9_]+)\/(\d+)(?:\?[^\s]*)?/i;

let cachedChannelId: number | null = null;

export function parseChannelPostUrl(text: string): { username: string; messageId: number } | null {
  const match = text.trim().match(CHANNEL_LINK_RE);
  if (!match) return null;
  const username = match[1];
  if (username.toLowerCase() !== env.channelUsername.toLowerCase()) return null;
  return { username, messageId: Number.parseInt(match[2], 10) };
}

function channelUsernameFromMessage(message: Message): string | undefined {
  const channelMessage = asChannelMessage(message);
  const origin = channelMessage.forward_origin;
  if (origin && 'chat' in origin && origin.type === 'channel') {
    return origin.chat?.username;
  }
  return channelMessage.forward_from_chat?.username;
}

export function isFromSourceChannel(message: Message): boolean {
  const username = channelUsernameFromMessage(message);
  if (!username) return false;
  return username.toLowerCase() === env.channelUsername.toLowerCase();
}

async function resolveChannelChatId(telegram: Context['telegram']): Promise<number> {
  if (env.channelId) {
    return Number.parseInt(env.channelId, 10);
  }
  if (cachedChannelId) return cachedChannelId;

  const chat = await telegram.getChat(`@${env.channelUsername}`);
  if (chat.type !== 'channel') {
    throw new Error('TELEGRAM_CHANNEL_USERNAME не указывает на канал');
  }
  cachedChannelId = chat.id;
  return chat.id;
}

export async function fetchChannelMessageById(
  ctx: Context,
  messageId: number,
): Promise<Message> {
  const channelId = await resolveChannelChatId(ctx.telegram);
  const chatId = ctx.chat!.id;

  const forwarded = await ctx.telegram.forwardMessage(chatId, channelId, messageId, {
    disable_notification: true,
  });

  try {
    await ctx.telegram.deleteMessage(chatId, forwarded.message_id);
  } catch {
    /* сообщение могло остаться — не критично */
  }

  return forwarded;
}

export function messageText(message: Message): string {
  const channelMessage = asChannelMessage(message);
  return (channelMessage.text || channelMessage.caption || '').trim();
}

export function extractPhotoFileIds(messages: Message[]): {
  coverFileId?: string;
  galleryFileIds: string[];
} {
  const fileIds = messages
    .map(asChannelMessage)
    .filter((message) => message.photo?.length)
    .map((message) => message.photo![message.photo!.length - 1].file_id);

  if (fileIds.length === 0) {
    return { galleryFileIds: [] };
  }

  return {
    coverFileId: fileIds[0],
    galleryFileIds: fileIds.slice(1, 5),
  };
}

function stripFooterLines(lines: string[]): string[] {
  return lines.filter((line) => {
    const lower = line.toLowerCase();
    return (
      !/^пишите\s+@/i.test(line) &&
      !/^консультация/i.test(lower) &&
      !/^подбор\s+недвижимости/i.test(lower) &&
      !/^👉/.test(line)
    );
  });
}

export function parseChannelPostText(raw: string): Pick<PostDraft, 'title' | 'excerpt' | 'body'> {
  const normalized = normalizeLineBreaks(raw);
  const lines = stripFooterLines(
    normalized
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  );

  const body = (lines.length ? lines.join('\n\n') : normalized).trim();
  if (!body) {
    return { title: 'Пост из Telegram', excerpt: 'Материал из канала Igor Broker', body: '' };
  }

  let title = lines[0] ?? body.split('\n')[0] ?? 'Пост из Telegram';
  title = title
    .replace(/^[\s#]+/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);

  const afterTitle = body.slice(body.indexOf(lines[0] ?? title) + (lines[0]?.length ?? title.length)).trim();
  const sourceForExcerpt = afterTitle || body;
  const sentences = sourceForExcerpt.match(/[^.!?…]+[.!?…]+/g) ?? [sourceForExcerpt];
  const excerpt =
    sentences
      .slice(0, 3)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 320) || title.slice(0, 320);

  return { title: title || 'Пост из Telegram', excerpt, body };
}

export function guessCategory(text: string): InsightCategory | undefined {
  const lower = text.toLowerCase();
  const rules: [RegExp, InsightCategory][] = [
    [/обзор\s+жк|\bжк\b|life-|квартал|clubhouse|клубный\s+город/i, 'jkReview'],
    [/\bкейс\b/i, 'case'],
    [/ипотек/i, 'mortgage'],
    [/аналитик|дом\.?\s*рф|dom\.rf/i, 'analytics'],
    [/рынок|доходност|цена\s+квадрат/i, 'market'],
  ];

  for (const [pattern, category] of rules) {
    if (pattern.test(lower)) return category;
  }
  return undefined;
}

export function buildImportDraft(
  text: string,
  photos: ReturnType<typeof extractPhotoFileIds>,
  sourceUrl?: string,
): PostDraft {
  const parsed = parseChannelPostText(text);
  return {
    ...parsed,
    category: guessCategory(text),
    coverFileId: photos.coverFileId,
    galleryFileIds: photos.galleryFileIds,
    sourceMessageUrl: sourceUrl,
  };
}

type AlbumBatch = {
  messages: Message[];
  timer: ReturnType<typeof setTimeout>;
};

const albumBuffers = new Map<string, AlbumBatch>();

export function collectAlbumMessages(
  ctx: Context,
  onComplete: (messages: Message[]) => Promise<void>,
): void {
  const message = ctx.message;
  if (!message || !('media_group_id' in message) || !message.media_group_id) {
    void onComplete(message ? [message] : []);
    return;
  }

  const key = `${ctx.from!.id}:${message.media_group_id}`;
  const existing = albumBuffers.get(key);
  const batch: AlbumBatch = existing ?? { messages: [], timer: setTimeout(() => undefined, 0) };

  batch.messages.push(message);
  clearTimeout(batch.timer);
  batch.timer = setTimeout(() => {
    albumBuffers.delete(key);
    const sorted = [...batch.messages].sort((a, b) => a.message_id - b.message_id);
    void onComplete(sorted);
  }, 900);

  albumBuffers.set(key, batch);
}
