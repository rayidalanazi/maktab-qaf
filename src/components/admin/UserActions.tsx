"use client";

import { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface Props {
  userName: string;
  tenantName: string;
  status: string;
  /** LIVE mode: persists suspend/restore to the backend. Demo (undefined) stays local-only. */
  onSetStatus?: (status: "suspended" | "active") => Promise<void> | void;
}

const ROLES = [
  "مدير النظام", "مدير عام", "شريك", "مدير القضايا",
  "محامي", "مستشار", "محاسب", "مسوّق", "مدقق", "سكرتارية",
];

export function UserActions({ userName, tenantName, status, onSetStatus }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | { key: string; title: string; body: string; danger?: boolean }>(null);
  const ref = useRef<HTMLDivElement>(null);
  const disabled = status === "معطل";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function act(key: string, msg: string, kind: "success" | "warn" = "success") {
    // eslint-disable-next-line no-console
    console.log("[user-action]", key, userName);
    toast(msg, kind);
    setOpen(false);
    setConfirm(null);
  }

  /** Suspend/restore: persists via onSetStatus in LIVE mode, local-only toast in demo. */
  function setStatusAndToast(next: "suspended" | "active", key: string, msg: string, kind: "success" | "warn" = "success") {
    if (!onSetStatus) { act(key, msg, kind); return; }
    void Promise.resolve(onSetStatus(next))
      .then(() => act(key, msg, kind))
      .catch((e) => {
        toast(e instanceof Error ? e.message : String(e), "warn");
        setOpen(false);
        setConfirm(null);
      });
  }

  const items = [
    { key: "role", label: "تغيير الدور", icon: "🎭", onClick: () => { setOpen(false); setRoleOpen(true); } },
    { key: "reset", label: "إرسال إعادة تعيين كلمة المرور", icon: "🔑", onClick: () => act("reset", `أُرسل رابط إعادة التعيين لـ ${userName}`) },
    { key: "impersonate", label: "الدخول كـ هذا المستخدم", icon: "🕵", onClick: () => act("impersonate", `دخول كـ ${userName} (سُجّل في التدقيق)`) },
    disabled
      ? { key: "enable", label: "إعادة التفعيل", icon: "✅", onClick: () => setStatusAndToast("active", "enable", `تم تفعيل ${userName}`) }
      : { key: "disable", label: "تعطيل الحساب", icon: "⏸", danger: true,
          onClick: () => { setOpen(false); setConfirm({ key: "disable", title: "تعطيل الحساب؟", body: `سيُمنع ${userName} من الدخول. يمكن إعادة تفعيله لاحقاً.`, danger: true }); } },
    { key: "remove", label: "إزالة من المكتب", icon: "🗑", danger: true,
      onClick: () => { setOpen(false); setConfirm({ key: "remove", title: "إزالة من المكتب؟", body: `سيُزال ${userName} من ${tenantName}. لا يؤثر على باقي البيانات.`, danger: true }); } },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-lg grid place-items-center hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
        aria-label="إجراءات"
      >
        ⋯
      </button>

      {open && (
        <div className="absolute left-0 mt-1 w-56 z-50 rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] shadow-2xl p-1.5">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={it.onClick}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-right transition-colors ${
                it.danger ? "text-[var(--danger)] hover:bg-[var(--danger)]/10" : "hover:bg-[var(--bg-hover)]"
              }`}
            >
              <span>{it.icon}</span>
              {it.label}
            </button>
          ))}
        </div>
      )}

      {/* Role change */}
      <Modal open={roleOpen} onClose={() => setRoleOpen(false)} title="تغيير دور المستخدم" sub={userName} size="sm">
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => { setRoleOpen(false); act("role", `تم تغيير دور ${userName} إلى ${r}`); }}
              className="p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--brand)] text-xs text-right"
            >
              {r}
            </button>
          ))}
        </div>
      </Modal>

      {/* Confirm destructive */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.title}
        size="sm"
        footer={
          <>
            <button onClick={() => setConfirm(null)} className="btn btn-ghost text-sm py-2.5">تراجع</button>
            <button
              onClick={() => {
                if (!confirm) return;
                const msg = `تم: ${confirm.title.replace("؟", "")} — ${userName}`;
                if (confirm.key === "disable") setStatusAndToast("suspended", "disable", msg, "warn");
                else act(confirm.key, msg, "warn");
              }}
              className="btn btn-ghost text-sm py-2.5 border-[var(--danger)] text-[var(--danger)]"
            >
              تأكيد
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{confirm?.body}</p>
      </Modal>
    </div>
  );
}
