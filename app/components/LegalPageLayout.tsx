import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { siteConfig } from '../site.config';

export function LegalPageLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            На главную
          </Link>
          <span className="text-[13px] font-semibold text-primary tracking-wide truncate">{siteConfig.brandName}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-2">{title}</h1>
        {updated && <p className="text-[13px] text-muted-foreground mb-10">Последнее обновление: {updated}</p>}
        <div className="space-y-6 text-[15px] leading-relaxed text-muted-foreground [&_h2]:text-primary [&_h2]:text-[17px] [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-2 [&_strong]:text-foreground/90">
          {children}
        </div>
      </main>
    </div>
  );
}
