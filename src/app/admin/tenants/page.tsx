"use client";

import { Fragment, useState, type FormEvent } from "react";
import Link from "next/link";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { TenantControls } from "@/components/admin/TenantControls";
import { useAdminData } from "@/hooks/useAdminData";
import {
  fetchAdminTenants,
  grantFeature,
  setTenantPlan,
  setTenantStatus,
} from "@/lib/data/queries";
import type { AdminTenantRow } from "@/lib/data/types";
import { ADMIN_TENANTS, ADMIN_TENANT_ADDONS } from "@/data/admin-mock";
import { ADDONS, BUNDLES, getAddon, getBundle } from "@/data/pricing";

const STATUS_COLOR: Record<string, string> = {
  "نشط": "var(--success)",
  "تجربة": "var(--info)",
  "متأخر دفع": "var(--accent)",
  "موقوف": "var(--text-faint)",
};

/** Live (DB) status → the Arabic label the table already uses. */
const LIVE_STATUS_LABEL: Record<string, string> = {
  active: "نشط",
  trialing: "تجربة",
  past_due: "متأخر دفع",
  suspended: "موقوف",
  cancelled: "موقوف",
};

// Demo fallback — admin-mock tenants reshaped into the real AdminTenantRow shape.
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
  enabledAddons: ADMIN_TENANT_ADDONS[t.slug] ?? [],
  trialEndsAt: null,
  createdAt: t.signedUp,
}));

/** Display extras (MRR / users / lastActive / Arabic labels) for demo rows. */
const MOCK_BY_SLUG = new Map(ADMIN_TENANTS.map((t) => [t.slug, t]));

