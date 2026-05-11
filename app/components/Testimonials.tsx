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
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="text-[38px] sm:text-[46px] text-primary mb-4 font-semibold tracking-tight">Отзывы</h2>
          <p className="text-[17px] sm:text-[18px] text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Обратная связь от клиентов, с которыми выстроена долгосрочная работа
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="relative p-8 rounded-[26px] bg-card/70 border border-border hover:border-accent/25 overflow-hidden group backdrop-blur-sm transition-all duration-500"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.07 }}
              whileHover={{ y: -4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="absolute -top-4 -right-4 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity">
                <Quote className="w-28 h-28 text-accent" />
              </div>

              <div className="relative z-10 space-y-5">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.07 + i * 0.04 }}
                    >
                      <Star className="w-5 h-5 fill-accent/85 text-accent/85" />
                    </motion.div>
                  ))}
                </div>

                <p className="text-[15px] text-foreground/88 leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>

                <div className="pt-4 border-t border-border">
                  <div className="font-semibold text-primary text-[15px]">{testimonial.author}</div>
                  <div className="text-[13px] text-muted-foreground mt-1">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
