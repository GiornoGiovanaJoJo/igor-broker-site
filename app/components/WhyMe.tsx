import React from 'react';
import { Briefcase, Calculator, Building2, LineChart } from 'lucide-react';
import { motion } from 'motion/react';

export function WhyMe() {
  const reasons = [
    {
      icon: Briefcase,
      title: 'Банковский бэкграунд',
      description: 'Ипотечные продукты изнутри — более 10 лет в системных банках. Понимаю, как устроены одобрение, риски и реальная стоимость денег',
    },
    {
      icon: Calculator,
      title: 'Личный опыт ипотеки',
      description: 'Прошёл путь клиента сам: от подбора до сделки. Без абстракций — только то, что работает на практике',
    },
    {
      icon: Building2,
      title: 'Застройщики и репутация',
      description: 'Прямые контакты и понимание реального качества ЖК, а не только маркетинговых брошюр',
    },
    {
      icon: LineChart,
      title: 'Цифры и сценарии',
      description: 'Не «показать объект», а сравнить варианты платежа, досрочного погашения и рисков — в понятной модели',
    },
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent/85 mb-4">Позиционирование</p>
          <h2 className="text-[38px] sm:text-[46px] text-primary mb-4 font-semibold tracking-tight">Почему я</h2>
          <p className="text-[17px] sm:text-[18px] text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Не каталог и не отдел продаж застройщика — финансовое сопровождение сделки с вашей стороны стола
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={index}
                className="group relative flex gap-6 p-8 rounded-3xl bg-card/60 border border-border hover:border-accent/22 overflow-hidden backdrop-blur-sm transition-all duration-500"
                initial={{ opacity: 0, x: index % 2 === 0 ? -22 : 22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                whileHover={{ y: -3 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={false}
                />

                <div className="flex-shrink-0 relative z-10">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-secondary border border-accent/15 flex items-center justify-center group-hover:border-accent/35 transition-colors duration-300"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.35 }}
                  >
                    <Icon className="w-7 h-7 text-accent/95 group-hover:text-accent transition-colors" />
                  </motion.div>
                </div>
                <div className="flex-1 relative z-10">
                  <h3 className="text-[20px] sm:text-[22px] text-primary mb-2 font-semibold">{reason.title}</h3>
                  <p className="text-[15px] text-muted-foreground leading-relaxed">{reason.description}</p>
                </div>

                <div className="absolute bottom-0 right-0 w-28 h-28 bg-accent/[0.03] rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
