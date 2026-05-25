import React from 'react';
import { MapPin, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function Cases() {
  const cases = [
    {
      name: 'Квартал Серебряный бор',
      location: 'Хорошёво-Мнёвники',
      date: 'Сдача Q4 2026',
      description:
        'Семейная ипотека, трёхкомнатная квартира. Оптимизация переплаты и прозрачная модель платежей под семейный бюджет.',
      image: '/images/case-serebryany-bor.png',
      gradient: 'from-[#1a1815] via-[#121110] to-[#0e0d0c]',
    },
    {
      name: 'LIFE‑Варшавская',
      location: 'Нагатинская набережная',
      date: 'Сдача Q2 2025',
      description:
        'Первая резиденция: студия с акцентом на первый взнос и аккуратный выход из текущего актива.',
      image: '/images/case-life-varshavskaya.png',
      gradient: 'from-[#181716] via-[#11100f] to-[#0c0b0a]',
    },
    {
      name: 'ЖК ПРИМАВЕРА',
      location: 'Москва',
      date: 'Сдача Q1 2027',
      description:
        'Инвестиционный запрос: подбор застройщика и локации с фокусом на ликвидность и сценарий удержания.',
      image: '/images/case-primavera.png',
      gradient: 'from-[#1c1a17] via-[#131210] to-[#0f0e0d]',
    },
  ];

  return (
    <section id="cases" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="mb-4 text-[38px] font-semibold tracking-tight text-primary sm:text-[46px]">Кейсы</h2>
          <p className="section-lead">
            Форматы реальных подборов — без публичных цен и рекламы застройщиков
          </p>
        </motion.div>

        <div className="cards-grid md:grid-cols-3">
          {cases.map((caseItem, index) => (
            <motion.article
              key={caseItem.name}
              className="card-shell group rounded-[26px] border border-border bg-card/75 shadow-[0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-500 hover:border-accent/28"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.07 }}
              whileHover={{ y: -8 }}
            >
              <div className={`relative h-56 shrink-0 overflow-hidden bg-gradient-to-br ${caseItem.gradient}`}>
                <img
                  src={caseItem.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"
                  aria-hidden
                />
              </div>

              <div className="card-content">
                <header className="space-y-2">
                  <h3 className="card-title">{caseItem.name}</h3>
                  <div className="flex min-h-[1.25rem] items-center gap-2 text-[13px] text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 text-accent/70" aria-hidden />
                    <span className="truncate">{caseItem.location}</span>
                  </div>
                </header>

                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0 text-accent/65" aria-hidden />
                  <span>{caseItem.date}</span>
                </div>

                <p className="card-text-grow text-[14px] text-foreground/85 sm:text-[15px]">{caseItem.description}</p>

                <div className="card-footer flex items-center gap-2 text-accent">
                  <CheckCircle className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
                  <span className="text-[14px] font-semibold tracking-wide">Сделка закрыта</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
