/**
 * ROI section — toned down per real-buyer critique.
 * Original claimed 27x ROI (inflated → trust killer).
 * Reframed to honest 2-4x ROI with explicit assumptions.
 */
const SCENARIOS = [
  {
    title_ar: "المحامي المستقل",
    persona_ar: "8-10 قضايا نشطة، يشتغل وحده + سكرتارية جزئية.",
    cost: 49,
    saves: 180,
    payback: 9,
    return_x: "3.7×",
    narrative_ar: "يوفّر ~4 ساعات أسبوعياً من البحث والترتيب اليدوي. تحصيل أسرع. الـ 49 ر.س ترجع خلال 9 أيام عمل.",
    assumptions_ar: ["ساعة سكرتارية = 45 ر.س", "4 ساعات/أسبوع توفير", "تخفيض الـ DSO من 60 إلى 45 يوم"],
  },
  {
    title_ar: "المكتب الصغير",
    persona_ar: "3 محامين، 25-30 قضية شهرياً، يخدمون شركات صغيرة.",
    cost: 199,
    saves: 720,
    payback: 8,
    return_x: "3.6×",
    narrative_ar: "تنظيم القضايا والفواتير والمواعيد + ساعات استشارية محسوبة. الفواتير تخرج تلقائياً، التحصيل أسرع.",
    assumptions_ar: ["6 ساعات/أسبوع توفير عبر الفريق", "إيراد إضافي من ساعات مفوترة كانت تتسرّب", "تكلفة ZATCA يدوية تنحذف"],
  },
  {
    title_ar: "المكتب المتوسط",
    persona_ar: "10 موظفين (6 محامين + 1 محاسب + سكرتارية)، 70+ قضية نشطة.",
    cost: 499,
    saves: 2100,
    payback: 7,
    return_x: "4.2×",
    narrative_ar: "بدل 3 اشتراكات منفصلة (إدارة قضايا + فوترة + تخزين)، نظام واحد بنصف التكلفة. تقارير KPI للشركاء تختصر اجتماعات.",
    assumptions_ar: ["استبدال أدوات حالية بـ ~1200 ر.س/شهر", "ساعات مفوترة مستردّة", "تحسّن التحصيل 15 يوم"],
  },
  {
    title_ar: "المكتب الكبير",
    persona_ar: "3 شركاء + 18 موظف، فرعين، قضايا تحكيم دولي.",
    cost: 1999,
    saves: 7500,
    payback: 8,
    return_x: "3.8×",
    narrative_ar: "حوكمة للشركاء + رادار تنظيمي + لوحة تنفيذية. وفّر دور مدير عمليات بدوام كامل.",
    assumptions_ar: ["استبدال 4-5 أدوات منفصلة", "وفر ساعات شركاء بـ 600 ر.س/ساعة", "تكلفة المخاطر التنظيمية المتجنّبة"],
  },
];

export function ROI() {
  return (
    <section className="py-20 border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="pill mb-4">الرياضيات</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl mb-4 leading-tight">
            قاف ترجع كلفتها
            <br />
            <span className="text-gradient-brand">خلال أسبوع.</span>
          </h2>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
            الأرقام بناءً على افتراضات متحفظة موثّقة. الرياضيات شفّافة — احسبها على مكتبك.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {SCENARIOS.map((s, i) => (
            <div key={i} className="card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg mb-1">{s.title_ar}</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {s.persona_ar}
                  </p>
                </div>
                <div className="text-left shrink-0">
                  <div className="text-[10px] font-mono text-[var(--text-faint)] uppercase">
                    عائد
                  </div>
                  <div className="font-display font-black text-2xl text-[var(--brand)] num">
                    {s.return_x}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-[var(--bg-hover)] rounded-lg p-2 border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-faint)]">التكلفة</div>
                  <div className="font-bold text-sm num">{s.cost} ر.س</div>
                </div>
                <div className="bg-[var(--bg-hover)] rounded-lg p-2 border border-[var(--brand)]/30">
                  <div className="text-[10px] text-[var(--brand)]">التوفير</div>
                  <div className="font-bold text-sm text-[var(--brand)] num">
                    {s.saves} ر.س
                  </div>
                </div>
                <div className="bg-[var(--bg-hover)] rounded-lg p-2 border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-faint)]">الاسترداد</div>
                  <div className="font-bold text-sm num">{s.payback} يوم</div>
                </div>
              </div>

              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">
                {s.narrative_ar}
              </p>

              <details className="text-xs">
                <summary className="cursor-pointer text-[var(--text-faint)] font-mono">
                  // كيف حسبناها؟
                </summary>
                <ul className="mt-2 space-y-1 ps-3">
                  {s.assumptions_ar.map((a, j) => (
                    <li key={j} className="text-[var(--text-muted)] flex items-start gap-1.5">
                      <span className="text-[var(--brand)]">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-[var(--text-faint)] font-mono">
          // أرقام متحفظة. مكتبك الفعلي قد يحقق أعلى. ما نبيع أوهام.
        </div>
      </div>
    </section>
  );
}
