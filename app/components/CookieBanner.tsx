import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'igor_broker_cookie_choice';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const choose = (allowAnalytics: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, allowAnalytics ? 'analytics' : 'essential');
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: allowAnalytics }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[150] p-4 sm:p-6 border-t border-border bg-card max-md:backdrop-blur-none md:bg-card/95 md:backdrop-blur-xl shadow-[0_-8px_40px_rgba(0,0,0,0.45)]"
      role="dialog"
      aria-label="Согласие на использование файлов cookie"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
        <p className="text-[13px] sm:text-[14px] text-muted-foreground leading-relaxed flex-1">
          Используем файлы cookie для работы сайта и (при согласии) для анонимной аналитики. Подробнее — в{' '}
          <Link to="/privacy" className="text-accent underline underline-offset-2 hover:text-[#c4a66a]">
            политике конфиденциальности
          </Link>
          .
        </p>
        <div className="flex flex-col xs:flex-row gap-2 shrink-0">
          <button
            type="button"
            onClick={() => choose(false)}
            className="px-4 py-2.5 rounded-sm border border-border text-[13px] font-medium text-foreground/90 hover:bg-muted transition-colors"
          >
            Только необходимые
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="px-4 py-2.5 rounded-sm bg-accent text-accent-foreground text-[13px] font-semibold hover:bg-[#c4a66a] transition-colors border border-accent/35"
          >
            Принять все
          </button>
        </div>
      </div>
    </div>
  );
}

export function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'analytics';
  } catch {
    return false;
  }
}
