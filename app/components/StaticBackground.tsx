/** Static gradient background — no blur animations (insights, legal pages). */
export function StaticBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#060607]" />
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(184, 149, 92, 0.06) 0%, transparent 55%), radial-gradient(ellipse 60% 45% at 100% 80%, rgba(184, 149, 92, 0.03) 0%, transparent 50%)',
        }}
      />
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.65)' }} />
    </div>
  );
}
