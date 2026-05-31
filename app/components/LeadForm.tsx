import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function LeadForm() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="lead-form" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="text-[32px] sm:text-[40px] text-primary mb-3 font-semibold tracking-tight">
            Короткий запрос
          </h2>
          <p className="text-[16px] sm:text-[17px] text-muted-foreground font-normal leading-[1.65]">
            Имя и контакт — отвечу по сути, без длинных анкет
          </p>
        </motion.div>

        <motion.div
          className="relative bg-card/70 backdrop-blur-md p-8 sm:p-10 rounded-[28px] border border-accent/18 shadow-[0_24px_80px_rgba(0,0,0,0.45)] overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.12 }}
        >
          <div className="absolute top-0 right-0 w-56 h-56 bg-accent/[0.06] rounded-full blur-3xl -z-0 pointer-events-none" />
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label htmlFor="name" className="block text-[14px] text-foreground/90 mb-2 tracking-wide">
                Имя
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:border-accent/50 focus:ring-2 focus:ring-accent/15 outline-none transition-all text-foreground placeholder:text-muted-foreground/55"
                placeholder="Как к вам обращаться"
              />
            </div>

            <div>
              <label htmlFor="contact" className="block text-[14px] text-foreground/90 mb-2 tracking-wide">
                Телефон или Telegram
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:border-accent/50 focus:ring-2 focus:ring-accent/15 outline-none transition-all text-foreground placeholder:text-muted-foreground/55"
                placeholder="+7 · @username"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitted}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-accent text-accent-foreground hover:bg-[#c4a66a] disabled:opacity-55 disabled:cursor-not-allowed transition-all duration-300 border border-accent/35 shadow-[0_12px_40px_rgba(184,149,92,0.22)] font-medium text-[16px] tracking-wide"
              whileHover={{ scale: isSubmitted ? 1 : 1.01 }}
              whileTap={{ scale: isSubmitted ? 1 : 0.99 }}
            >
              {isSubmitted ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Запрос отправлен</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Отправить</span>
                </>
              )}
            </motion.button>

            <p className="text-[12px] text-muted-foreground text-center leading-relaxed">
              Нажимая кнопку, вы соглашаетесь с{' '}
              <Link to="/privacy" className="text-accent/90 hover:text-accent underline-offset-4 hover:underline transition-colors">
                политикой конфиденциальности
              </Link>
              .
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
