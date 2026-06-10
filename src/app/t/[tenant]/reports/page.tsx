import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

// إيرادات آخر 6 أشهر (بالريال السعودي)
const REVENUE = [
  { month: "ديسمبر", value: 142000 },
  { month: "يناير", value: 168500 },
  { month: "فبراير", value: 121000 },
  { month: "مارس", value: 195400 },
  { month: "أبريل", value: 176200 },
  { month: "مايو", value: 231800 },
];

// توزيع القضايا حسب نوع المحكمة
const CASE_TYPES = [
  { label: "المحكمة التجارية", value: 38, accent: "var(--brand)" },
  { label: "محكمة التنفيذ", value: 29, accent: "var(--accent)" },
  { label: "المحكمة العامة بالرياض", value: 22, accent: "var(--info)" },
  { label: "محكمة الأحوال الشخصية", value: 17, accent: "var(--success)" },
  { label: "المحكمة العمالية", value: 13, accent: "var(--warn)" },
  { label: "المحكمة الإدارية", value: 9, accent: "var(--danger)" },
];

// أداء المحامين خلال الربع الحالي
const LAWYERS = [
  { name: "أ. سلطان القحطاني", cases: 24, won: 19, revenue: 312000, rate: 79 },
  { name: "أ. نورة العتيبي", cases: 21, won: 18, revenue: 287500, rate: 86 },
  { name: "أ. فهد الدوسري", cases: 18, won: 12, revenue: 198000, rate: 67 },
  { name: "أ. ريم الشهري", cases: 16, won: 14, revenue: 241300, rate: 88 },
  { name: "أ. ماجد الحربي", cases: 14, won: 9, revenue: 156800, rate: 64 },
  { name: "أ. لمى الزهراني", cases: 11, won: 8, revenue: 132400, rate: 73 },
];

