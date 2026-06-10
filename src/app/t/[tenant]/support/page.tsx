import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

/* ============================================================
   Mock data — self-contained
   ============================================================ */

const CONTACT_CHANNELS = [
  {
    id: "wa",
    label: "واتساب",
    value: "+966 55 123 4567",
    hint: "الأسرع — رد خلال دقائق",
    icon: "💬",
    href: "https://wa.me/966551234567",
    accent: "success" as const,
    cta: "افتح المحادثة",
  },
  {
    id: "email",
    label: "البريد الإلكتروني",
    value: "support@qaf.sa",
    hint: "للطلبات التفصيلية والمرفقات",
    icon: "✉",
    href: "mailto:support@qaf.sa",
    accent: "info" as const,
    cta: "أرسل إيميل",
  },
  {
    id: "phone",
    label: "الهاتف",
    value: "920 00 1234",
    hint: "الأحد–الخميس · 9ص – 6م",
    icon: "📞",
    href: "tel:920001234",
    accent: "brand" as const,
    cta: "اتصل الآن",
  },
];

const FAQ_ITEMS = [
  {
    q: "كيف أضيف مستخدم جديد لفريق المكتب؟",
    a: "من صفحة «المستخدمون» اضغط زر «+ إضافة مستخدم»، أدخل الاسم والبريد وحدد الصلاحية (محامٍ، مساعد، محاسب، مدير). تُرسل دعوة تلقائياً عبر البريد لتفعيل الحساب.",
    open: true,
  },
  {
    q: "هل يمكنني تصدير القضايا والفواتير إلى Excel؟",
    a: "نعم. أي جدول في النظام (القضايا، الفواتير، المصروفات) يحتوي زر تصدير أعلى يمين الجدول يدعم صيغتي Excel و PDF مع الحفاظ على التنسيق العربي.",
    open: false,
  },
  {
    q: "ما حدود الباقة الحالية لعدد القضايا والمستخدمين؟",
    a: "تعتمد الحدود على باقتك. راجع صفحة «الإعدادات ← الاشتراك» لمعرفة استهلاكك الحالي مقابل الحد الأقصى، أو تواصل معنا للترقية فوراً دون انقطاع الخدمة.",
    open: false,
  },
  {
    q: "كيف أربط رزنامة الجلسات بتقويم جوجل؟",
    a: "من «الإعدادات ← التكاملات» فعّل تكامل التقويم وامنح الصلاحية لحسابك. ستُزامَن مواعيد الجلسات تلقائياً في الاتجاهين خلال دقائق.",
    open: false,
  },
  {
    q: "نسيت كلمة المرور — ماذا أفعل؟",
    a: "اضغط «نسيت كلمة المرور» في شاشة الدخول وأدخل بريدك المسجّل. يصلك رابط إعادة تعيين صالح لمدة ساعة. إن لم يصل، تحقق من مجلد الرسائل غير المرغوب فيها.",
    open: false,
  },
  {
    q: "هل بياناتي آمنة ومستضافة داخل السعودية؟",
    a: "نعم. جميع البيانات مشفّرة وتُخزَّن على خوادم داخل المملكة بما يتوافق مع متطلبات حماية البيانات. النسخ الاحتياطي يومي تلقائي.",
    open: false,
  },
];

type TicketStatus = "open" | "in_progress" | "resolved";

const TICKETS: {
  id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  agent: string;
  created: string;
  updated: string;
}[] = [
  {
    id: "QAF-1042",
    subject: "خطأ عند رفع مستند PDF أكبر من 20 ميجابايت",
    category: "المستندات",
    status: "in_progress",
    agent: "فريق الدعم — نورة",
    created: "2026-06-08",
    updated: "2026-06-09",
  },
  {
    id: "QAF-1037",
    subject: "طلب ترقية الباقة لإضافة 5 مستخدمين",
    category: "الاشتراك",
    status: "open",
    agent: "بانتظار الرد",
    created: "2026-06-09",
    updated: "2026-06-09",
  },
  {
    id: "QAF-0998",
    subject: "تعذّر مزامنة مواعيد الجلسات مع تقويم جوجل",
    category: "التكاملات",
    status: "resolved",
    agent: "فريق الدعم — سلطان",
    created: "2026-05-28",
    updated: "2026-05-30",
  },
];

const STATUS_META: Record<TicketStatus, { label: string; color: string }> = {
  open: { label: "مفتوحة", color: "var(--warn)" },
  in_progress: { label: "قيد المعالجة", color: "var(--info)" },
  resolved: { label: "تم الحل", color: "var(--success)" },
};

const ACCENT_VARS: Record<string, string> = {
  brand: "var(--brand)",
  accent: "var(--accent)",
  success: "var(--success)",
  warn: "var(--warn)",
  info: "var(--info)",
};

/* ============================================================
   Page
   ============================================================ */

