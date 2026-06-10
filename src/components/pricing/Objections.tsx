/**
 * Objection responses — softened per brand-voice critique.
 * Removed buyer-insulting lines ("لو هذا غالي، يمكن المشكلة مو في السعر"),
 * removed condescending "ممتاز" openers.
 */
const OBJECTIONS = [
  {
    q_ar: "هذا غالي على مكتب صغير",
    a_ar: "49 ر.س في الشهر = أقل من فنجالين قهوة مختصّة. وتقدر تلغي بأي لحظة. مافي مخاطرة.",
  },
  {
    q_ar: "ما عندي وقت أتعلّم نظام جديد",
    a_ar: "// التجربة 14 يوم. أول 10 دقايق تعرف كل شيء الأساسي. الباقي تكتشفه وأنت تشتغل.",
  },
  {
    q_ar: "Excel يكفيني، شغّال عليه من 10 سنين",
    a_ar: "10 سنين شغل محترم. كم ملف ضاع منك خلالها؟ وكم مرة قلت «وين حطّيت المذكرة؟». Excel للمحاسبين، خلصنا.",
  },
  {
    q_ar: "خصوصية موكلي أهم شيء عندي",
    a_ar: "بياناتك مشفّرة AES-256، استضافة EU/Frankfurt (تخطّط لـ STC Cloud)، وعقد DPA موقّع. أصلاً Excel على لاب توبك أقل أماناً.",
  },
  {
    q_ar: "أنا شريك في مكتب كبير، 49 ر.س يخلّيني أشكّ في الجدّية",
    a_ar: "الـ 49 ر.س للمحامي المستقل. باقة Enterprise بـ 1999 ر.س فيها كل شيء + SLA + دعم مخصّص + custom domain.",
  },
  {
    q_ar: "وش الفرق بينكم وبين الأنظمة الثانية؟",
    a_ar: "هم يبيعونك حزمة بـ 1,500 ر.س فيها 80% ما تستخدمه. إحنا 49 ر.س + تركّب اللي تبيه. الباقي رياضيات.",
  },
  {
    q_ar: "ممكن أرجع لـ Excel لو ما عجبني؟",
    a_ar: "أكيد. تصدّر كل بياناتك CSV/PDF بضغطة في أي وقت. ما حد رجع لـ Excel بعد ما جرّب — بس لو رجعت، عيالنا.",
  },
  {
    q_ar: "وش يصير ببياناتي لو الشركة سكّرت؟",
    a_ar: "بنود واضحة في العقد: 90 يوم وصول كامل للتصدير + كود مفتوح المصدر للأرشفة المحلية إذا توقفت الخدمة نهائياً.",
  },
];

export function Objections() {
  return (
    <section className="py-20 border-b border-[var(--border)]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="pill mb-4">// الأسئلة الصعبة</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl mb-4 leading-tight">
            اعتراضاتك مشروعة.
            <br />
            <span className="text-gradient-brand">إجاباتنا صريحة.</span>
          </h2>
        </div>

        <div className="space-y-3">
          {OBJECTIONS.map((o, i) => (
            <div
              key={i}
              className="card group hover:border-[var(--brand)]/40 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-[var(--accent)] font-mono text-xs shrink-0 mt-1">
                  Q.
                </span>
                <h3 className="font-bold text-base flex-1">{o.q_ar}</h3>
              </div>
              <div className="flex items-start gap-3 ps-6">
                <span className="text-[var(--brand)] font-mono text-xs shrink-0 mt-1">
                  A.
                </span>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">
                  {o.a_ar}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
