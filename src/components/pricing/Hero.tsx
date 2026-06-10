import Link from "next/link";

export function PricingHero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-12 bg-noise">
      <div
        className="blob"
        style={{
          background: "var(--brand)",
          width: 500,
          height: 500,
          top: -150,
          right: -100,
          opacity: 0.12,
        }}
      />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <span className="pill pill-brand mb-6">
          <span className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
          // أسعار بدون لفّ ودوران
        </span>

        <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight mb-5">
          ادفع على اللي تحتاجه.
          <br />
          <span className="text-gradient-brand">ولا هلّلة زيادة.</span>
        </h1>

        <p className="text-lg sm:text-xl text-[var(--text-muted)] max-w-3xl mx-auto mb-8 leading-relaxed">
          ابدأ بـ 49 ر.س في الشهر. كبّر مكتبك لمّا تكبر شغلتك.
          خلصنا من باقات الـ«كل شيء أو لا شيء».
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link href="/signup" className="btn btn-brand text-base px-7 py-3.5">
            ابدأ تجربة 14 يوم مجاناً
            <span className="arrow-flip">→</span>
          </Link>
          <Link href="#calculator" className="btn btn-ghost text-base px-7 py-3.5">
            احسب فاتورتك
          </Link>
        </div>

        <div className="text-xs text-[var(--text-faint)] flex flex-wrap justify-center gap-x-4 gap-y-1">
          <span>بدون بطاقة ائتمان</span>
          <span className="text-[var(--border-strong)]">•</span>
          <span>إلغاء بأي لحظة</span>
          <span className="text-[var(--border-strong)]">•</span>
          <span>تفعيل خلال 60 ثانية</span>
        </div>
      </div>
    </section>
  );
}
