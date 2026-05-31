import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AnimatedBackground } from '../AnimatedBackground';
import { Header } from '../Header';
import { Footer } from '../Footer';

export function InsightsLayout({
  children,
  backHref = '/insights',
  backLabel = 'К материалам',
  contentClassName = 'max-w-7xl',
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  contentClassName?: string;
}) {
  return (
    <div className="insights-editorial min-h-screen text-foreground relative overflow-x-hidden">
      <AnimatedBackground />
      <div className="relative z-[1]">
        <Header />
        <main id="main-content" className="pt-28 pb-24">
          <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${contentClassName}`}>
            <Link
              to={backHref}
              className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-accent transition-colors mb-10"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden />
              {backLabel}
            </Link>
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export function InsightsPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-14 text-center max-w-3xl mx-auto readable-over-bg">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-accent">Insights</p>
      <h1 className="insights-display text-[34px] sm:text-[44px] lg:text-[48px] font-semibold tracking-tight text-primary text-pretty leading-[1.12] mb-5">
        {title}
      </h1>
      <p className="section-lead text-insights-prose-muted">{description}</p>
    </header>
  );
}
