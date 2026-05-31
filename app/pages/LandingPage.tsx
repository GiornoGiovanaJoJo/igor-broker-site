import React, { lazy, useEffect } from 'react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { ForWhom } from '../components/ForWhom';
import { WhyMe } from '../components/WhyMe';
import { HowItWorks } from '../components/HowItWorks';
import { SkipLink } from '../components/SkipLink';
import { SeoJsonLd } from '../components/SeoJsonLd';
import { LazySection } from '../components/LazySection';

const CatalogDownload = lazy(() => import('../components/CatalogDownload').then((m) => ({ default: m.CatalogDownload })));
const LeadForm = lazy(() => import('../components/LeadForm').then((m) => ({ default: m.LeadForm })));
const Cases = lazy(() => import('../components/Cases').then((m) => ({ default: m.Cases })));
const Testimonials = lazy(() => import('../components/Testimonials').then((m) => ({ default: m.Testimonials })));
const FAQ = lazy(() => import('../components/FAQ').then((m) => ({ default: m.FAQ })));
const TelegramCTA = lazy(() => import('../components/TelegramCTA').then((m) => ({ default: m.TelegramCTA })));
const Footer = lazy(() => import('../components/Footer').then((m) => ({ default: m.Footer })));

function SectionFallback({ height = 240 }: { height?: number }) {
  return <div className="w-full animate-pulse rounded-[26px] bg-card/40 border border-border/50" style={{ minHeight: height }} aria-hidden />;
}

export function LandingPage() {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <SkipLink />
      <SeoJsonLd />
      <AnimatedBackground />
      <Header />
      <main id="main-content">
        <Hero />
        <ForWhom />
        <WhyMe />
        <HowItWorks />
        <LazySection minHeight={520}>
          <React.Suspense fallback={<SectionFallback height={520} />}>
            <CatalogDownload />
          </React.Suspense>
        </LazySection>
        <LazySection minHeight={480}>
          <React.Suspense fallback={<SectionFallback height={480} />}>
            <LeadForm />
          </React.Suspense>
        </LazySection>
        <LazySection minHeight={400}>
          <React.Suspense fallback={<SectionFallback height={400} />}>
            <Cases />
          </React.Suspense>
        </LazySection>
        <LazySection minHeight={360}>
          <React.Suspense fallback={<SectionFallback height={360} />}>
            <Testimonials />
          </React.Suspense>
        </LazySection>
        <LazySection minHeight={280}>
          <React.Suspense fallback={<SectionFallback height={280} />}>
            <FAQ />
          </React.Suspense>
        </LazySection>
        <LazySection minHeight={320}>
          <React.Suspense fallback={<SectionFallback height={320} />}>
            <TelegramCTA />
          </React.Suspense>
        </LazySection>
      </main>
      <LazySection minHeight={200}>
        <React.Suspense fallback={<SectionFallback height={200} />}>
          <Footer />
        </React.Suspense>
      </LazySection>
    </div>
  );
}
