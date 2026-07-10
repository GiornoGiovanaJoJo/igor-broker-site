import type { PointerEvent } from 'react';
import { useMotionValue, useSpring } from 'motion/react';
import { useMotionProfile } from './useMotionProfile';

export function useMagnetic(strength = 0.3) {
  const { isMobile, reduceMotion } = useMotionProfile();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.4 });
  const enabled = !isMobile && !reduceMotion;

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!enabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { style: { x: springX, y: springY }, onPointerMove, onPointerLeave };
}
