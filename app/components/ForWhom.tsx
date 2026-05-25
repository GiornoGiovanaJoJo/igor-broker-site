import React from 'react';
import { Home, Users, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export function ForWhom() {
  const segments = [
    {
      icon: Home,
      title: 'Первая резиденция',
      description:
        'Первое жильё и вложение — самый важный момент: подбор застройщика с фокусом на надёжность и перспективу. Просто дешевле или нравится — не работает.',
      iconBg: 'from-[#1f1e1c] to-[#141312]',
    },
    {
      icon: Users,
      title: 'Семейный капитал',
      description:
        'Стратегия платежей и фактической переплаты: как для сохранения семейного капитала, так и покупка недвижимости с целью проживания или для детей, на будущее.',
      iconBg: 'from-[#1a1918] to-[#121110]',
    },
    {
      icon: TrendingUp,
      title: 'Улучшение и инвестиции',
      description:
        'Ликвидность локации, рассрочка и полная оплата, сценарии выхода из актива — как для жизни, так и для капитала',
      iconBg: 'from-[#1d1c1a] to-[#131211]',
    },
  ];

  return (
    <section id="for-whom" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="text-[38px] sm:text-[46px] text-primary mb-4 font-semibold tracking-tight">Для кого</h2>
          <p className="section-lead">
            Работаю с семьями и частными инвесторами, которым важны цифры, время и приватность — без давления и «горящих акций»
          </p>
        </motion.div>

        <div className="cards-grid md:grid-cols-3">
          {segments.map((segment, index) => {
            const Icon = segment.icon;
            return (
              <motion.article
                key={segment.title}
                className="card-shell group relative overflow-hidden rounded-3xl border border-border bg-card/80 p-8 backdrop-blur-sm transition-all duration-500 hover:border-accent/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex h-full flex-col">
                  <motion.div
                    className={`mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent/15 bg-gradient-to-br ${segment.iconBg}`}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  >
                    <Icon className="h-7 w-7 text-accent/95" aria-hidden />
                  </motion.div>
                  <h3 className="card-title mb-3 text-[22px] sm:text-[24px]">{segment.title}</h3>
                  <p className="card-text-grow">{segment.description}</p>
                </div>

                <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-bl-[36px] bg-accent/[0.04] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
