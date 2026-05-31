import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import type { InsightPost } from '../../lib/insights/types';
import { CATEGORY_STYLES } from '../../lib/insights/categoryStyles';
import { InsightCoverImage } from './InsightCoverImage';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export function InsightCard({ post, index = 0 }: { post: InsightPost; index?: number }) {
  const categoryStyle = CATEGORY_STYLES[post.category];
  return (
    <motion.article
      className="card-shell insights-card-shell group overflow-hidden rounded-[26px] border shadow-[0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-500 hover:border-accent/28"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/insights/${post.slug}`} className="relative flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-[26px]">
        <InsightCoverImage
          src={post.coverImage.url}
          alt={post.coverImage.alt ?? post.title}
          variant="card"
        />
        <span
          className={`pointer-events-none absolute left-4 top-4 z-10 rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide backdrop-blur-sm ${categoryStyle.badge}`}
        >
          {categoryStyle.label}
        </span>

        <div className="card-content flex flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-insights-prose-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-accent/70" aria-hidden />
              {formatDate(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-accent/70" aria-hidden />
              {post.readingTimeMinutes} мин
            </span>
          </div>

          <h2 className="card-title insights-display text-[20px] sm:text-[22px]">{post.title}</h2>
          <p className="card-text-grow line-clamp-3 text-[15px] text-insights-prose/90">{post.excerpt}</p>

          <div className="card-footer flex items-center gap-2 text-accent">
            <span className="text-[14px] font-semibold tracking-wide">Читать материал</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
