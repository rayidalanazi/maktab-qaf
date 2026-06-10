import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { MOCK_EVENTS } from "@/data/app-mock";

const TYPE_COLOR: Record<string, string> = {
  "جلسة": "var(--brand)",
  "اجتماع": "var(--info)",
  "موعد نهائي": "var(--accent)",
  "مهمة": "var(--warn)",
  "تدريب": "var(--success)",
};

export default async function SchedulePage({ params }: { params: Promise<{ tenant: string }> }) {
  await params;

  // Group by date
  const byDate = MOCK_EVENTS.reduce<Record<string, typeof MOCK_EVENTS>>((acc, e) => {
    (acc[e.date] = acc[e.date] || []).push(e);
    return acc;
  }, {});

  return (
    <>
      <Topbar title="الجدولة" sub="التقويم والمواعيد" breadcrumb={["الرئيسية", "الجدولة"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="الجدولة"
          sub="كل الجلسات والمواعيد القادمة"
          actions={<button className="btn btn-brand text-sm py-2.5">+ موعد جديد</button>}
        />

        <div className="space-y-4">
          {Object.entries(byDate).sort().map(([date, events]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <div className="font-mono text-xs text-[var(--text-faint)]" dir="ltr">
                  {date}
                </div>
                <div className="flex-1 h-px bg-[var(--border)]" />
                <div className="text-[10px] text-[var(--text-faint)]">
                  {events.length} موعد
                </div>
              </div>
              <div className="space-y-2">
                {events.map((e) => (
                  <div
                    key={e.id}
                    className="card flex items-start gap-4 hover:border-[var(--brand)]/40 cursor-pointer"
                  >
                    <div className="text-center shrink-0">
                      <div className="text-xs text-[var(--text-faint)]">{e.time.split(":")[0]}</div>
                      <div className="font-bold text-lg num">{e.time}</div>
                    </div>
                    <div
                      className="w-1 self-stretch rounded-full shrink-0"
                      style={{ background: TYPE_COLOR[e.type] || "var(--brand)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm mb-0.5">{e.title}</div>
                      <div className="text-xs text-[var(--text-muted)]">{e.desc}</div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${TYPE_COLOR[e.type]} 15%, transparent)`,
                        color: TYPE_COLOR[e.type],
                      }}
                    >
                      {e.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
