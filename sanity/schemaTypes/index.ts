import { defineField, defineType, defineArrayMember } from 'sanity';

export const insightCategory = defineType({
  name: 'insightCategory',
  title: 'Category',
  type: 'string',
  options: {
    list: [
      { title: 'Аналитика', value: 'analytics' },
      { title: 'Обзор ЖК', value: 'jkReview' },
      { title: 'Кейс', value: 'case' },
      { title: 'Ипотека', value: 'mortgage' },
      { title: 'Рынок', value: 'market' },
      { title: 'Практика', value: 'tips' },
    ],
  },
});

export const insightBlockParagraph = defineType({
  name: 'insightBlockParagraph',
  title: 'Paragraph',
  type: 'object',
  fields: [defineField({ name: 'text', type: 'text', rows: 4, validation: (r) => r.required() })],
  preview: { select: { title: 'text' } },
});

export const insightBlockHeading = defineType({
  name: 'insightBlockHeading',
  title: 'Heading',
  type: 'object',
  fields: [
    defineField({
      name: 'level',
      type: 'number',
      options: { list: [2, 3] },
      initialValue: 2,
    }),
    defineField({ name: 'text', type: 'string', validation: (r) => r.required() }),
  ],
});

export const insightBlockBulletList = defineType({
  name: 'insightBlockBulletList',
  title: 'Bullet list',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (r) => r.required().min(1),
    }),
  ],
});

export const insightBlockQuote = defineType({
  name: 'insightBlockQuote',
  title: 'Quote',
  type: 'object',
  fields: [
    defineField({ name: 'text', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'attribution', type: 'string' }),
  ],
});

export const insightBlockCta = defineType({
  name: 'insightBlockCta',
  title: 'CTA',
  type: 'object',
  fields: [
    defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'url', type: 'url', validation: (r) => r.required() }),
  ],
});

export const insightBlockImageGallery = defineType({
  name: 'insightBlockImageGallery',
  title: 'Image gallery',
  type: 'object',
  fields: [
    defineField({
      name: 'images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (r) => r.max(4),
    }),
    defineField({ name: 'caption', type: 'string' }),
  ],
});

export const insightBlockDivider = defineType({
  name: 'insightBlockDivider',
  title: 'Divider',
  type: 'object',
  fields: [defineField({ name: 'placeholder', type: 'string', hidden: true })],
});

export const insightPost = defineType({
  name: 'insightPost',
  title: 'Insight post',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'excerpt', type: 'text', rows: 3, validation: (r) => r.required().max(320) }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      description: 'Переопределение title (до 60 символов). Пусто — используется заголовок.',
      validation: (r) => r.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 2,
      description: 'Переопределение description (до 160 символов). Пусто — excerpt.',
      validation: (r) => r.max(160),
    }),
    defineField({
      name: 'seoKeywords',
      title: 'SEO keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Внутренние ключевые слова (не выводятся в meta keywords).',
    }),
    defineField({
      name: 'sourceText',
      title: 'Исходный текст',
      type: 'text',
      rows: 14,
      description:
        'Пишите обычным текстом без разметки. Меню документа (⋯) → «✨ Форматировать (Cursor)» — блоки ниже заполнятся автоматически.',
    }),
    defineField({ name: 'category', type: 'insightCategory', validation: (r) => r.required() }),
    defineField({
      name: 'coverImage',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'publishedAt', type: 'datetime' }),
    defineField({ name: 'readingTimeMinutes', type: 'number', readOnly: true }),
    defineField({
      name: 'blocks',
      type: 'array',
      of: [
        defineArrayMember({ type: 'insightBlockParagraph' }),
        defineArrayMember({ type: 'insightBlockHeading' }),
        defineArrayMember({ type: 'insightBlockBulletList' }),
        defineArrayMember({ type: 'insightBlockQuote' }),
        defineArrayMember({ type: 'insightBlockCta' }),
        defineArrayMember({ type: 'insightBlockImageGallery' }),
        defineArrayMember({ type: 'insightBlockDivider' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', media: 'coverImage', subtitle: 'category' },
  },
});

export const schemaTypes = [
  insightCategory,
  insightBlockParagraph,
  insightBlockHeading,
  insightBlockBulletList,
  insightBlockQuote,
  insightBlockCta,
  insightBlockImageGallery,
  insightBlockDivider,
  insightPost,
];
