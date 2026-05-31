import React from 'react';
import { Quote, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useMotionProfile } from '../hooks/useMotionProfile';

const TESTIMONIALS = [
  {
    text: 'Игорь разложил ипотечные программы по полочкам — не лозунги, а цифры и сценарии. В итоге выбрали не то, что «продавали» в рекламе, а то, что реально подошло семье.',
    author: 'Анна К.',
    role: 'Семейная ипотека · Серебряный Бор',
    rating: 5,
  },
  {
    text: 'После нескольких агентов с каталогами впервые услышали честный расчёт переплаты и досрочного погашения. Это другой уровень сервиса.',
    author: 'Дмитрий М.',
    role: 'Первая резиденция · LIFE-Варшавская',
    rating: 5,
  },
  {
    text: 'Никакого давления: каждый вариант с плюсами и минусами. Сопровождение до сделки и в банке — ощущение private-подхода, а не массового отдела продаж.',
    author: 'Екатерина Л.',
    role: 'Улучшение жилья',
    rating: 5,
  },
] as const;

export function Testimonials() {
  const { reduceMotion } = useMotionProfile();

  return (
    <section id="testimonials" className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 sm:mb-16 text-center">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-accent/90">Доверие</p>
          <h2 className="mb-4 text-[34px] font-semibold tracking-tight text-primary sm:text-[46px]">Отзывы</h2>
          <p className="section-lead">Обратная связь от клиентов, с которыми выстроена долгосрочная работа</p>
        </div>

        <div className="cards-grid md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => {
            const motionProps = reduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.45, delay: index * 0.06 },
                };

            return (
              <motion.blockquote
                key={testimonial.author}
                className="card-shell group relative overflow-hidden rounded-[26px] border border-border bg-card/90 p-7 sm:p-8 transition-colors duration-300 hover:border-accent/25"
                {...motionProps}
              >
                <div className="pointer-events-none absolute -top-4 -right-4 opacity-[0.06]">
                  <Quote className="h-28 w-28 text-accent" aria-hidden />
                </div>

                <div className="relative z-10 flex h-full flex-col gap-5">
                  <div className="flex shrink-0 gap-1" aria-hidden>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent/85 text-accent/85" />
                    ))}
                  </div>

                  <p className="card-text-grow text-[15px] text-foreground/88">&ldquo;{testimonial.text}&rdquo;</p>

                  <footer className="card-footer">
                    <div className="text-[15px] font-semibold text-primary">{testimonial.author}</div>
                    <div className="mt-1 text-[13px] text-muted-foreground">{testimonial.role}</div>
                  </footer>
                </div>
              </motion.blockquote>
            );
          })}
        </div>
      </div>
    </section>
  );
}
