import React, { useEffect } from 'react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { ForWhom } from '../components/ForWhom';
import { WhyMe } from '../components/WhyMe';
import { HowItWorks } from '../components/HowItWorks';
import { CatalogDownload } from '../components/CatalogDownload';
import { LeadForm } from '../components/LeadForm';
import { Cases } from '../components/Cases';
import { Testimonials } from '../components/Testimonials';
import { FAQ } from '../components/FAQ';
import { TelegramCTA } from '../components/TelegramCTA';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { SeoJsonLd } from '../components/SeoJsonLd';
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
        <CatalogDownload />
        <LeadForm />
        <Cases />
        <Testimonials />
        <FAQ />
        <TelegramCTA />
      </main>
      <Footer />
    </div>
  );
}
