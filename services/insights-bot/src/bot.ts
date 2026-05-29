import { Telegraf, Markup } from 'telegraf';
import type { Context } from 'telegraf';
import { env, botConfigured, sanityConfigured, cursorConfigured } from './env.js';
import { fetchBuffer, getTelegrafOptions } from './telegram.js';
import { normalizeDraftText, parseBodyToBlocks, slugifyTitle } from './format.js';
import { improveTextWithCursor } from './cursor.js';
import { buildPreviewMessage } from './preview.js';
import { publishDraft } from './sanity.js';
import {
  CATEGORY_LABELS,
  clearDraft,
  getSession,
  resetSession,
  type InsightCategory,
} from './session.js';

const MAX_PIN_ATTEMPTS = 3;

function categoryKeyboard() {
  const entries = Object.entries(CATEGORY_LABELS) as [InsightCategory, string][];
  return Markup.inlineKeyboard(
    entries.map(([id, label]) => [Markup.button.callback(label, `cat:${id}`)]),
  );
}

function previewKeyboard() {
  const rows: ReturnType<typeof Markup.button.callback>[][] = [
    [Markup.button.callback('✅ Опубликовать', 'action:publish')],
    [Markup.button.callback('📝 Черновик', 'action:draft')],
  ];
  if (cursorConfigured()) {
    rows.push([Markup.button.callback('✨ Улучшить текст (Cursor)', 'action:improve')]);
  }
  rows.push([Markup.button.callback('❌ Отмена', 'action:cancel')]);
  return Markup.inlineKeyboard(rows);
}

function mainMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('➕ Создать пост', 'action:create')],
    [Markup.button.callback('ℹ️ Помощь', 'action:help')],
  ]);
}

function photoKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('⏭ Пропустить обложку', 'action:skip_photo')],
    [Markup.button.callback('❌ Отмена', 'action:cancel')],
  ]);
}

async function downloadPhoto(ctx: Context, fileId: string): Promise<{ buffer: Buffer; filename: string }> {
  const link = await ctx.telegram.getFileLink(fileId);
  const buffer = await fetchBuffer(link.href);
  return { buffer, filename: `cover-${Date.now()}.jpg` };
}

function helpText(): string {
  return [
    '*Insights Bot* — редакторская лента Igor Broker',
    '',
    '1. Введите PIN редактора',
    '2. Создайте пост: категория → заголовок → лид → тело → обложка',
    '3. Проверьте предпросмотр и опубликуйте в Sanity',
    '',
    'Форматирование тела:',
    '• Пустая строка = новый абзац',
    '• `- пункт` или `1. пункт` = список',
    '• `> цитата` = цитата',
    '• `## Заголовок` = подзаголовок',
    '',
    sanityConfigured() ? '✅ Sanity подключён' : '⚠️ Sanity не настроен',
    cursorConfigured() ? '✅ Cursor AI доступен' : '⚠️ Cursor API не настроен',
  ].join('\n');
}

