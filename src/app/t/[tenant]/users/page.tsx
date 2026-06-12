"use client";

import { useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { useQafData } from "@/hooks/useQafData";
import {
  fetchUsers, fetchInvitations, inviteUser, revokeInvitation,
} from "@/lib/data/queries";
import { MOCK_USERS } from "@/data/app-mock";
import { RecordFormModal, type FormField } from "@/components/app/RecordFormModal";

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير النظام", general_manager: "مدير عام", manager: "مدير القضايا",
  lawyer: "محامي", consultant: "مستشار قانوني", auditor: "مدقّق قانوني",
  accountant: "محاسب", secretary: "سكرتير", marketer: "مسوّق",
};

const INVITE_FIELDS: FormField[] = [
  { name: "email", label: "البريد الإلكتروني", required: true, dir: "ltr", placeholder: "name@firm.sa" },
  { name: "fullName", label: "الاسم", half: true },
  { name: "role", label: "الدور", type: "select", half: true, default: "lawyer",
    options: ["admin", "general_manager", "manager", "lawyer", "consultant", "auditor", "accountant", "secretary"]
      .map((v) => ({ value: v, label: ROLE_LABELS[v] ?? v })) },
];

export default function UsersPage() {
  const { data: users, reload: reloadUsers } = useQafData(fetchUsers, MOCK_USERS);
  const { data: invites, reload: reloadInvites } = useQafData(fetchInvitations, []);
  const [openInvite, setOpenInvite] = useState(false);

  async function revoke(id: string | number) {
    try { await revokeInvitation(String(id)); reloadInvites(); } catch { /* ignore */ }
  }

  return (
    <>
      <Topbar title="المستخدمون" sub="فريق المكتب" breadcrumb={["الرئيسية", "المستخدمون"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="فريق المكتب"
          sub={`${users.length} عضو${invites.length ? ` • ${invites.length} دعوة معلّقة` : ""}`}
          actions={
            <>
              <button onClick={() => setOpenInvite(true)} className="btn btn-brand text-sm py-2.5">+ دعوة عضو</button>
              <button className="btn btn-ghost text-sm py-2.5">⚡ ترقية الباقة</button>
            </>
          }
        />

        <div className="card !p-0 overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[1fr_1fr_140px_100px_140px] bg-[var(--bg-hover)] border-b border-[var(--border)] text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] px-4 py-2.5">
            <div>المستخدم</div>
            <div>البريد</div>
            <div>الدور</div>
            <div>الحالة</div>
            <div>آخر دخول</div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {users.map((u) => (
              <div
                key={u.id}
                className="md:grid md:grid-cols-[1fr_1fr_140px_100px_140px] p-3 sm:p-4 hover:bg-[var(--bg-hover)] cursor-pointer"
              >
                <div className="flex items-center gap-2.5 mb-2 md:mb-0">
                  <span className="w-9 h-9 rounded-full bg-[var(--brand-deep)] text-black grid place-items-center font-bold text-xs">
                    {u.initials}
                  </span>
                  <div className="font-bold text-sm">{u.name}</div>
                </div>
                <div className="text-xs text-[var(--text-muted)] mb-2 md:mb-0 font-mono truncate" dir="ltr">
                  {u.email}
                </div>
                <div className="text-xs text-[var(--text-muted)] mb-2 md:mb-0">{u.role}</div>
                <div className="mb-2 md:mb-0">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[var(--success)]/15 text-[var(--success)]">
                    ● {u.status}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-faint)]">{u.lastLogin}</div>
              </div>
            ))}

            {/* Pending invitations */}
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="md:grid md:grid-cols-[1fr_1fr_140px_100px_140px] p-3 sm:p-4 bg-[var(--warn)]/5"
              >
                <div className="flex items-center gap-2.5 mb-2 md:mb-0">
                  <span className="w-9 h-9 rounded-full bg-[var(--bg-hover)] grid place-items-center text-sm">✉</span>
                  <div className="font-bold text-sm text-[var(--text-muted)]">{inv.fullName || "دعوة معلّقة"}</div>
                </div>
                <div className="text-xs text-[var(--text-muted)] mb-2 md:mb-0 font-mono truncate" dir="ltr">
                  {inv.email}
                </div>
                <div className="text-xs text-[var(--text-muted)] mb-2 md:mb-0">{ROLE_LABELS[inv.role] ?? inv.role}</div>
                <div className="mb-2 md:mb-0">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[var(--warn)]/15 text-[var(--warn)]">
                    ⏳ بانتظار القبول
                  </span>
                </div>
                <div className="text-xs">
                  <button onClick={() => revoke(inv.id)} className="text-[var(--danger)] hover:underline">
                    إلغاء الدعوة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[var(--text-faint)] mt-3 font-mono">
          // المدعو ينضم لمكتبك تلقائياً بمجرد تسجيل دخوله بنفس البريد — بدون خطوات إضافية
        </p>
      </main>

      <RecordFormModal
        open={openInvite}
        onClose={() => setOpenInvite(false)}
        title="دعوة عضو للفريق"
        sub="يصله الوصول فور تسجيل دخوله بنفس البريد"
        fields={INVITE_FIELDS}
        submitLabel="إرسال الدعوة"
        onSubmit={async (v) => { await inviteUser(v.email, v.fullName, v.role); reloadInvites(); }}
      />
    </>
  );
}
