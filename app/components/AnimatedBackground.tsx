import React from 'react';
import { motion } from 'motion/react';
import { useMotionProfile } from '../hooks/useMotionProfile';

const noiseSvg =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function AnimatedBackground() {
  const { allowHeavyEffects, reduceMotion } = useMotionProfile();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#060607]" />

      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(184, 149, 92, 0.07) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 100% 50%, rgba(184, 149, 92, 0.04) 0%, transparent 45%), radial-gradient(ellipse 60% 45% at 0% 80%, rgba(120, 115, 105, 0.06) 0%, transparent 50%)',
        }}
      />

      {!reduceMotion && (
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay max-md:opacity-[0.02] max-md:mix-blend-normal"
          style={{ backgroundImage: noiseSvg }}
          aria-hidden
        />
      )}

      <div
        className="absolute inset-0"
        style={{ boxShadow: 'inset 0 0 140px rgba(0,0,0,0.72)' }}
      />

      {allowHeavyEffects && (
        <>
          <div
            className="absolute top-[12%] right-[8%] w-[min(38vw,420px)] h-[min(48vw,520px)] border border-accent/12 rounded-sm premium-drift opacity-50"
            aria-hidden
          />
          <div
            className="absolute top-[18%] right-[11%] w-[min(32vw,360px)] h-[min(40vw,440px)] border border-white/[0.06] rounded-sm premium-drift opacity-40"
            style={{ animationDelay: '-6s' }}
            aria-hidden
          />

          <motion.div
            className="absolute top-[-10%] left-[-5%] w-[520px] h-[520px] rounded-full blur-[100px] perf-hide-blur-orbs"
            style={{
              background: 'radial-gradient(circle, rgba(184, 149, 92, 0.06) 0%, transparent 68%)',
            }}
            animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-[35%] right-[-8%] w-[480px] h-[480px] rounded-full blur-[90px] perf-hide-blur-orbs"
            style={{
              background: 'radial-gradient(circle, rgba(45, 44, 42, 0.45) 0%, transparent 70%)',
            }}
            animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[-5%] left-[25%] w-[600px] h-[600px] rounded-full blur-[110px] perf-hide-blur-orbs"
            style={{
              background: 'radial-gradient(circle, rgba(184, 149, 92, 0.045) 0%, transparent 72%)',
            }}
            animate={{ x: [0, -60, 0], y: [0, -35, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 36, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {allowHeavyEffects &&
        [0, 1, 2, 3].map((id) => (
          <motion.div
            key={id}
            className="absolute w-px h-px rounded-full bg-accent/25 perf-hide-blur-orbs"
            style={{ left: `${12 + id * 22}%`, top: `${18 + id * 16}%` }}
            animate={{ y: [0, -18, 0], opacity: [0.15, 0.45, 0.15] }}
            transition={{
              duration: 5 + id * 1.5,
              repeat: Infinity,
              delay: id * 0.8,
              ease: 'easeInOut',
            }}
          />
        ))}
    </div>
  );
}
