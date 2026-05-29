import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Send, Copy, Check } from 'lucide-react';
import { InsightsLayout } from '../components/insights/InsightsLayout';
import { InsightArticleJsonLd } from '../components/insights/InsightArticleJsonLd';
import { InsightBlocksRenderer } from '../components/insights/InsightBlocksRenderer';
import { fetchInsightBySlug } from '../lib/insights/api';
import type { InsightPost } from '../lib/insights/types';
import { INSIGHT_CATEGORIES } from '../lib/insights/types';
import { absoluteSiteUrl, telegramDmUrl } from '../site.config';

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
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchInsightBySlug(slug)
      .then(setPost)
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} — Igor Broker`;
  }, [post]);

  const shareUrl = slug ? absoluteSiteUrl(`/insights/${slug}`) : '';

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
          <div className="h-8 w-3/4 rounded bg-card" />
          <div className="aspect-[16/10] rounded bg-card" />
          <div className="h-4 rounded bg-card" />
          <div className="h-4 w-5/6 rounded bg-card" />
        </div>
      </InsightsLayout>
    );
  }

  if (!post) {
    return (
      <InsightsLayout>
        <div className="py-20 text-center">
          <h1 className="insights-display mb-4 text-2xl text-primary">Материал не найден</h1>
          <Link to="/insights" className="text-accent hover:underline">
            Вернуться к ленте
          </Link>
        </div>
      </InsightsLayout>
    );
  }

  return (
    <InsightsLayout>
      <InsightArticleJsonLd post={post} />
      <article className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <span className="mb-5 inline-block rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-medium tracking-wide text-accent">
            {INSIGHT_CATEGORIES[post.category]}
          </span>
          <h1 className="insights-display mb-6 text-balance text-[32px] font-semibold leading-tight tracking-tight text-primary sm:text-[42px]">
            {post.title}
          </h1>
          <p className="mx-auto mb-6 max-w-xl text-pretty text-[18px] leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[13px] text-muted-foreground">
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

        <div className="-mx-4 mb-12 overflow-hidden rounded-sm border border-border sm:mx-0">
          <img
            src={post.coverImage.url}
            alt={post.coverImage.alt ?? post.title}
            className="aspect-[16/10] w-full object-cover"
            loading="eager"
          />
        </div>

        <InsightBlocksRenderer blocks={post.blocks} />

        <footer className="mt-14 flex flex-wrap justify-center gap-3 border-t border-border pt-8">
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
        </footer>
      </article>
    </InsightsLayout>
  );
}
