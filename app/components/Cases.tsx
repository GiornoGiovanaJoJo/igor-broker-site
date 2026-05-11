import React from 'react';
import { MapPin, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function Cases() {
  const cases = [
    {
      name: 'Серебряный Бор',
      location: 'Хорошёво-Мнёвники',
      date: 'Сдача Q4 2026',
      description: 'Семейная ипотека, трёхкомнатная квартира. Оптимизация переплаты и прозрачная модель платежей под семейный бюджет.',
      gradient: 'from-[#1a1815] via-[#121110] to-[#0e0d0c]',
    },
    {
      name: 'LIFE‑Варшавская',
      location: 'Нагатинская набережная',
      date: 'Сдача Q2 2025',
      description: 'Первая резиденция: студия с акцентом на первый взнос и аккуратный выход из текущего актива.',
      gradient: 'from-[#181716] via-[#11100f] to-[#0c0b0a]',
    },
    {
      name: 'Headliner',
      location: 'Кутузовский проспект',
      date: 'Сдача Q1 2027',
      description: 'Инвестиционный запрос: подбор застройщика и локации с фокусом на ликвидность и сценарий удержания.',
      gradient: 'from-[#1c1a17] via-[#131210] to-[#0f0e0d]',
    },
  ];

  return (
    <section id="cases" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="text-[38px] sm:text-[46px] text-primary mb-4 font-semibold tracking-tight">Кейсы</h2>
          <p className="text-[17px] sm:text-[18px] text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Форматы реальных подборов — без публичных цен и рекламы застройщиков
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {cases.map((caseItem, index) => (
            <motion.div
              key={index}
              className="group bg-card/75 rounded-[26px] overflow-hidden border border-border hover:border-accent/28 backdrop-blur-sm transition-all duration-500 shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.07 }}
              whileHover={{ y: -8 }}
            >
              <div className={`relative h-52 bg-gradient-to-br ${caseItem.gradient} overflow-hidden`}>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-accent/25 rounded-full"
                    style={{
                      left: `${25 + i * 22}%`,
                      top: `${32 + i * 12}%`,
                    }}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.15, 0.45, 0.15],
                    }}
                    transition={{
                      duration: 4 + i * 0.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}

                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-[24px] sm:text-[26px] font-semibold text-primary mb-2">{caseItem.name}</h3>
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <MapPin className="w-4 h-4 text-accent/70" />
                    <span>{caseItem.location}</span>
                  </div>
                </div>

                <motion.div
                  className="absolute top-4 right-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5 text-accent/35" />
                </motion.div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Calendar className="w-4 h-4 text-accent/65" />
                  <span>{caseItem.date}</span>
                </div>

                <p className="text-[14px] sm:text-[15px] text-foreground/85 leading-relaxed">{caseItem.description}</p>

                <div className="pt-4 flex items-center gap-2 text-accent border-t border-border">
                  <CheckCircle className="w-5 h-5 opacity-90" />
                  <span className="text-[14px] font-semibold tracking-wide">Сделка закрыта</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
