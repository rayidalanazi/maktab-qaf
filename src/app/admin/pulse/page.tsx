import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

// أحداث حيّة — أحدث 8 أحداث على المنصة
const EVENTS = [
  { id: 1, icon: "🔐", text: "تسجيل دخول جديد", tenant: "شركة رائد للمحاماة", time: "الآن", color: "var(--info)" },
  { id: 2, icon: "💳", text: "دفعة ناجحة — 499 ر.س", tenant: "مكتب الفيصل", time: "قبل 1 د", color: "var(--success)" },
  { id: 3, icon: "📁", text: "إنشاء قضية 2026/0512", tenant: "مكتب القحطاني", time: "قبل 3 د", color: "var(--brand)" },
  { id: 4, icon: "🧩", text: "تفعيل إضافة المذكرات", tenant: "مكتب الخوري", time: "قبل 6 د", color: "var(--accent)" },
  { id: 5, icon: "👤", text: "دعوة محامٍ جديد", tenant: "مكتب المطيري", time: "قبل 9 د", color: "var(--info)" },
  { id: 6, icon: "⚠️", text: "فشل خصم البطاقة", tenant: "مكتب الشمري", time: "قبل 14 د", color: "var(--warn)" },
  { id: 7, icon: "📄", text: "رفع 12 مستنداً", tenant: "مكتب العنزي", time: "قبل 18 د", color: "var(--brand)" },
  { id: 8, icon: "✅", text: "إغلاق قضية بنجاح", tenant: "مؤسسة العتيبي", time: "قبل 23 د", color: "var(--success)" },
];

// صحة الأنظمة — 4 مؤشرات
const SYSTEMS = [
  { name: "الخادم", detail: "زمن الاستجابة 84ms — مستقر", status: "ok", value: "99.98%" },
  { name: "قاعدة البيانات", detail: "Supabase — 23 اتصالاً نشطاً", status: "ok", value: "99.99%" },
  { name: "بوابة ميسر", detail: "تأخر طفيف في التحقق من البطاقات", status: "warn", value: "98.6%" },
  { name: "التخزين", detail: "412 GB من أصل 500 GB مستخدمة", status: "ok", value: "82%" },
];

// أكثر المكاتب نشاطاً الآن
const ACTIVE_FIRMS = [
  { name: "شركة رائد للمحاماة", actions: 142, pct: 100 },
  { name: "مكتب الفيصل", actions: 118, pct: 83 },
  { name: "مكتب القحطاني", actions: 94, pct: 66 },
  { name: "مكتب الخوري", actions: 67, pct: 47 },
  { name: "مكتب المطيري", actions: 41, pct: 29 },
];

// نبض الأحداث آخر 12 ساعة (للرسم البياني)
const HOURLY = [
  { h: "01", v: 28 }, { h: "03", v: 19 }, { h: "05", v: 12 }, { h: "07", v: 34 },
  { h: "09", v: 78 }, { h: "11", v: 96 }, { h: "13", v: 88 }, { h: "15", v: 71 },
  { h: "17", v: 64 }, { h: "19", v: 52 }, { h: "21", v: 47 }, { h: "23", v: 31 },
];

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  ok: { color: "var(--success)", label: "سليم" },
  warn: { color: "var(--warn)", label: "تنبيه" },
  down: { color: "var(--danger)", label: "متوقف" },
};

