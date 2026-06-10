import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div
        className="blob"
        style={{
          background: "var(--brand)",
          width: 800,
          height: 800,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.18,
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <div className="text-6xl mb-6">⚡</div>
        <h2 className="font-display font-black text-4xl sm:text-6xl mb-6 leading-tight">
          خل مكتبك يدخل
          <br />
          <span className="text-gradient-brand">القرن الواحد والعشرين.</span>
        </h2>
        <p className="text-[var(--text-muted)] text-lg mb-10">
          14 يوم تجربة مجانية. بدون بطاقة. بدون مبيعات تطاردك.
          <br />
          إذا ما عجبك، ارجع لـ Excel. ما حد بيلومك.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className="btn btn-brand text-base px-7 py-3.5">
            ابدأ تجربة مجانية
            <span className="arrow-flip">→</span>
          </Link>
          <Link href="#pricing" className="btn btn-ghost text-base px-7 py-3.5">
            شوف الأسعار
          </Link>
        </div>
      </div>
    </section>
  );
}