const SAR = (n: number) => n.toLocaleString("en-US");

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  await params;

  const maxRevenue = Math.max(...REVENUE.map((r) => r.value));
  const maxCases = Math.max(...CASE_TYPES.map((c) => c.value));
  const totalRevenue = REVENUE.reduce((s, r) => s + r.value, 0);
  const totalCases = CASE_TYPES.reduce((s, c) => s + c.value, 0);

  return (
    <>
      <Topbar
        title="التقارير الدورية"
        sub="نظرة تحليلية على الأداء المالي والقضائي للمكتب"
        breadcrumb={["الرئيسية", "التقارير"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="التقارير الدورية"
          sub="إيرادات، توزيع القضايا، وأداء المحامين — مُحدّثة حتى مايو 2026"
          actions={
            <>
              <button className="btn btn-ghost text-sm py-2.5">⬇ تصدير PDF</button>
              <button className="btn btn-brand text-sm py-2.5">+ تقرير مخصص</button>
            </>
          }
        />

        {/* صف الإحصائيات */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="إجمالي الإيرادات (6 أشهر)"
            value={`${SAR(totalRevenue)} ر.س`}
            icon="💰"
            accent="brand"
            trend={{ v: "+18%", up: true }}
            hint="مقارنة بالنصف السابق"
          />
          <StatCard
            label="القضايا النشطة"
            value={totalCases}
            icon="⚖"
            accent="info"
            trend={{ v: "+6", up: true }}
            hint="موزعة على 6 محاكم"
          />
          <StatCard
            label="نسبة كسب القضايا"
            value="76%"
            icon="🏆"
            accent="success"
            trend={{ v: "+4%", up: true }}
            hint="80 من أصل 105 قضية"
          />
          <StatCard
            label="متوسط مدة القضية"
            value="94 يوم"
            icon="⏱"
            accent="warn"
            trend={{ v: "-8 أيام", up: true }}
            hint="أسرع من الربع الماضي"
          />
        </div>

        {/* الرسوم البيانية: إيرادات + توزيع */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mb-6">
          {/* مخطط الإيرادات (أعمدة رأسية) */}
          <section className="card lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h3 className="font-bold text-base">إيرادات آخر 6 أشهر</h3>
              <span className="pill pill-brand text-[11px]">بالريال السعودي</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-5">
              ذروة الإيرادات في مايو بفضل تسويات تجارية كبرى.
            </p>

            <div className="flex items-end justify-between gap-2 sm:gap-4 h-52 border-b border-[var(--border)] pb-px">
              {REVENUE.map((r) => {
                const h = Math.round((r.value / maxRevenue) * 100);
                return (
                  <div
                    key={r.month}
                    className="flex-1 flex flex-col items-center justify-end gap-2 h-full min-w-0"
                  >
                    <span className="num text-[10px] sm:text-xs text-[var(--text-muted)]" dir="ltr">
                      {Math.round(r.value / 1000)}k
                    </span>
                    <div
                      className="w-full max-w-[44px] rounded-t-md transition-all"
                      style={{
                        height: `${h}%`,
                        background:
                          "linear-gradient(to top, var(--brand), color-mix(in srgb, var(--brand) 55%, transparent))",
                      }}
                      title={`${SAR(r.value)} ر.س`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between gap-2 sm:gap-4 mt-2">
              {REVENUE.map((r) => (
                <span
                  key={r.month}
                  className="flex-1 text-center text-[10px] sm:text-xs text-[var(--text-faint)] truncate"
                >
                  {r.month}
                </span>
              ))}
            </div>
          </section>

          {/* توزيع القضايا (أعمدة أفقية) */}
          <section className="card lg:col-span-2">
            <h3 className="font-bold text-base mb-1">توزيع القضايا حسب النوع</h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">
              التجارية والتنفيذ تستحوذان على أكثر من نصف الملفات.
            </p>

            <div className="flex flex-col gap-4">
              {CASE_TYPES.map((c) => {
                const w = Math.round((c.value / maxCases) * 100);
                return (
                  <div key={c.label}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs sm:text-[13px] text-[var(--text)] truncate min-w-0">
                        {c.label}
                      </span>
                      <span className="num text-xs font-bold shrink-0" dir="ltr" style={{ color: c.accent }}>
                        {c.value}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${w}%`, background: c.accent }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* أداء المحامين */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="font-bold text-base">أداء المحامين</h3>
            <span className="text-xs text-[var(--text-faint)]">الربع الثاني 2026</span>
          </div>

          <div className="card !p-0 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-[var(--text-muted)] text-xs border-b border-[var(--border)]">
                  <th className="text-start font-medium px-4 py-3">المحامي</th>
                  <th className="text-center font-medium px-4 py-3">القضايا</th>
                  <th className="text-center font-medium px-4 py-3">المكسوبة</th>
                  <th className="text-start font-medium px-4 py-3 w-[28%]">نسبة النجاح</th>
                  <th className="text-end font-medium px-4 py-3">الإيرادات</th>
                </tr>
              </thead>
              <tbody>
                {LAWYERS.map((l) => {
                  const rateColor =
                    l.rate >= 80
                      ? "var(--success)"
                      : l.rate >= 70
                      ? "var(--info)"
                      : "var(--warn)";
                  return (
                    <tr
                      key={l.name}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      <td className="px-4 py-3.5 font-medium text-[var(--text)] whitespace-nowrap">
                        {l.name}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="num" dir="ltr">{l.cases}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="num text-[var(--success)]" dir="ltr">{l.won}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-[var(--bg-hover)] overflow-hidden min-w-[60px]">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${l.rate}%`, background: rateColor }}
                            />
                          </div>
                          <span className="num text-xs font-bold shrink-0" dir="ltr" style={{ color: rateColor }}>
                            {l.rate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-end whitespace-nowrap">
                        <span className="num font-medium" dir="ltr">{SAR(l.revenue)}</span>
                        <span className="text-[var(--text-faint)] text-xs"> ر.س</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-[var(--text-faint)] mt-3">
            {/* الأرقام تقديرية لأغراض العرض — التقرير الفعلي يُولّد من بيانات النظام */}
            * الأرقام محسوبة آلياً من ملفات القضايا والفواتير المسجّلة في النظام.
          </p>
        </section>
      </main>
    </>
  );
}
