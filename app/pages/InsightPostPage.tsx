import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Send, Copy, Check } from 'lucide-react';
import { InsightsLayout } from '../components/insights/InsightsLayout';
import { InsightArticleJsonLd } from '../components/insights/InsightArticleJsonLd';
import { InsightBreadcrumbs } from '../components/insights/InsightBreadcrumbs';
import { InsightBlocksRenderer } from '../components/insights/InsightBlocksRenderer';
import { InsightCoverImage } from '../components/insights/InsightCoverImage';
import { InsightRelatedPosts } from '../components/insights/InsightRelatedPosts';
import { SeoHead } from '../components/SeoHead';
import { fetchInsightBySlug, fetchRelatedPosts } from '../lib/insights/api';
import { CATEGORY_STYLES } from '../lib/insights/categoryStyles';
import type { InsightPost } from '../lib/insights/types';
import { absoluteSiteUrl, telegramChannelUrl, telegramDmUrl } from '../site.config';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export function InsightPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<InsightPost | null>(null);
  const [related, setRelated] = useState<InsightPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchInsightBySlug(slug)
      .then(async (found) => {
        setPost(found);
        if (found) {
          const relatedPosts = await fetchRelatedPosts(found.slug, found.category);
          setRelated(relatedPosts);
        } else {
          setRelated([]);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const shareUrl = slug ? absoluteSiteUrl(`/insights/${slug}`) : '';
  const coverImageUrl = post?.coverImage.url.startsWith('http')
    ? post.coverImage.url
    : post?.coverImage.url
      ? absoluteSiteUrl(post.coverImage.url)
      : undefined;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <InsightsLayout>
        <div className="mx-auto max-w-[680px] animate-pulse space-y-6">
          <div className="h-8 w-3/4 rounded bg-insights-surface-elevated" />
          <div className="aspect-[16/10] rounded bg-insights-surface-elevated" />
          <div className="h-4 rounded bg-insights-surface-elevated" />
          <div className="h-4 w-5/6 rounded bg-insights-surface-elevated" />
        </div>
      </InsightsLayout>
    );
  }

  if (!post) {
    return (
      <InsightsLayout>
        <SeoHead
          title="Материал не найден — Igor Broker"
          description="Запрошенный материал не найден. Вернитесь к ленте аналитики."
          path={`/insights/${slug ?? ''}`}
          noindex
        />
        <div className="py-20 text-center">
          <h1 className="insights-display mb-4 text-2xl text-primary">Материал не найден</h1>
          <Link to="/insights" className="text-insights-link hover:underline">
            Вернуться к ленте
          </Link>
        </div>
      </InsightsLayout>
    );
  }

  const categoryStyle = CATEGORY_STYLES[post.category];

  return (
    <InsightsLayout>
      <SeoHead
        title={`${post.seoTitle ?? post.title} — Igor Broker`}
        description={post.seoDescription ?? post.excerpt}
        path={`/insights/${post.slug}`}
        image={coverImageUrl}
        type="article"
        publishedTime={post.publishedAt}
      />
      <InsightArticleJsonLd post={post} />
      <article className="mx-auto max-w-3xl">
        <InsightBreadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Аналитика', href: '/insights' },
            { label: post.title },
          ]}
        />

        <header className="mb-10 text-center">
          <span
            className={`mb-5 inline-block rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide ${categoryStyle.badge}`}
          >
            {categoryStyle.label}
          </span>
          <h1 className="insights-display mb-6 text-balance text-[32px] font-semibold leading-tight tracking-tight text-primary sm:text-[42px]">
            {post.title}
          </h1>
          <p className="mx-auto mb-6 max-w-xl text-pretty text-[18px] leading-[1.8] text-insights-prose-muted">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[13px] text-insights-prose-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-accent/70" aria-hidden />
              {formatDate(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-accent/70" aria-hidden />
              {post.readingTimeMinutes} мин чтения
            </span>
          </div>
        </header>

        <InsightCoverImage
          src={post.coverImage.url}
          alt={post.coverImage.alt ?? post.title}
          variant="hero"
          className="mb-12"
        />

        <InsightBlocksRenderer blocks={post.blocks} />

        <InsightRelatedPosts posts={related} />

        <footer className="mt-14 flex flex-col items-center gap-6 border-t border-border pt-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-2.5 text-[13px] transition-colors hover:border-accent/30"
            >
              {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4 text-accent/80" />}
              {copied ? 'Ссылка скопирована' : 'Копировать ссылку'}
            </button>
            <a
              href={telegramDmUrl(`Интересует материал: ${post.title}\n${shareUrl}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-accent/35 bg-accent/10 px-5 py-2.5 text-[13px] text-accent transition-colors hover:bg-accent/15"
            >
              <Send className="h-4 w-4" />
              Обсудить в Telegram
            </a>
          </div>
          <p className="text-center text-[14px] text-insights-prose-muted">
            Больше материалов — в канале{' '}
            <a
              href={telegramChannelUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-insights-link hover:underline"
            >
              @IgorBroker
            </a>
          </p>
        </footer>
      </article>
    </InsightsLayout>
  );
}