export default function PulsePage() {
  const peak = Math.max(...HOURLY.map((p) => p.v));

  return (
    <>
      <Topbar title="نبض المنصة" breadcrumb={["Admin", "نبض المنصة"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="نبض المنصة"
          sub="// مراقبة حيّة لكل ما يجري على قاف الآن — لحظة بلحظة"
          actions={
            <>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-lg"
                style={{
                  background: `color-mix(in srgb, var(--success) 15%, transparent)`,
                  color: "var(--success)",
                }}
              >
                <span className="relative flex w-2 h-2">
                  <span
                    className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping"
                    style={{ background: "var(--success)" }}
                  />
                  <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
                </span>
                مباشر
              </span>
              <button className="btn btn-ghost text-sm py-2.5">📥 تصدير</button>
            </>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard label="مستخدمون متصلون الآن" value={23} icon="🟢" accent="success" trend={{ v: "+5", up: true }} hint="عبر 11 مكتباً" />
          <StatCard label="أحداث اليوم" value={"1٬284"} icon="⚡" accent="brand" trend={{ v: "+12%", up: true }} hint="مقارنة بالأمس" />
          <StatCard label="صحة النظام" value={"99.6%"} icon="❤️" accent="info" hint="جميع الخدمات تعمل" />
          <StatCard label="آخر مزامنة" value={"الآن"} icon="🔄" accent="accent" hint="2026-06-10 13:42" />
        </div>

        {/* نبض الأحداث — رسم بياني بالساعة */}
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm">نبض الأحداث — آخر 12 ساعة</h3>
              <p className="text-[11px] text-[var(--text-faint)]">عدد الأحداث المسجّلة في كل فترة</p>
            </div>
            <span className="text-[11px] text-[var(--text-faint)] num" dir="ltr">{peak} ذروة</span>
          </div>
          <div className="flex items-end gap-1.5 sm:gap-2 h-32">
            {HOURLY.map((p) => (
              <div key={p.h} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className="w-full max-w-[26px] rounded-t-md transition-all group-hover:opacity-100 opacity-80"
                    style={{
                      height: `${(p.v / peak) * 100}%`,
                      background: `linear-gradient(to top, var(--brand), color-mix(in srgb, var(--brand) 55%, transparent))`,
                    }}
                  />
                </div>
                <span className="text-[9px] sm:text-[10px] text-[var(--text-faint)] font-mono" dir="ltr">{p.h}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* أحداث حيّة — feed */}
          <div className="lg:col-span-2 card !p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="relative flex w-2 h-2">
                  <span
                    className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping"
                    style={{ background: "var(--accent)" }}
                  />
                  <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
                </span>
                <h3 className="font-bold text-sm">أحداث حيّة</h3>
              </div>
              <span className="text-[11px] text-[var(--text-faint)]">آخر 8 أحداث</span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {EVENTS.map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-3 sm:px-4 hover:bg-[var(--bg-hover)] transition-colors">
                  <div
                    className="w-9 h-9 rounded-lg grid place-items-center text-base shrink-0"
                    style={{ background: `color-mix(in srgb, ${e.color} 14%, transparent)` }}
                  >
                    {e.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{e.text}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{e.tenant}</div>
                  </div>
                  <span className="text-[11px] text-[var(--text-faint)] shrink-0 num" dir="ltr">{e.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* العمود الجانبي */}
          <div className="space-y-4">
            {/* صحة الأنظمة */}
            <div className="card">
              <h3 className="font-bold text-sm mb-3">صحة الأنظمة</h3>
              <div className="space-y-3">
                {SYSTEMS.map((s) => {
                  const st = STATUS_STYLE[s.status];
                  return (
                    <div key={s.name} className="flex items-start gap-2.5">
                      <span className="relative flex w-2.5 h-2.5 mt-1 shrink-0">
                        {s.status !== "ok" && (
                          <span
                            className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping"
                            style={{ background: st.color }}
                          />
                        )}
                        <span className="relative inline-flex w-2.5 h-2.5 rounded-full" style={{ background: st.color }} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">{s.name}</span>
                          <span className="text-[11px] num shrink-0" dir="ltr" style={{ color: st.color }}>{s.value}</span>
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] leading-snug">{s.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* أكثر المكاتب نشاطاً الآن */}
            <div className="card">
              <h3 className="font-bold text-sm mb-3">أكثر المكاتب نشاطاً الآن</h3>
              <div className="space-y-3">
                {ACTIVE_FIRMS.map((f, i) => (
                  <div key={f.name}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium truncate flex items-center gap-1.5">
                        <span className="text-[var(--text-faint)] num" dir="ltr">{i + 1}.</span>
                        {f.name}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] num shrink-0" dir="ltr">{f.actions} حدث</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${f.pct}%`,
                          background: `linear-gradient(to left, var(--brand), var(--accent))`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
