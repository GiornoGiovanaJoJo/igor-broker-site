import React from 'react';
import { Link } from 'react-router-dom';
import type { InsightPost } from '../../lib/insights/types';
import { CATEGORY_STYLES } from '../../lib/insights/categoryStyles';

export function InsightRelatedPosts({ posts }: { posts: InsightPost[] }) {
  if (posts.length === 0) return null;

  return (
    <aside className="mt-16 border-t border-border/80 pt-10">
      <h2 className="insights-display mb-6 text-[24px] font-semibold text-primary">Читайте также</h2>
      <ul className="space-y-4">
        {posts.map((post) => {
          const style = CATEGORY_STYLES[post.category];
          return (
            <li key={post._id}>
              <Link
                to={`/insights/${post.slug}`}
                className="group block rounded-xl border border-border/70 bg-insights-surface-elevated/50 p-4 transition-colors hover:border-accent/30 hover:bg-insights-surface-elevated"
              >
                <span
                  className={`mb-2 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wide ${style.badge}`}
                >
                  {style.label}
                </span>
                <p className="insights-display text-[18px] font-medium text-primary group-hover:text-accent transition-colors line-clamp-2">
                  {post.title}
                </p>
                <p className="mt-1 text-[14px] text-insights-prose-muted line-clamp-2">{post.excerpt}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
