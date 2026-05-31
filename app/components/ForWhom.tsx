import React from 'react';
import { Home, Users, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useMotionProfile } from '../hooks/useMotionProfile';

const SEGMENTS = [
  {
    icon: Home,
    title: 'Первая резиденция',
    description:
      'Первое жильё и вложение — самый важный момент: подбор застройщика с фокусом на надёжность и перспективу. Просто дешевле или нравится — не работает.',
    iconBg: 'from-[#1f1e1c] to-[#141312]',
    accent: '01',
  },
  {
    icon: Users,
    title: 'Семейный капитал',
    description:
      'Стратегия платежей и фактической переплаты: как для сохранения семейного капитала, так и покупка недвижимости с целью проживания или для детей, на будущее.',
    iconBg: 'from-[#1a1918] to-[#121110]',
    accent: '02',
  },
  {
    icon: TrendingUp,
    title: 'Улучшение и инвестиции',
    description:
      'Ликвидность локации, рассрочка и полная оплата, сценарии выхода из актива — как для жизни, так и для капитала',
    iconBg: 'from-[#1d1c1a] to-[#131211]',
    accent: '03',
  },
] as const;

export function ForWhom() {
  const { allowContentMotion } = useMotionProfile();

  return (
    <section id="for-whom" className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14 sm:mb-16">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-accent/90">Аудитория</p>
          <h2 className="text-[34px] sm:text-[46px] text-primary mb-4 font-semibold tracking-tight">Для кого</h2>
          <p className="section-lead">
            Работаю с семьями и частными инвесторами, которым важны цифры, время и приватность — без давления и «горящих акций»
          </p>
        </div>

        <div className="cards-grid md:grid-cols-3">
          {SEGMENTS.map((segment, index) => {
            const Icon = segment.icon;
            const motionProps = !allowContentMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.45, delay: index * 0.06 },
                };

            return (
              <motion.article
                key={segment.title}
                className="card-shell group relative overflow-hidden rounded-3xl border border-border bg-card/90 p-7 sm:p-8 transition-colors duration-300 hover:border-accent/25"
                {...motionProps}
              >
                <span className="absolute top-5 right-6 text-[11px] font-medium tracking-[0.2em] text-accent/40">{segment.accent}</span>
                <div className="relative z-10 flex h-full flex-col">
                  <div
                    className={`mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent/15 bg-gradient-to-br ${segment.iconBg}`}
                  >
                    <Icon className="h-7 w-7 text-accent/95" aria-hidden />
                  </div>
                  <h3 className="card-title mb-3 text-[22px] sm:text-[24px]">{segment.title}</h3>
                  <p className="card-text-grow">{segment.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
