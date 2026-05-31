import { Telegraf, Markup } from 'telegraf';
import type { Context } from 'telegraf';
import { env, botConfigured, sanityConfigured, cursorConfigured } from './env.js';
import { fetchBuffer, getTelegrafOptions } from './telegram.js';
import { normalizeDraftText, parseBodyToBlocks, slugifyTitle } from './format.js';
import { formatDraftBody } from './format-api.js';
import { buildPreviewMessage } from './preview.js';
import { publishDraft } from './sanity.js';
import { importChannelPostsToSanity } from './channel-bulk-import.js';
import {
  buildImportDraft,
  collectAlbumMessages,
  extractPhotoFileIds,
  fetchChannelMessageById,
  isFromSourceChannel,
  messageText,
  parseChannelPostUrl,
} from './channel-import.js';
import {
  CATEGORY_LABELS,
  clearDraft,
  getSession,
  resetSession,
  setLastEditorChatId,
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
    rows.push([Markup.button.callback('✨ Переформатировать (Cursor)', 'action:improve')]);
  }
  rows.push([Markup.button.callback('❌ Отмена', 'action:cancel')]);
  return Markup.inlineKeyboard(rows);
}

function mainMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('➕ Создать пост', 'action:create')],
    [Markup.button.callback('📥 Импорт из @IgorBroker', 'action:import')],
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
    '2. Создайте пост вручную или импортируйте из канала @IgorBroker',
    '3. Проверьте предпросмотр и опубликуйте в Sanity',
    '',
    '*Импорт из канала:*',
    '• Перешлите пост из @IgorBroker боту — один шаг',
    '• Или отправьте ссылку вида `https://t.me/IgorBroker/123`',
    '• `/import_channel` — перенести все посты канала в ленту',
    '• Фото, текст и форматирование Cursor — автоматически',
    '',
    'Тело материала — обычный текст без разметки.',
    'Cursor автоматически оформит абзацы, списки и подзаголовки.',
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

  bot.action('action:import', async (ctx) => {
    await ctx.answerCbQuery();
    const session = getSession(ctx.from!.id);
    if (!session.authenticated) {
      await ctx.reply('Сначала введите PIN через /start');
      return;
    }
    clearDraft(ctx.from!.id);
    session.step = 'import';
    await ctx.reply(
      [
        '📥 *Импорт из @IgorBroker*',
        '',
        'Перешлите пост из канала сюда — или отправьте ссылку:',
        '`https://t.me/IgorBroker/123`',
        '',
        'Бот сам подтянет текст и фото, оформит через Cursor и покажет предпросмотр.',
      ].join('\n'),
      { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('❌ Отмена', 'action:cancel')]]) },
    );
  });

  async function finalizeImport(ctx: Context): Promise<void> {
    const session = getSession(ctx.from!.id);
    if (!session.draft.title || !session.draft.body) {
      await ctx.reply('Не удалось извлечь текст из поста.');
      return;
    }

    if (cursorConfigured()) {
      await ctx.reply('✨ Cursor оформляет текст…');
      try {
        const { blocks } = await formatDraftBody({
          title: session.draft.title,
          excerpt: session.draft.excerpt ?? session.draft.title,
          body: session.draft.body,
        });
        session.draft.blocks = blocks;
      } catch {
        session.draft.blocks = parseBodyToBlocks(session.draft.body);
        await ctx.reply('⚠️ Cursor недоступен — сохранён базовый формат.');
      }
    } else {
      session.draft.blocks = parseBodyToBlocks(session.draft.body);
    }

    if (session.draft.category) {
      session.step = 'preview';
      await ctx.reply(`📥 Импорт готов.\n\n${buildPreviewMessage(session.draft)}`, previewKeyboard());
      return;
    }

    session.step = 'category';
    await ctx.reply('Категорию определить не удалось — выберите вручную:', categoryKeyboard());
  }

  async function importFromMessages(
    ctx: Context,
    messages: import('telegraf/types').Message[],
    sourceUrl?: string,
  ): Promise<void> {
    const session = getSession(ctx.from!.id);
    if (!session.authenticated) {
      await ctx.reply('Введите /start и PIN для доступа.');
      return;
    }

    const text = messages.map(messageText).find(Boolean) ?? '';
    const photos = extractPhotoFileIds(messages);
    if (!text && !photos.coverFileId) {
      await ctx.reply('В посте нет текста и фото.');
      return;
    }

    clearDraft(ctx.from!.id);
    session.authenticated = true;
    Object.assign(session.draft, buildImportDraft(text, photos, sourceUrl));

    await ctx.reply('📥 Импортирую пост из @IgorBroker…');
    await finalizeImport(ctx);
  }

  async function importFromUrl(ctx: Context, messageId: number): Promise<void> {
    const session = getSession(ctx.from!.id);
    if (!session.authenticated) {
      await ctx.reply('Введите /start и PIN для доступа.');
      return;
    }

    await ctx.reply('📥 Загружаю пост по ссылке…');
    try {
      const message = await fetchChannelMessageById(ctx, messageId);
      const sourceUrl = `https://t.me/${env.channelUsername}/${messageId}`;
      await importFromMessages(ctx, [message], sourceUrl);
    } catch (err) {
      const hint =
        'Не удалось получить пост по ссылке. Перешлите его из канала вручную — или добавьте бота администратором в @IgorBroker.';
      await ctx.reply(`${hint}\n\n${err instanceof Error ? err.message : 'unknown'}`);
      session.step = 'import';
    }
  }

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

    if (session.draft.title && session.draft.body && session.draft.blocks?.length) {
      session.step = 'preview';
      await ctx.reply(`Категория: *${CATEGORY_LABELS[category]}*\n\n${buildPreviewMessage(session.draft)}`, {
        parse_mode: 'Markdown',
        ...previewKeyboard(),
      });
      return;
    }

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

    await ctx.reply('✨ Cursor переформатирует текст…');
    try {
      const { blocks } = await formatDraftBody({
        title: session.draft.title,
        excerpt: session.draft.excerpt,
        body: session.draft.body,
      });
      session.draft.blocks = blocks;
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

    const galleryBuffers: { buffer: Buffer; filename: string }[] = [];
    if (session.draft.galleryFileIds?.length) {
      for (const [index, fileId] of session.draft.galleryFileIds.entries()) {
        const downloaded = await downloadPhoto(ctx, fileId);
        galleryBuffers.push({
          buffer: downloaded.buffer,
          filename: `gallery-${index}-${Date.now()}.jpg`,
        });
      }
    }

    const { id, slug, snapshotWarning } = await publishDraft(
      session.draft,
      coverBuffer,
      coverFilename,
      publish,
      galleryBuffers,
    );
    clearDraft(ctx.from!.id);
    session.step = 'idle';

    const status = publish ? 'Опубликовано' : 'Сохранено как черновик';
    const siteNote = publish
      ? snapshotWarning
        ? `\n\n⚠️ Пост в Sanity, но лента на сайте не обновилась:\n\`${snapshotWarning}\``
        : '\n\nЛента на сайте обновлена.'
      : '\n\nЧерновик без даты публикации — на сайте не появится. Нажмите «Опубликовать».';
    await ctx.reply(`${status} ✅\n\nID: \`${id}\`\nSlug: \`${slug}\`${siteNote}`, {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard(),
    });
  }

  bot.action('action:publish', async (ctx) => {
    await ctx.answerCbQuery();
    try {
      await handlePublish(ctx, true);
    } catch (err) {
      console.error('Publish failed:', err);
      await ctx.reply(`Ошибка публикации: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  });

  bot.action('action:draft', async (ctx) => {
    await ctx.answerCbQuery();
    try {
      await handlePublish(ctx, false);
    } catch (err) {
      console.error('Draft save failed:', err);
      await ctx.reply(`Ошибка сохранения: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  });

  bot.on('photo', async (ctx) => {
    const session = getSession(ctx.from!.id);
    if (!session.authenticated) return;

    const canImport = session.step === 'import' || isFromSourceChannel(ctx.message);

    if (canImport) {
      collectAlbumMessages(ctx, async (messages) => {
        await importFromMessages(ctx, messages);
      });
      return;
    }

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

    if (text === '/import_channel' || text === '/import') {
      if (!session.authenticated) {
        await ctx.reply('Сначала /start и PIN.');
        return;
      }
      await ctx.reply('📥 Импорт всех постов из @IgorBroker в ленту Insights… Это займёт несколько минут.');
      try {
        const result = await importChannelPostsToSanity({
          telegram: ctx.telegram,
          destChatId: userId,
          limit: 500,
          regenerateSeo: true,
        });
        await ctx.reply(
          `Импорт завершён ✅\n\nНайдено: ${result.scraped}\nСоздано: ${result.created}\nПропущено: ${result.skipped}\nОшибок: ${result.failed}`,
          mainMenuKeyboard(),
        );
      } catch (err) {
        await ctx.reply(`Ошибка импорта: ${err instanceof Error ? err.message : 'unknown'}`);
      }
      return;
    }

    if (session.step === 'pin') {
      if (text === env.editorPin) {
        session.authenticated = true;
        session.step = 'idle';
        session.pinAttempts = 0;
        setLastEditorChatId(userId);
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

    const channelLink = parseChannelPostUrl(text);
    if (channelLink) {
      await importFromUrl(ctx, channelLink.messageId);
      return;
    }

    if (session.step === 'import') {
      if (isFromSourceChannel(ctx.message)) {
        await importFromMessages(ctx, [ctx.message]);
        return;
      }
      await ctx.reply(
        'Перешлите пост из @IgorBroker или отправьте ссылку вида https://t.me/IgorBroker/123',
        Markup.inlineKeyboard([[Markup.button.callback('❌ Отмена', 'action:cancel')]]),
      );
      return;
    }

    if (session.step === 'idle' && isFromSourceChannel(ctx.message)) {
      await importFromMessages(ctx, [ctx.message]);
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
        await ctx.reply('Введите тело материала обычным текстом — Cursor сам оформит абзацы и списки.');
        break;

      case 'body': {
        session.draft.body = normalizeDraftText(text);
        if (cursorConfigured()) {
          await ctx.reply('✨ Cursor оформляет текст…');
          try {
            const { blocks } = await formatDraftBody({
              title: session.draft.title ?? '',
              excerpt: session.draft.excerpt ?? '',
              body: session.draft.body,
            });
            session.draft.blocks = blocks;
          } catch {
            session.draft.blocks = parseBodyToBlocks(session.draft.body);
            await ctx.reply('⚠️ Cursor недоступен — сохранён базовый формат.');
          }
        } else {
          session.draft.blocks = parseBodyToBlocks(session.draft.body);
        }
        session.step = 'photo';
        await ctx.reply('Отправьте обложку (фото) или пропустите:', photoKeyboard());
        break;
      }

      default:
        await ctx.reply('Выберите действие:', mainMenuKeyboard());
    }
  });

  return bot;
}
