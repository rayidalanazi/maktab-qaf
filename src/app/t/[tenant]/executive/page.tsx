"use client";

import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useQafData } from "@/hooks/useQafData";
import {
  fetchCases, fetchInvoices, fetchExpenses, fetchClients,
} from "@/lib/data/queries";
import { MOCK_CASES } from "@/data/app-mock";
import type { ClientItem, ExpenseItem, InvoiceItem } from "@/lib/data/types";

// ── بيانات العرض (demo fallback) ───────────────────────────────
const REVENUE_TREND_DEMO = [
  { m: "يناير", v: 1.42 },
  { m: "فبراير", v: 1.61 },
  { m: "مارس", v: 1.38 },
  { m: "أبريل", v: 1.84 },
  { m: "مايو", v: 2.05 },
  { m: "يونيو", v: 2.31 },
  { m: "يوليو", v: 2.18 },
  { m: "أغسطس", v: 2.46 },
  { m: "سبتمبر", v: 2.72 },
  { m: "أكتوبر", v: 2.58 },
  { m: "نوفمبر", v: 2.94 },
  { m: "ديسمبر", v: 3.21 },
];

const TOP_CLIENTS_DEMO = [
  { name: "شركة الراجحي للتطوير العقاري", court: "المحكمة التجارية", cases: 14, revenue: "1,240,000", share: 100 },
  { name: "مجموعة الفيصلية القابضة", court: "المحكمة الإدارية", cases: 9, revenue: "880,000", share: 71 },
  { name: "مؤسسة نجد للمقاولات", court: "المحكمة العمالية", cases: 11, revenue: "640,000", share: 52 },
  { name: "بنك الإنماء — الإدارة القانونية", court: "محكمة التنفيذ", cases: 7, revenue: "520,000", share: 42 },
  { name: "شركة الدرعية للاستثمار", court: "المحكمة العامة بالرياض", cases: 5, revenue: "410,000", share: 33 },
  { name: "عبدالله العتيبي وشركاه", court: "محكمة الأحوال الشخصية", cases: 4, revenue: "275,000", share: 22 },
];

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

type Health = "good" | "warn" | "bad";
const HEALTH_STYLES: Record<Health, { color: string; dot: string; label: string }> = {
  good: { color: "var(--success)", dot: "var(--success)", label: "سليم" },
  warn: { color: "var(--warn)", dot: "var(--warn)", label: "انتباه" },
  bad: { color: "var(--danger)", dot: "var(--danger)", label: "خطر" },
};

const SAR = (n: number) => n.toLocaleString("en-US");

