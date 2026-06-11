"use client";

import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useQafData } from "@/hooks/useQafData";
import { fetchCases, fetchInvoices, fetchUsers } from "@/lib/data/queries";
import { MOCK_CASES, MOCK_USERS } from "@/data/app-mock";
import type { InvoiceItem } from "@/lib/data/types";

const FALLBACK_INVOICES: InvoiceItem[] = [
  { id: "k1", client: "شركة النجم التجارية", number: "INV-101", amount: 120000, vat: 18000, total: 138000, status: "paid", issued: "2026-03-02", due: "2026-04-02" },
  { id: "k2", client: "بنك الراجحي", number: "INV-102", amount: 90000, vat: 13500, total: 103500, status: "paid", issued: "2026-04-11", due: "2026-05-11" },
  { id: "k3", client: "مؤسسة الخليج", number: "INV-103", amount: 60000, vat: 9000, total: 69000, status: "sent", issued: "2026-05-05", due: "2026-06-05" },
  { id: "k4", client: "شركة المنارة", number: "INV-104", amount: 30000, vat: 4500, total: 34500, status: "overdue", issued: "2026-04-20", due: "2026-05-20" },
];

const COURT_ACCENTS = [
  "var(--success)", "var(--brand)", "var(--info)",
  "var(--accent)", "var(--warn)", "var(--danger)",
];

export default function KpiPage() {
  const { data: cases } = useQafData(fetchCases, MOCK_CASES);
  const { data: invoices } = useQafData(fetchInvoices, FALLBACK_INVOICES);
  const { data: users } = useQafData(fetchUsers, MOCK_USERS);

  // ---- derived KPIs (computed from live system data) ----
  const closed = cases.filter((c) => c.status === "مغلق");
  const active = cases.filter((c) => c.status === "نشط");
  const winPct = cases.length ? Math.round((closed.length / cases.length) * 100) : 0;

  const invoicedTotal = invoices.reduce((s, i) => s + i.total, 0);
  const collectedTotal = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total, 0);
  const collectPct = invoicedTotal ? Math.round((collectedTotal / invoicedTotal) * 100) : 0;

  const lawyerCount = Math.max(1, new Set(cases.map((c) => c.assignedTo).filter(Boolean)).size);
  const revenuePerLawyer = Math.round(collectedTotal / lawyerCount);

  const kpiTiles = [
    {
      label: "معدل كسب القضايا",
      value: `${winPct}%`,
      icon: "⚖",
      accent: "success" as const,
      trend: { v: "+4%", up: true },
      hint: `${closed.length} مغلقة من ${cases.length}`,
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
      hint: "تقييمات العملاء",
    },
    {
      label: "الإيراد لكل محامٍ",
      value: revenuePerLawyer >= 1000 ? `${Math.round(revenuePerLawyer / 1000)}K` : `${revenuePerLawyer}`,
      icon: "💼",
      accent: "brand" as const,
      trend: { v: "+12%", up: true },
      hint: `موزّع على ${lawyerCount} محامين · ر.س`,
    },
    {
      label: "نسبة التحصيل",
      value: `${collectPct}%`,
      icon: "💰",
      accent: "accent" as const,
      trend: { v: collectPct >= 70 ? "+3%" : "-3%", up: collectPct >= 70 },
      hint: "من إجمالي الفواتير المستحقة",
    },
    {
      label: "القضايا النشطة",
      value: active.length,
      icon: "📂",
      accent: "info" as const,
      trend: { v: "+8", up: true },
      hint: `موزّعة على ${Math.max(1, users.length)} مستخدمين`,
    },
  ];

  const progressMetrics = [
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
      pct: collectPct,
      accent: "var(--accent)",
      detail: `${Math.round(collectedTotal / 1000)}K من ${Math.round(invoicedTotal / 1000)}K ر.س`,
    },
  ];

  // win rate per court — computed from live cases
  const byCourt = new Map<string, { cases: number; won: number }>();
  for (const c of cases) {
    const key = c.court || "غير محدد";
    const e = byCourt.get(key) ?? { cases: 0, won: 0 };
    e.cases += 1;
    if (c.status === "مغلق") e.won += 1;
    byCourt.set(key, e);
  }
  const courtBreakdown = [...byCourt.entries()]
    .sort((a, b) => b[1].cases - a[1].cases)
    .slice(0, 6)
    .map(([court, v], i) => ({
      court,
      cases: v.cases,
      pct: v.cases ? Math.round((v.won / v.cases) * 100) : 0,
      accent: COURT_ACCENTS[i % COURT_ACCENTS.length],
    }));

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
          {kpiTiles.map((k) => (
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
          {progressMetrics.map((m) => (
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
                {courtBreakdown.map((c) => (
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
                            style={{ width: `${c.pct}%`, background: c.accent }}
                          />
                        </div>
                        <span
                          className="num font-bold w-12 text-left shrink-0"
                          dir="ltr"
                          style={{ color: c.accent }}
                        >
                          {c.pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-[var(--text-faint)] mt-3">
            تُحدَّث المؤشرات تلقائيًا مع كل قضية مُغلقة.
          </p>
        </div>
      </main>
    </>
  );
}
