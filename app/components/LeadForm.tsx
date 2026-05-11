import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function LeadForm() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    budget: '',
    goal: '',
    familyMortgage: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="lead-form" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent/85 mb-4">Конфиденциально</p>
          <h2 className="text-[36px] sm:text-[44px] text-primary mb-4 font-semibold tracking-tight">
            Запрос на короткий разбор ситуации
          </h2>
          <p className="text-[17px] sm:text-[18px] text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            Оставьте контакты — отвечу в приоритетном порядке и предложу варианты под ваш запрос без массовых рассылок
          </p>
        </motion.div>

        <motion.div
          className="relative bg-card/70 backdrop-blur-md p-8 sm:p-12 rounded-[28px] border border-accent/18 shadow-[0_24px_80px_rgba(0,0,0,0.45)] overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.12 }}
        >
          <div className="absolute top-0 right-0 w-56 h-56 bg-accent/[0.06] rounded-full blur-3xl -z-0 pointer-events-none" />
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
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
            </div>

            <div>
              <label htmlFor="budget" className="block text-[14px] text-foreground/90 mb-2 tracking-wide">
                Бюджет
              </label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:border-accent/50 focus:ring-2 focus:ring-accent/15 outline-none transition-all"
              >
                <option value="">Выберите диапазон</option>
                <option value="3-5">3–5 млн ₽</option>
                <option value="5-8">5–8 млн ₽</option>
                <option value="8-12">8–12 млн ₽</option>
                <option value="12-20">12–20 млн ₽</option>
                <option value="20+">20+ млн ₽</option>
              </select>
            </div>

            <div>
              <label htmlFor="goal" className="block text-[14px] text-foreground/90 mb-2 tracking-wide">
                Цель
              </label>
              <select
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:border-accent/50 focus:ring-2 focus:ring-accent/15 outline-none transition-all"
              >
                <option value="">Выберите цель</option>
                <option value="first">Первая резиденция</option>
                <option value="family">Семейная ипотека</option>
                <option value="improve">Улучшение жилья</option>
                <option value="invest">Инвестиция / капитал</option>
              </select>
            </div>

            <div>
              <label className="block text-[14px] text-foreground/90 mb-3 tracking-wide">Семейная ипотека</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="familyMortgage"
                    value="yes"
                    checked={formData.familyMortgage === 'yes'}
                    onChange={handleChange}
                    className="w-4 h-4 accent-accent border-border bg-input-background focus:ring-accent/30"
                  />
                  <span className="text-[14px] text-foreground/85 group-hover:text-foreground transition-colors">Да</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="familyMortgage"
                    value="no"
                    checked={formData.familyMortgage === 'no'}
                    onChange={handleChange}
                    className="w-4 h-4 accent-accent border-border bg-input-background focus:ring-accent/30"
                  />
                  <span className="text-[14px] text-foreground/85 group-hover:text-foreground transition-colors">Нет</span>
                </label>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitted}
              className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-accent text-accent-foreground hover:bg-[#c4a66a] disabled:opacity-55 disabled:cursor-not-allowed transition-all duration-300 border border-accent/35 shadow-[0_12px_40px_rgba(184,149,92,0.22)] font-medium text-[16px] tracking-wide"
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
                  <span>Получить разбор</span>
                </>
              )}
            </motion.button>

            <p className="text-[12px] text-muted-foreground text-center leading-relaxed">
              Нажимая кнопку, вы соглашаетесь с{' '}
              <Link to="/privacy" className="text-accent/90 hover:text-accent underline-offset-4 hover:underline transition-colors">
                политикой конфиденциальности
              </Link>
              . Данные не передаются третьим лицам.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
