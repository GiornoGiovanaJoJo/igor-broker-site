import { useCallback, useState } from 'react';
import { definePlugin, useDocumentOperation, type DocumentActionComponent } from 'sanity';
import { formatWithCursor } from '../lib/formatApi';
import { estimateReadingTimeMinutes, toSanityBlocks } from '../lib/draftBlocks';

type InsightDoc = {
  title?: string;
  excerpt?: string;
  sourceText?: string;
};

const FormatWithCursorAction: DocumentActionComponent = (props) => {
  const { id, type, draft, published, onComplete } = props;
  const doc = (draft || published) as InsightDoc | null;
  const { patch } = useDocumentOperation(id, type);
  const [running, setRunning] = useState(false);

  const onHandle = useCallback(async () => {
    if (!doc?.title?.trim() || !doc.excerpt?.trim() || !doc.sourceText?.trim()) {
      return;
    }

    setRunning(true);
    try {
      const { blocks } = await formatWithCursor({
        title: doc.title.trim(),
        excerpt: doc.excerpt.trim(),
        body: doc.sourceText.trim(),
      });

      patch.execute([
        { set: { blocks: toSanityBlocks(blocks) } },
        { set: { readingTimeMinutes: estimateReadingTimeMinutes(blocks) } },
      ]);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Ошибка форматирования');
    } finally {
      setRunning(false);
      onComplete();
    }
  }, [doc, onComplete, patch]);

  const ready = Boolean(doc?.title?.trim() && doc?.excerpt?.trim() && doc?.sourceText?.trim());

  return {
    label: running ? 'Форматирование…' : '✨ Форматировать (Cursor)',
    disabled: running || !ready,
    title: ready
      ? 'Cursor разобьёт исходный текст на абзацы, списки и подзаголовки'
      : 'Заполните заголовок, лид и исходный текст',
    onHandle,
  };
};

export const cursorFormatPlugin = definePlugin({
  name: 'cursor-format',
  document: {
    actions: (prev, context) => {
      if (context.schemaType !== 'insightPost') return prev;
      return [...prev, FormatWithCursorAction];
    },
  },
});
