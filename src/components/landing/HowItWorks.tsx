const STEPS = [
  {
    n: "01",
    title: "سجّل المكتب",
    desc: "اسم المكتب وبس. خلال 30 ثانية يكون عندك subdomain خاص مثل raed.qaf.sa.",
    note: "ما يحتاج بطاقة. ما يحتاج اتصال بمبيعات.",
  },
  {
    n: "02",
    title: "خصّص + ادعُ فريقك",
    desc: "ارفع شعار المكتب، اختر ألوانك، وارسل دعوات للموظفين. كل واحد يدخل بصلاحياته.",
    note: "11 دور جاهز: محامي، شريك، محاسب، سكرتيرة...",
  },
  {
    n: "03",
    title: "ابدأ الشغل",
    desc: "حوّل قضاياك من Excel، أو ابدأ من الصفر. النظام يستوعب الاثنين.",
    note: "نسوي لك migration من Excel مجاناً في الباقات المدفوعة.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 border-b border-[var(--border)] relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="pill mb-4">3 خطوات. هذا كل شيء.</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl mb-4 leading-tight">
            من الصفر إلى شغّال
            <br />
            <span className="text-gradient-brand">خلال دقائق.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 right-[15%] left-[15%] h-px bg-gradient-to-l from-transparent via-[var(--brand)]/30 to-transparent" />

          {STEPS.map((s, i) => (
            <div key={i} className="relative">
              <div className="font-mono text-6xl font-black text-[var(--brand)] mb-4 leading-none num">
                {s.n}
              </div>
              <h3 className="font-bold text-xl mb-2">{s.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed mb-3">
                {s.desc}
              </p>
              <p className="text-xs text-[var(--text-faint)] font-mono">
                <span className="opacity-60">// </span>{s.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
