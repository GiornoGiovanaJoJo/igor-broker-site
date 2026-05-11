import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Send, Mail, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { siteConfig, telegramDmUrl, maxWebOpenUrl } from '../site.config';

export function Footer() {
  const telHref = `tel:${siteConfig.phoneTel}`;

  return (
    <footer className="relative py-16 px-4 sm:px-6 lg:px-8 bg-[#050506] text-primary overflow-hidden border-t border-border">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(90%,720px)] h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
      <div className="absolute top-0 left-0 w-52 h-52 bg-accent/6 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-52 h-52 bg-muted opacity-50 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="flex flex-col mb-6">
              <Link to="/" className="text-[26px] font-semibold tracking-tight font-display hover:text-accent transition-colors w-fit">
                {siteConfig.brandName}
              </Link>
              <span className="text-[11px] text-accent/90 font-medium mt-1 tracking-[0.2em] uppercase">{siteConfig.tagline}</span>
            </div>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
              Подбор новостроек и ипотечная стратегия в Москве и области — конфиденциально и по запросу
            </p>
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <MapPin className="w-4 h-4 text-accent/65 shrink-0" aria-hidden />
              <span>{siteConfig.region}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.06 }}
          >
            <h3 className="text-[15px] font-semibold mb-6 tracking-wide text-primary">Контакты</h3>
            <div className="space-y-4">
              <a
                href={telHref}
                className="flex items-center gap-3 text-[14px] text-muted-foreground hover:text-accent transition-colors duration-300 group"
              >
                <div className="w-9 h-9 rounded-lg bg-card border border-border group-hover:border-accent/35 flex items-center justify-center transition-colors">
                  <Phone className="w-4 h-4 text-accent/85" aria-hidden />
                </div>
                <span>{siteConfig.phoneDisplay}</span>
              </a>
              <a
                href={telegramDmUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[14px] text-muted-foreground hover:text-accent transition-colors duration-300 group"
              >
                <div className="w-9 h-9 rounded-lg bg-card border border-border group-hover:border-accent/35 flex items-center justify-center transition-colors">
                  <Send className="w-4 h-4 text-accent/85" aria-hidden />
                </div>
                <span>@{siteConfig.telegramUsername}</span>
              </a>
              <a
                href={maxWebOpenUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[14px] text-muted-foreground hover:text-accent transition-colors duration-300 group"
              >
                <div className="w-9 h-9 rounded-lg bg-card border border-border group-hover:border-accent/35 flex items-center justify-center transition-colors text-[11px] font-bold text-accent">
                  MAX
                </div>
                <span>{siteConfig.maxPhoneTel}</span>
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-3 text-[14px] text-muted-foreground hover:text-accent transition-colors duration-300 group"
              >
                <div className="w-9 h-9 rounded-lg bg-card border border-border group-hover:border-accent/35 flex items-center justify-center transition-colors">
                  <Mail className="w-4 h-4 text-accent/85" aria-hidden />
                </div>
                <span>{siteConfig.email}</span>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.12 }}
          >
            <h3 className="text-[15px] font-semibold mb-6 tracking-wide text-primary">Информация</h3>
            <div className="space-y-4">
              <Link
                to="/privacy"
                className="block text-[14px] text-muted-foreground hover:text-accent transition-colors hover:translate-x-0.5 duration-300"
              >
                Политика конфиденциальности
              </Link>
              <Link
                to="/terms"
                className="block text-[14px] text-muted-foreground hover:text-accent transition-colors hover:translate-x-0.5 duration-300"
              >
                Пользовательское соглашение
              </Link>
              <Link
                to="/work"
                className="block text-[14px] text-muted-foreground hover:text-accent transition-colors hover:translate-x-0.5 duration-300"
              >
                О работе
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="pt-8 border-t border-border"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[13px] text-muted-foreground">
              © {new Date().getFullYear()} {siteConfig.brandName}. Все права защищены
            </p>
            <p className="text-[13px] text-muted-foreground">{siteConfig.city}</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
