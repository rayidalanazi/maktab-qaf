import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { MOCK_USERS } from "@/data/app-mock";

export default async function UsersPage({ params }: { params: Promise<{ tenant: string }> }) {
  await params;
  return (
    <>
      <Topbar title="المستخدمون" sub="فريق المكتب" breadcrumb={["الرئيسية", "المستخدمون"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="فريق المكتب"
          sub={`${MOCK_USERS.length} مستخدم • 1 مقعد متاح في باقتك`}
          actions={
            <>
              <button className="btn btn-brand text-sm py-2.5">+ دعوة عضو</button>
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
            {MOCK_USERS.map((u) => (
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
          </div>
        </div>
      </main>
    </>
  );
}
