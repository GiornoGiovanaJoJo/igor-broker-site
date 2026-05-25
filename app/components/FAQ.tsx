import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Сколько стоят ваши услуги для клиента?',
    a: 'Формат и условия вознаграждения обсуждаются прозрачно до старта работ и зависят от сценария сделки. На консультации по подбору и стратегии ипотеки вы получаете понятную рамку без скрытых платежей.',
  },
  {
    q: 'Вы представляете интересы застройщика или клиента?',
    a: 'Работаю на стороне вашего запроса: сравниваю объекты и программы финансирования, фиксирую риски и допущения. Цель — взвешенное решение по вашим критериям, а не «продать конкретный ЖК».',
  },
  {
    q: 'Можно ли всё пройти дистанционно?',
    a: 'Да: созвоны, обмен документами, согласование шагов и ипотечного контура — в удалённом формате. Выездные показы и бронирование организуются по необходимости.',
  },
  {
    q: 'Чем подбор от брокера отличается от отдела продаж?',
    a: 'Отдел продаж закреплён за проектом и продвигает свой продукт. Я сопоставляю несколько застройщиков и банковских программ, считаю платежи и переплату, помогаю выбрать вариант под вашу задачу.',
  },
  {
    q: 'Какие документы обычно нужны на старте?',
    a: 'На первом этапе достаточно описания задачи, ориентиров по бюджету и статуса семейной ипотеки/ЗП. Полный пакет под конкретный банк и сделку подскажу после фокусировки на 2–3 объектах.',
  },
  {
    q: 'Работаете только с новостройками в Москве?',
    a: 'Фокус — Москва и Московская область по новостройкам и ипотечному сопровождению. Отдельные запросы по регионам обсуждаются индивидуально.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-border/80">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="text-[34px] sm:text-[42px] text-primary mb-4 font-bold tracking-tight">Частые вопросы</h2>
          <p className="text-[17px] text-muted-foreground font-light leading-relaxed">
            Коротко о формате работы и ожиданиях — без обещаний «лучшей квартиры за один звонок»
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((item, index) => {
            const isOpen = open === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="border border-border rounded-sm bg-card/40 overflow-hidden"
              >
                <button
                  type="button"
                  id={`faq-trigger-${index}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-card/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <span className="text-[15px] font-semibold text-primary pr-2 text-pretty">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-accent transition-transform mt-0.5 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${index}`}
                  hidden={!isOpen}
                  className={`${isOpen ? 'block' : 'hidden'} px-5 pb-5 pt-0 border-t border-border/60`}
                >
                  <p className="pt-4 text-[14px] leading-relaxed text-muted-foreground text-pretty">{item.a}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
