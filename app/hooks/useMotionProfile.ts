import { useEffect, useState } from 'react';

export type MotionProfile = {
  /** Only prefers-reduced-motion (a11y) */
  reduceMotion: boolean;
  isMobile: boolean;
  /** Static hex-crack SVG grid — desktop + mobile */
  showHexCracks: boolean;
  /** Hover highlight on crack paths — desktop fine pointer only */
  allowCrackHover: boolean;
  /** @deprecated use allowCrackHover */
  allowHexCrack: boolean;
  /** Legacy blur-orbs slot; true when hex crack is active on desktop */
  allowHeavyEffects: boolean;
  /** whileInView / stagger — enabled unless user prefers reduced motion */
  allowContentMotion: boolean;
};

const MOBILE_QUERY = '(max-width: 768px)';
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';
const COARSE_QUERY = '(pointer: coarse)';
const HEX_CRACK_QUERY = '(min-width: 1024px) and (pointer: fine)';

function readProfile(): MotionProfile {
  if (typeof window === 'undefined') {
    return {
      reduceMotion: false,
      isMobile: false,
      showHexCracks: false,
      allowCrackHover: false,
      allowHexCrack: false,
      allowHeavyEffects: false,
      allowContentMotion: true,
    };
  }

  const isMobile = window.matchMedia(MOBILE_QUERY).matches || window.matchMedia(COARSE_QUERY).matches;
  const reduceMotion = window.matchMedia(REDUCE_QUERY).matches;
  const allowCrackHover = window.matchMedia(HEX_CRACK_QUERY).matches && !reduceMotion;
  const showHexCracks = !reduceMotion;

  return {
    isMobile,
    reduceMotion,
    showHexCracks,
    allowCrackHover,
    allowHexCrack: allowCrackHover,
    allowHeavyEffects: allowCrackHover,
    allowContentMotion: !reduceMotion,
  };
}

export function useMotionProfile(): MotionProfile {
  const [profile, setProfile] = useState<MotionProfile>(readProfile);

  useEffect(() => {
    const mobileMq = window.matchMedia(MOBILE_QUERY);
    const reduceMq = window.matchMedia(REDUCE_QUERY);
    const coarseMq = window.matchMedia(COARSE_QUERY);
    const hexMq = window.matchMedia(HEX_CRACK_QUERY);

    const update = () => setProfile(readProfile());

    update();
    mobileMq.addEventListener('change', update);
    reduceMq.addEventListener('change', update);
    coarseMq.addEventListener('change', update);
    hexMq.addEventListener('change', update);
    return () => {
      mobileMq.removeEventListener('change', update);
      reduceMq.removeEventListener('change', update);
      coarseMq.removeEventListener('change', update);
      hexMq.removeEventListener('change', update);
    };
  }, []);

  return profile;
}
