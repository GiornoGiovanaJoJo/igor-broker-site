import React, { useEffect, useMemo, useRef, useState } from 'react';

function parseValue(raw: string) {
  const match = raw.match(/^([^\d]*)([\d]+(?:[.,]\d+)?)(.*)$/);
  if (!match) return null;
  const [, prefix, numStr, suffix] = match;
  if (/\d/.test(suffix)) return null;
  const normalized = numStr.replace(',', '.');
  const number = parseFloat(normalized);
  if (!Number.isFinite(number) || number === 0) return null;
  const decimals = normalized.includes('.') ? normalized.split('.')[1].length : 0;
  return { prefix, number, suffix, decimals };
}

export function CountUp({
  value,
  duration = 1.4,
  className,
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = useMemo(() => parseValue(value), [value]);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    setDisplay(value);
    const node = ref.current;
    if (!node || !parsed) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frameId = 0;
    const { prefix, number, suffix, decimals } = parsed;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / (duration * 1000));
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(`${prefix}${(number * eased).toFixed(decimals)}${suffix}`);
            if (progress < 1) {
              frameId = requestAnimationFrame(tick);
            } else {
              setDisplay(value);
            }
          };
          frameId = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [value, duration, parsed]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
