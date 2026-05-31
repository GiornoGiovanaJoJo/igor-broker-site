import React from 'react';
import { Send, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { telegramDmUrl, maxWebOpenUrl, siteConfig } from '../site.config';
import { useMotionProfile } from '../hooks/useMotionProfile';

const HERO_PORTRAIT = '/images/hero-portrait.png';
const HERO_PORTRAIT_WEBP = '/images/hero-portrait.webp';

const TASK_CHIPS = ['Личное проживание', 'Инвест', 'Улучшение актива', 'Пассивный поток'] as const;

function HeroPortrait({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden border border-accent/15 bg-card/50 shadow-[0_24px_80px_rgba(0,0,0,0.5)] ${compact ? 'aspect-[4/5] max-h-[340px] rounded-[22px]' : 'aspect-[4/5] rounded-[28px]'} ${className ?? ''}`}
    >
      <picture>
        <source srcSet={HERO_PORTRAIT_WEBP} type="image/webp" />
        <img
          src={HERO_PORTRAIT}
          alt="Игорь — брокер по новостройкам"
          width={1456}
          height={2048}
          className="absolute inset-0 w-full h-full object-cover object-[center_12%]"
          loading={compact ? 'lazy' : 'eager'}
          decoding="async"
          fetchPriority={compact ? 'auto' : 'high'}
          sizes={compact ? '(max-width: 768px) 85vw' : '(min-width: 1024px) 50vw'}
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent pointer-events-none" />
    </div>
  );
}

export function Hero() {
  const { reduceMotion } = useMotionProfile();

  const scrollToForm = () => {
    const element = document.getElementById('lead-form');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const heroStats = [
    { kind: 'era' as const, top: 'В недвижимости', accent: 'с 2019 года' },
    { kind: 'era' as const, top: 'В банковской сфере', accent: 'с 2005 года' },
    { kind: 'num' as const, value: '500+', label: 'консультаций' },
    { kind: 'num' as const, value: '150+', label: 'сделок' },
    { kind: 'num' as const, value: '200+', label: 'подборов' },
    { kind: 'num' as const, value: '0%', label: 'комиссия клиента' },
  ];

  const fadeUp = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <motion.div className="space-y-7 sm:space-y-8" {...fadeUp}>
            <div className="space-y-5 sm:space-y-6">
              <h1 className="text-[38px] sm:text-[54px] lg:text-[64px] leading-[1.08] tracking-tight text-primary font-semibold">
                Новостройка{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-accent">под вашу задачу</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
                </span>
              </h1>

              <div className="lg:hidden mx-auto w-full max-w-[300px]">
                <HeroPortrait compact />
              </div>

              <div className="flex flex-wrap gap-2 max-w-xl">
                {TASK_CHIPS.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-[13px] sm:text-[14px] border border-border bg-card/80 text-foreground/90"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="space-y-4 max-w-xl text-[17px] sm:text-[19px] text-muted-foreground leading-relaxed font-light">
                <p>
                  Конфиденциальный подбор и консультация по стратегии выбора.
                  <br className="hidden sm:block" />
                  <span className="sm:ml-0"> Без лишних визитов в офисы продаж.</span>
                </p>
                <p>
                  Как использовать{' '}
                  <span className="text-foreground/85">ипотеку</span>,{' '}
                  <span className="text-foreground/85">рассрочку</span> и{' '}
                  <span className="text-foreground/85">100% оплату</span>?
                </p>
                <p className="text-foreground/80">Сопровождение сделки на уровне private banking.</p>
                <p>
                  Регион работы и анализа: <span className="text-foreground/85">г. Москва</span>.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <button
                type="button"
                onClick={scrollToForm}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-accent text-accent-foreground hover:bg-[#c4a66a] transition-colors duration-300 border border-accent/30 shadow-[0_8px_32px_rgba(184,149,92,0.2)] active:scale-[0.99]"
              >
                <span className="font-medium tracking-wide">Запросить разбор</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" />
              </button>
              <button
                type="button"
                onClick={() => window.open(telegramDmUrl(), '_blank')}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-border bg-card/70 hover:bg-card hover:border-accent/30 text-primary transition-colors duration-300 active:scale-[0.99]"
              >
                <Send className="w-5 h-5 text-accent/90" />
                <span className="font-medium tracking-wide">Telegram</span>
              </button>
              <a
                href={maxWebOpenUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-border bg-card/70 hover:bg-card hover:border-accent/30 text-primary transition-colors duration-300 active:scale-[0.99]"
              >
                <span className="font-semibold tracking-wide text-accent/95">MAX</span>
                <span className="text-[13px] text-muted-foreground whitespace-nowrap">{siteConfig.maxPhoneTel}</span>
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-7 pt-1 max-w-4xl">
              {heroStats.map((stat, i) => (
                <div key={i} className="flex flex-col">
                  {stat.kind === 'era' ? (
                    <>
                      <span className="text-[11px] sm:text-[12px] text-muted-foreground font-medium tracking-wide uppercase leading-snug">
                        {stat.top}
                      </span>
                      <span className="text-[17px] sm:text-[19px] font-semibold text-accent font-display mt-1">{stat.accent}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[26px] sm:text-[30px] font-semibold text-accent font-display leading-none">
                        {stat.value}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase mt-2">{stat.label}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative hidden lg:block"
            {...(reduceMotion
              ? {}
              : {
                  initial: { opacity: 0, scale: 0.98 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const },
                })}
          >
            <HeroPortrait />
            {!reduceMotion && (
              <>
                <div className="absolute -top-4 -right-4 w-28 h-28 bg-accent/6 rounded-full blur-3xl -z-10 perf-hide-blur-orbs" />
                <div className="absolute -bottom-4 -left-4 w-36 h-36 bg-muted rounded-full blur-3xl -z-10 opacity-80 perf-hide-blur-orbs" />
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
