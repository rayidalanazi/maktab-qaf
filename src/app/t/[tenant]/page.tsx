import { Topbar } from "@/components/app/Topbar";
import { StatCard } from "@/components/app/StatCard";
import { PageHeader } from "@/components/app/PageHeader";
import { MOCK_CASES, MOCK_TASKS, MOCK_EVENTS, MOCK_NOTIFICATIONS } from "@/data/app-mock";

export default async function TenantDashboardPage({ params }: { params: Promise<{ tenant: string }> }) {
  await params;
  const activeCases = MOCK_CASES.filter((c) => c.status === "نشط").length;
  const urgentTasks = MOCK_TASKS.filter((t) => t.priority === "عالية").length;
  const upcomingHearings = MOCK_EVENTS.filter((e) => e.type === "جلسة").length;
  const unreadNotifs = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <>
      <Topbar title="الصفحة الرئيسية" breadcrumb={["الرئيسية"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="مرحباً، عبدالله 👋"
          sub="إليك ملخّص ما يحتاج انتباهك اليوم"
          actions={
            <>
              <button className="btn btn-brand text-sm py-2.5">+ قضية جديدة</button>
              <button className="btn btn-ghost text-sm py-2.5">📝 مذكرة جديدة</button>
            </>
          }
        />

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="قضايا نشطة" value={activeCases} icon="⚖" accent="brand" trend={{ v: "+2", up: true }} hint="ضمن نطاق الأداء" />
          <StatCard label="مهام عاجلة" value={urgentTasks} icon="📌" accent="accent" hint="تحتاج إنجازك" />
          <StatCard label="جلسات قادمة" value={upcomingHearings} icon="📅" accent="info" hint="هذا الأسبوع" />
          <StatCard label="إشعارات جديدة" value={unreadNotifs} icon="🔔" accent="warn" hint="3 منها عاجلة" />
        </div>

        {/* Two columns: urgent cases + upcoming hearings */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold">القضايا العاجلة</div>
                <div className="text-xs text-[var(--text-faint)]">آخر مواعيد قريبة</div>
              </div>
              <a className="text-xs text-[var(--brand)] hover:underline">شف الكل ←</a>
            </div>
            <div className="space-y-2.5">
              {MOCK_CASES.filter((c) => c.status === "نشط").slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)]">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm">قضية {c.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate">
                      {c.plaintiff} ضد {c.defendant} • {c.type}
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className="text-[10px] text-[var(--text-faint)]">{c.deadline}</div>
                    <div className="text-[10px] text-[var(--accent)]">{c.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold">جدول اليوم</div>
              <a className="text-xs text-[var(--brand)] hover:underline">التقويم ←</a>
            </div>
            <div className="space-y-2.5">
              {MOCK_EVENTS.slice(0, 4).map((e) => (
                <div key={e.id} className="flex items-start gap-3">
                  <div className="text-center shrink-0 w-12 bg-[var(--bg-hover)] rounded-lg p-1.5 border border-[var(--border)]">
                    <div className="text-[10px] text-[var(--text-faint)]">{e.date.slice(5)}</div>
                    <div className="text-xs font-bold">{e.time}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{e.title}</div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate">{e.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
