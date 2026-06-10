interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  hint?: string;
  trend?: { v: string; up: boolean };
  accent?: "brand" | "accent" | "success" | "warn" | "info";
}

const ACCENT_COLORS: Record<string, string> = {
  brand: "var(--brand)",
  accent: "var(--accent)",
  success: "var(--success)",
  warn: "var(--warn)",
  info: "var(--info)",
};

export function StatCard({ label, value, icon, hint, trend, accent = "brand" }: StatCardProps) {
  const color = ACCENT_COLORS[accent];
  return (
    <div className="card relative overflow-hidden">
      <div
        className="absolute -top-8 -left-8 w-24 h-24 rounded-full opacity-20 blur-2xl"
        style={{ background: color }}
      />
      <div className="relative flex items-start justify-between gap-2 mb-2">
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
          {label}
        </div>
        {icon && <div className="text-xl opacity-70">{icon}</div>}
      </div>
      <div className="relative flex items-baseline gap-2 mb-1">
        <span className="font-display font-black text-3xl num" style={{ color }}>
          {value}
        </span>
        {trend && (
          <span
            className="text-[11px] font-mono"
            style={{ color: trend.up ? "var(--success)" : "var(--danger)" }}
          >
            {trend.up ? "↑" : "↓"} {trend.v}
          </span>
        )}
      </div>
      {hint && (
        <div className="relative text-[11px] text-[var(--text-faint)]">{hint}</div>
      )}
    </div>
  );
}
