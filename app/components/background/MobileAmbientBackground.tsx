/** CSS-only ambient layers for mobile — aurora only; cracks via HexCrackBackground */

export function MobileAmbientBackground() {
  return (
    <div className="mobile-ambient absolute inset-0 pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0 opacity-95"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 50% -5%, rgba(184, 149, 92, 0.10) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 100% 60%, rgba(184, 149, 92, 0.08) 0%, transparent 45%), radial-gradient(ellipse 60% 45% at 0% 85%, rgba(212, 188, 132, 0.07) 0%, transparent 50%)',
        }}
      />

      <div
        className="mobile-aurora mobile-aurora-a absolute -top-[20%] left-[10%] h-[55vh] w-[70vw] rounded-full opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(184, 149, 92, 0.24) 0%, transparent 70%)',
        }}
      />
      <div
        className="mobile-aurora mobile-aurora-b absolute -bottom-[15%] right-[5%] h-[45vh] w-[65vw] rounded-full opacity-55"
        style={{
          background: 'radial-gradient(circle, rgba(212, 188, 132, 0.18) 0%, transparent 68%)',
        }}
      />
    </div>
  );
}