export default function AdminTenantsPage() {
  const { data: tenants, isLive, reload } = useAdminData(fetchAdminTenants, FALLBACK_TENANTS);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <Topbar title="المكاتب" sub="كل العملاء" breadcrumb={["Admin", "المكاتب"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="المكاتب المشتركة"
          sub={`${tenants.length} مكتب`}
          actions={
            <>
              <button className="btn btn-ghost text-sm py-2.5">📥 تصدير CSV</button>
              <button className="btn btn-brand text-sm py-2.5">+ إضافة يدوية</button>
            </>
          }
        />

        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] bg-[var(--bg-hover)] border-b border-[var(--border)]">
              <tr>
                <th className="text-right p-3">المكتب</th>
                <th className="text-right p-3">النطاق</th>
                <th className="text-right p-3">الباقة</th>
                <th className="text-right p-3">MRR</th>
                <th className="text-right p-3">المستخدمون</th>
                <th className="text-right p-3">الحالة</th>
                <th className="text-right p-3">آخر نشاط</th>
                <th className="text-right p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {tenants.map((t) => {
                const mock = MOCK_BY_SLUG.get(t.slug);
                const statusLabel = isLive
                  ? LIVE_STATUS_LABEL[t.status] ?? t.status
                  : mock?.status ?? LIVE_STATUS_LABEL[t.status] ?? t.status;
                const planLabel = isLive
                  ? getBundle(t.plan)?.name_ar ?? t.plan
                  : mock?.plan ?? t.plan;
                const statusColor = STATUS_COLOR[statusLabel] ?? "var(--text-faint)";
                return (
                  <Fragment key={t.id}>
                    <tr className="hover:bg-[var(--bg-hover)] transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-sm">{t.name}</div>
                        <div className="text-[10px] text-[var(--text-faint)] font-mono">
                          منذ {!isLive && mock ? mock.signedUp : t.createdAt}
                        </div>
                      </td>
                      <td className="p-3 text-xs font-mono text-[var(--text-muted)]" dir="ltr">
                        {t.slug}.qaf.sa
                      </td>
                      <td className="p-3 text-xs">{planLabel}</td>
                      <td className="p-3 text-xs font-mono num">
                        {!isLive && mock && mock.mrr > 0 ? `${mock.mrr} ر.س` : "—"}
                      </td>
                      <td className="p-3 text-xs num">{!isLive && mock ? mock.users : "—"}</td>
                      <td className="p-3">
                        <span
                          className="text-[10px] font-bold px-2 py-1 rounded-full"
                          style={{
                            background: `color-mix(in srgb, ${statusColor} 15%, transparent)`,
                            color: statusColor,
                          }}
                        >
                          ● {statusLabel}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-[var(--text-muted)]">
                        {!isLive && mock ? mock.lastActive : "—"}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 justify-end">
                          {isLive ? (
                            <button
                              onClick={() => setOpenId(openId === t.id ? null : t.id)}
                              className="text-[11px] text-[var(--brand)] hover:underline whitespace-nowrap"
                            >
                              {openId === t.id ? "إغلاق" : "التفاصيل"}
                            </button>
                          ) : (
                            <>
                              <Link
                                href={`/admin/tenants/${t.slug}`}
                                className="text-[11px] text-[var(--brand)] hover:underline whitespace-nowrap"
                              >
                                التفاصيل
                              </Link>
                              <TenantControls tenantSlug={t.slug} tenantName={t.name} status={statusLabel} variant="compact" />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isLive && openId === t.id && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <LiveTenantPanel tenant={t} onChanged={reload} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

/* ============================================================
   LIVE row detail panel — real controls hitting Supabase:
   grantFeature / setTenantPlan / setTenantStatus, then reload().
   ============================================================ */
function LiveTenantPanel({
  tenant,
  onChanged,
}: {
  tenant: AdminTenantRow;
  onChanged: () => void;
}) {
  const [addonKey, setAddonKey] = useState(ADDONS[0]?.key ?? "");
  const [label, setLabel] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [plan, setPlan] = useState(tenant.plan);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function run(key: string, fn: () => Promise<void>, doneMsg: string) {
    setBusy(key);
    setErr(null);
    setOk(null);
    try {
      await fn();
      setOk(doneMsg);
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  function submitGrant(e: FormEvent) {
    e.preventDefault();
    if (!addonKey) return;
    const addon = getAddon(addonKey);
    void run(
      "grant",
      () =>
        grantFeature({
          tenantId: tenant.id,
          addonKey,
          label: label.trim() || `${addon?.name_ar ?? addonKey} (مجاناً)`,
          expiresAt: expiresAt || null,
        }),
      "تم منح الميزة وتفعيلها على المكتب",
    );
  }

  const inputCls =
    "w-full px-2.5 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs outline-none focus:border-[var(--brand)]";

  return (
    <div className="p-4 bg-[var(--bg-hover)] border-t border-[var(--border)] space-y-4" dir="rtl">
      {/* Detail chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="pill">الباقة: {getBundle(tenant.plan)?.name_ar ?? tenant.plan}</span>
        <span className="pill">الحالة: {LIVE_STATUS_LABEL[tenant.status] ?? tenant.status}</span>
        <span className="pill">نهاية التجربة: {tenant.trialEndsAt ?? "—"}</span>
      </div>

      {/* Enabled addons */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] mb-1.5">
          الإضافات المفعّلة
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tenant.enabledAddons.length === 0 ? (
            <span className="text-xs text-[var(--text-muted)]">لا إضافات مفعّلة</span>
          ) : (
            tenant.enabledAddons.map((k) => (
              <span key={k} className="pill pill-brand text-[10px]">
                {getAddon(k)?.name_ar ?? k}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Live controls */}
      <div className="grid sm:grid-cols-3 gap-3">
        {/* (a) grant feature */}
        <form onSubmit={submitGrant} className="card !p-3 space-y-2">
          <div className="text-xs font-bold">🎁 منح ميزة</div>
          <select value={addonKey} onChange={(e) => setAddonKey(e.target.value)} className={inputCls}>
            {ADDONS.map((a) => (
              <option key={a.key} value={a.key}>
                {a.name_ar}
                {a.price_monthly_sar > 0 ? ` — ${a.price_monthly_sar} ر.س` : ""}
              </option>
            ))}
          </select>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="وصف المنحة (اختياري)"
            className={inputCls}
          />
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            dir="ltr"
            className={inputCls}
          />
          <button
            type="submit"
            disabled={busy !== null}
            className="btn btn-brand w-full text-xs py-2 disabled:opacity-40"
          >
            {busy === "grant" ? "جارٍ المنح..." : "منح الميزة"}
          </button>
        </form>

        {/* (b) plan */}
        <div className="card !p-3 space-y-2">
          <div className="text-xs font-bold">⬆ الباقة</div>
          <select value={plan} onChange={(e) => setPlan(e.target.value)} className={inputCls}>
            {BUNDLES.map((b) => (
              <option key={b.key} value={b.key}>
                {b.name_ar} — {b.price_monthly_sar} ر.س
              </option>
            ))}
          </select>
          <button
            onClick={() => void run("plan", () => setTenantPlan(tenant.id, plan), "تم تغيير الباقة")}
            disabled={busy !== null || plan === tenant.plan}
            className="btn btn-ghost w-full text-xs py-2 disabled:opacity-40"
          >
            {busy === "plan" ? "جارٍ الحفظ..." : "تغيير الباقة"}
          </button>
        </div>

        {/* (c) status */}
        <div className="card !p-3 space-y-2">
          <div className="text-xs font-bold">⏯ الحالة</div>
          <div className="flex gap-2">
            <button
              onClick={() => void run("activate", () => setTenantStatus(tenant.id, "active"), "تم تفعيل المكتب")}
              disabled={busy !== null || tenant.status === "active"}
              className="btn btn-brand flex-1 text-xs py-2 disabled:opacity-40"
            >
              {busy === "activate" ? "جارٍ التفعيل..." : "تفعيل"}
            </button>
            <button
              onClick={() => void run("suspend", () => setTenantStatus(tenant.id, "suspended"), "تم تعليق المكتب")}
              disabled={busy !== null || tenant.status === "suspended"}
              className="btn btn-ghost flex-1 text-xs py-2 border-[var(--danger)]/40 text-[var(--danger)] hover:bg-[var(--danger)]/10 disabled:opacity-40"
            >
              {busy === "suspend" ? "جارٍ التعليق..." : "تعليق"}
            </button>
          </div>
          <p className="text-[10px] text-[var(--text-faint)] font-mono">
            // التعليق يمنع دخول كل مستخدمي المكتب — البيانات تبقى سليمة
          </p>
        </div>
      </div>

      {(err || ok) && (
        <div className={`text-xs ${err ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
          {err ?? ok}
        </div>
      )}
    </div>
  );
}