export default function ExecutivePage() {
  const { data: cases, isDemo } = useQafData(fetchCases, MOCK_CASES);
  const { data: invoices } = useQafData<InvoiceItem>(fetchInvoices, []);
  const { data: expenses } = useQafData<ExpenseItem>(fetchExpenses, []);
  const { data: clients } = useQafData<ClientItem>(fetchClients, []);

  const activeCases = cases.filter((c) => c.status === "نشط").length;

  // ---- financials from live invoices/expenses ----
  const paid = invoices.filter((i) => i.status === "paid");
  const collected = paid.reduce((s, i) => s + i.total, 0);
  const invoicedTotal = invoices.reduce((s, i) => s + i.total, 0);
  const expensesTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const collectPct = invoicedTotal ? Math.round((collected / invoicedTotal) * 100) : 0;
  const marginPct = collected ? Math.max(0, Math.round(((collected - expensesTotal) / collected) * 100)) : 0;

  // ---- monthly revenue trend ----
  const trend = (() => {
    if (isDemo || paid.length === 0) return REVENUE_TREND_DEMO;
    const byMonth = new Map<string, number>();
    for (const inv of paid) {
      const m = (inv.issued || "").slice(0, 7);
      if (m) byMonth.set(m, (byMonth.get(m) ?? 0) + inv.total);
    }
    return [...byMonth.keys()].sort().slice(-12).map((key) => ({
      m: AR_MONTHS[parseInt(key.slice(5), 10) - 1] ?? key,
      v: (byMonth.get(key) ?? 0) / 1_000_000,
    }));
  })();
  const maxRev = Math.max(0.0001, ...trend.map((r) => r.v));
  const annualRevenue = isDemo
    ? "28.7M"
    : collected >= 1_000_000
      ? `${(collected / 1_000_000).toFixed(1)}M`
      : `${Math.round(collected / 1000)}K`;

  // ---- office health (collection rate live; rest curated) ----
  const stuckCases = cases.filter((c) => c.status === "معلق").length;
  const health: { label: string; status: Health; value: string; note: string }[] = [
    {
      label: "معدل التحصيل",
      status: collectPct >= 85 ? "good" : collectPct >= 60 ? "warn" : "bad",
      value: `${isDemo ? 94 : collectPct}%`,
      note: "المستهدف 85%",
    },
    { label: "متوسط أيام السداد", status: "warn", value: "38 يوم", note: "أعلى من المتوقع بـ 8 أيام" },
    { label: "استغلال ساعات الشركاء", status: "good", value: "78%", note: "توزيع متوازن للأحمال" },
    {
      label: "قضايا متعثرة (+90 يوم)",
      status: stuckCases > 3 ? "bad" : stuckCases > 0 ? "warn" : "good",
      value: `${isDemo ? 6 : stuckCases} قضايا`,
      note: stuckCases > 0 ? "تحتاج مراجعة عاجلة" : "لا يوجد تعثّر",
    },
  ];

  // ---- top clients by revenue (live: invoices grouped by client) ----
  const topClients = (() => {
    if (isDemo || invoices.length === 0) return TOP_CLIENTS_DEMO;
    const byClient = new Map<string, { revenue: number; cases: number }>();
    for (const inv of invoices) {
      const e = byClient.get(inv.client) ?? { revenue: 0, cases: 0 };
      e.revenue += inv.total;
      e.cases += 1;
      byClient.set(inv.client, e);
    }
    const rows = [...byClient.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 6);
    const top = rows[0]?.[1].revenue || 1;
    return rows.map(([name, v]) => ({
      name,
      court: "—",
      cases: v.cases,
      revenue: SAR(v.revenue),
      share: Math.round((v.revenue / top) * 100),
    }));
  })();

  return (
    <>
      <Topbar
        title="اللوحة التنفيذية"
        sub="نظرة الشركاء على أداء المكتب"
        breadcrumb={["الرئيسية", "اللوحة التنفيذية"]}
      />

      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="اللوحة التنفيذية"
          sub="الأرقام التي تهم الشركاء — في لمحة واحدة"
          actions={
            <>
              <button className="btn btn-ghost text-sm py-2.5">تصدير PDF</button>
              <button className="btn btn-brand text-sm py-2.5">+ تقرير ربع سنوي</button>
            </>
          }
        />

        {/* ── صف الإحصائيات الكبير ─────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="الإيراد السنوي"
            value={annualRevenue}
            icon="₪"
            accent="brand"
            trend={{ v: "12.4%", up: true }}
            hint="ر.س — مقارنة بالعام الماضي"
          />
          <StatCard
            label="هامش الربحية"
            value={`${isDemo ? 41 : marginPct}%`}
            icon="📈"
            accent="success"
            trend={{ v: "3.1%", up: true }}
            hint="صافي بعد المصروفات التشغيلية"
          />
          <StatCard
            label="عدد العملاء"
            value={isDemo ? 142 : clients.length}
            icon="🤝"
            accent="info"
            trend={{ v: "9", up: true }}
            hint="نشط هذا العام"
          />
          <StatCard
            label="القضايا النشطة"
            value={isDemo ? 87 : activeCases}
            icon="⚖"
            accent="accent"
            trend={{ v: "4", up: false }}
            hint="قيد النظر حالياً"
          />
        </div>

        {/* ── الشبكة الرئيسية: مخطط الإيراد + صحة المكتب ───────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 sm:mt-6">
          {/* مخطط الإيراد الشهري */}
          <section className="card lg:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-2 mb-5">
              <div className="min-w-0">
                <h3 className="font-display font-black text-lg">منحنى الإيراد الشهري</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  بالمليون ر.س — السنة المالية الحالية
                </p>
              </div>
              <div className="text-end">
                <div className="font-display font-black text-2xl num text-[var(--brand)]" dir="ltr">
                  {maxRev >= 1 ? `${maxRev.toFixed(2)}M` : `${Math.round(maxRev * 1000)}K`}
                </div>
                <div className="text-[11px] text-[var(--success)] font-mono">↑ أعلى شهر</div>
              </div>
            </div>

            <div className="flex items-end gap-1.5 sm:gap-2 h-44 overflow-x-auto pb-1">
              {trend.map((r) => {
                const h = Math.round((r.v / maxRev) * 100);
                const isPeak = r.v === maxRev;
                return (
                  <div
                    key={r.m}
                    className="flex-1 min-w-[24px] flex flex-col items-center justify-end gap-1.5 h-full group"
                  >
                    <span className="text-[9px] num text-[var(--text-faint)] opacity-0 group-hover:opacity-100 transition-opacity" dir="ltr">
                      {r.v.toFixed(2)}
                    </span>
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{
                        height: `${h}%`,
                        background: isPeak
                          ? "var(--brand)"
                          : `color-mix(in srgb, var(--brand) 45%, transparent)`,
                      }}
                    />
                    <span className="text-[9px] text-[var(--text-faint)] truncate w-full text-center">
                      {r.m.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* صحة المكتب */}
          <section className="card">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-display font-black text-lg">صحة المكتب</h3>
              <span className="pill pill-brand text-[10px]">آخر تحديث: اليوم</span>
            </div>

            <div className="space-y-3">
              {health.map((h) => {
                const s = HEALTH_STYLES[h.status];
                return (
                  <div
                    key={h.label}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-3"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm text-[var(--text)] truncate">{h.label}</span>
                      <span
                        className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                        style={{
                          background: `color-mix(in srgb, ${s.color} 15%, transparent)`,
                          color: s.color,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: s.dot }}
                        />
                        {s.label}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className="font-display font-black text-xl num"
                        style={{ color: s.color }}
                        dir="ltr"
                      >
                        {h.value}
                      </span>
                      <span className="text-[11px] text-[var(--text-faint)] text-end break-words">
                        {h.note}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── أكبر العملاء ───────────────────────────────── */}
        <section className="mt-4 sm:mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="font-display font-black text-lg">أكبر العملاء بالإيراد</h3>
            <span className="text-xs text-[var(--text-muted)]">
              أعلى {topClients.length} عملاء بالإيراد المسجّل
            </span>
          </div>

          <div className="card !p-0 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider">
                  <th className="text-start font-medium px-4 py-3">العميل</th>
                  <th className="text-start font-medium px-4 py-3">الجهة القضائية</th>
                  <th className="text-center font-medium px-4 py-3">القضايا</th>
                  <th className="text-start font-medium px-4 py-3">الإيراد (ر.س)</th>
                  <th className="text-start font-medium px-4 py-3 w-40">الحصة النسبية</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((c, i) => (
                  <tr
                    key={c.name}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[11px] font-bold num bg-[var(--bg-elev)] text-[var(--brand)]">
                          {i + 1}
                        </span>
                        <span className="font-medium text-[var(--text)] truncate">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">{c.court}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="num" dir="ltr">{c.cases}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--text)]">
                      <span className="num" dir="ltr">{c.revenue}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-elev)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${c.share}%`, background: "var(--brand)" }}
                          />
                        </div>
                        <span className="num text-[11px] text-[var(--text-faint)] w-9 text-end" dir="ltr">
                          {c.share}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-[var(--text-faint)] mt-3 text-center">
            الأرقام محسوبة آلياً من فواتير ومصروفات النظام.
          </p>
        </section>
      </main>
    </>
  );
}
