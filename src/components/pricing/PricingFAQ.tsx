"use client";

import { useState } from "react";

const QUESTIONS = [
  {
    q_ar: "في رسوم خفية أو إعداد؟",
    a_ar: "لا. الرقم اللي تشوفه هو اللي تدفعه. بدون رسوم تفعيل، بدون «إعداد أولي» بـ 3,000 ر.س زي ما يسوّي غيرنا.",
  },
  {
    q_ar: "أقدر أنزّل من باقة لباقة أصغر؟",
    a_ar: "نعم، بأي وقت. التغيير يصير في دورة الفوترة الجاية، وبياناتك تبقى كاملة. ما نحبسك.",
  },
  {
    q_ar: "لو ضفت ميزة في نص الشهر، كيف الحساب؟",
    a_ar: "نحسبها بالتناسب (Pro-rated) من يوم التفعيل لنهاية الدورة. تدفع بس على الأيام اللي استخدمتها فعلاً.",
  },
  {
    q_ar: "في استرداد للمبلغ؟",
    a_ar: "أول 14 يوم تجربة كاملة بدون دفع. بعد كذا، لو ألغيت خلال أول 30 يوم من الاشتراك المدفوع، نرجع لك كامل المبلغ. الاشتراك السنوي: استرداد تناسبي خلال 60 يوم.",
  },
  {
    q_ar: "وش يعتبر «مستخدم»؟ السكرتارية محسوبة؟",
    a_ar: "المستخدم = حساب دخول واحد لمحامي/مدير/محاسب/مسوّق/مدقّق. السكرتارية مجاناً في كل الباقات.",
  },
  {
    q_ar: "كيف أربط نطاقي الخاص (law.firm.sa)؟",
    a_ar: "إضافة بـ 79 ر.س/شهر. تحدّث DNS واحد، نهتم بالباقي (SSL، توجيه). تفعيل خلال 24 ساعة.",
  },
  {
    q_ar: "هل المساعد الذكي قد يهلوس ويخترع سوابق غير حقيقية؟",
    a_ar: "كل ادعاء يستشهد بمصدر يقدر يفتحه ويتحقق. التحقق النهائي مسؤولية المحامي — مكتوب بصراحة في وثيقة الاستخدام.",
  },
  {
    q_ar: "وش يصير لو شركتكم أفلست أو سُكرت الخدمة؟",
    a_ar: "بنود واضحة في عقد الخدمة: 90 يوم وصول كامل + كود مفتوح المصدر للأرشفة. بياناتك ملكك، مو ملكنا.",
  },
];

export function PricingFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 border-b border-[var(--border)]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="pill mb-4">الأسئلة المتكرّرة</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl mb-4 leading-tight">
            كل اللي بيلك،
            <br />
            <span className="text-gradient-brand">قبل ما تسألنا.</span>
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
                <span className="font-bold text-base">{item.q_ar}</span>
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
                  {item.a_ar}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
