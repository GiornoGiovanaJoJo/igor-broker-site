import React, { useEffect } from 'react';
import { hasAnalyticsConsent } from './CookieBanner';

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
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

function injectMicrosoftClarity(projectId: string) {
  if (document.querySelector(`script[data-clarity="${projectId}"]`)) return;
  if (window.clarity) return;

  const head = document.getElementsByTagName('head')[0];
  const inline = document.createElement('script');
  inline.type = 'text/javascript';
  inline.dataset.clarity = projectId;
  inline.text = `(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "${projectId}");`;
  head.appendChild(inline);
}

export function Analytics() {
  useEffect(() => {
    const tryLoad = () => {
      if (!hasAnalyticsConsent()) return;

      const metrikaId = import.meta.env.VITE_YANDEX_METRIKA_ID;
      if (metrikaId) injectYandexMetrika(metrikaId.trim());

      const clarityId = import.meta.env.VITE_CLARITY_ID;
      if (clarityId) injectMicrosoftClarity(clarityId.trim());
    };

    tryLoad();
    const onConsent = () => tryLoad();
    window.addEventListener('cookie-consent-changed', onConsent as EventListener);
    return () => window.removeEventListener('cookie-consent-changed', onConsent as EventListener);
  }, []);

  return null;
}
