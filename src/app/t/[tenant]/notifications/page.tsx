import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { MOCK_NOTIFICATIONS } from "@/data/app-mock";

const URGENCY_COLOR: Record<string, string> = {
  red: "var(--accent)",
  yellow: "var(--warn)",
  green: "var(--success)",
};

export default async function NotificationsPage({ params }: { params: Promise<{ tenant: string }> }) {
  await params;
  return (
    <>
      <Topbar title="الإشعارات" breadcrumb={["الرئيسية", "الإشعارات"]} />
      <main className="p-4 sm:p-6 max-w-3xl w-full">
        <PageHeader
          title="الإشعارات"
          sub={`${MOCK_NOTIFICATIONS.filter((n) => n.unread).length} إشعار غير مقروء`}
          actions={<button className="btn btn-ghost text-sm py-2.5">✓ اعتبر الكل مقروءاً</button>}
        />

        <div className="space-y-2">
          {MOCK_NOTIFICATIONS.map((n) => (
            <div
              key={n.id}
              className={`card flex items-start gap-3 cursor-pointer ${
                n.unread ? "border-[var(--brand)]/30 bg-[var(--brand)]/3" : ""
              }`}
            >
              <div
                className="w-2 h-2 rounded-full mt-2 shrink-0"
                style={{ background: URGENCY_COLOR[n.urgency] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-bold text-sm">{n.title}</div>
                  <div className="text-[10px] text-[var(--text-faint)] shrink-0 font-mono">
                    {n.time}
                  </div>
                </div>
                <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {n.desc}
                </div>
              </div>
              {n.unread && (
                <span className="text-[9px] font-bold bg-[var(--brand)] text-black px-1.5 py-0.5 rounded-full shrink-0 mt-1">
                  جديد
                </span>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
