import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

type Crumb = { label: string; href?: string };

export function InsightBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-insights-prose-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />}
              {item.href && !isLast ? (
                <Link to={item.href} className="hover:text-insights-link transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-insights-prose line-clamp-1' : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
