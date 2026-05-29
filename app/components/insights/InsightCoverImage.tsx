import React from 'react';

type InsightCoverImageProps = {
  src: string;
  alt: string;
  variant?: 'card' | 'hero';
  className?: string;
};

/** Shows the full uploaded image (no crop), letterboxed if aspect ratio differs. */
export function InsightCoverImage({ src, alt, variant = 'hero', className = '' }: InsightCoverImageProps) {
  if (variant === 'card') {
    return (
      <div
        className={`relative flex aspect-[16/10] shrink-0 items-center justify-center overflow-hidden bg-[#0a0a0c] ${className}`}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-sm border border-border bg-[#0a0a0c] ${className}`}>
      <img
        src={src}
        alt={alt}
        className="mx-auto block h-auto max-h-[min(72vh,820px)] w-full object-contain"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
