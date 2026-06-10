import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

const KPI_TILES = [
  {
    label: "معدل كسب القضايا",
    value: "78%",
    icon: "⚖",
    accent: "success" as const,
    trend: { v: "+4%", up: true },
    hint: "آخر 12 شهرًا",
  },
  {
    label: "متوسط مدة القضية",
    value: "94 يوم",
    icon: "⏱",
    accent: "info" as const,
    trend: { v: "-6 أيام", up: true },
    hint: "من القيد حتى الإغلاق",
  },
  {
    label: "رضا العملاء",
    value: "4.6 / 5",
    icon: "⭐",
    accent: "warn" as const,
    trend: { v: "+0.2", up: true },
    hint: "من 312 تقييمًا",
  },
  {
    label: "الإيراد لكل محامٍ",
    value: "186K",
    icon: "💼",
    accent: "brand" as const,
    trend: { v: "+12%", up: true },
    hint: "متوسط ربع سنوي · ر.س",
  },
  {
    label: "نسبة التحصيل",
    value: "71%",
    icon: "💰",
    accent: "accent" as const,
    trend: { v: "-3%", up: false },
    hint: "من إجمالي الفواتير المستحقة",
  },
  {
    label: "القضايا النشطة",
    value: 64,
    icon: "📂",
    accent: "info" as const,
    trend: { v: "+8", up: true },
    hint: "موزّعة على 9 محامين",
  },
];

const PROGRESS_METRICS = [
  {
    title: "الالتزام بالمواعيد القضائية",
    sub: "الجلسات والمذكرات المقدّمة في وقتها",
    pct: 92,
    accent: "var(--success)",
    detail: "284 من 309 موعدًا",
  },
  {
    title: "استغلال ساعات العمل القابلة للفوترة",
    sub: "الساعات المفوترة مقابل المتاحة",
    pct: 76,
    accent: "var(--brand)",
    detail: "1,420 من 1,860 ساعة",
  },
  {
    title: "تحصيل الفواتير المستحقة",
    sub: "المبالغ المُحصّلة من إجمالي المطالبات",
    pct: 71,
    accent: "var(--accent)",
    detail: "2.1M من 3.0M ر.س",
  },
];

const COURT_BREAKDOWN = [
  { court: "المحكمة التجارية بالرياض", cases: 21, winRate: "82%", accent: "var(--success)" },
  { court: "المحكمة العامة بالرياض", cases: 14, winRate: "74%", accent: "var(--brand)" },
  { court: "محكمة الأحوال الشخصية", cases: 11, winRate: "69%", accent: "var(--info)" },
  { court: "المحكمة العمالية بالرياض", cases: 9, winRate: "88%", accent: "var(--success)" },
  { court: "محكمة التنفيذ بالرياض", cases: 6, winRate: "63%", accent: "var(--warn)" },
  { court: "المحكمة الإدارية", cases: 3, winRate: "55%", accent: "var(--danger)" },
];

export default async function KpiPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  await params;

  return (
    <>
      <Topbar
        title="مؤشّرات الأداء KPIs"
        sub="نظرة شاملة على أداء المكتب القانوني"
        breadcrumb={["الرئيسية", "مؤشرات الأداء"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="مؤشّرات الأداء KPIs"
          sub="قياس صحة المكتب: من معدّل الكسب إلى التحصيل والإنتاجية."
          actions={
            <>
              <button className="btn btn-ghost text-sm py-2.5">
                <span className="num" dir="ltr">
                  Q2 2026
                </span>
              </button>
              <button className="btn btn-brand text-sm py-2.5">+ تقرير مخصّص</button>
            </>
          }
        />

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {KPI_TILES.map((k) => (
            <StatCard
              key={k.label}
              label={k.label}
              value={k.value}
              icon={k.icon}
              accent={k.accent}
              trend={k.trend}
              hint={k.hint}
            />
          ))}
        </div>

        {/* Progress-bar metric cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
          {PROGRESS_METRICS.map((m) => (
            <div key={m.title} className="card flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm leading-tight break-words">
                    {m.title}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 break-words">
                    {m.sub}
                  </p>
                </div>
                <span
                  className="font-display font-black text-2xl num shrink-0"
                  dir="ltr"
                  style={{ color: m.accent }}
                >
                  {m.pct}%
                </span>
              </div>
              <div
                className="h-2.5 w-full rounded-full overflow-hidden"
                style={{
                  background: `color-mix(in srgb, ${m.accent} 15%, transparent)`,
                }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${m.pct}%`, background: m.accent }}
                />
              </div>
              <div className="text-[11px] text-[var(--text-faint)]">
                <span className="num" dir="ltr">
                  {m.detail}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Win rate by court */}
        <div className="mt-4 sm:mt-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="font-bold text-base sm:text-lg">معدّل الكسب حسب المحكمة</h3>
            <span className="pill pill-brand text-[11px]">آخر 12 شهرًا</span>
          </div>
          <div className="card !p-0 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider border-b border-[var(--border)]">
                  <th className="text-right font-medium px-4 py-3">المحكمة</th>
                  <th className="text-right font-medium px-4 py-3">القضايا</th>
                  <th className="text-right font-medium px-4 py-3 w-[45%]">معدّل الكسب</th>
                </tr>
              </thead>
              <tbody>
                {COURT_BREAKDOWN.map((c) => {
                  const pct = parseInt(c.winRate, 10);
                  return (
                    <tr
                      key={c.court}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      <td className="px-4 py-3 font-medium break-words">{c.court}</td>
                      <td className="px-4 py-3">
                        <span className="num" dir="ltr">
                          {c.cases}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-2 flex-1 rounded-full overflow-hidden min-w-[80px]"
                            style={{
                              background: `color-mix(in srgb, ${c.accent} 15%, transparent)`,
                            }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{ width: c.winRate, background: c.accent }}
                            />
                          </div>
                          <span
                            className="num font-bold w-12 text-left shrink-0"
                            dir="ltr"
                            style={{ color: c.accent }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-[var(--text-faint)] mt-3">
            {/* الأرقام تقديرية لأغراض العرض — اربطها بقاعدة البيانات لاحقًا */}
            تُحدَّث المؤشرات تلقائيًا مع كل قضية مُغلقة.
          </p>
        </div>
      </main>
    </>
  );
}
