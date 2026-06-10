/**
 * Trust strip — addresses skeptical-lawyer critique about security/SLA.
 * Honest about what's live vs planned.
 */
export function TrustStrip() {
  const items = [
    { ic: "🇸🇦", title: "بيانات السعودية", sub: "خوادم Frankfurt EU + خطة ترحيل لـ STC Cloud" },
    { ic: "🛡", title: "تشفير AES-256", sub: "على القرص والشبكة" },
    { ic: "📋", title: "ISO 27001", sub: "قيد التطبيق Q4 2026" },
    { ic: "⏱", title: "99.5% Uptime", sub: "SLA موثّق في العقد" },
    { ic: "💾", title: "تصدير CSV+PDF", sub: "بضغطة في أي وقت" },
    { ic: "🔐", title: "DPA + GDPR", sub: "موقّع لكل عميل" },
  ];

  return (
    <section className="py-14 border-y border-[var(--border)] bg-[var(--bg-elev)]/40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-mono text-[var(--text-faint)] uppercase tracking-widest">
            // الثقة قبل السعر
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {items.map((it, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-3 rounded-lg border border-[var(--border)]"
            >
              <span className="text-xl shrink-0">{it.ic}</span>
              <div className="min-w-0">
                <div className="font-bold text-xs">{it.title}</div>
                <div className="text-[10px] text-[var(--text-faint)] leading-tight">
                  {it.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
