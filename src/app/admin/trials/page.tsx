import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

const TRIAL_LENGTH = 14;

interface Trial {
  id: string;
  firm: string;
  slug: string;
  startDate: string;
  daysLeft: number;
  activity: "عالي" | "متوسط" | "منخفض";
  conversion: number;
}

const TRIALS: Trial[] = [
  { id: "t1", firm: "شركة رائد للمحاماة", slug: "raed", startDate: "2026-06-08", daysLeft: 12, activity: "عالي", conversion: 82 },
  { id: "t2", firm: "مكتب الفيصل", slug: "faisal", startDate: "2026-06-04", daysLeft: 8, activity: "عالي", conversion: 71 },
  { id: "t3", firm: "مكتب القحطاني", slug: "qahtani", startDate: "2026-05-30", daysLeft: 3, activity: "متوسط", conversion: 48 },
  { id: "t4", firm: "مكتب الخوري", slug: "khoury", startDate: "2026-06-06", daysLeft: 10, activity: "متوسط", conversion: 55 },
  { id: "t5", firm: "مكتب المطيري", slug: "mutairi", startDate: "2026-05-28", daysLeft: 1, activity: "منخفض", conversion: 19 },
  { id: "t6", firm: "مؤسسة العتيبي", slug: "otaibi", startDate: "2026-05-27", daysLeft: 0, activity: "منخفض", conversion: 12 },
];

const ACTIVITY_COLOR: Record<string, string> = {
  "عالي": "var(--success)",
  "متوسط": "var(--warn)",
  "منخفض": "var(--danger)",
};

const activeCount = TRIALS.length;
const endingToday = TRIALS.filter((t) => t.daysLeft === 0).length;
const conversionRate = Math.round(
  TRIALS.reduce((s, t) => s + t.conversion, 0) / TRIALS.length
);
const avgDaysLeft = Math.round(
  (TRIALS.reduce((s, t) => s + t.daysLeft, 0) / TRIALS.length) * 10
) / 10;

function conversionColor(p: number): string {
  if (p >= 65) return "var(--success)";
  if (p >= 40) return "var(--warn)";
  return "var(--danger)";
}

export default function AdminTrialsPage() {
  return (
    <>
      <Topbar title="التجارب" breadcrumb={["Admin", "التجارب"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="التجارب النشطة"
          sub={`${activeCount} مكتب في تجربة ${TRIAL_LENGTH} يوم`}
          actions={<button className="btn btn-ghost text-sm py-2.5">📥 تصدير</button>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard
            label="تجارب نشطة"
            value={activeCount}
            icon="🚀"
            accent="info"
            hint="مكاتب في فترة التجربة"
          />
          <StatCard
            label="تنتهي اليوم"
            value={endingToday}
            icon="⏰"
            accent="warn"
            hint="تحتاج متابعة عاجلة"
          />
          <StatCard
            label="معدل التحويل"
            value={`${conversionRate}%`}
            icon="📈"
            accent="success"
            trend={{ v: "+6%", up: true }}
            hint="متوسط احتمالية الاشتراك"
          />
          <StatCard
            label="متوسط الأيام المتبقية"
            value={avgDaysLeft}
            icon="📅"
            accent="brand"
            hint={`من أصل ${TRIAL_LENGTH} يوم`}
          />
        </div>

        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] bg-[var(--bg-hover)] border-b border-[var(--border)]">
              <tr>
                <th className="text-right p-3">المكتب</th>
                <th className="text-right p-3">يوم البدء</th>
                <th className="text-right p-3 min-w-[180px]">أيام متبقية</th>
                <th className="text-right p-3">نشاط</th>
                <th className="text-right p-3">احتمالية التحويل</th>
                <th className="text-right p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {TRIALS.map((t) => {
                const daysUsed = TRIAL_LENGTH - t.daysLeft;
                const usedPct = Math.min(100, Math.round((daysUsed / TRIAL_LENGTH) * 100));
                const urgent = t.daysLeft <= 3;
                const barColor = urgent ? "var(--danger)" : "var(--brand)";
                const convColor = conversionColor(t.conversion);
                return (
                  <tr key={t.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="p-3">
                      <div className="font-bold">{t.firm}</div>
                      <div className="text-[10px] text-[var(--text-faint)] font-mono" dir="ltr">
                        {t.slug}.qaf.sa
                      </div>
                    </td>
                    <td className="p-3 text-xs text-[var(--text-muted)]">
                      <span className="num" dir="ltr">{t.startDate}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className="text-xs font-bold num"
                          style={{ color: urgent ? "var(--danger)" : "var(--text)" }}
                        >
                          {t.daysLeft === 0 ? "ينتهي اليوم" : `${t.daysLeft} يوم`}
                        </span>
                        <span className="text-[10px] text-[var(--text-faint)] num" dir="ltr">
                          {daysUsed}/{TRIAL_LENGTH}
                        </span>
                      </div>
                      <div
                        className="h-2 w-full rounded-full overflow-hidden"
                        style={{ background: "var(--bg-hover)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${usedPct}%`, background: barColor }}
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                        style={{
                          background: `color-mix(in srgb, ${ACTIVITY_COLOR[t.activity]} 15%, transparent)`,
                          color: ACTIVITY_COLOR[t.activity],
                        }}
                      >
                        ● {t.activity}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-1.5 flex-1 min-w-[48px] rounded-full overflow-hidden"
                          style={{ background: "var(--bg-hover)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${t.conversion}%`, background: convColor }}
                          />
                        </div>
                        <span className="text-xs font-bold num" dir="ltr" style={{ color: convColor }}>
                          {t.conversion}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button className="btn btn-brand text-[11px] py-1.5 px-2.5 whitespace-nowrap">
                          تحويل
                        </button>
                        <button className="btn btn-ghost text-[11px] py-1.5 px-2.5 whitespace-nowrap">
                          تمديد
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
