import React, { useEffect } from 'react';
import { siteConfig, absoluteSiteUrl } from '../site.config';

export function SeoJsonLd() {
  useEffect(() => {
    const url = absoluteSiteUrl('/');
    const data = {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: siteConfig.brandName,
      description:
        'Подбор новостроек и ипотечное сопровождение в Москве и Московской области: семейная ипотека, рассрочка, 100% оплата, расчёты и сопровождение сделки.',
      areaServed: {
        '@type': 'City',
        name: 'Москва',
      },
      url: url || undefined,
      telephone: siteConfig.phoneTel,
      email: siteConfig.email,
      priceRange: '$$',
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-ld', 'igor-broker');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      document.head.querySelectorAll('script[data-seo-ld="igor-broker"]').forEach((el) => el.remove());
    };
  }, []);

  return null;
}
