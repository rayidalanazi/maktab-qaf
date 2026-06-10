import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div
        className="blob"
        style={{
          background: "var(--brand)",
          width: 700,
          height: 700,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.18,
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <div className="text-6xl mb-6">🚀</div>
        <h2 className="font-display font-black text-4xl sm:text-6xl mb-6 leading-tight">
          خلصنا الكلام.
          <br />
          <span className="text-gradient-brand">جرّب بنفسك.</span>
        </h2>
        <p className="text-[var(--text-muted)] text-lg mb-10 leading-relaxed">
          14 يوم مجاناً. بدون بطاقة. بدون مكالمة مبيعات تطاردك.
          <br />
          لو ما عجبك، سكّر التبويب وانسانا.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link href="/signup" className="btn btn-brand text-base px-8 py-4">
            ابدأ تجربتك المجانية الآن
            <span className="arrow-flip">→</span>
          </Link>
          <Link href="#calculator" className="btn btn-ghost text-base px-8 py-4">
            ارجع للحاسبة
          </Link>
        </div>
        <p className="text-xs text-[var(--text-faint)] font-mono">
          // 200+ مكتب على قائمة الانتظار. كن من الأوائل.
        </p>
      </div>
    </section>
  );
}
