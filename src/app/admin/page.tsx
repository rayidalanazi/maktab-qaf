"use client";

import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useAdminData } from "@/hooks/useAdminData";
import {
  fetchAdminTenants,
  fetchAdminUsers,
  fetchAdminPayments,
} from "@/lib/data/queries";
import type {
  AdminTenantRow,
  AdminUserRow,
  AdminPaymentRow,
} from "@/lib/data/types";
import {
  ADMIN_TENANTS,
  ADMIN_USERS,
  ADMIN_REVENUE_BY_MONTH,
  ADMIN_RECENT_EVENTS,
} from "@/data/admin-mock";

// Demo fallbacks — admin-mock arrays reshaped into the real admin row shapes.
const FALLBACK_TENANTS: AdminTenantRow[] = ADMIN_TENANTS.map((t) => ({
  id: String(t.id),
  slug: t.slug,
  name: t.name,
  plan: t.plan,
  status: t.trial
    ? "trialing"
    : t.status === "نشط"
      ? "active"
      : t.status === "متأخر دفع"
        ? "past_due"
        : "suspended",
  enabledAddons: [],
  trialEndsAt: null,
  createdAt: t.signedUp,
}));

const FALLBACK_USERS: AdminUserRow[] = ADMIN_USERS.map((u) => ({
  id: String(u.id),
  name: u.name,
  email: u.email,
  role: u.roleKey,
  status: u.status === "نشط" ? "active" : u.status === "معطل" ? "disabled" : "invited",
  tenantId: u.tenantSlug,
  lastSeen: u.lastLogin,
  createdAt: u.createdAt,
}));

const FALLBACK_PAYMENTS: AdminPaymentRow[] = ADMIN_TENANTS
  .filter((t) => t.mrr > 0)
  .map((t) => ({
    id: `pay-${t.id}`,
    tenantId: String(t.id),
    amount: t.mrr,
    status: "paid",
    paymentType: "subscription",
    paidAt: "2026-06-01",
    createdAt: "2026-06-01",
  }));

export default function AdminHome() {
  const { data: tenants } = useAdminData(fetchAdminTenants, FALLBACK_TENANTS);
  const { data: users } = useAdminData(fetchAdminUsers, FALLBACK_USERS);
  const { data: payments } = useAdminData(fetchAdminPayments, FALLBACK_PAYMENTS);

  const totalFirms = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === "active").length;
  const trialTenants = tenants.filter((t) => t.status === "trialing").length;
  const suspendedTenants = tenants.filter((t) => t.status === "suspended").length;
  const totalUsers = users.length;
  const totalMRR = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);
  const arr = totalMRR * 12;
  const last = ADMIN_REVENUE_BY_MONTH[ADMIN_REVENUE_BY_MONTH.length - 1];
  const prev = ADMIN_REVENUE_BY_MONTH[ADMIN_REVENUE_BY_MONTH.length - 2];
  const growth = (((last.mrr - prev.mrr) / prev.mrr) * 100).toFixed(1);

  return (
    <>
      <Topbar title="لوحة الإدارة" breadcrumb={["Admin"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="نظرة عامة"
          sub={`${totalFirms} مكتب • ${activeTenants} نشط • ${trialTenants} في التجربة • ${suspendedTenants} معلّق • ${totalUsers} مستخدم • ${(arr / 1000).toFixed(1)}K ر.س ARR`}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="MRR" value={`${totalMRR.toLocaleString()} ر.س`} icon="💰" accent="brand" trend={{ v: `${growth}%`, up: parseFloat(growth) > 0 }} hint="هذا الشهر" />
          <StatCard label="ARR" value={`${(arr / 1000).toFixed(0)}K`} icon="📈" accent="success" hint="معدل سنوي" />
          <StatCard label="مكاتب نشطة" value={activeTenants} icon="🏢" accent="info" trend={{ v: "+4", up: true }} hint="نمو الشهر" />
          <StatCard label="في التجربة" value={trialTenants} icon="🆕" accent="warn" hint="تحويل متوقع" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold">نمو MRR — آخر 6 أشهر</div>
                <div className="text-xs text-[var(--text-faint)]">// إذا الخط طلع، كل شي تمام</div>
              </div>
              <span className="text-xs text-[var(--brand)] font-mono">+{growth}%</span>
            </div>
            <div className="flex items-end gap-2 h-40">
              {ADMIN_REVENUE_BY_MONTH.map((m) => {
                const pct = (m.mrr / Math.max(...ADMIN_REVENUE_BY_MONTH.map((x) => x.mrr))) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[10px] text-[var(--text-faint)] font-mono">
                      {(m.mrr / 1000).toFixed(1)}K
                    </div>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-[var(--brand-deep)] to-[var(--brand)] min-h-[4px]"
                      style={{ height: `${pct}%` }}
                    />
                    <div className="text-[10px] text-[var(--text-faint)] font-mono">
                      2026-{m.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent events */}
          <div className="card">
            <div className="font-bold mb-3">آخر الأحداث</div>
            <div className="space-y-2.5">
              {ADMIN_RECENT_EVENTS.slice(0, 6).map((e) => (
                <div key={e.id} className="flex items-start gap-2.5">
                  <span className="text-lg shrink-0">{e.ic}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs">
                      <span className="font-bold">{e.tenant}</span>{" "}
                      <span className="text-[var(--text-muted)]">{e.desc}</span>
                    </div>
                    <div className="text-[10px] text-[var(--text-faint)] font-mono">{e.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
