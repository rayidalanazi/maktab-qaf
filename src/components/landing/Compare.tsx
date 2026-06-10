export function Compare() {
  return (
    <section className="py-24 border-b border-[var(--border)]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="pill mb-4">المقارنة الصعبة 🥲</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl mb-4 leading-tight">
            هل ما زلت تستخدم
            <br />
            <span className="line-through text-[var(--text-faint)]">Excel و Word و WhatsApp؟</span>
          </h2>
          <p className="text-[var(--text-muted)] text-lg">
            احنا أيضاً صُدمنا. لكن لا تقلق، عندنا الحل.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="card border-[var(--border)] bg-[var(--bg-elev)] relative overflow-hidden">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--text-faint)] uppercase tracking-widest">
              قبل قاف
            </div>
            <div className="pt-8">
              <div className="text-4xl mb-4">😩</div>
              <h3 className="font-bold text-xl mb-4">حياة فوضوية</h3>
              <ul className="space-y-3 text-sm text-[var(--text-muted)]">
                {[
                  "ملف Excel اسمه «قضايا_v17_final_FINAL_2.xlsx»",
                  "مذكرة ضاعت لأن السكرتيرة أرسلتها بـ WhatsApp",
                  "موعد جلسة فاتك لأن التقويم كان على ورقة",
                  "عميل ينتظر فاتورته 45 يوم",
                  "ما تعرف كم قضية لكل محامي",
                  "السحابة = USB في الدرج",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-0.5">✗</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* After */}
          <div className="card relative overflow-hidden" style={{ borderColor: "var(--brand)" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/5 to-transparent pointer-events-none" />
            <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--brand)] uppercase tracking-widest">
              بعد قاف
            </div>
            <div className="pt-8 relative">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-bold text-xl mb-4">حياة منظّمة</h3>
              <ul className="space-y-3 text-sm text-[var(--text-muted)]">
                {[
                  "كل قضية لها صفحة + مستندات + سجل تحديثات",
                  "مذكرات بقوالب احترافية + workflow اعتماد",
                  "تنبيهات قبل كل موعد بـ 24 ساعة",
                  "فواتير تروح للعميل تلقائياً + ربط ميسر",
                  "ترى وزن العمل لكل محامي في رسم بياني",
                  "كل شي في السحابة الحقيقية، Backup يومي",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[var(--brand)] mt-0.5">✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
