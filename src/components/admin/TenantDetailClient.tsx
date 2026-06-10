"use client";

import { useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/app/Topbar";
import { StatCard } from "@/components/app/StatCard";
import { TenantControls } from "./TenantControls";
import { UserActions } from "./UserActions";
import { ADDONS } from "@/data/pricing";
import type { AdminUser, AdminGrant } from "@/data/admin-mock";

interface TenantData {
  slug: string;
  name: string;
  plan: string;
  status: string;
  mrr: number;
  users: number;
  signedUp: string;
  lastActive: string;
  trial: boolean;
}

interface Props {
  tenant: TenantData;
  users: AdminUser[];
  addonKeys: string[];
  grants: AdminGrant[];
  activity: { ts: string; text: string; ic: string }[];
}

const TABS = [
  { key: "overview", label: "نظرة عامة" },
  { key: "users", label: "المستخدمون" },
  { key: "addons", label: "الإضافات" },
  { key: "grants", label: "المنح" },
  { key: "activity", label: "النشاط" },
];

const STATUS_COLOR: Record<string, string> = {
  "نشط": "var(--success)",
  "تجربة": "var(--info)",
  "متأخر دفع": "var(--accent)",
  "موقوف": "var(--text-faint)",
};

export function TenantDetailClient({ tenant, users, addonKeys, grants, activity }: Props) {
  const [tab, setTab] = useState("overview");
  const enabledAddons = ADDONS.filter((a) => addonKeys.includes(a.key));
  const allPaidAddons = ADDONS.filter((a) => a.price_monthly_sar > 0);

  return (
    <>
      <Topbar title={tenant.name} breadcrumb={["Admin", "المكاتب", tenant.name]} />
      <main className="p-4 sm:p-6 max-w-6xl w-full">
        {/* Header card */}
        <div className="card mb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-14 h-14 rounded-2xl bg-[var(--brand)] text-black grid place-items-center font-display font-black text-2xl shrink-0">
                {tenant.name.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <h2 className="font-display font-black text-xl">{tenant.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-[var(--text-faint)]" dir="ltr">{tenant.slug}.qaf.sa</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `color-mix(in srgb, ${STATUS_COLOR[tenant.status]} 15%, transparent)`, color: STATUS_COLOR[tenant.status] }}>
                    ● {tenant.status}
                  </span>
                </div>
              </div>
            </div>
            <Link href={`/t/${tenant.slug}`} className="btn btn-ghost text-sm py-2.5">
              فتح التطبيق ↗
            </Link>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard label="الإيراد الشهري" value={tenant.mrr > 0 ? `${tenant.mrr}` : "—"} icon="💰" accent="brand" hint="ر.س / شهر" />
          <StatCard label="الباقة" value={tenant.plan} icon="📦" accent="info" />
          <StatCard label="المستخدمون" value={users.length} icon="👥" accent="accent" />
          <StatCard label="الإضافات المفعّلة" value={enabledAddons.length} icon="🧩" accent="success" />
        </div>

        {/* Controls */}
        <div className="card mb-5">
          <div className="text-xs font-mono text-[var(--text-faint)] mb-3">// إجراءات التحكّم</div>
          <TenantControls tenantSlug={tenant.slug} tenantName={tenant.name} status={tenant.status} variant="full" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-[var(--border)] overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key
                  ? "border-[var(--brand)] text-[var(--brand)] font-semibold"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview" && (
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { k: "تاريخ الاشتراك", v: tenant.signedUp, ltr: true },
              { k: "آخر نشاط", v: tenant.lastActive },
              { k: "الحالة", v: tenant.status },
              { k: "نوع الحساب", v: tenant.trial ? "تجربة مجانية" : "مدفوع" },
              { k: "النطاق", v: `${tenant.slug}.qaf.sa`, ltr: true },
              { k: "المنح النشطة", v: `${grants.length}` },
            ].map((r, i) => (
              <div key={i} className="card flex items-center justify-between !py-3">
                <span className="text-sm text-[var(--text-muted)]">{r.k}</span>
                <span className={`text-sm font-semibold ${r.ltr ? "font-mono" : ""}`} dir={r.ltr ? "ltr" : undefined}>{r.v}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="card !p-0 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] bg-[var(--bg-hover)] border-b border-[var(--border)]">
                <tr><th className="text-right p-3">المستخدم</th><th className="text-right p-3">الدور</th><th className="text-right p-3">آخر دخول</th><th className="text-right p-3">الحالة</th><th className="p-3"></th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--bg-hover)]">
                    <td className="p-3"><div className="font-bold text-xs">{u.name}</div><div className="text-[10px] text-[var(--text-faint)] font-mono" dir="ltr">{u.email}</div></td>
                    <td className="p-3 text-xs text-[var(--text-muted)]">{u.role}</td>
                    <td className="p-3 text-xs text-[var(--text-faint)]">{u.lastLogin}</td>
                    <td className="p-3 text-xs">{u.status}</td>
                    <td className="p-3"><UserActions userName={u.name} tenantName={tenant.name} status={u.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="p-8 text-center text-xs text-[var(--text-faint)]">// لا مستخدمون</div>}
          </div>
        )}

        {tab === "addons" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {allPaidAddons.map((a) => {
              const on = addonKeys.includes(a.key);
              return (
                <div key={a.key} className={`card !p-3 flex items-center justify-between gap-2 ${on ? "border-[var(--brand)]/40" : ""}`}>
                  <div className="min-w-0">
                    <div className="font-bold text-xs">{a.name_ar}</div>
                    <div className="text-[10px] text-[var(--text-faint)]">{a.price_monthly_sar} ر.س/شهر</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${on ? "bg-[var(--brand)]/15 text-[var(--brand)]" : "bg-[var(--bg-hover)] text-[var(--text-faint)]"}`}>
                    {on ? "مفعّلة" : "معطّلة"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {tab === "grants" && (
          <div className="space-y-2">
            {grants.length === 0 && <div className="card text-center text-xs text-[var(--text-faint)]">// لا منح نشطة — استخدم زر «منح ميزة» بالأعلى</div>}
            {grants.map((g) => (
              <div key={g.id} className="card !p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-sm">{g.label}</div>
                  <div className="text-[10px] text-[var(--text-faint)]">{g.reason}</div>
                </div>
                <div className="text-left">
                  <div className="text-xs num" style={{ color: g.daysLeft !== null && g.daysLeft <= 3 ? "var(--warn)" : undefined }}>
                    {g.daysLeft === null ? "دائم" : `${g.daysLeft} يوم متبقٍ`}
                  </div>
                  <div className="text-[10px] text-[var(--text-faint)]">{g.autoConvert ? "↻ تتحوّل لمدفوعة" : "تنتهي"}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "activity" && (
          <div className="card">
            {activity.length === 0 && <div className="text-center text-xs text-[var(--text-faint)] py-6">// لا نشاط مسجّل</div>}
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg shrink-0">{a.ic}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{a.text}</div>
                    <div className="text-[10px] text-[var(--text-faint)] font-mono">{a.ts}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
