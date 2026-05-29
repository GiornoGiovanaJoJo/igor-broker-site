import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { AnimatedBackground } from '../AnimatedBackground';

export function InsightsLayout({
  children,
  backHref = '/insights',
  backLabel = 'К материалам',
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="insights-editorial min-h-screen bg-background text-foreground relative">
      <AnimatedBackground />
      <Header />
      <main id="main-content" className="relative z-10 pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
    <header className="mb-14 text-center max-w-2xl mx-auto">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-accent/90">Insights</p>
      <h1 className="insights-display text-[38px] sm:text-[48px] font-semibold tracking-tight text-primary text-balance mb-5">
        {title}
      </h1>
      <p className="section-lead">{description}</p>
    </header>
  );
}
