import React from 'react';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="opacity-0 pointer-events-none focus:opacity-100 focus:pointer-events-auto fixed left-4 top-4 z-[200] px-4 py-2 rounded-sm bg-accent text-accent-foreground text-sm font-semibold shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      Перейти к содержимому
    </a>
  );
}
