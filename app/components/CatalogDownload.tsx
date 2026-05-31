import React, { useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Download, X, Copy, Send, CheckCircle2 } from 'lucide-react';
import { telegramDmUrl } from '../site.config';
import { OptimizedImage } from './OptimizedImage';

/**
 * После загрузки PDF в public/catalog.pdf установите true —
 * кнопка сразу инициирует скачивание.
 */
export const CATALOG_PDF_AVAILABLE = false;

const CATALOG_COVER = { png: '/images/catalog/catalog-cover.png', webp: '/images/catalog/catalog-cover.webp' };

const CATALOG_SCROLL_IMAGES = [
  { src: '/images/catalog/catalog-scroll-1.png', webp: '/images/catalog/catalog-scroll-1.webp', alt: 'Новостройки Москвы — современный жилой комплекс' },
  { src: '/images/catalog/catalog-scroll-2.png', webp: '/images/catalog/catalog-scroll-2.webp', alt: 'Москва-Сити — деловой центр' },
  { src: '/images/catalog/catalog-scroll-3.png', webp: '/images/catalog/catalog-scroll-3.webp', alt: 'Жилой квартал с благоустроенной территорией' },
] as const;

function catalogPdfUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  const path = base.endsWith('/') ? `${base}catalog.pdf` : `${base}/catalog.pdf`;
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
}

function telegramPrefilledLink(): string {
  return telegramDmUrl(
    'Добрый день! Запросил каталог недвижимости. Готов обсудить формат получения материалов.',
  );
}

