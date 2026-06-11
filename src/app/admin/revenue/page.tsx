"use client";

import { useMemo } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useAdminData } from "@/hooks/useAdminData";
import { fetchAdminTenants, fetchAdminPayments } from "@/lib/data/queries";
import type { AdminTenantRow, AdminPaymentRow } from "@/lib/data/types";
import { ADMIN_TENANTS, ADMIN_REVENUE_BY_MONTH } from "@/data/admin-mock";
import { getBundle } from "@/data/pricing";

// Demo fallback shaped like AdminTenantRow (plan key carries the demo MRR via name).
const FALLBACK_TENANTS: AdminTenantRow[] = ADMIN_TENANTS.map((t) => ({
  id: String(t.id),
  slug: t.slug,
  name: t.name,
  plan: t.plan,
  status: t.trial ? "trialing" : "active",
  enabledAddons: [],
  trialEndsAt: null,
  createdAt: t.signedUp,
}));

// Demo MRR lookup (the mock stores mrr per tenant; live derives from bundle price).
const DEMO_MRR = new Map(ADMIN_TENANTS.map((t) => [String(t.id), t.mrr]));
const DEMO_USERS = new Map(ADMIN_TENANTS.map((t) => [String(t.id), t.users]));

export default function AdminRevenuePage() {
  const { data: tenants, isLive } = useAdminData(fetchAdminTenants, FALLBACK_TENANTS);
  const { data: payments } = useAdminData<AdminPaymentRow>(fetchAdminPayments, []);

  // MRR per tenant: live = bundle monthly price (paying tenants only); demo = mock mrr.
  const rows = useMemo(
    () =>
      tenants.map((t) => {
        const mrr = isLive
          ? (t.status === "active" || t.status === "past_due"
              ? getBundle(t.plan)?.price_monthly_sar ?? 0
              : 0)
          : DEMO_MRR.get(t.id) ?? 0;
        return {
          id: t.id,
          name: t.name,
          plan: isLive ? (getBundle(t.plan)?.name_ar ?? t.plan) : t.plan,
          users: DEMO_USERS.get(t.id) ?? null,
          mrr,
        };
      }),
    [tenants, isLive],
  );

  const totalMRR = rows.reduce((s, t) => s + t.mrr, 0);
  const arr = totalMRR * 12;
  const payingCount = Math.max(1, rows.filter((t) => t.mrr > 0).length);
  const avgPerTenant = Math.round(totalMRR / payingCount);

  const byPlan = rows.reduce<Record<string, { count: number; mrr: number }>>((acc, t) => {
    const k = t.plan;
    acc[k] = acc[k] || { count: 0, mrr: 0 };
    acc[k].count += 1;
    acc[k].mrr += t.mrr;
    return acc;
  }, {});

  // Revenue trend: live = paid payments grouped by month; demo = mock series.
  const trend = useMemo(() => {
    if (!isLive || payments.length === 0) {
      return ADMIN_REVENUE_BY_MONTH.map((m) => ({ label: `2026-${m.month}`, mrr: m.mrr }));
    }
    const byMonth = new Map<string, number>();
    for (const p of payments) {
      if (p.status !== "paid") continue;
      const m = (p.paidAt ?? p.createdAt ?? "").slice(0, 7);
      if (m) byMonth.set(m, (byMonth.get(m) ?? 0) + p.amount);
    }
    return [...byMonth.keys()].sort().slice(-6).map((k) => ({
      label: k,
      mrr: byMonth.get(k) ?? 0,
    }));
  }, [payments, isLive]);
  const maxTrend = Math.max(1, ...trend.map((x) => x.mrr));

  return (
    <>
      <Topbar title="الإيرادات" breadcrumb={["Admin", "الإيرادات"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader title="الإيرادات والمالية" sub="// الأرقام اللي توضح ما تشتغل عبثاً" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="MRR" value={`${totalMRR.toLocaleString()}`} icon="💰" accent="brand" hint="ر.س / شهر" />
          <StatCard label="ARR" value={`${(arr / 1000).toFixed(0)}K`} icon="📈" accent="success" hint="ر.س / سنة" />
          <StatCard label="معدّل كل مكتب" value={avgPerTenant} icon="🧮" accent="info" hint="ر.س / شهر" />
          <StatCard label="معدل تحويل التجربة" value="68%" icon="🎯" accent="warn" hint="آخر 90 يوماً" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {/* Revenue trend */}
          <div className="card">
            <div className="font-bold mb-4">
              {isLive ? "المحصّل شهرياً — من ميسر" : "MRR — آخر 6 أشهر"}
            </div>
            <div className="space-y-2">
              {trend.map((m, i) => {
                const pct = (m.mrr / maxTrend) * 100;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-[10px] font-mono text-[var(--text-faint)] w-14" dir="ltr">
                      {m.label}
                    </div>
                    <div className="flex-1 h-6 bg-[var(--bg-hover)] rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-l from-[var(--brand)] to-[var(--brand-deep)] rounded flex items-center justify-end px-2 text-[10px] font-mono text-black font-bold"
                        style={{ width: `${pct}%` }}
                      >
                        {m.mrr.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
              {trend.length === 0 && (
                <div className="text-xs text-[var(--text-muted)] py-6 text-center">
                  لا مدفوعات مسجّلة بعد.
                </div>
              )}
            </div>
          </div>

          {/* By plan */}
          <div className="card">
            <div className="font-bold mb-4">توزيع الإيرادات حسب الباقة</div>
            <div className="space-y-3">
              {Object.entries(byPlan).map(([plan, data]) => {
                const pct = totalMRR > 0 ? (data.mrr / totalMRR) * 100 : 0;
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <span className="font-bold">{plan}</span>
                      <span className="font-mono text-[var(--text-muted)]">
                        {data.count} مكتب • {data.mrr.toLocaleString()} ر.س
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--brand)] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tenant revenue contribution */}
        <div className="card">
          <div className="font-bold mb-4">أعلى المكاتب مساهمة بـ MRR</div>
          <div className="space-y-2">
            {[...rows]
              .sort((a, b) => b.mrr - a.mrr)
              .slice(0, 5)
              .map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-hover)]">
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-[10px] text-[var(--text-faint)]">
                      {t.plan}{t.users != null ? ` • ${t.users} مستخدم` : ""}
                    </div>
                  </div>
                  <div className="font-mono font-bold num text-[var(--brand)]">{t.mrr} ر.س</div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </>
  );
}
