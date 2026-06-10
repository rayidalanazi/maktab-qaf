const FEATURES = [
  {
    icon: "⚖",
    title: "إدارة القضايا",
    desc: "كل قضية فيها كل اللي تحتاجه: مستندات، مواعيد، سجل تحديثات، خصم، حكم، وثائق.",
    snark: "ما عاد فيه «وين الملف؟»",
  },
  {
    icon: "📝",
    title: "المذكرات الذكية",
    desc: "قوالب جاهزة (دفاع، توكيل، إنذار)، workflow اعتماد متعدد المراحل، توقيع إلكتروني.",
    snark: "وداعاً Ctrl+C / Ctrl+V",
  },
  {
    icon: "📅",
    title: "الجدولة والتذكير",
    desc: "تقويم متكامل لكل المحامين، تنبيهات قبل المواعيد، حضور وانصراف الموظفين.",
    snark: "ما حد بينسى جلسة بعد اليوم",
  },
  {
    icon: "💰",
    title: "الفوترة الذكية",
    desc: "ربط مباشر مع ميسر، فواتير تلقائية حسب مراحل القضية، تذكير عملاء بالدفع.",
    snark: "الفلوس تصل قبل ما تطلبها",
  },
  {
    icon: "👥",
    title: "العملاء والـ Leads",
    desc: "Kanban للعملاء المحتملين، عقود، تراخيص، ساعات استشارية مفوترة تلقائياً.",
    snark: "السكرتيرة بتشكرك",
  },
  {
    icon: "📊",
    title: "تقارير + AI",
    desc: "KPIs، تقييم مخاطر القضايا، رادار أنظمي للتحديثات القانونية، لوحة تنفيذية.",
    snark: "البيانات تتكلم. فعلاً.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 border-b border-[var(--border)] relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="pill mb-4">المميزات</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl mb-4 leading-tight">
            كل اللي يحتاجه مكتب محاماة جدّي
            <br />
            <span className="text-gradient-brand">في مكان واحد.</span>
          </h2>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
            مصمّم خصيصاً للنظام القانوني السعودي. عربي 100%. RTL أصلي. ليس ترجمة لمنتج أجنبي.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className="card group relative">
              <div className="absolute top-4 left-4 text-[10px] font-mono text-[var(--text-faint)] opacity-0 group-hover:opacity-100 transition-opacity">
                0{i + 1}
              </div>
              <div className="text-4xl mb-4 transition-transform group-hover:scale-110 inline-block">
                {f.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                {f.desc}
              </p>
              <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--brand)] font-mono">
                <span className="opacity-60">// </span>{f.snark}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