export function CatalogDownload() {
  const reduceMotion = useReducedMotion();
  const [modalOpen, setModalOpen] = useState(false);

  const handlePrimaryClick = () => {
    if (CATALOG_PDF_AVAILABLE) {
      const a = document.createElement('a');
      a.href = catalogPdfUrl();
      a.download = 'catalog-novostroyki.pdf';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    setModalOpen(true);
  };

  return (
    <section
      id="catalog"
      className="relative py-24 px-4 sm:px-6 lg:px-8 border-y border-border bg-[#030303]/90 overflow-hidden"
      aria-labelledby="catalog-heading"
    >
      {/* Локальный декор секции */}
      <div className="absolute top-24 left-[6%] w-px h-32 bg-gradient-to-b from-transparent via-accent/35 to-transparent pointer-events-none" aria-hidden />
      <div className="absolute bottom-20 right-[10%] w-40 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent pointer-events-none" aria-hidden />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-14 lg:gap-10 items-center">
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2
                id="catalog-heading"
                className="text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.15] text-primary font-semibold tracking-[0.06em] uppercase font-display"
              >
                Каталоги недвижимости
              </h2>
              <p className="mt-6 text-[16px] sm:text-[17px] text-muted-foreground leading-relaxed font-light max-w-md">
                Подборка форматов и локаций под запрос: без навязчивых рассылок — материалы передам удобным способом после короткого контакта.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-4 items-center"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                onClick={handlePrimaryClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-sm bg-accent text-accent-foreground hover:bg-[#c4a66a] transition-colors duration-300 text-[13px] font-semibold tracking-[0.12em] uppercase border border-accent/40 shadow-[0_8px_32px_rgba(184,149,92,0.18)]"
              >
                <Download className="w-4 h-4" aria-hidden />
                Скачать каталог
              </button>
              <a
                href={telegramPrefilledLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-sm border border-border text-[13px] font-medium tracking-wide text-foreground/85 hover:border-accent/35 hover:bg-card/50 transition-all duration-300"
              >
                <Send className="w-4 h-4 text-accent/90" aria-hidden />
                Telegram
              </a>
            </motion.div>
          </div>

          <div className="lg:col-span-7 relative min-h-[300px] sm:min-h-[360px] lg:min-h-[440px]">
            <motion.div
              className="flex gap-4 overflow-x-auto pb-6 pt-2 pr-[min(48vw,240px)] sm:pr-[300px] snap-x snap-mandatory scrollbar-thin [scrollbar-color:rgba(184,149,92,0.35)_transparent]"
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              {CATALOG_SCROLL_IMAGES.map((item) => (
                <div
                  key={item.src}
                  className="relative shrink-0 w-[min(78vw,300px)] sm:w-[320px] aspect-[16/10] snap-start overflow-hidden rounded-sm border border-white/[0.08] shadow-[0_0_0_1px_rgba(184,149,92,0.12),0_20px_50px_rgba(0,0,0,0.45)]"
                >
                  <OptimizedImage
                    webpSrc={item.webp}
                    fallbackSrc={item.src}
                    alt={item.alt}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                    sizes="300px"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" aria-hidden />
                </div>
              ))}
            </motion.div>

            {/* Обложка каталога */}
            <motion.div
              className={`absolute bottom-0 right-0 z-20 w-[min(52vw,240px)] sm:w-[260px] lg:w-[280px] ${reduceMotion ? '' : 'catalog-sway'}`}
              initial={reduceMotion ? false : { opacity: 0, rotate: -6, y: 20 }}
              whileInView={{ opacity: 1, rotate: -5, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative rounded-sm p-[2px] premium-shimmer-border shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
                <div className="aspect-square overflow-hidden rounded-sm bg-card">
                  <OptimizedImage
                    webpSrc={CATALOG_COVER.webp}
                    fallbackSrc={CATALOG_COVER.png}
                    alt="Каталог недвижимости Москвы"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <CatalogRequestModal
          onClose={() => setModalOpen(false)}
          catalogUrl={catalogPdfUrl()}
        />
      )}
    </section>
  );
}

function CatalogRequestModal({ onClose, catalogUrl }: { onClose: () => void; catalogUrl: string }) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [consent, setConsent] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setStep('success');
  };

  const copyCatalogLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(catalogUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }, [catalogUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 max-md:backdrop-blur-none md:backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
      onMouseDown={handleBackdrop}
    >
      <div
        className="relative w-full max-w-md rounded-sm border border-accent/25 bg-card shadow-[0_24px_80px_rgba(0,0,0,0.6)] p-6 sm:p-8"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-sm text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' ? (
          <>
            <h3 id="catalog-modal-title" className="text-xl font-semibold text-primary font-display tracking-wide pr-10">
              Каталог
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {!CATALOG_PDF_AVAILABLE
                ? 'Оставьте контакт — отправлю ссылку на материалы или отвечу в Telegram. Прямое скачивание PDF будет доступно после размещения файла на сайте.'
                : 'Подтвердите контакт для отправки ссылки на каталог.'}
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="catalog-name" className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  Имя
                </label>
                <input
                  id="catalog-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-sm bg-input-background border border-border text-foreground text-sm focus:border-accent/45 focus:ring-2 focus:ring-accent/15 outline-none"
                  placeholder="Как к вам обращаться"
                />
              </div>
              <div>
                <label htmlFor="catalog-contact" className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  Телефон или Telegram
                </label>
                <input
                  id="catalog-contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-sm bg-input-background border border-border text-foreground text-sm focus:border-accent/45 focus:ring-2 focus:ring-accent/15 outline-none"
                  placeholder="+7 или @username"
                />
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-accent rounded-sm border-border"
                />
                <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground/90 transition-colors">
                  Согласен на обработку персональных данных и связь по запросу каталога.
                </span>
              </label>
              <button
                type="submit"
                disabled={!consent}
                className="w-full py-3.5 rounded-sm bg-accent text-accent-foreground text-[13px] font-semibold tracking-[0.1em] uppercase hover:bg-[#c4a66a] disabled:opacity-45 disabled:cursor-not-allowed transition-colors border border-accent/35"
              >
                Продолжить
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-5 pt-1">
            <div className="flex items-center gap-2 text-accent">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <p className="text-lg font-semibold text-primary font-display">Спасибо</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ссылка на файл каталога (будет активна после загрузки PDF в раздел сайта). Скопируйте её или напишите в Telegram — пришлю материалы лично.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={copyCatalogLink}
                className="inline-flex items-center justify-center gap-2 flex-1 py-3 rounded-sm border border-accent/35 bg-accent/10 hover:bg-accent/15 text-[13px] font-medium tracking-wide transition-colors"
              >
                <Copy className="w-4 h-4 text-accent" />
                {copied ? 'Скопировано' : 'Копировать ссылку'}
              </button>
              <a
                href={telegramPrefilledLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 flex-1 py-3 rounded-sm bg-accent text-accent-foreground text-[13px] font-semibold tracking-wide hover:bg-[#c4a66a] transition-colors border border-accent/35"
              >
                <Send className="w-4 h-4" />
                Telegram
              </a>
            </div>
            <p className="text-[11px] text-muted-foreground/90 break-all font-mono">{catalogUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
}
