"use client";

import { useMemo } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { useAdminData } from "@/hooks/useAdminData";
import {
  fetchAdminGrants, fetchAdminPayments, fetchAdminTenants,
} from "@/lib/data/queries";
import type {
  AdminGrantRow, AdminPaymentRow, AdminTenantRow,
} from "@/lib/data/types";

interface LogRow {
  id: string | number;
  ts: string;
  actor: string;
  action: string;
  detail: string;
  ip: string;
  level: string;
}

const DEMO_LOGS: LogRow[] = [
  { id: 1, ts: "2026-06-10 13:42", actor: "demo-firm", action: "signup", detail: "اشترك في تجربة الأساس", ip: "188.55.x.x", level: "info" },
  { id: 2, ts: "2026-06-10 12:18", actor: "alfaisal", action: "addon.enable", detail: "فعّل إضافة المذكرات", ip: "212.12.x.x", level: "info" },
  { id: 3, ts: "2026-06-10 11:05", actor: "raed", action: "payment.success", detail: "دفع 499 ر.س — تجديد شهري", ip: "94.97.x.x", level: "success" },
  { id: 4, ts: "2026-06-10 09:30", actor: "alshammari", action: "payment.failed", detail: "فشل خصم البطاقة — رصيد غير كافٍ", ip: "37.18.x.x", level: "warn" },
  { id: 5, ts: "2026-06-09 22:14", actor: "platform", action: "auth.login", detail: "دخول لوحة الإدارة عبر Google", ip: "94.97.x.x", level: "info" },
  { id: 6, ts: "2026-06-09 18:50", actor: "alqahtani", action: "user.invite", detail: "دعا محامياً جديداً للحساب", ip: "176.44.x.x", level: "info" },
  { id: 7, ts: "2026-06-09 16:00", actor: "alqahtani", action: "addon.cancel", detail: "ألغى إضافة المساعد الذكي", ip: "176.44.x.x", level: "warn" },
  { id: 8, ts: "2026-06-09 14:32", actor: "khoury", action: "case.create", detail: "أنشأ قضية جديدة 2026/0512", ip: "5.42.x.x", level: "info" },
];

const LEVEL_COLOR: Record<string, string> = {
  info: "var(--info)",
  success: "var(--success)",
  warn: "var(--warn)",
  danger: "var(--danger)",
};

export default function AdminLogsPage() {
  // LIVE: the activity stream is synthesized from real platform events
  // (grants + payments + signups). DEMO: curated sample rows.
  const { data: grants, isLive } = useAdminData<AdminGrantRow>(fetchAdminGrants, []);
  const { data: payments } = useAdminData<AdminPaymentRow>(fetchAdminPayments, []);
  const { data: tenants } = useAdminData<AdminTenantRow>(fetchAdminTenants, []);

  const logs = useMemo<LogRow[]>(() => {
    if (!isLive) return DEMO_LOGS;
    const names = new Map(tenants.map((t) => [t.id, t.slug]));
    const rows: LogRow[] = [];
    for (const t of tenants) {
      rows.push({
        id: `t-${t.id}`, ts: t.createdAt, actor: t.slug, action: "signup",
        detail: `سجّل مكتب «${t.name}» في المنصة`, ip: "—", level: "info",
      });
    }
    for (const g of grants) {
      rows.push({
        id: `g-${g.id}`, ts: g.startsAt, actor: names.get(g.tenantId) ?? "—",
        action: "grant." + g.grantType,
        detail: `منحة: ${g.label}${g.expiresAt ? ` (حتى ${g.expiresAt})` : ""}`,
        ip: "—", level: "success",
      });
    }
    for (const p of payments) {
      rows.push({
        id: `p-${p.id}`, ts: p.paidAt ?? p.createdAt, actor: names.get(p.tenantId) ?? "—",
        action: p.status === "paid" ? "payment.success" : `payment.${p.status}`,
        detail: `${p.paymentType} — ${p.amount.toLocaleString()} ر.س`,
        ip: "—", level: p.status === "paid" ? "success" : "warn",
      });
    }
    return rows.sort((a, b) => (a.ts < b.ts ? 1 : -1)).slice(0, 30);
  }, [isLive, grants, payments, tenants]);

  return (
    <>
      <Topbar title="سجل النشاط" breadcrumb={["Admin", "السجل"]} />
      <main className="p-4 sm:p-6 max-w-5xl w-full">
        <PageHeader
          title="سجل النشاط"
          sub="// كل حدث في المنصة — append-only، للمراجعة والتدقيق"
          actions={<button className="btn btn-ghost text-sm py-2.5">📥 تصدير</button>}
        />

        <div className="space-y-2">
          {logs.map((l) => (
            <div
              key={l.id}
              className="card !p-3 flex items-start gap-3 hover:border-[var(--border-strong)]"
            >
              <span
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{ background: LEVEL_COLOR[l.level] ?? "var(--info)" }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-0.5">
                  <span className="font-bold text-sm">{l.actor}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-muted)]" dir="ltr">
                    {l.action}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">{l.detail}</div>
              </div>
              <div className="text-left shrink-0">
                <div className="text-[10px] text-[var(--text-faint)] font-mono" dir="ltr">{l.ts}</div>
                <div className="text-[10px] text-[var(--text-faint)] font-mono" dir="ltr">{l.ip}</div>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="card text-center text-sm text-[var(--text-muted)] py-10">
              لا أحداث مسجّلة بعد.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
