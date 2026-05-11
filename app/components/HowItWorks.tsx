import React from 'react';
import { FileText, Phone, ListChecks, HandshakeIcon } from 'lucide-react';
import { motion } from 'motion/react';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: FileText,
      title: 'Запрос',
      description: 'Контакт и суть задачи — без длинной анкеты, детали уточним на созвоне',
    },
    {
      number: '02',
      icon: Phone,
      title: 'Созвон 20–30 минут',
      description: 'Уточняем приоритеты: район, срок сдачи, застройщик, допущения по риску',
    },
    {
      number: '03',
      icon: ListChecks,
      title: 'Короткий список',
      description: '3–5 вариантов с расчётами платежей и сценариями досрочного погашения',
    },
    {
      number: '04',
      icon: HandshakeIcon,
      title: 'Сопровождение',
      description: 'До сделки: документы, ипотека, бронь — в том темпе, который удобен вам',
    },
  ];

  return (
    <section id="how-works" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="text-[38px] sm:text-[46px] text-primary mb-4 font-semibold tracking-tight">Как проходит работа</h2>
          <p className="text-[17px] sm:text-[18px] text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Прозрачные этапы без навязанных показов — фокус на вашей задаче и цифрах
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.07 }}
              >
                <motion.div
                  className="flex flex-col items-center text-center"
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                >
                  <div className="relative mb-6">
                    <motion.div
                      className="w-24 h-24 rounded-3xl bg-card/90 border border-accent/18 flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-colors hover:border-accent/35"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Icon className="w-10 h-10 text-accent/90" />
                    </motion.div>
                    <motion.div
                      className="absolute -top-3 -right-3 w-11 h-11 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center text-[13px] font-semibold border border-accent/40 shadow-[0_8px_24px_rgba(184,149,92,0.25)]"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', delay: index * 0.08 + 0.25, stiffness: 260, damping: 18 }}
                    >
                      {step.number}
                    </motion.div>
                  </div>
                  <h3 className="text-[20px] sm:text-[22px] text-primary mb-3 font-semibold">{step.title}</h3>
                  <p className="text-[14px] text-muted-foreground leading-relaxed max-w-[260px]">{step.description}</p>
                </motion.div>

                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute top-12 left-[calc(100%+1rem)] w-8 h-px bg-gradient-to-r from-accent/35 to-transparent"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: index * 0.15 + 0.45 }}
                    style={{ transformOrigin: 'left' }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
