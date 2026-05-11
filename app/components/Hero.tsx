import React from 'react';
import { Send, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { telegramDmUrl, maxWebOpenUrl, siteConfig } from '../site.config';

const HERO_PORTRAIT =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=960&q=85&auto=format&fit=crop';

const TASK_CHIPS = ['Личное проживание', 'Инвест', 'Улучшение актива', 'Пассивный поток'] as const;

export function Hero() {
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

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <Sparkles className="w-4 h-4 text-accent/90" />
              <span className="text-[12px] font-medium text-muted-foreground tracking-wide uppercase">
                Банковская сфера с 2005 · Недвижимость с 2019
              </span>
            </div>

            <div className="space-y-6">
              <h1 className="text-[42px] sm:text-[54px] lg:text-[64px] leading-[1.08] tracking-tight text-primary font-semibold">
                Новостройка{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-accent">под вашу задачу</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
                </span>
              </h1>

              <div className="flex flex-wrap gap-2 max-w-xl">
                {TASK_CHIPS.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-[13px] sm:text-[14px] border border-border bg-card/50 text-foreground/90"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <p className="text-[18px] sm:text-[19px] text-muted-foreground leading-relaxed font-light max-w-xl">
                Конфиденциальный подбор и сценарии платежа без лишних визитов в офисы застройщика. Москва и область:{' '}
                <span className="text-foreground/85">семейная ипотека</span>,{' '}
                <span className="text-foreground/85">рассрочка</span>,{' '}
                <span className="text-foreground/85">100% оплата</span>
                {' — '}сопровождение сделки на уровне private banking.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <motion.button
                onClick={scrollToForm}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-accent text-accent-foreground hover:bg-[#c4a66a] transition-all duration-300 border border-accent/30 shadow-[0_8px_32px_rgba(184,149,92,0.2)]"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="relative z-10 font-medium tracking-wide">Запросить разбор</span>
                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => window.open(telegramDmUrl(), '_blank')}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-border bg-card/40 hover:bg-card/70 hover:border-accent/30 text-primary transition-all duration-300"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Send className="w-5 h-5 text-accent/90" />
                <span className="font-medium tracking-wide">Telegram</span>
              </motion.button>
              <a
                href={maxWebOpenUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-border bg-card/40 hover:bg-card/70 hover:border-accent/30 text-primary transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span className="font-semibold tracking-wide text-accent/95">MAX</span>
                <span className="text-[13px] text-muted-foreground whitespace-nowrap">{siteConfig.maxPhoneTel}</span>
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-8 pt-2 max-w-4xl">
              {heroStats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.65 + i * 0.05 }}
                >
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
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative aspect-[4/5] rounded-[28px] overflow-hidden border border-accent/15 bg-card/50 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
              <img
                src={HERO_PORTRAIT}
                alt=""
                className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent pointer-events-none" />
              <motion.div
                className="absolute inset-0 pointer-events-none mix-blend-soft-light opacity-40"
                animate={{
                  background: [
                    'linear-gradient(145deg, rgba(184,149,92,0.12) 0%, transparent 55%)',
                    'linear-gradient(215deg, transparent 0%, rgba(184,149,92,0.08) 50%)',
                    'linear-gradient(145deg, rgba(184,149,92,0.12) 0%, transparent 55%)',
                  ],
                }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
              />
              <p className="absolute bottom-5 left-5 right-5 text-[12px] text-muted-foreground tracking-wide">
                Иллюстрация: замените на ваше фото в коде компонента Hero
              </p>
            </div>

            <div className="absolute -top-4 -right-4 w-28 h-28 bg-accent/6 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-4 -left-4 w-36 h-36 bg-muted rounded-full blur-3xl -z-10 opacity-80" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
