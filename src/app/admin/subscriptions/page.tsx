import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

type SubStatus = "نشط" | "معلّق" | "ملغى";
type Cycle = "شهري" | "سنوي";

interface Subscription {
  id: string;
  firm: string;
  plan: string;
  cycle: Cycle;
  price: number;
  startDate: string;
  renewDate: string;
  status: SubStatus;
}

const SUBSCRIPTIONS: Subscription[] = [
  { id: "SUB-1042", firm: "شركة رائد للمحاماة", plan: "الاحترافية", cycle: "سنوي", price: 14400, startDate: "2025-06-01", renewDate: "2026-06-01", status: "نشط" },
  { id: "SUB-1039", firm: "مكتب الفيصل", plan: "النمو", cycle: "شهري", price: 799, startDate: "2026-01-15", renewDate: "2026-06-15", status: "نشط" },
  { id: "SUB-1036", firm: "مكتب القحطاني", plan: "الاحترافية", cycle: "شهري", price: 1499, startDate: "2025-11-20", renewDate: "2026-06-20", status: "نشط" },
  { id: "SUB-1031", firm: "مكتب الخوري", plan: "النمو", cycle: "سنوي", price: 7680, startDate: "2025-03-10", renewDate: "2026-03-10", status: "معلّق" },
  { id: "SUB-1028", firm: "مكتب المطيري", plan: "البداية", cycle: "شهري", price: 299, startDate: "2026-02-01", renewDate: "2026-06-01", status: "نشط" },
  { id: "SUB-1024", firm: "مكتب الشمري", plan: "الاحترافية", cycle: "سنوي", price: 14400, startDate: "2024-12-05", renewDate: "2025-12-05", status: "ملغى" },
  { id: "SUB-1019", firm: "مكتب العنزي", plan: "النمو", cycle: "شهري", price: 799, startDate: "2026-04-18", renewDate: "2026-06-18", status: "نشط" },
  { id: "SUB-1015", firm: "مؤسسة العتيبي", plan: "البداية", cycle: "شهري", price: 299, startDate: "2025-09-22", renewDate: "2026-06-22", status: "معلّق" },
  { id: "SUB-1008", firm: "مكتب الفيصل", plan: "البداية", cycle: "سنوي", price: 2880, startDate: "2024-08-30", renewDate: "2025-08-30", status: "ملغى" },
];

const STATUS_COLOR: Record<SubStatus, string> = {
  "نشط": "var(--success)",
  "معلّق": "var(--warn)",
  "ملغى": "var(--danger)",
};

const FILTERS: { label: string; active: boolean }[] = [
  { label: "الكل", active: true },
  { label: "نشط", active: false },
  { label: "معلّق", active: false },
  { label: "ملغى", active: false },
];

// Monthly Recurring Revenue: normalize annual plans to a monthly figure, active only.
const MRR = SUBSCRIPTIONS.filter((s) => s.status === "نشط").reduce(
  (sum, s) => sum + (s.cycle === "سنوي" ? Math.round(s.price / 12) : s.price),
  0
);

const COUNTS = {
  active: SUBSCRIPTIONS.filter((s) => s.status === "نشط").length,
  held: SUBSCRIPTIONS.filter((s) => s.status === "معلّق").length,
  cancelled: SUBSCRIPTIONS.filter((s) => s.status === "ملغى").length,
};

export default function SubscriptionsPage() {
  return (
    <>
      <Topbar title="الاشتراكات" breadcrumb={["Admin", "الاشتراكات"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="الاشتراكات"
          sub={`${SUBSCRIPTIONS.length} اشتراك عبر كل المكاتب`}
          actions={<button className="btn btn-ghost text-sm py-2.5">📥 تصدير</button>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard
            label="اشتراكات نشطة"
            value={COUNTS.active}
            icon="✅"
            accent="success"
            trend={{ v: "+2", up: true }}
            hint="تجدّد تلقائيًا"
          />
          <StatCard
            label="معلّقة"
            value={COUNTS.held}
            icon="⏸️"
            accent="warn"
            hint="بانتظار الدفع"
          />
          <StatCard
            label="ملغاة"
            value={COUNTS.cancelled}
            icon="🚫"
            accent="accent"
            hint="آخر 90 يومًا"
          />
          <StatCard
            label="MRR — الإيراد الشهري المتكرر"
            value={`${MRR.toLocaleString("en-US")} ر.س`}
            icon="💰"
            accent="brand"
            trend={{ v: "+8%", up: true }}
            hint="بعد معادلة الباقات السنوية"
          />
        </div>

        {/* فلاتر الحالة — عرض فقط */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              className="pill text-xs py-1.5 px-3 transition-colors"
              style={
                f.active
                  ? {
                      background: `color-mix(in srgb, var(--brand) 15%, transparent)`,
                      color: "var(--brand)",
                      borderColor: "var(--brand)",
                    }
                  : undefined
              }
            >
              {f.label}
            </button>
          ))}
          <span className="text-[11px] text-[var(--text-faint)] ms-auto">
            تحديث: <span className="num" dir="ltr">2026-06-10</span>
          </span>
        </div>

        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] bg-[var(--bg-hover)] border-b border-[var(--border)]">
              <tr>
                <th className="text-right p-3">المكتب</th>
                <th className="text-right p-3">الباقة</th>
                <th className="text-right p-3">الدورة</th>
                <th className="text-right p-3">السعر</th>
                <th className="text-right p-3">تاريخ البدء</th>
                <th className="text-right p-3">التجديد القادم</th>
                <th className="text-right p-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {SUBSCRIPTIONS.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-sm">{s.firm}</div>
                    <div className="text-[10px] text-[var(--text-faint)] font-mono" dir="ltr">
                      {s.id}
                    </div>
                  </td>
                  <td className="p-3 text-xs">{s.plan}</td>
                  <td className="p-3">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{
                        background:
                          s.cycle === "سنوي"
                            ? `color-mix(in srgb, var(--info) 14%, transparent)`
                            : `color-mix(in srgb, var(--text-faint) 14%, transparent)`,
                        color: s.cycle === "سنوي" ? "var(--info)" : "var(--text-muted)",
                      }}
                    >
                      {s.cycle}
                    </span>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="num" dir="ltr">
                      {s.price.toLocaleString("en-US")}
                    </span>{" "}
                    ر.س
                  </td>
                  <td className="p-3 text-xs text-[var(--text-muted)]">
                    <span className="num" dir="ltr">{s.startDate}</span>
                  </td>
                  <td className="p-3 text-xs">
                    <span
                      className="num"
                      dir="ltr"
                      style={{
                        color: s.status === "ملغى" ? "var(--text-faint)" : "var(--text)",
                      }}
                    >
                      {s.renewDate}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                      style={{
                        background: `color-mix(in srgb, ${STATUS_COLOR[s.status]} 15%, transparent)`,
                        color: STATUS_COLOR[s.status],
                      }}
                    >
                      ● {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
