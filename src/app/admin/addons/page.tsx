"use client";

import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { useAdminData } from "@/hooks/useAdminData";
import { fetchAdminTenants } from "@/lib/data/queries";
import type { AdminTenantRow } from "@/lib/data/types";
import { ADDONS, CATEGORIES } from "@/data/pricing";
import { ADMIN_TENANTS } from "@/data/admin-mock";

// Demo fallback — shaped like AdminTenantRow (no addon data in the mock).
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

/**
 * Platform-admin view of every addon: adoption + revenue.
 * LIVE: adoption counted from real tenants' enabled_addons.
 * DEMO: deterministic fake adoption so the showcase looks alive.
 */
export default function AdminAddonsPage() {
  const { data: tenants, isLive } = useAdminData(fetchAdminTenants, FALLBACK_TENANTS);
  const byCat = CATEGORIES.slice().sort((a, b) => a.order - b.order);

  const demoAdoption = (key: string) => {
    let h = 0;
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) % 97;
    return Math.max(1, Math.round((h / 97) * Math.max(1, tenants.length)));
  };

  const liveAdoption = (key: string) =>
    tenants.filter((t) => t.enabledAddons.includes(key)).length;

  const adoption = (key: string) => (isLive ? liveAdoption(key) : demoAdoption(key));
  const totalTenants = Math.max(1, tenants.length);

  return (
    <>
      <Topbar title="إدارة الإضافات" breadcrumb={["Admin", "الإضافات"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="إدارة الإضافات"
          sub={`${ADDONS.length} إضافة عبر ${CATEGORIES.length} فئة — فعّل أو عطّل لأي مكتب`}
        />

        <div className="space-y-6">
          {byCat.map((cat) => {
            const items = ADDONS.filter((a) => a.category === cat.key && a.price_monthly_sar > 0);
            if (!items.length) return null;
            return (
              <div key={cat.key}>
                <div className="flex items-center gap-2 mb-3">
                  <span>{cat.icon}</span>
                  <span className="font-bold text-sm">{cat.label_ar}</span>
                  <span className="text-[10px] text-[var(--text-faint)]">({items.length})</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((a) => {
                    const users = adoption(a.key);
                    const pct = Math.round((users / totalTenants) * 100);
                    return (
                      <div key={a.key} className="card">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="font-bold text-sm">{a.name_ar}</div>
                          <div className="font-mono text-[var(--brand)] text-xs num shrink-0">
                            {a.price_monthly_sar} ر.س
                          </div>
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-3">
                          {a.description_ar}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[var(--text-faint)] mb-1.5">
                          <span>التبني: {users} مكتب</span>
                          <span className="num">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--brand)] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
