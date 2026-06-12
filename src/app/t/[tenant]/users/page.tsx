"use client";

import { useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { useQafData } from "@/hooks/useQafData";
import { useSession } from "@/components/app/SessionProvider";
import {
  fetchUsers, fetchInvitations, inviteUser, revokeInvitation, inviteLink,
} from "@/lib/data/queries";
import { MOCK_USERS } from "@/data/app-mock";
import { RecordFormModal, type FormField } from "@/components/app/RecordFormModal";

function OwnerPill({ owner }: { owner: boolean }) {
  return (
    <span
      className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
      style={owner
        ? { background: "var(--brand)", color: "#000" }
        : { background: "color-mix(in srgb, var(--text-faint) 22%, transparent)", color: "var(--text-muted)" }}
      title={owner ? "مالك الاشتراك" : "موظف بالمكتب"}
    >
      {owner ? "مالك" : "موظف"}
    </span>
  );
}

function CopyButton({ value, label = "نسخ الرابط" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1800); }
        catch { /* clipboard blocked — user can select manually */ }
      }}
      className="text-[var(--brand)] hover:underline whitespace-nowrap"
    >
      {done ? "✓ نُسخ" : `🔗 ${label}`}
    </button>
  );
}

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
  const { data: users } = useQafData(fetchUsers, MOCK_USERS);
  const { data: invites, reload: reloadInvites } = useQafData(fetchInvitations, []);
  const { tenant, isOwner } = useSession();
  const ownerId = tenant?.owner_id ?? null;
  const [openInvite, setOpenInvite] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  async function revoke(id: string | number) {
    try { await revokeInvitation(String(id)); reloadInvites(); } catch { /* ignore */ }
  }

  return (
    <>
      <Topbar title="الفريق" sub="أعضاء المكتب والدعوات" breadcrumb={["الرئيسية", "الفريق"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="فريق المكتب"
          sub={`${users.length} عضو${invites.length ? ` • ${invites.length} دعوة معلّقة` : ""}`}
          actions={
            isOwner ? (
              <button onClick={() => setOpenInvite(true)} className="btn btn-brand text-sm py-2.5">+ دعوة عضو</button>
            ) : null
          }
        />

        {/* Freshly-created invite link — owner copies + shares it */}
        {createdLink && (
          <div className="card mb-4 border-[var(--brand)]/40">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">🔗</span>
              <div className="font-bold text-sm">رابط الدعوة جاهز — شاركه مع الموظف</div>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mb-2.5">
              يفتح الموظف الرابط، ينشئ حسابه، وينضم لمكتبك تلقائيًا. الرابط يُستخدم مرة واحدة.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                readOnly value={createdLink} dir="ltr"
                onFocus={(e) => e.currentTarget.select()}
                className="w-full sm:flex-1 min-w-0 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs font-mono"
              />
              <div className="flex items-center gap-3 shrink-0">
                <CopyButton value={createdLink} label="نسخ" />
                <button onClick={() => setCreatedLink(null)} className="text-[var(--text-faint)] text-xs hover:text-[var(--text)]">إخفاء</button>
              </div>
            </div>
          </div>
        )}

        <div className="card !p-0 overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[1fr_1fr_140px_100px_140px] bg-[var(--bg-hover)] border-b border-[var(--border)] text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] px-4 py-2.5">
            <div>العضو</div>
            <div>البريد</div>
            <div>الدور</div>
            <div>الحالة</div>
            <div>آخر دخول</div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {users.map((u) => (
              <div
                key={u.id}
                className="md:grid md:grid-cols-[1fr_1fr_140px_100px_140px] p-3 sm:p-4 hover:bg-[var(--bg-hover)]"
              >
                <div className="flex items-center gap-2.5 mb-2 md:mb-0">
                  <span className="w-9 h-9 rounded-full bg-[var(--brand-deep)] text-black grid place-items-center font-bold text-xs">
                    {u.initials}
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="font-bold text-sm truncate">{u.name}</div>
                    {ownerId && <OwnerPill owner={String(u.id) === ownerId} />}
                  </div>
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

            {/* Pending invitations — owner sees the link + revoke */}
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
                <div className="text-xs flex items-center gap-3">
                  {isOwner && inv.token && <CopyButton value={inviteLink(inv.token)} />}
                  {isOwner && (
                    <button onClick={() => revoke(inv.id)} className="text-[var(--danger)] hover:underline">إلغاء</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[var(--text-faint)] mt-3 font-mono">
          {isOwner
            ? "// اضغط «دعوة عضو» لإنشاء رابط فردي، ثم شاركه. ينضم الموظف بمجرد إنشاء حسابه عبر الرابط."
            : `// مالك المكتب يدير الأعضاء والدعوات${ownerId ? "" : ""}`}
        </p>
      </main>

      <RecordFormModal
        open={openInvite}
        onClose={() => setOpenInvite(false)}
        title="دعوة عضو للفريق"
        sub="ينشئ رابطاً فرديًا تشاركه مع الموظف — يُستخدم مرة واحدة"
        fields={INVITE_FIELDS}
        submitLabel="إنشاء رابط الدعوة"
        onSubmit={async (v) => {
          const token = await inviteUser(v.email, v.fullName, v.role);
          reloadInvites();
          if (token) setCreatedLink(inviteLink(token));
        }}
      />
    </>
  );
}
