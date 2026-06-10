import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { ADMIN_SUPPORT_TICKETS } from "@/data/admin-mock";

const STATUS_COLOR: Record<string, string> = {
  "جديد": "var(--accent)",
  "قيد الحل": "var(--warn)",
  "تم الرد": "var(--info)",
  "مغلق": "var(--success)",
};

const PRIORITY_COLOR: Record<string, string> = {
  "عالية": "var(--accent)",
  "متوسطة": "var(--warn)",
  "منخفضة": "var(--text-faint)",
};

export default function AdminSupportPage() {
  return (
    <>
      <Topbar title="تذاكر الدعم" breadcrumb={["Admin", "الدعم"]} />
      <main className="p-4 sm:p-6 max-w-5xl w-full">
        <PageHeader title="تذاكر الدعم" sub={`${ADMIN_SUPPORT_TICKETS.length} تذكرة مفتوحة`} />

        <div className="space-y-2">
          {ADMIN_SUPPORT_TICKETS.map((t) => (
            <div key={t.id} className="card hover:border-[var(--brand)]/40 cursor-pointer">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-[var(--text-faint)] mb-0.5" dir="ltr">
                    #{t.id} • {t.tenant}
                  </div>
                  <div className="font-bold text-sm">{t.subject}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${PRIORITY_COLOR[t.priority]} 15%, transparent)`,
                      color: PRIORITY_COLOR[t.priority],
                    }}
                  >
                    {t.priority}
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${STATUS_COLOR[t.status]} 15%, transparent)`,
                      color: STATUS_COLOR[t.status],
                    }}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-[var(--text-faint)] font-mono">
                فُتحت {t.opened}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
