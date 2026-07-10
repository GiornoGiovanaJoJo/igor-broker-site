import { useEffect, useState } from 'react';

export type MotionProfile = {
  /** Only prefers-reduced-motion (a11y) */
  reduceMotion: boolean;
  isMobile: boolean;
  /** Desktop + fine pointer + no reduced motion — cursor-reactive / heavier effects */
  allowHeavyEffects: boolean;
  /** whileInView / stagger — enabled unless user prefers reduced motion */
  allowContentMotion: boolean;
};

const MOBILE_QUERY = '(max-width: 768px)';
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';
const COARSE_QUERY = '(pointer: coarse)';
const FINE_DESKTOP_QUERY = '(min-width: 1024px) and (pointer: fine)';

function readProfile(): MotionProfile {
  if (typeof window === 'undefined') {
    return {
      reduceMotion: false,
      isMobile: false,
      allowHeavyEffects: false,
      allowContentMotion: true,
    };
  }

  const isMobile = window.matchMedia(MOBILE_QUERY).matches || window.matchMedia(COARSE_QUERY).matches;
  const reduceMotion = window.matchMedia(REDUCE_QUERY).matches;
  const allowHeavyEffects = window.matchMedia(FINE_DESKTOP_QUERY).matches && !reduceMotion;

  return {
    isMobile,
    reduceMotion,
    allowHeavyEffects,
    allowContentMotion: !reduceMotion,
  };
}

export function useMotionProfile(): MotionProfile {
  const [profile, setProfile] = useState<MotionProfile>(readProfile);

  useEffect(() => {
    const mobileMq = window.matchMedia(MOBILE_QUERY);
    const reduceMq = window.matchMedia(REDUCE_QUERY);
    const coarseMq = window.matchMedia(COARSE_QUERY);
    const fineMq = window.matchMedia(FINE_DESKTOP_QUERY);

    const update = () => setProfile(readProfile());

    update();
    mobileMq.addEventListener('change', update);
    reduceMq.addEventListener('change', update);
    coarseMq.addEventListener('change', update);
    fineMq.addEventListener('change', update);
    return () => {
      mobileMq.removeEventListener('change', update);
      reduceMq.removeEventListener('change', update);
      coarseMq.removeEventListener('change', update);
      fineMq.removeEventListener('change', update);
    };
  }, []);

  return profile;
}
