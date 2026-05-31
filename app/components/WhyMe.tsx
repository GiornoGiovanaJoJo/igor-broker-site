import React from 'react';
import { Briefcase, Calculator, Building2, LineChart } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'motion/react';

type Reason = {
  index: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  title: string;
  description: string;
  highlight?: boolean;
  proofs?: string[];
  gridClass: string;
};

const CONTRAST_PILLS = ['Не каталог', 'Не отдел продаж', 'Ваша сторона стола'] as const;

const TRUST_STATS = [
  { value: '2005', label: 'в банковской сфере' },
  { value: '500+', label: 'консультаций' },
  { value: '0%', label: 'комиссия клиента' },
] as const;

const REASONS: Reason[] = [
  {
    index: '01',
    icon: Briefcase,
    tag: 'Экспертиза',
    title: 'Банковский бэкграунд',
    description:
      'Ипотечные продукты изнутри — в банковской сфере с 2005 года. Понимаю, как устроены одобрение, риски и реальная стоимость денег.',
    gridClass: 'lg:col-start-8 lg:col-span-5 lg:row-start-1',
  },
  {
    index: '02',
    icon: Calculator,
    tag: 'Проверено на себе',
    title: 'Личный опыт ипотеки',
    description:
      'Прошёл путь клиента сам: от подбора до сделки. Четыре личных кейса покупки — от студии до трёхкомнатной квартиры в Москве. Без абстракций, только то, что работает на практике.',
    highlight: true,
    proofs: ['4 личных кейса', 'Студия → 3‑комн'],
    gridClass: 'lg:col-start-1 lg:col-span-7 lg:row-start-1 lg:row-span-2 order-first lg:order-none',
  },
  {
    index: '03',
    icon: Building2,
    tag: 'Due diligence',
    title: 'Обзоры жилых комплексов',
    description:
      'Разбираю ЖК глубже маркетинговых брошюр: локация, застройщик, реальные сроки и качество — чтобы решение опиралось на факты, а не на обещания в рекламе.',
    gridClass: 'lg:col-start-8 lg:col-span-5 lg:row-start-2',
  },
  {
    index: '04',
    icon: LineChart,
    tag: 'Модель решения',
    title: 'Цифры и аналитика',
    description:
      'Сравниваем варианты платежей, досрочного погашения и рисков в понятной модели. Работаем с цифрами и при покупке для личного проживания — это всё равно крупное финансовое решение.',
    gridClass: 'lg:col-span-12 lg:row-start-3',
  },
];

function ReasonCard({
  reason,
  variants,
  reduceMotion,
}: {
  reason: Reason;
  variants: Variants;
  reduceMotion: boolean | null;
}) {
  const Icon = reason.icon;
  const isFeatured = reason.highlight;
  const isWide = reason.gridClass.includes('col-span-12');

  return (
    <motion.article
      variants={variants}
      className={`group relative overflow-hidden rounded-[28px] border backdrop-blur-sm transition-[border-color,box-shadow] duration-500 focus-within:ring-2 focus-within:ring-accent/35 ${reason.gridClass} ${
        isFeatured
          ? 'border-accent/30 bg-gradient-to-br from-card/90 via-card/75 to-[#141210]/90 shadow-[0_24px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(184,149,92,0.12)]'
          : 'border-border/80 bg-card/55 hover:border-accent/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]'
      } ${isWide ? 'p-8 sm:p-10' : 'p-7 sm:p-8'} ${isFeatured ? 'min-h-[320px] lg:min-h-full' : ''} flex h-full flex-col`}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.07] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      {isFeatured && (
        <div
          className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-accent/[0.08] blur-3xl"
          aria-hidden
        />
      )}

      <motion.div
        className={`relative z-10 ${isWide ? 'flex flex-col gap-6 md:flex-row md:items-center md:gap-10' : 'flex h-full flex-col'} ${isFeatured ? 'flex-1' : ''}`}
      >
        <motion.div className={`flex shrink-0 ${isWide ? 'md:w-[280px]' : ''}`}>
          <div className="flex items-start gap-4">
            <span
              className={`font-display text-[13px] font-semibold tracking-[0.2em] ${
                isFeatured ? 'text-accent' : 'text-accent/70'
              }`}
              aria-hidden
            >
              {reason.index}
            </span>
            <motion.div
              className={`flex items-center justify-center rounded-2xl border shadow-[0_8px_28px_rgba(0,0,0,0.25)] ${
                isFeatured
                  ? 'h-16 w-16 border-accent/35 bg-gradient-to-br from-accent/15 to-accent/[0.04]'
                  : 'h-14 w-14 border-accent/18 bg-secondary/80 group-hover:border-accent/30'
              }`}
              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            >
              <Icon className={`${isFeatured ? 'h-8 w-8' : 'h-7 w-7'} text-accent/95`} aria-hidden />
            </motion.div>
          </div>
        </motion.div>

        <div className={`min-w-0 flex-1 ${isFeatured ? 'mt-6 flex flex-col' : 'mt-5'}`}>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-accent/80">{reason.tag}</p>
          <h3
            className={`mb-3 font-semibold text-primary ${
              isFeatured ? 'text-[24px] sm:text-[28px] leading-tight' : 'text-[20px] sm:text-[22px]'
            }`}
          >
            {reason.title}
          </h3>
          <p
            className={`leading-relaxed text-muted-foreground ${
              isFeatured ? 'text-[16px] sm:text-[17px] max-w-xl' : 'text-[15px]'
            }`}
          >
            {reason.description}
          </p>

          {reason.proofs && (
            <div className="mt-6 flex flex-wrap gap-2">
              {reason.proofs.map((proof) => (
                <span
                  key={proof}
                  className="inline-flex items-center rounded-full border border-accent/25 bg-accent/[0.08] px-3 py-1.5 text-[12px] font-medium tracking-wide text-foreground/90"
                >
                  {proof}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 rounded-tl-[40px] bg-accent/[0.04] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
    </motion.article>
  );
}

export function WhyMe() {
  const reduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: reduceMotion ? {} : { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = reduceMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0, y: 22 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <section
      id="why-me"
      className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8"
      aria-labelledby="why-me-heading"
    >
      <motion.div
        className="pointer-events-none absolute left-[8%] top-16 h-40 w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute bottom-24 right-[6%] h-px w-48 bg-gradient-to-r from-transparent via-accent/25 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/[0.04] blur-[120px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          className="mx-auto mb-14 max-w-3xl text-center lg:mb-16 readable-over-bg"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-accent">Private advisory</p>
          <h2
            id="why-me-heading"
            className="mb-5 text-[38px] font-semibold tracking-tight text-primary sm:text-[46px]"
          >
            Почему я
          </h2>
          <p className="mx-auto max-w-2xl section-lead">
            Не каталог и не отдел продаж застройщика — финансовое сопровождение сделки с вашей стороны стола
          </p>

          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2 sm:gap-3">
            {CONTRAST_PILLS.map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center rounded-full border border-border/80 bg-card/40 px-3.5 py-1.5 text-[12px] font-medium tracking-wide text-foreground/92 backdrop-blur-sm"
              >
                {pill}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:grid-rows-[auto_auto_auto] lg:gap-6 lg:items-stretch"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {REASONS.map((reason) => (
            <ReasonCard key={reason.index} reason={reason} variants={itemVariants} reduceMotion={reduceMotion} />
          ))}
        </motion.div>

        <motion.div
          className="cards-grid mt-12 border-t border-border/70 pt-10 sm:grid-cols-3"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15 }}
        >
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="font-display text-[28px] font-semibold leading-none text-accent sm:text-[32px]">{stat.value}</p>
              <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