export default async function SupportPage({ params }: { params: Promise<{ tenant: string }> }) {
  await params;

  const openCount = TICKETS.filter((t) => t.status !== "resolved").length;

  return (
    <>
      <Topbar
        title="الدعم الفني"
        sub="فريق قاف معك خطوة بخطوة"
        breadcrumb={["الرئيسية", "الدعم"]}
      />
      <main className="p-4 sm:p-6 max-w-5xl w-full">
        <PageHeader
          title="الدعم الفني"
          sub="عندك سؤال أو مشكلة؟ اختر القناة الأنسب لك — نرد بسرعة وبلا تعقيد."
          actions={
            <button className="btn btn-brand text-sm py-2.5">+ تذكرة دعم جديدة</button>
          }
        />

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="تذاكر مفتوحة"
            value={openCount}
            icon="🎫"
            accent="warn"
            hint="قيد المتابعة من فريقنا"
          />
          <StatCard
            label="متوسط زمن الرد"
            value="< 1 س"
            icon="⚡"
            accent="success"
            trend={{ v: "أسرع", up: true }}
            hint="على قناة واتساب"
          />
          <StatCard
            label="رضا العملاء"
            value="98%"
            icon="⭐"
            accent="brand"
            hint="آخر 90 يوماً"
          />
          <StatCard
            label="ساعات العمل"
            value="9—6"
            icon="🕘"
            accent="info"
            hint="الأحد – الخميس"
          />
        </div>

        {/* Contact channels — big tappable cards */}
        <section className="mb-8">
          <h3 className="font-display font-bold text-lg mb-3">تواصل معنا مباشرة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {CONTACT_CHANNELS.map((c) => {
              const color = ACCENT_VARS[c.accent];
              return (
                <a
                  key={c.id}
                  href={c.href}
                  target={c.id === "wa" ? "_blank" : undefined}
                  rel={c.id === "wa" ? "noopener noreferrer" : undefined}
                  className="card flex flex-col gap-3 group !p-5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl grid place-items-center text-2xl shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${color} 15%, transparent)`,
                        color,
                      }}
                    >
                      {c.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                        {c.label}
                      </div>
                      <div className="font-bold text-base truncate num" dir="ltr">
                        {c.value}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--text-faint)] leading-relaxed">
                    {c.hint}
                  </div>
                  <div
                    className="mt-1 text-sm font-bold flex items-center justify-center gap-1.5 rounded-lg py-2.5 transition-colors"
                    style={{
                      background: `color-mix(in srgb, ${color} 12%, transparent)`,
                      color,
                    }}
                  >
                    {c.cta}
                    <span className="arrow-flip">←</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Support tickets */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="font-display font-bold text-lg">تذاكر الدعم</h3>
            <span className="pill text-[11px]">آخر التذاكر</span>
          </div>

          <div className="space-y-2">
            {TICKETS.map((t) => {
              const meta = STATUS_META[t.status];
              return (
                <div key={t.id} className="card !p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-[11px] text-[var(--text-faint)] num" dir="ltr">
                          #{t.id}
                        </span>
                        <span className="pill text-[10px]">{t.category}</span>
                      </div>
                      <div className="font-bold text-sm leading-relaxed break-words">
                        {t.subject}
                      </div>
                    </div>
                    <span
                      className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{
                        background: `color-mix(in srgb, ${meta.color} 15%, transparent)`,
                        color: meta.color,
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[var(--text-faint)]">المسؤول:</span>
                      <span className="truncate">{t.agent}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[var(--text-faint)]">فُتحت:</span>
                      <span className="num" dir="ltr">{t.created}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[var(--text-faint)]">آخر تحديث:</span>
                      <span className="num" dir="ltr">{t.updated}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ — native accordion, no client JS */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="font-display font-bold text-lg">الأسئلة الشائعة</h3>
            <span className="text-[11px] text-[var(--text-faint)]">
              {/* أغلب الأسئلة تلاقي جوابها هنا قبل ما تفتح تذكرة */}
              جاوبنا على أكثرها قبل ما تسأل
            </span>
          </div>

          <div className="space-y-2">
            {FAQ_ITEMS.map((f, i) => (
              <details
                key={i}
                open={f.open}
                className="card !p-0 overflow-hidden group"
              >
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-4 py-4 hover:bg-[var(--bg-hover)] transition-colors">
                  <span className="font-bold text-sm leading-relaxed break-words">
                    {f.q}
                  </span>
                  <span className="shrink-0 text-[var(--brand)] text-lg leading-none transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-4 pb-4 pt-0 text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)]">
                  <p className="pt-3">{f.a}</p>
                </div>
              </details>
            ))}
          </div>

          {/* Still stuck */}
          <div className="card mt-4 text-center flex flex-col items-center gap-3 !p-6">
            <div className="text-3xl">🤝</div>
            <div className="font-bold text-base">ما لقيت جوابك؟</div>
            <p className="text-xs text-[var(--text-muted)] max-w-md leading-relaxed">
              لا تتردد — افتح تذكرة دعم أو راسلنا على واتساب وبنكون معك على طول. الدعم
              جزء من الباقة، مو إضافة.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              <a
                href="https://wa.me/966551234567"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-brand text-sm py-2.5"
              >
                💬 راسلنا على واتساب
              </a>
              <a href="mailto:support@qaf.sa" className="btn btn-ghost text-sm py-2.5">
                ✉ support@qaf.sa
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
