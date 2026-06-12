import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-noise pt-20 pb-24">
      {/* Background glow blobs */}
      <div
        className="blob"
        style={{
          background: "var(--brand)",
          width: 600,
          height: 600,
          top: -200,
          right: -150,
          opacity: 0.15,
        }}
      />
      <div
        className="blob"
        style={{
          background: "var(--accent)",
          width: 500,
          height: 500,
          bottom: -200,
          left: -100,
          opacity: 0.12,
        }}
      />

      {/* Grid backdrop */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Eyebrow pill */}
        <div className="flex justify-center mb-8 animate-float-up">
          <span className="pill pill-brand">
            <span className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
            الإصدار الأول • مفتوح للتسجيل المبكر
          </span>
        </div>

        {/* Headline — Arabic, bold, sarcastic */}
        <h1 className="font-display font-black text-center text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-6 animate-float-up delay-100">
          مكتبك القانوني
          <br />
          <span className="text-gradient-brand">يستحق أكثر من Excel.</span>
        </h1>

        {/* Subhead */}
        <p className="text-center text-lg sm:text-xl text-[var(--text-muted)] max-w-3xl mx-auto mb-10 leading-relaxed animate-float-up delay-200">
          قاف منصّة سعودية لإدارة مكاتب المحاماة. قضايا، مذكرات، فوترة، عملاء —
          كلّها في مكان واحد. <span className="text-[var(--text)] font-semibold">ابدأ من 49 ر.س</span> وادفع فقط على الميزات اللي تستخدمها فعلاً.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-14 animate-float-up delay-300">
          <Link href="/signup" className="btn btn-brand text-base px-7 py-3.5">
            ابدأ تجربة 14 يوم مجاناً
            <span className="arrow-flip">→</span>
          </Link>
          <Link href="#features" className="btn btn-ghost text-base px-7 py-3.5">
            شوف وش يسوي
          </Link>
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--text-faint)] animate-float-up delay-400">
          <span className="flex items-center gap-1.5">
            <span className="text-[var(--brand)]">✓</span> بدون بطاقة ائتمان
          </span>
          <span className="text-[var(--border-strong)]">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-[var(--brand)]">✓</span> إلغاء بضغطة زر
          </span>
          <span className="text-[var(--border-strong)]">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-[var(--brand)]">✓</span> مدفوعات عبر ميسر
          </span>
          <span className="text-[var(--border-strong)]">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-[var(--brand)]">✓</span> 100% عربي + RTL
          </span>
        </div>

        {/* Dashboard preview mock */}
        <div className="relative mt-20 animate-float-up delay-500">
          <div className="absolute inset-x-0 -top-10 h-40 bg-gradient-to-b from-[var(--brand)]/10 to-transparent blur-3xl pointer-events-none" />
          <DashboardMock />
          <div className="sm:hidden text-center text-[10px] text-[var(--text-faint)] font-mono mt-3">
            👈 اسحب يمين / يسار لاستعراض اللوحة كاملة
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMock() {
  return (
    <div className="relative rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elev)] overflow-hidden shadow-2xl">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 h-10 border-b border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <span className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-xs text-[var(--text-faint)] font-mono">
            raed.qaf.sa/dashboard
          </span>
        </div>
      </div>

      {/* Body — scrolls horizontally on mobile so the wide desktop layout isn't cropped */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[200px_1fr] min-w-[600px] min-h-[420px]">
        {/* Sidebar */}
        <aside className="border-l border-[var(--border)] p-3 bg-[var(--bg)]/30">
          <div className="flex items-center gap-2 mb-5 px-2">
            <span className="w-7 h-7 rounded-lg bg-[var(--brand)] text-black grid place-items-center font-black text-sm">
              ر
            </span>
            <div>
              <div className="text-xs font-bold">شركة رائد</div>
              <div className="text-[10px] text-[var(--text-faint)]">Raed Law</div>
            </div>
          </div>
          {[
            { ic: "🏠", l: "الرئيسية", active: true },
            { ic: "⚖", l: "القضايا", badge: "12" },
            { ic: "📝", l: "المذكرات" },
            { ic: "📅", l: "الجدولة" },
            { ic: "📁", l: "المستندات" },
            { ic: "💰", l: "الفوترة" },
            { ic: "📊", l: "التقارير" },
          ].map((it, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs mb-0.5 ${
                it.active
                  ? "bg-[var(--brand)]/15 text-[var(--brand)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              <span>{it.ic}</span>
              <span className="flex-1">{it.l}</span>
              {it.badge && (
                <span className="text-[10px] bg-[var(--accent)] text-white px-1.5 rounded-full">
                  {it.badge}
                </span>
              )}
            </div>
          ))}
        </aside>

        {/* Main */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-sm mb-0.5">مرحباً، عبدالله</h3>
              <p className="text-[11px] text-[var(--text-faint)]">
                عندك 3 قضايا تحتاج انتباهك اليوم
              </p>
            </div>
            <button className="text-[10px] btn btn-brand py-1.5 px-3">
              + قضية جديدة
            </button>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { v: "47", l: "قضايا نشطة", c: "var(--brand)" },
              { v: "12", l: "موعد قريب", c: "var(--accent)" },
              { v: "₪89K", l: "إيراد الشهر", c: "var(--success)" },
              { v: "8", l: "فاتورة معلّقة", c: "var(--warn)" },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-2.5"
              >
                <div
                  className="text-base font-black num"
                  style={{ color: s.c }}
                >
                  {s.v}
                </div>
                <div className="text-[10px] text-[var(--text-faint)]">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Mini chart */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 mb-3">
            <div className="text-[11px] text-[var(--text-muted)] mb-2">
              الإيرادات — آخر 6 أشهر
            </div>
            <div className="flex items-end gap-1 h-16">
              {[40, 65, 50, 80, 70, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-[var(--brand-deep)] to-[var(--brand)]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Recent row */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3">
            <div className="text-[11px] text-[var(--text-muted)] mb-2">
              آخر التحديثات
            </div>
            {[
              { ic: "⚠", t: "موعد جلسة قريب — قضية 2026/0142", c: "var(--warn)" },
              { ic: "✓", t: "تم اعتماد مذكرة الدفاع", c: "var(--success)" },
              { ic: "💸", t: "تم تحصيل فاتورة 30,000 ر.س", c: "var(--brand)" },
            ].map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2 py-1.5 text-[11px] border-t border-[var(--border)] first:border-t-0"
              >
                <span style={{ color: r.c }}>{r.ic}</span>
                <span className="text-[var(--text-muted)]">{r.t}</span>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
