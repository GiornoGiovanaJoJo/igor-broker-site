import { useEffect, useState } from 'react';

export type MotionProfile = {
  /** prefers-reduced-motion or coarse pointer / narrow viewport */
  reduceMotion: boolean;
  isMobile: boolean;
  /** Infinite blur orbs, particles, shimmer — off on mobile */
  allowHeavyEffects: boolean;
};

const MOBILE_QUERY = '(max-width: 768px)';
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';
const COARSE_QUERY = '(pointer: coarse)';

export function useMotionProfile(): MotionProfile {
  const [profile, setProfile] = useState<MotionProfile>(() => ({
    reduceMotion: false,
    isMobile: false,
    allowHeavyEffects: true,
  }));

  useEffect(() => {
    const mobileMq = window.matchMedia(MOBILE_QUERY);
    const reduceMq = window.matchMedia(REDUCE_QUERY);
    const coarseMq = window.matchMedia(COARSE_QUERY);

    const update = () => {
      const isMobile = mobileMq.matches || coarseMq.matches;
      const reduceMotion = reduceMq.matches || isMobile;
      setProfile({
        isMobile,
        reduceMotion,
        allowHeavyEffects: !reduceMotion && !isMobile,
      });
    };

    update();
    mobileMq.addEventListener('change', update);
    reduceMq.addEventListener('change', update);
    coarseMq.addEventListener('change', update);
    return () => {
      mobileMq.removeEventListener('change', update);
      reduceMq.removeEventListener('change', update);
      coarseMq.removeEventListener('change', update);
    };
  }, []);

  return profile;
}
