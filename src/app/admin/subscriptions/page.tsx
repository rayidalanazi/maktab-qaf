"use client";

import { useMemo } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useAdminData } from "@/hooks/useAdminData";
import { fetchAdminTenants } from "@/lib/data/queries";
import type { AdminTenantRow } from "@/lib/data/types";
import { ADMIN_TENANTS } from "@/data/admin-mock";
import { getBundle } from "@/data/pricing";

type SubStatus = "نشط" | "معلّق" | "ملغى";
type Cycle = "شهري" | "سنوي";

interface Subscription {
  id: string;
  firm: string;
  plan: string;
  cycle: Cycle;
  price: number;
  startDate: string;
  renewDate: string;
  status: SubStatus;
}

const PLAN_KEY: Record<string, string> = {
  "الأساس": "bundle_base",
  "الأساس + إضافات": "bundle_base",
  "صغير": "bundle_small",
  "متوسط": "bundle_medium",
  "Enterprise": "bundle_enterprise",
};

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Demo fallback — كل مستأجر = اشتراك. Shaped like AdminTenantRow.
const FALLBACK_TENANTS: AdminTenantRow[] = ADMIN_TENANTS.map((t) => ({
  id: String(t.id),
  slug: t.slug,
  name: t.name,
  plan: PLAN_KEY[t.plan] ?? "bundle_base",
  status: t.status === "تجربة" ? "trialing" : t.status === "متأخر دفع" ? "past_due" : "active",
  enabledAddons: [],
  trialEndsAt: t.trial ? addDays(t.signedUp, 14) : null,
  createdAt: t.signedUp,
}));

const STATUS_AR: Record<string, SubStatus> = {
  active: "نشط",
  trialing: "نشط",
  past_due: "معلّق",
  suspended: "معلّق",
  cancelled: "ملغى",
};

const STATUS_COLOR: Record<SubStatus, string> = {
  "نشط": "var(--success)",
  "معلّق": "var(--warn)",
  "ملغى": "var(--danger)",
};

const FILTERS: { label: string; active: boolean }[] = [
  { label: "الكل", active: true },
  { label: "نشط", active: false },
  { label: "معلّق", active: false },
  { label: "ملغى", active: false },
];

export default function SubscriptionsPage() {
  const { data: tenants } = useAdminData(fetchAdminTenants, FALLBACK_TENANTS);

  const subscriptions = useMemo<Subscription[]>(
    () =>
      tenants.map((t): Subscription => {
        const bundle = getBundle(t.plan);
        return {
          id: t.slug,
          firm: t.name,
          plan: bundle?.name_ar ?? t.plan,
          cycle: "شهري",
          price: bundle?.price_monthly_sar ?? 0,
          startDate: t.createdAt,
          renewDate: t.trialEndsAt ?? "—",
          status: STATUS_AR[t.status] ?? "نشط",
        };
      }),
    [tenants],
  );

  // Monthly Recurring Revenue: normalize annual plans to a monthly figure, active only.
  const MRR = subscriptions.filter((s) => s.status === "نشط").reduce(
    (sum, s) => sum + (s.cycle === "سنوي" ? Math.round(s.price / 12) : s.price),
    0
  );

  const COUNTS = {
    active: subscriptions.filter((s) => s.status === "نشط").length,
    held: subscriptions.filter((s) => s.status === "معلّق").length,
    cancelled: subscriptions.filter((s) => s.status === "ملغى").length,
  };

  return (
    <>
      <Topbar title="الاشتراكات" breadcrumb={["Admin", "الاشتراكات"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="الاشتراكات"
          sub={`${subscriptions.length} اشتراك عبر كل المكاتب`}
          actions={<button className="btn btn-ghost text-sm py-2.5">📥 تصدير</button>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard
            label="اشتراكات نشطة"
            value={COUNTS.active}
            icon="✅"
            accent="success"
            trend={{ v: "+2", up: true }}
            hint="تجدّد تلقائيًا"
          />
          <StatCard
            label="معلّقة"
            value={COUNTS.held}
            icon="⏸️"
            accent="warn"
            hint="بانتظار الدفع"
          />
          <StatCard
            label="ملغاة"
            value={COUNTS.cancelled}
            icon="🚫"
            accent="accent"
            hint="آخر 90 يومًا"
          />
          <StatCard
            label="MRR — الإيراد الشهري المتكرر"
            value={`${MRR.toLocaleString("en-US")} ر.س`}
            icon="💰"
            accent="brand"
            trend={{ v: "+8%", up: true }}
            hint="بعد معادلة الباقات السنوية"
          />
        </div>

        {/* فلاتر الحالة — عرض فقط */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              className="pill text-xs py-1.5 px-3 transition-colors"
              style={
                f.active
                  ? {
                      background: `color-mix(in srgb, var(--brand) 15%, transparent)`,
                      color: "var(--brand)",
                      borderColor: "var(--brand)",
                    }
                  : undefined
              }
            >
              {f.label}
            </button>
          ))}
          <span className="text-[11px] text-[var(--text-faint)] ms-auto">
            تحديث: <span className="num" dir="ltr">2026-06-10</span>
          </span>
        </div>

        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] bg-[var(--bg-hover)] border-b border-[var(--border)]">
              <tr>
                <th className="text-right p-3">المكتب</th>
                <th className="text-right p-3">الباقة</th>
                <th className="text-right p-3">الدورة</th>
                <th className="text-right p-3">السعر</th>
                <th className="text-right p-3">تاريخ البدء</th>
                <th className="text-right p-3">التجديد القادم</th>
                <th className="text-right p-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {subscriptions.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-sm">{s.firm}</div>
                    <div className="text-[10px] text-[var(--text-faint)] font-mono" dir="ltr">
                      {s.id}
                    </div>
                  </td>
                  <td className="p-3 text-xs">{s.plan}</td>
                  <td className="p-3">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{
                        background:
                          s.cycle === "سنوي"
                            ? `color-mix(in srgb, var(--info) 14%, transparent)`
                            : `color-mix(in srgb, var(--text-faint) 14%, transparent)`,
                        color: s.cycle === "سنوي" ? "var(--info)" : "var(--text-muted)",
                      }}
                    >
                      {s.cycle}
                    </span>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="num" dir="ltr">
                      {s.price.toLocaleString("en-US")}
                    </span>{" "}
                    ر.س
                  </td>
                  <td className="p-3 text-xs text-[var(--text-muted)]">
                    <span className="num" dir="ltr">{s.startDate}</span>
                  </td>
                  <td className="p-3 text-xs">
                    <span
                      className="num"
                      dir="ltr"
                      style={{
                        color: s.status === "ملغى" ? "var(--text-faint)" : "var(--text)",
                      }}
                    >
                      {s.renewDate}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                      style={{
                        background: `color-mix(in srgb, ${STATUS_COLOR[s.status]} 15%, transparent)`,
                        color: STATUS_COLOR[s.status],
                      }}
                    >
                      ● {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
