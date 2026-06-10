"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { GrantFeatureDialog } from "./GrantFeatureDialog";

interface Props {
  tenantSlug: string;
  tenantName: string;
  status: string;
  /** compact = icon row for list rows; full = labeled buttons for detail page */
  variant?: "compact" | "full";
}

type Action = {
  key: string;
  label: string;
  icon: string;
  danger?: "caution" | "destructive";
  confirm?: { title: string; body: string; typed?: string };
};

export function TenantControls({ tenantSlug, tenantName, status, variant = "full" }: Props) {
  const { toast } = useToast();
  const [grantOpen, setGrantOpen] = useState(false);
  const [confirm, setConfirm] = useState<Action | null>(null);
  const [typed, setTyped] = useState("");
  const suspended = status === "موقوف";

  const actions: Action[] = [
    { key: "upgrade", label: "ترقية الباقة", icon: "⬆", danger: "caution" },
    { key: "impersonate", label: "الدخول كـ المكتب", icon: "🕵", danger: "caution",
      confirm: { title: "الدخول كـ هذا المكتب؟", body: `ستدخل حساب ${tenantName} برؤية كاملة. يُسجَّل هذا الإجراء في سجل التدقيق.` } },
    suspended
      ? { key: "reactivate", label: "إعادة التفعيل", icon: "✅" }
      : { key: "suspend", label: "تعليق المكتب", icon: "⏸", danger: "caution",
          confirm: { title: "تعليق المكتب؟", body: `سيُمنع ${tenantName} وكل مستخدميه من الدخول حتى تعيد التفعيل. البيانات تبقى سليمة.` } },
    { key: "message", label: "إرسال رسالة", icon: "✉" },
    { key: "delete", label: "حذف المكتب", icon: "🗑", danger: "destructive",
      confirm: { title: "حذف المكتب نهائياً؟", body: `سيُحذف ${tenantName} وكل بياناته. تُحفظ نسخة قابلة للاسترجاع 90 يوماً (PDPL) ثم تُمحى. اكتب اسم النطاق للتأكيد.`, typed: tenantSlug } },
  ];

  function run(a: Action) {
    if (a.confirm) {
      setConfirm(a);
      setTyped("");
      return;
    }
    fire(a);
  }

  function fire(a: Action) {
    // No backend yet — confirm visually. Production: POST /api/admin/tenants/:slug/:action
    // eslint-disable-next-line no-console
    console.log("[tenant-action]", a.key, tenantSlug);
    const msgs: Record<string, string> = {
      upgrade: `افتح ترقية باقة ${tenantName}`,
      impersonate: `دخول كـ ${tenantName} (سُجّل في التدقيق)`,
      reactivate: `تم إعادة تفعيل ${tenantName}`,
      suspend: `تم تعليق ${tenantName}`,
      message: `فتح مراسلة ${tenantName}`,
      delete: `تم جدولة حذف ${tenantName} (قابل للاسترجاع 90 يوم)`,
    };
    toast(msgs[a.key] || "تم", a.key === "delete" || a.key === "suspend" ? "warn" : "success");
    setConfirm(null);
  }

  return (
    <>
      {variant === "compact" ? (
        <div className="flex items-center gap-1">
          <button onClick={() => setGrantOpen(true)} title="منح ميزة"
            className="w-8 h-8 rounded-lg grid place-items-center hover:bg-[var(--bg-hover)]">🎁</button>
          <Link href={`/admin/tenants/${tenantSlug}`} title="التفاصيل"
            className="w-8 h-8 rounded-lg grid place-items-center hover:bg-[var(--bg-hover)] text-[var(--brand)]">⋯</Link>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setGrantOpen(true)} className="btn btn-brand text-sm py-2.5">
            🎁 منح ميزة / ترقية
          </button>
          {actions.map((a) => (
            <button
              key={a.key}
              onClick={() => run(a)}
              className={`btn text-sm py-2.5 ${
                a.danger === "destructive"
                  ? "btn-ghost border-[var(--danger)]/40 text-[var(--danger)] hover:bg-[var(--danger)]/10"
                  : "btn-ghost"
              }`}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      )}

      <GrantFeatureDialog open={grantOpen} onClose={() => setGrantOpen(false)} tenantSlug={tenantSlug} />

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.confirm?.title}
        size="sm"
        footer={
          <>
            <button onClick={() => setConfirm(null)} className="btn btn-ghost text-sm py-2.5">تراجع</button>
            <button
              onClick={() => confirm && fire(confirm)}
              disabled={!!confirm?.confirm?.typed && typed.trim() !== confirm.confirm.typed}
              className={`btn text-sm py-2.5 disabled:opacity-40 ${
                confirm?.danger === "destructive"
                  ? "btn-ghost border-[var(--danger)] text-[var(--danger)]"
                  : "btn-brand"
              }`}
            >
              تأكيد
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{confirm?.confirm?.body}</p>
        {confirm?.confirm?.typed && (
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={confirm.confirm.typed}
            dir="ltr"
            className="w-full mt-3 px-3 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--danger)] text-sm font-mono text-center"
          />
        )}
      </Modal>
    </>
  );
}
