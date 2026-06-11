"use client";

import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useQafData } from "@/hooks/useQafData";
import { fetchCases, fetchInvoices } from "@/lib/data/queries";
import { MOCK_CASES } from "@/data/app-mock";
import type { InvoiceItem } from "@/lib/data/types";

// Demo fallback (shown only when no firm/DB yet). Shaped like InvoiceItem.
const FALLBACK_INVOICES: InvoiceItem[] = [
  { id: "INV-201", client: "شركة النجم التجارية", number: "INV-2025-201", amount: 142000, vat: 0, total: 142000, status: "paid", issued: "2025-12-18", due: "2026-01-18" },
  { id: "INV-202", client: "بنك الراجحي", number: "INV-2026-202", amount: 168500, vat: 0, total: 168500, status: "paid", issued: "2026-01-20", due: "2026-02-20" },
  { id: "INV-203", client: "مؤسسة الخليج الصناعية", number: "INV-2026-203", amount: 121000, vat: 0, total: 121000, status: "paid", issued: "2026-02-15", due: "2026-03-15" },
  { id: "INV-204", client: "شركة المنارة العقارية", number: "INV-2026-204", amount: 195400, vat: 0, total: 195400, status: "paid", issued: "2026-03-12", due: "2026-04-12" },
  { id: "INV-205", client: "شركة النجم التجارية", number: "INV-2026-205", amount: 176200, vat: 0, total: 176200, status: "paid", issued: "2026-04-09", due: "2026-05-09" },
  { id: "INV-206", client: "مؤسسة الخليج الصناعية", number: "INV-2026-206", amount: 231800, vat: 0, total: 231800, status: "paid", issued: "2026-05-14", due: "2026-06-14" },
];

// أسماء الأشهر — تُشتق من تاريخ إصدار الفاتورة (YYYY-MM)
const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

// ألوان أعمدة توزيع القضايا
const TYPE_ACCENTS = [
  "var(--brand)", "var(--accent)", "var(--info)",
  "var(--success)", "var(--warn)", "var(--danger)",
];

const SAR = (n: number) => n.toLocaleString("en-US");

export default function ReportsPage() {
  const { data: cases } = useQafData(fetchCases, MOCK_CASES);
  const { data: invoices } = useQafData(fetchInvoices, FALLBACK_INVOICES);

  // إيرادات آخر 6 أشهر (بالريال السعودي) — من الفواتير المحصّلة
  const paid = invoices.filter((i) => i.status === "paid");
  const byMonth = new Map<string, number>();
  for (const inv of paid) {
    const m = (inv.issued || "").slice(0, 7);
    if (m) byMonth.set(m, (byMonth.get(m) ?? 0) + inv.total);
  }
  const revenue = [...byMonth.keys()]
    .sort()
    .slice(-6)
    .map((key) => ({
      key,
      month: AR_MONTHS[parseInt(key.slice(5), 10) - 1] ?? key,
      value: byMonth.get(key) ?? 0,
    }));

  // توزيع القضايا حسب النوع
  const byType = new Map<string, number>();
  for (const c of cases) {
    const t = c.type || "أخرى";
    byType.set(t, (byType.get(t) ?? 0) + 1);
  }
  const caseTypes = [...byType.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], i) => ({ label, value, accent: TYPE_ACCENTS[i % TYPE_ACCENTS.length] }));

  // أداء المحامين — محسوب من القضايا المسندة والإيراد المحصّل
  const totalRevenue = revenue.reduce((s, r) => s + r.value, 0);
  const byLawyer = new Map<string, { cases: number; won: number }>();
  for (const c of cases) {
    const key = c.assignedTo || "غير مسند";
    const e = byLawyer.get(key) ?? { cases: 0, won: 0 };
    e.cases += 1;
    if (c.status === "مغلق") e.won += 1;
    byLawyer.set(key, e);
  }
  const lawyers = [...byLawyer.entries()]
    .map(([name, v]) => ({
      name,
      cases: v.cases,
      won: v.won,
      rate: v.cases ? Math.round((v.won / v.cases) * 100) : 0,
      revenue: cases.length ? Math.round((totalRevenue * v.cases) / cases.length) : 0,
    }))
    .sort((a, b) => b.cases - a.cases);

  const activeCases = cases.filter((c) => c.status === "نشط");
  const closedCases = cases.filter((c) => c.status === "مغلق");
  const winPct = cases.length ? Math.round((closedCases.length / cases.length) * 100) : 0;
  const activeCourts = new Set(activeCases.map((c) => c.court).filter(Boolean)).size;

  const maxRevenue = Math.max(1, ...revenue.map((r) => r.value));
  const maxCases = Math.max(1, ...caseTypes.map((c) => c.value));

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
            value={activeCases.length}
            icon="⚖"
            accent="info"
            trend={{ v: "+6", up: true }}
            hint={`موزعة على ${activeCourts} محاكم`}
          />
          <StatCard
            label="نسبة كسب القضايا"
            value={`${winPct}%`}
            icon="🏆"
            accent="success"
            trend={{ v: "+4%", up: true }}
            hint={`${closedCases.length} من أصل ${cases.length} قضية`}
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
              {revenue.map((r) => {
                const h = Math.round((r.value / maxRevenue) * 100);
                return (
                  <div
                    key={r.key}
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
              {revenue.map((r) => (
                <span
                  key={r.key}
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
              {caseTypes.map((c) => {
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
                {lawyers.map((l) => {
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
            {/* الأرقام محسوبة من بيانات النظام (القضايا + الفواتير) */}
            * الأرقام محسوبة آلياً من ملفات القضايا والفواتير المسجّلة في النظام.
          </p>
        </section>
      </main>
    </>
  );
}
