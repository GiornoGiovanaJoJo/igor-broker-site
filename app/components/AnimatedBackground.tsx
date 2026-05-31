import React from 'react';
import { useMotionProfile } from '../hooks/useMotionProfile';
import { BrickCrackBackground } from './background/BrickCrackBackground';
import { MobileAmbientBackground } from './background/MobileAmbientBackground';

const noiseSvg =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function AnimatedBackground() {
  const { showHexCracks, allowCrackHover, isMobile, reduceMotion } = useMotionProfile();

  const vignetteStrength = allowCrackHover ? 0.58 : isMobile ? 0.62 : 0.68;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#060607]" />

      <div
        className={`absolute inset-0 ${showHexCracks ? 'opacity-45' : 'opacity-90'}`}
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(184, 149, 92, 0.07) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 100% 50%, rgba(184, 149, 92, 0.04) 0%, transparent 45%), radial-gradient(ellipse 60% 45% at 0% 80%, rgba(120, 115, 105, 0.06) 0%, transparent 50%)',
        }}
      />

      {isMobile && !reduceMotion && <MobileAmbientBackground />}

      {!reduceMotion && (
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay max-md:opacity-[0.02] max-md:mix-blend-normal"
          style={{ backgroundImage: noiseSvg }}
          aria-hidden
        />
      )}

      <div
        className="absolute inset-0"
        style={{ boxShadow: `inset 0 0 140px rgba(0,0,0,${vignetteStrength})` }}
      />

      {showHexCracks && (
        <>
          <BrickCrackBackground
            interactive={allowCrackHover}
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-black/40 pointer-events-none" aria-hidden />
        </>
      )}
    </div>
  );
}
