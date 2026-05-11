import React from 'react';
import { Home, Users, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export function ForWhom() {
  const segments = [
    {
      icon: Home,
      title: 'Первая резиденция',
      description: 'Семейная ипотека и госпрограммы — подбор застройщика с фокусом на надёжность и юридическую чистоту',
      iconBg: 'from-[#1f1e1c] to-[#141312]',
    },
    {
      icon: Users,
      title: 'Семейный капитал',
      description: 'Стратегия платежей и реальная переплата: льготные продукты без навязанных «комплектов» от продаж',
      iconBg: 'from-[#1a1918] to-[#121110]',
    },
    {
      icon: TrendingUp,
      title: 'Улучшение и инвестиции',
      description: 'Ликвидность локации, trade-in, сценарии выхода из актива — как для жизни, так и для капитала',
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
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent/85 mb-4">Аудитория</p>
          <h2 className="text-[38px] sm:text-[46px] text-primary mb-4 font-semibold tracking-tight">Для кого</h2>
          <p className="text-[17px] sm:text-[18px] text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Работаю с семьями и частными инвесторами, которым важны цифры, время и приватность — без давления и «горящих акций»
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {segments.map((segment, index) => {
            const Icon = segment.icon;
            return (
              <motion.div
                key={index}
                className="group relative p-8 rounded-3xl bg-card/80 border border-border hover:border-accent/25 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden backdrop-blur-sm"
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <motion.div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${segment.iconBg} flex items-center justify-center mb-6 border border-accent/15`}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  >
                    <Icon className="w-7 h-7 text-accent/95" />
                  </motion.div>
                  <h3 className="text-[22px] sm:text-[24px] text-primary mb-3 font-semibold">{segment.title}</h3>
                  <p className="text-[15px] text-muted-foreground leading-relaxed">{segment.description}</p>
                </div>

                <div className="absolute top-0 right-0 w-16 h-16 bg-accent/[0.04] rounded-bl-[36px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
