import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Send, Menu, X } from 'lucide-react';
import { siteConfig, telegramDmUrl, maxWebOpenUrl } from '../site.config';

const NAV = [
  { id: 'for-whom', label: 'Для кого' },
  { id: 'how-works', label: 'Процесс' },
  { id: 'catalog', label: 'Каталог' },
  { id: 'cases', label: 'Кейсы' },
  { id: 'testimonials', label: 'Отзывы' },
  { id: 'faq', label: 'FAQ' },
] as const;

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleNav = (id: string) => {
    setMobileOpen(false);
    if (isHome) scrollToSection(id);
    else {
      const b = import.meta.env.BASE_URL;
      const prefix = b === '/' ? '' : b.replace(/\/$/, '');
      window.location.assign(`${prefix}/#${id}`);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-background/85 backdrop-blur-xl border-b border-border shadow-[0_8px_32px_rgba(0,0,0,0.45)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
              <span className="text-[26px] sm:text-[28px] font-semibold text-primary leading-none tracking-tight font-display">
                {siteConfig.brandName}
              </span>
              <span className="text-[10px] sm:text-[11px] text-accent/90 font-medium mt-1 tracking-[0.2em] uppercase">
                {siteConfig.tagline}
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-10" aria-label="Основное меню">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className="text-[14px] text-foreground/75 hover:text-accent transition-colors duration-300 tracking-wide"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              <button
                type="button"
                onClick={() => window.open(telegramDmUrl(), '_blank')}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg border border-accent/35 text-foreground/90 hover:bg-accent/10 hover:border-accent/55 transition-all duration-300"
              >
                <Send className="w-4 h-4 text-accent/90" aria-hidden />
                <span className="text-[14px]">Telegram</span>
              </button>
              <a
                href={maxWebOpenUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-accent/35 text-foreground/90 hover:bg-accent/10 hover:border-accent/55 transition-all duration-300 text-[14px] font-medium"
              >
                <span className="text-accent/95">MAX</span>
                <span className="text-muted-foreground text-[13px] tabular-nums">{siteConfig.maxPhoneTel}</span>
              </a>
              <button
                type="button"
                onClick={() => handleNav('lead-form')}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-accent-foreground hover:bg-[#c4a66a] transition-all duration-300 shadow-[0_4px_24px_rgba(184,149,92,0.22)]"
              >
                <Phone className="w-4 h-4" aria-hidden />
                <span className="text-[14px] font-medium">Запрос</span>
              </button>

              <button
                type="button"
                className="lg:hidden p-2.5 rounded-lg border border-border text-foreground hover:bg-card/60 transition-colors"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <>
        <div
          className="fixed inset-0 z-[55] lg:hidden bg-black/70 backdrop-blur-sm"
          aria-hidden
          onClick={() => setMobileOpen(false)}
          role="presentation"
        />
        <div
          id="mobile-menu"
          className="fixed inset-0 z-[60] lg:hidden pt-20 pb-8 px-6 bg-background/98 backdrop-blur-xl border-b border-border overflow-y-auto pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Мобильная навигация"
        >
          <nav className="flex flex-col gap-1 max-w-md mx-auto" aria-label="Мобильное меню">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className="text-left py-4 text-[17px] text-foreground border-b border-border hover:text-accent transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleNav('lead-form')}
              className="text-left py-4 text-[17px] font-semibold text-accent border-b border-border"
            >
              Оставить запрос
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                window.open(telegramDmUrl(), '_blank');
              }}
              className="mt-4 flex items-center justify-center gap-2 w-full py-4 rounded-lg border border-accent/35 text-[15px] font-medium"
            >
              <Send className="w-5 h-5 text-accent" aria-hidden />
              Telegram
            </button>
            <a
              href={maxWebOpenUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 w-full py-4 rounded-lg border border-accent/35 text-[15px] font-medium"
            >
              <span className="text-accent font-semibold">MAX</span>
              {siteConfig.maxPhoneTel}
            </a>
          </nav>
        </div>
        </>
      )}
    </>
  );
}
