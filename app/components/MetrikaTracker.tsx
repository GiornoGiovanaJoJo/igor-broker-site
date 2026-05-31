import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
  }
}

function metrikaCounterId(): number | null {
  const raw = import.meta.env.VITE_YANDEX_METRIKA_ID?.trim();
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

/** Sends pageviews on React Router navigations (counter init is in index.html). */
export function MetrikaTracker() {
  const location = useLocation();
  const skipInitialHit = useRef(true);

  useEffect(() => {
    const id = metrikaCounterId();
    if (!id || typeof window.ym !== 'function') return;

    if (skipInitialHit.current) {
      skipInitialHit.current = false;
      return;
    }

    const url = location.pathname + location.search + location.hash;
    window.ym(id, 'hit', url, {
      title: document.title,
      referer: window.location.href,
    });
  }, [location]);

  return null;
}
