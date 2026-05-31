import React from 'react';

type OptimizedImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  webpSrc: string;
  fallbackSrc: string;
};

/** PNG/JPEG fallback + WebP source for smaller transfers on mobile. */
export function OptimizedImage({ webpSrc, fallbackSrc, alt = '', ...imgProps }: OptimizedImageProps) {
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img src={fallbackSrc} alt={alt} {...imgProps} />
    </picture>
  );
}
