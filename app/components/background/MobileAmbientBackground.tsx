/** CSS-only ambient layers for mobile — no canvas, compositor-friendly. */

const HEX_MESH_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 2 L52 15 L52 41 L28 54 L4 41 L4 15 Z' fill='none' stroke='%23b8955c' stroke-width='0.6'/%3E%3Cpath d='M28 46 L52 59 L52 85 L28 98 L4 85 L4 59 Z' fill='none' stroke='%23b8955c' stroke-width='0.6'/%3E%3C/svg%3E")`;

export function MobileAmbientBackground() {
  return (
    <div className="mobile-ambient absolute inset-0 pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: HEX_MESH_SVG,
          backgroundSize: '56px 100px',
        }}
      />

      <div
        className="absolute inset-0 opacity-95"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 50% -5%, rgba(184, 149, 92, 0.10) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 100% 60%, rgba(184, 149, 92, 0.08) 0%, transparent 45%), radial-gradient(ellipse 60% 45% at 0% 85%, rgba(212, 188, 132, 0.07) 0%, transparent 50%)',
        }}
      />

      <div
        className="mobile-aurora mobile-aurora-a absolute -top-[20%] left-[10%] h-[55vh] w-[70vw] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(184, 149, 92, 0.14) 0%, transparent 70%)',
        }}
      />
      <div
        className="mobile-aurora mobile-aurora-b absolute -bottom-[15%] right-[5%] h-[45vh] w-[65vw] rounded-full opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(212, 188, 132, 0.10) 0%, transparent 68%)',
        }}
      />
    </div>
  );
}
