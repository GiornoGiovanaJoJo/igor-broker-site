import React from 'react';
import { Send, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { telegramChannelUrl } from '../site.config';
import { useMotionProfile } from '../hooks/useMotionProfile';

export function TelegramCTA() {
  const { allowHeavyEffects, allowContentMotion } = useMotionProfile();

  const inView = !allowContentMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.55 },
      };

  return (
    <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#080809] text-primary overflow-hidden border-y border-border">
      {allowHeavyEffects ? (
        <>
          <motion.div
            className="absolute top-0 right-0 w-[420px] h-[420px] bg-accent/10 rounded-full blur-[120px] perf-hide-blur-orbs"
            animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.5, 0.35] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-muted rounded-full blur-[100px] opacity-60 perf-hide-blur-orbs"
            animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      ) : (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/8 rounded-full opacity-60" aria-hidden />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-muted/40 rounded-full opacity-50" aria-hidden />
        </>
      )}

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-3xl bg-accent/10 mb-8 border border-accent/25">
          <TrendingUp className="w-9 h-9 text-accent/90" />
        </div>

        <motion.h2 className="text-[32px] sm:text-[48px] mb-6 font-semibold tracking-tight text-primary" {...inView}>
          Аналитика рынка — в канале
        </motion.h2>
        <motion.p
          className="text-[16px] sm:text-[18px] text-muted-foreground mb-10 max-w-2xl mx-auto font-light leading-relaxed"
          {...inView}
        >
          Отобранные материалы по новостройкам, ставкам и застройщикам — без шума и массовых рассылок
        </motion.p>

        <button
          type="button"
          onClick={() => window.open(telegramChannelUrl(), '_blank')}
          className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-accent text-accent-foreground hover:bg-[#c4a66a] transition-colors duration-300 font-medium text-[16px] tracking-wide border border-accent/35 shadow-[0_12px_40px_rgba(184,149,92,0.2)] active:scale-[0.98]"
        >
          <Send className="w-5 h-5" />
          <span>Подписаться</span>
        </button>

        <div className="mt-14 sm:mt-16 pt-10 sm:pt-12 border-t border-border">
          <div className="cards-grid sm:grid-cols-3">
            {[
              { value: '2000+', label: 'подписчиков' },
              { value: '50+', label: 'обзоров ЖК' },
              { value: '3–5', label: 'материалов в неделю' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center text-center py-2">
                <div className="mb-2 font-display text-[32px] font-semibold text-accent sm:text-[40px]">{stat.value}</div>
                <div className="min-h-[2.5rem] text-[14px] tracking-wide text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