export function createBot(): Telegraf {
  if (!botConfigured()) {
    throw new Error('TELEGRAM_BOT_TOKEN и BOT_EDITOR_PIN обязательны');
  }

  const bot = new Telegraf(env.botToken, getTelegrafOptions());

  bot.start(async (ctx) => {
    const userId = ctx.from!.id;
    resetSession(userId);
    await ctx.reply(
      'Добро пожаловать в редактор Insights.\n\nВведите PIN для доступа:',
    );
    getSession(userId).step = 'pin';
  });

  bot.action('action:help', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(helpText(), { parse_mode: 'Markdown', ...mainMenuKeyboard() });
  });

  bot.action('action:create', async (ctx) => {
    await ctx.answerCbQuery();
    const session = getSession(ctx.from!.id);
    if (!session.authenticated) {
      await ctx.reply('Сначала введите PIN через /start');
      return;
    }
    clearDraft(ctx.from!.id);
    session.step = 'category';
    await ctx.reply('Выберите категорию:', categoryKeyboard());
  });

  bot.action(/^cat:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const session = getSession(ctx.from!.id);
    if (!session.authenticated) return;

    const category = ctx.match[1] as InsightCategory;
    session.draft.category = category;
    session.step = 'title';
    await ctx.reply(`Категория: *${CATEGORY_LABELS[category]}*\n\nВведите заголовок:`, {
      parse_mode: 'Markdown',
    });
  });

  bot.action('action:skip_photo', async (ctx) => {
    await ctx.answerCbQuery();
    const session = getSession(ctx.from!.id);
    session.step = 'preview';
    await ctx.reply(buildPreviewMessage(session.draft), previewKeyboard());
  });

  bot.action('action:cancel', async (ctx) => {
    await ctx.answerCbQuery();
    clearDraft(ctx.from!.id);
    const session = getSession(ctx.from!.id);
    session.step = session.authenticated ? 'idle' : 'pin';
    await ctx.reply('Отменено.', mainMenuKeyboard());
  });

  bot.action('action:improve', async (ctx) => {
    await ctx.answerCbQuery();
    const session = getSession(ctx.from!.id);
    if (!session.draft.title || !session.draft.excerpt || !session.draft.body) {
      await ctx.reply('Недостаточно данных для улучшения.');
      return;
    }

    await ctx.reply('✨ Cursor улучшает текст…');
    try {
      session.draft.blocks = await improveTextWithCursor({
        title: session.draft.title,
        excerpt: session.draft.excerpt,
        body: session.draft.body,
      });
      await ctx.reply('Текст обновлён.\n\n' + buildPreviewMessage(session.draft), previewKeyboard());
    } catch (err) {
      await ctx.reply(`Ошибка Cursor: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  });

  async function handlePublish(ctx: Context, publish: boolean) {
    const session = getSession(ctx.from!.id);
    if (!session.draft.blocks?.length && session.draft.body) {
      session.draft.blocks = parseBodyToBlocks(session.draft.body);
    }
    session.draft.slug = slugifyTitle(session.draft.title ?? 'post');

    let coverBuffer: Buffer | null = null;
    let coverFilename = 'cover.jpg';
    if (session.draft.coverFileId) {
      const downloaded = await downloadPhoto(ctx, session.draft.coverFileId);
      coverBuffer = downloaded.buffer;
      coverFilename = downloaded.filename;
    }

    const { id, slug } = await publishDraft(session.draft, coverBuffer, coverFilename, publish);
    clearDraft(ctx.from!.id);
    session.step = 'idle';

    const status = publish ? 'Опубликовано' : 'Сохранено как черновик';
    await ctx.reply(`${status} ✅\n\nID: \`${id}\`\nSlug: \`${slug}\``, {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard(),
    });
  }

  bot.action('action:publish', async (ctx) => {
    await ctx.answerCbQuery();
    try {
      await handlePublish(ctx, true);
    } catch (err) {
      await ctx.reply(`Ошибка публикации: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  });

  bot.action('action:draft', async (ctx) => {
    await ctx.answerCbQuery();
    try {
      await handlePublish(ctx, false);
    } catch (err) {
      await ctx.reply(`Ошибка сохранения: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  });

  bot.on('photo', async (ctx) => {
    const session = getSession(ctx.from!.id);
    if (session.step !== 'photo') return;

    const photos = ctx.message.photo;
    const largest = photos[photos.length - 1];
    session.draft.coverFileId = largest.file_id;
    session.step = 'preview';

    if (!session.draft.blocks?.length && session.draft.body) {
      session.draft.blocks = parseBodyToBlocks(session.draft.body);
    }

    await ctx.reply('Обложка получена.\n\n' + buildPreviewMessage(session.draft), previewKeyboard());
  });

  bot.on('text', async (ctx) => {
    const userId = ctx.from!.id;
    const session = getSession(userId);
    const text = ctx.message.text.trim();

    if (text === '/help') {
      await ctx.reply(helpText(), { parse_mode: 'Markdown', ...mainMenuKeyboard() });
      return;
    }

    if (session.step === 'pin') {
      if (text === env.editorPin) {
        session.authenticated = true;
        session.step = 'idle';
        session.pinAttempts = 0;
        await ctx.reply('Доступ разрешён.', mainMenuKeyboard());
      } else {
        session.pinAttempts += 1;
        if (session.pinAttempts >= MAX_PIN_ATTEMPTS) {
          resetSession(userId);
          await ctx.reply('Слишком много попыток. Начните заново: /start');
        } else {
          await ctx.reply(`Неверный PIN. Осталось попыток: ${MAX_PIN_ATTEMPTS - session.pinAttempts}`);
        }
      }
      return;
    }

    if (!session.authenticated) {
      await ctx.reply('Введите /start и PIN для доступа.');
      return;
    }

    switch (session.step) {
      case 'title':
        session.draft.title = normalizeDraftText(text);
        session.step = 'excerpt';
        await ctx.reply('Введите лид (2–3 предложения):');
        break;

      case 'excerpt':
        session.draft.excerpt = normalizeDraftText(text);
        session.step = 'body';
        await ctx.reply(
          'Введите тело материала.\n\nПустая строка = абзац. Списки: `- пункт`. Цитаты: `> текст`.',
        );
        break;

      case 'body':
        session.draft.body = normalizeDraftText(text);
        session.draft.blocks = parseBodyToBlocks(session.draft.body);
        session.step = 'photo';
        await ctx.reply('Отправьте обложку (фото) или пропустите:', photoKeyboard());
        break;

      default:
        await ctx.reply('Выберите действие:', mainMenuKeyboard());
    }
  });

  return bot;
}
