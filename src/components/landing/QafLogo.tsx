/**
 * Qaf logo mark.
 * The Arabic letter ق, rendered with confidence and a dot that doubles as a glow.
 */
export function QafLogo({ size = 32 }: { size?: number }) {
  return (
    <span
      className="font-display font-black inline-flex items-center justify-center relative"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.85,
        lineHeight: 1,
        color: "var(--brand)",
        textShadow: "0 0 24px var(--brand-glow)",
      }}
      aria-label="Qaf logo"
    >
      ق
    </span>
  );
}

export function QafWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <QafLogo size={28} />
      <span className="font-display font-black text-xl tracking-tight">قاف</span>
    </div>
  );
}
