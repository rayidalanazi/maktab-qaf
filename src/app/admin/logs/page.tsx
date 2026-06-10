import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";

const LOGS = [
  { id: 1, ts: "2026-06-10 13:42", actor: "demo-firm", action: "signup", entity: "tenant", detail: "اشترك في تجربة الأساس", ip: "188.55.x.x", level: "info" },
  { id: 2, ts: "2026-06-10 12:18", actor: "alfaisal", action: "addon.enable", entity: "memos_module", detail: "فعّل إضافة المذكرات", ip: "212.12.x.x", level: "info" },
  { id: 3, ts: "2026-06-10 11:05", actor: "raed", action: "payment.success", entity: "invoice", detail: "دفع 499 ر.س — تجديد شهري", ip: "94.97.x.x", level: "success" },
  { id: 4, ts: "2026-06-10 09:30", actor: "alshammari", action: "payment.failed", entity: "subscription", detail: "فشل خصم البطاقة — رصيد غير كافٍ", ip: "37.18.x.x", level: "warn" },
  { id: 5, ts: "2026-06-09 22:14", actor: "platform", action: "auth.login", entity: "admin", detail: "دخول لوحة الإدارة عبر Google", ip: "94.97.x.x", level: "info" },
  { id: 6, ts: "2026-06-09 18:50", actor: "alqahtani", action: "user.invite", entity: "user", detail: "دعا محامياً جديداً للحساب", ip: "176.44.x.x", level: "info" },
  { id: 7, ts: "2026-06-09 16:00", actor: "alqahtani", action: "addon.cancel", entity: "ai_assistant", detail: "ألغى إضافة المساعد الذكي", ip: "176.44.x.x", level: "warn" },
  { id: 8, ts: "2026-06-09 14:32", actor: "khoury", action: "case.create", entity: "case", detail: "أنشأ قضية جديدة 2026/0512", ip: "5.42.x.x", level: "info" },
];

const LEVEL_COLOR: Record<string, string> = {
  info: "var(--info)",
  success: "var(--success)",
  warn: "var(--warn)",
  danger: "var(--danger)",
};

export default function AdminLogsPage() {
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
          {LOGS.map((l) => (
            <div
              key={l.id}
              className="card !p-3 flex items-start gap-3 hover:border-[var(--border-strong)]"
            >
              <span
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{ background: LEVEL_COLOR[l.level] }}
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
        </div>
      </main>
    </>
  );
}
