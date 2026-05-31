import React, { useEffect } from 'react';
import { hasAnalyticsConsent } from './CookieBanner';

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
  }
}

function injectYandexMetrika(counterId: string) {
  if (document.querySelector(`script[data-yandex-metrika="${counterId}"]`)) return;

  const head = document.getElementsByTagName('head')[0];
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.dataset.yandexMetrika = counterId;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';

  script.onload = () => {
    const id = Number(counterId);
    if (!Number.isFinite(id)) return;
    window.ym?.(id, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false,
    });
  };

  head.appendChild(script);

  const noscript = document.createElement('noscript');
  noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${counterId}" style="position:absolute; left:-9999px;" alt="" /></div>`;
  head.appendChild(noscript);
}

export function Analytics() {
  useEffect(() => {
    const tryLoad = () => {
      const counterId = import.meta.env.VITE_YANDEX_METRIKA_ID;
      if (!counterId || !hasAnalyticsConsent()) return;
      injectYandexMetrika(counterId.trim());
    };

    tryLoad();
    const onConsent = () => tryLoad();
    window.addEventListener('cookie-consent-changed', onConsent as EventListener);
    return () => window.removeEventListener('cookie-consent-changed', onConsent as EventListener);
  }, []);

  return null;
}
