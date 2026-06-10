"use client";

import { useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { GrantFeatureDialog } from "@/components/admin/GrantFeatureDialog";
import { ADMIN_GRANTS } from "@/data/admin-mock";

const STATUS_COLOR: Record<string, string> = {
  "نشط": "var(--success)",
  "قارب الانتهاء": "var(--warn)",
  "منتهٍ": "var(--text-faint)",
};

const TYPE_LABEL: Record<string, string> = {
  free_addon: "ميزة مجانية",
  free_upgrade: "ترقية مجانية",
  extended_trial: "تمديد تجربة",
  discount: "خصم",
  comp_seats: "مقاعد مجانية",
};

export default function AdminGrantsPage() {
  const [grantOpen, setGrantOpen] = useState(false);

  const active = ADMIN_GRANTS.filter((g) => g.status === "نشط").length;
  const expiring = ADMIN_GRANTS.filter((g) => g.status === "قارب الانتهاء").length;

  return (
    <>
      <Topbar title="المنح والعروض الترويجية" breadcrumb={["Admin", "المنح"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="المنح والعروض"
          sub="امنح أي مكتب ميزة جديدة مجاناً لفترة محددة — ثم تنتهي أو تتحوّل لمدفوعة"
          actions={
            <button onClick={() => setGrantOpen(true)} className="btn btn-brand text-sm py-2.5">
              🎁 منح جديد
            </button>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard label="منح نشطة" value={active} icon="🎁" accent="brand" />
          <StatCard label="قاربت الانتهاء" value={expiring} icon="⏳" accent="warn" hint="خلال أيام" />
          <StatCard label="إجمالي المنح" value={ADMIN_GRANTS.length} icon="📦" accent="info" />
          <StatCard label="ستتحوّل لمدفوعة" value={ADMIN_GRANTS.filter(g => g.autoConvert).length} icon="💰" accent="success" hint="عند الانتهاء" />
        </div>

        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] bg-[var(--bg-hover)] border-b border-[var(--border)]">
              <tr>
                <th className="text-right p-3">المكتب</th>
                <th className="text-right p-3">النوع</th>
                <th className="text-right p-3">الممنوح</th>
                <th className="text-right p-3">يبدأ</th>
                <th className="text-right p-3">ينتهي</th>
                <th className="text-right p-3">المتبقي</th>
                <th className="text-right p-3">عند الانتهاء</th>
                <th className="text-right p-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {ADMIN_GRANTS.map((g) => (
                <tr key={g.id} className="hover:bg-[var(--bg-hover)]">
                  <td className="p-3">
                    <Link href={`/admin/tenants/${g.tenantSlug}`} className="text-xs font-bold text-[var(--brand)] hover:underline">
                      {g.tenantName}
                    </Link>
                  </td>
                  <td className="p-3 text-xs text-[var(--text-muted)]">{TYPE_LABEL[g.type]}</td>
                  <td className="p-3 text-xs font-semibold">{g.label}</td>
                  <td className="p-3 text-xs font-mono text-[var(--text-faint)]" dir="ltr">{g.startsAt}</td>
                  <td className="p-3 text-xs font-mono text-[var(--text-faint)]" dir="ltr">{g.expiresAt || "دائم"}</td>
                  <td className="p-3 text-xs num">
                    {g.daysLeft === null ? "∞" : <span style={{ color: g.daysLeft <= 3 ? "var(--warn)" : undefined }}>{g.daysLeft} يوم</span>}
                  </td>
                  <td className="p-3 text-[10px]">
                    {g.autoConvert
                      ? <span className="text-[var(--success)]">↻ تتحوّل لمدفوعة</span>
                      : <span className="text-[var(--text-faint)]">تنتهي</span>}
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ background: `color-mix(in srgb, ${STATUS_COLOR[g.status]} 15%, transparent)`, color: STATUS_COLOR[g.status] }}>
                      ● {g.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-[11px] text-[var(--text-faint)] font-mono">
          // المنح القاربة على الانتهاء يصلك تذكير قبلها بـ 3 أيام — لتقرر التجديد أو التحويل لمدفوعة
        </div>
      </main>

      <GrantFeatureDialog open={grantOpen} onClose={() => setGrantOpen(false)} />
    </>
  );
}
