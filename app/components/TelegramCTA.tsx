import React from 'react';
import { Send, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { telegramChannelUrl } from '../site.config';

export function TelegramCTA() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#080809] text-primary overflow-hidden border-y border-border">
      <motion.div
        className="absolute top-0 right-0 w-[420px] h-[420px] bg-accent/10 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.35, 0.5, 0.35],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-muted rounded-full blur-[100px] opacity-60"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          className="inline-flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-3xl bg-accent/10 mb-8 border border-accent/25 backdrop-blur-sm"
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <TrendingUp className="w-9 h-9 text-accent/90" />
        </motion.div>

        <motion.h2
          className="text-[36px] sm:text-[48px] mb-6 font-semibold tracking-tight text-primary"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          Аналитика рынка — в канале
        </motion.h2>
        <motion.p
          className="text-[17px] sm:text-[18px] text-muted-foreground mb-10 max-w-2xl mx-auto font-light leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.06 }}
        >
          Отобранные материалы по новостройкам, ставкам и застройщикам — без шума и массовых рассылок
        </motion.p>

        <motion.button
          onClick={() => window.open(telegramChannelUrl(), '_blank')}
          className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-accent text-accent-foreground hover:bg-[#c4a66a] transition-all duration-300 font-medium text-[16px] tracking-wide border border-accent/35 shadow-[0_12px_40px_rgba(184,149,92,0.2)]"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.12 }}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <Send className="w-5 h-5" />
          <span>Подписаться</span>
        </motion.button>

        <motion.div
          className="mt-16 pt-12 border-t border-border"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.18 }}
        >
          <div className="grid sm:grid-cols-3 gap-10">
            {[
              { value: '2000+', label: 'подписчиков' },
              { value: '50+', label: 'обзоров ЖК' },
              { value: '3–5', label: 'материалов в неделю' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.22 + i * 0.08 }}
              >
                <div className="text-[36px] sm:text-[40px] font-semibold text-accent mb-2 font-display">
                  {stat.value}
                </div>
                <div className="text-[14px] text-muted-foreground tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
