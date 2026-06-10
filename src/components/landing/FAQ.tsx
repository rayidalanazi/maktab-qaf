"use client";

import { useState } from "react";

const QUESTIONS = [
  {
    q: "هل بياناتي آمنة؟",
    a: "بياناتك مشفّرة (AES-256) ومخزّنة في خوادم Supabase الأوروبية (Frankfurt) المتوافقة مع GDPR. عزل تام بين المكاتب عبر Row Level Security — مستحيل مكتب يشوف بيانات مكتب ثاني. Backup يومي.",
  },
  {
    q: "هل تقبلون الدفع عبر مدى أو Apple Pay؟",
    a: "نعم. الدفع عبر ميسر (Moyasar) — يقبل مدى، فيزا، ماستر، Apple Pay، وSTC Pay. خصم تلقائي شهري، أو سنوي بخصم 15%.",
  },
  {
    q: "لو ألغيت الاشتراك، أيش يصير ببياناتي؟",
    a: "بياناتك تظل محفوظة 90 يوم بعد الإلغاء — تقدر ترجع وتسترجعها بضغطة زر. بعد 90 يوم تنحذف نهائياً. وقت ما تبي تصدّرها (Excel أو PDF)، نسهّل لك.",
  },
  {
    q: "هل المنصة فعلاً عربية؟ أم ترجمة؟",
    a: "صُمّمت من الصفر بالعربي. RTL أصلي. مفردات قانونية سعودية (المحكمة العامة، الأحوال الشخصية، النيابة العامة...). فريقنا يفهم النظام السعودي.",
  },
  {
    q: "ما الفرق بين الباقات؟",
    a: "الأساس (49 ر.س) للمحامي المستقل: قضايا أساسية وعملاء. لما تحتاج مذكرات بقوالب أو فوترة أو تقارير، ترقّي للباقة المناسبة، أو تشتري الميزة مفرد. ما تدفع على ميزة ما تستخدمها.",
  },
  {
    q: "هل عندكم تطبيق موبايل؟",
    a: "النسخة الحالية responsive — تشتغل على الموبايل من المتصفح. تطبيق iOS و Android جاي قريباً (Q3 2026).",
  },
  {
    q: "أنا مكتب كبير، أبي custom domain (مثل law.firmname.sa)",
    a: "متوفر في باقة Enterprise (1999 ر.س) أو كـ add-on بـ 99 ر.س/شهر. تشتغل خلال 24 ساعة بعد التحقق من الـ DNS.",
  },
  {
    q: "هل أقدر أنقل بياناتي من نظام آخر؟",
    a: "نعم. نقبل CSV و Excel و JSON. للباقات المدفوعة، فريقنا يسوي الهجرة مجاناً. حتى لو عندك قضايا في WhatsApp 😅",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 border-b border-[var(--border)] relative">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="pill mb-4">الأسئلة المتكررة</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl mb-4 leading-tight">
            أسئلة مشروعة،
            <br />
            <span className="text-gradient-brand">إجابات صريحة.</span>
          </h2>
        </div>

        <div className="space-y-2">
          {QUESTIONS.map((item, i) => (
            <button
              key={i}
              onClick={() => setOpen(open === i ? null : i)}
              className={`w-full text-right p-5 rounded-xl border transition-all ${
                open === i
                  ? "bg-[var(--bg-card)] border-[var(--brand)]/40"
                  : "border-[var(--border)] hover:border-[var(--border-strong)]"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-base">{item.q}</span>
                <span
                  className={`text-[var(--brand)] text-xl transition-transform shrink-0 ${
                    open === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </div>
              <div
                className={`overflow-hidden transition-all ${
                  open === i ? "max-h-96 mt-3" : "max-h-0"
                }`}
              >
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  {item.a}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
