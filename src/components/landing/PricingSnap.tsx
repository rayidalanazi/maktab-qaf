import Link from "next/link";

const TIERS = [
  {
    name: "الأساس",
    tagline: "للمحامي المستقل",
    price: 49,
    period: "/شهر",
    cta: "ابدأ مجاناً",
    highlight: false,
    features: [
      "مستخدم واحد + سكرتيرة مجاناً",
      "10 قضايا نشطة",
      "إدارة العملاء والمواعيد",
      "1 GB مستندات",
      "إشعارات أساسية",
    ],
  },
  {
    name: "مكتب صغير",
    tagline: "للمكاتب الناشئة",
    price: 199,
    period: "/شهر",
    cta: "ابدأ مجاناً",
    highlight: false,
    features: [
      "3 مستخدمين",
      "قضايا غير محدودة",
      "المذكرات والقوالب",
      "الفوترة الذكية",
      "10 GB مستندات",
    ],
  },
  {
    name: "مكتب متوسط",
    tagline: "الأكثر طلباً",
    price: 499,
    period: "/شهر",
    cta: "ابدأ مجاناً",
    highlight: true,
    badge: "🔥 الأكثر طلباً",
    features: [
      "10 مستخدمين",
      "كل ميزات الأساس + الصغير",
      "التقارير وKPI",
      "إدارة العمولات",
      "تقييم المخاطر",
      "50 GB مستندات",
      "دعم أولوية",
    ],
  },
  {
    name: "Enterprise",
    tagline: "للمكاتب الكبيرة",
    price: 1999,
    period: "/شهر",
    cta: "تواصل معنا",
    highlight: false,
    features: [
      "مستخدمين بلا حدود",
      "كل الميزات",
      "Custom domain خاص",
      "API access",
      "دعم مخصص 24/7",
      "تخزين بلا حدود",
      "AI مساعد قانوني",
    ],
  },
];

export function PricingSnap() {
  return (
    <section id="pricing" className="py-24 border-b border-[var(--border)] relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="pill mb-4">الأسعار</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl mb-4 leading-tight">
            ادفع فقط على
            <br />
            <span className="text-gradient-brand">ما تحتاجه فعلاً.</span>
          </h2>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
            ابدأ بالأساس وأضف الميزات لما تحتاجها. ما تدفع 999 ر.س لو ما تحتاج إلا 49.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((t, i) => (
            <div
              key={i}
              className={`card relative flex flex-col ${
                t.highlight
                  ? "border-[var(--brand)] bg-gradient-to-b from-[var(--brand)]/5 to-transparent scale-105 z-10 shadow-2xl"
                  : ""
              }`}
            >
              {t.badge && (
                <div className="absolute -top-3 right-4 text-[10px] font-bold bg-[var(--brand)] text-black px-3 py-1 rounded-full">
                  {t.badge}
                </div>
              )}

              <div className="mb-5">
                <div className="text-xs font-mono text-[var(--text-faint)] uppercase tracking-widest mb-1">
                  {t.tagline}
                </div>
                <div className="font-display font-bold text-xl mb-3">{t.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="num font-black text-4xl">{t.price}</span>
                  <span className="text-[var(--text-muted)] text-sm">ر.س</span>
                  <span className="text-[var(--text-faint)] text-xs">
                    {t.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {t.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <span className="text-[var(--brand)] mt-0.5 shrink-0">✓</span>
                    <span className="text-[var(--text-muted)]">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`btn w-full ${
                  t.highlight ? "btn-brand" : "btn-ghost"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-[var(--text-faint)]">
            كلها تشمل تجربة 14 يوم مجاناً • بدون بطاقة • إلغاء أي وقت
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 mt-3 text-sm text-[var(--brand)] hover:underline"
          >
            شوف كل الإضافات والأسعار التفصيلية
            <span className="arrow-flip">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
