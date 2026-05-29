import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { fetchInsightPosts } from '../../lib/insights/api';
import type { InsightCategory, InsightPost } from '../../lib/insights/types';
import { INSIGHT_CATEGORIES } from '../../lib/insights/types';
import { InsightCard } from './InsightCard';

export function InsightFeed() {
  const [posts, setPosts] = useState<InsightPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<InsightCategory | null>(null);

  const load = useCallback(async (append: boolean, nextCursor: string | null, cat: InsightCategory | null) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      const result = await fetchInsightPosts({ cursor: append ? nextCursor : null, category: cat });
      setPosts((prev) => (append ? [...prev, ...result.posts] : result.posts));
      setHasMore(result.hasMore);
      setCursor(result.nextCursor);
    } catch {
      setError('Не удалось загрузить материалы. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setCursor(null);
    load(false, null, category);
  }, [category, load]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium tracking-wide transition-colors ${
            category === null
              ? 'border-accent/40 bg-accent/15 text-accent'
              : 'border-border bg-card/40 text-muted-foreground hover:border-accent/25'
          }`}
        >
          Все
        </button>
        {(Object.entries(INSIGHT_CATEGORIES) as [InsightCategory, string][]).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setCategory(id)}
            className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium tracking-wide transition-colors ${
              category === id
                ? 'border-accent/40 bg-accent/15 text-accent'
                : 'border-border bg-card/40 text-muted-foreground hover:border-accent/25'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="cards-grid md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[420px] animate-pulse rounded-[26px] bg-card/50 border border-border" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            type="button"
            onClick={() => load(false, null, category)}
            className="rounded-sm border border-accent/35 px-6 py-2.5 text-[14px] text-accent hover:bg-accent/10"
          >
            Повторить
          </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <p className="text-center text-muted-foreground py-16">Материалы скоро появятся.</p>
      )}

      {!loading && posts.length > 0 && (
        <div className="cards-grid md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <InsightCard key={post._id} post={post} index={i} />
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <motion.div className="flex justify-center pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => load(true, cursor, category)}
            className="inline-flex items-center gap-2 rounded-sm border border-accent/35 bg-accent/10 px-8 py-3.5 text-[13px] font-semibold tracking-[0.1em] uppercase text-accent hover:bg-accent/15 disabled:opacity-50 transition-colors"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Загрузка…
              </>
            ) : (
              'Показать ещё'
            )}
          </button>
        </motion.div>
      )}

      {!hasMore && posts.length > 0 && !loading && (
        <p className="text-center text-[13px] text-muted-foreground pt-2">Больше материалов пока нет</p>
      )}
    </div>
  );
}
