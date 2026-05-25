import React from 'react';
import { Quote, Star } from 'lucide-react';
import { motion } from 'motion/react';

export function Testimonials() {
  const testimonials = [
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
  ];

  return (
    <section id="testimonials" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="mb-4 text-[38px] font-semibold tracking-tight text-primary sm:text-[46px]">Отзывы</h2>
          <p className="section-lead">Обратная связь от клиентов, с которыми выстроена долгосрочная работа</p>
        </motion.div>

        <div className="cards-grid md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.blockquote
              key={testimonial.author}
              className="card-shell group relative overflow-hidden rounded-[26px] border border-border bg-card/70 p-8 backdrop-blur-sm transition-all duration-500 hover:border-accent/25"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.07 }}
              whileHover={{ y: -4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="pointer-events-none absolute -top-4 -right-4 opacity-[0.06] transition-opacity group-hover:opacity-[0.1]">
                <Quote className="h-28 w-28 text-accent" aria-hidden />
              </div>

              <motion.div className="relative z-10 flex h-full flex-col gap-5">
                <div className="flex shrink-0 gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.07 + i * 0.04 }}
                    >
                      <Star className="h-5 w-5 fill-accent/85 text-accent/85" aria-hidden />
                    </motion.div>
                  ))}
                </div>

                <p className="card-text-grow text-[15px] text-foreground/88">&ldquo;{testimonial.text}&rdquo;</p>

                <footer className="card-footer">
                  <div className="text-[15px] font-semibold text-primary">{testimonial.author}</div>
                  <div className="mt-1 text-[13px] text-muted-foreground">{testimonial.role}</div>
                </footer>
              </motion.div>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
