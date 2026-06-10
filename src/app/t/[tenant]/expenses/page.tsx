import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

type Status = "approved" | "pending" | "rejected";

interface Expense {
  id: string;
  item: string;
  category: string;
  icon: string;
  amount: number;
  date: string;
  paidBy: string;
  status: Status;
  case: string;
}

const EXPENSES: Expense[] = [
  {
    id: "EXP-1042",
    item: "رسوم رفع دعوى تجارية",
    category: "رسوم محكمة",
    icon: "⚖",
    amount: 3500,
    date: "2026-06-08",
    paidBy: "أحمد الدوسري",
    status: "approved",
    case: "القضية ١٢٤ — المحكمة التجارية بالرياض",
  },
  {
    id: "EXP-1041",
    item: "أتعاب خبير محاسبي مُعتمد",
    category: "خبير",
    icon: "📊",
    amount: 6000,
    date: "2026-06-05",
    paidBy: "سارة العتيبي",
    status: "pending",
    case: "القضية ٠٩٨ — المحكمة العامة بالرياض",
  },
  {
    id: "EXP-1040",
    item: "تنقلات وحضور جلسة بجدة",
    category: "تنقلات",
    icon: "✈",
    amount: 1850,
    date: "2026-06-03",
    paidBy: "أحمد الدوسري",
    status: "approved",
    case: "القضية ١١٧ — المحكمة العمالية بجدة",
  },
  {
    id: "EXP-1039",
    item: "ترجمة عقد معتمد إنجليزي",
    category: "ترجمة",
    icon: "🌐",
    amount: 950,
    date: "2026-05-29",
    paidBy: "نورة القحطاني",
    status: "approved",
    case: "القضية ١٠٣ — محكمة التنفيذ بالرياض",
  },
  {
    id: "EXP-1038",
    item: "رسوم استخراج صك تنفيذي",
    category: "رسوم محكمة",
    icon: "⚖",
    amount: 1200,
    date: "2026-05-24",
    paidBy: "سارة العتيبي",
    status: "pending",
    case: "القضية ٠٨٧ — محكمة التنفيذ بالرياض",
  },
  {
    id: "EXP-1037",
    item: "أتعاب مترجم محلّف بالجلسة",
    category: "ترجمة",
    icon: "🌐",
    amount: 1400,
    date: "2026-05-20",
    paidBy: "خالد الشهري",
    status: "rejected",
    case: "القضية ١٢٢ — المحكمة الإدارية بالرياض",
  },
  {
    id: "EXP-1036",
    item: "تنقلات لمحكمة الأحوال الشخصية",
    category: "تنقلات",
    icon: "✈",
    amount: 600,
    date: "2026-05-16",
    paidBy: "نورة القحطاني",
    status: "approved",
    case: "القضية ٠٧٩ — محكمة الأحوال الشخصية بالرياض",
  },
];

const STATUS_META: Record<Status, { label: string; color: string }> = {
  approved: { label: "معتمد", color: "var(--success)" },
  pending: { label: "بانتظار الموافقة", color: "var(--warn)" },
  rejected: { label: "مرفوض", color: "var(--danger)" },
};

const CATEGORY_META: Record<string, string> = {
  "رسوم محكمة": "var(--brand)",
  تنقلات: "var(--info)",
  خبير: "var(--accent)",
  ترجمة: "var(--success)",
};

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export default async function ExpensesPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  await params;

  const monthTotal = EXPENSES.reduce((s, e) => s + e.amount, 0);
  const approvedTotal = EXPENSES.filter((e) => e.status === "approved").reduce(
    (s, e) => s + e.amount,
    0,
  );
  const pendingTotal = EXPENSES.filter((e) => e.status === "pending").reduce(
    (s, e) => s + e.amount,
    0,
  );
  const pendingCount = EXPENSES.filter((e) => e.status === "pending").length;

  return (
    <>
      <Topbar
        title="المصروفات"
        sub="تتبّع مصروفات المكتب والقضايا واعتمادها"
        breadcrumb={["الرئيسية", "المصروفات"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="المصروفات"
          sub="كل ريال له حكاية — ومكانه هنا."
          actions={
            <button className="btn btn-brand text-sm py-2.5">
              + تسجيل مصروف
            </button>
          }
        />

        {/* Stat row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="إجمالي الشهر"
            value={`${fmt(monthTotal)} ر.س`}
            icon="💰"
            accent="brand"
            trend={{ v: "+8%", up: true }}
            hint="مقارنة بمايو ٢٠٢٦"
          />
          <StatCard
            label="معتمد"
            value={`${fmt(approvedTotal)} ر.س`}
            icon="✓"
            accent="success"
            hint={`${EXPENSES.filter((e) => e.status === "approved").length} بنود مُعتمدة`}
          />
          <StatCard
            label="بانتظار الموافقة"
            value={`${fmt(pendingTotal)} ر.س`}
            icon="⏳"
            accent="warn"
            hint={`${pendingCount} بنود تنتظر القرار`}
          />
        </div>

        {/* Expenses table */}
        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-right text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="font-medium px-4 py-3.5 whitespace-nowrap">
                  البند
                </th>
                <th className="font-medium px-4 py-3.5 whitespace-nowrap">
                  المبلغ
                </th>
                <th className="font-medium px-4 py-3.5 whitespace-nowrap">
                  التاريخ
                </th>
                <th className="font-medium px-4 py-3.5 whitespace-nowrap">
                  دفعها
                </th>
                <th className="font-medium px-4 py-3.5 whitespace-nowrap">
                  الحالة
                </th>
                <th className="font-medium px-4 py-3.5 whitespace-nowrap">
                  القضية المرتبطة
                </th>
              </tr>
            </thead>
            <tbody>
              {EXPENSES.map((e) => {
                const st = STATUS_META[e.status];
                const catColor = CATEGORY_META[e.category] ?? "var(--brand)";
                return (
                  <tr
                    key={e.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span
                          className="shrink-0 w-8 h-8 rounded-lg grid place-items-center text-base"
                          style={{
                            background: `color-mix(in srgb, ${catColor} 14%, transparent)`,
                            color: catColor,
                          }}
                        >
                          {e.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-[var(--text)] break-words leading-snug">
                            {e.item}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className="pill"
                              style={{
                                background: `color-mix(in srgb, ${catColor} 12%, transparent)`,
                                color: catColor,
                              }}
                            >
                              {e.category}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--text-faint)] num" dir="ltr">
                              {e.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      <span className="num font-semibold text-[var(--text)]" dir="ltr">
                        {fmt(e.amount)}
                      </span>{" "}
                      <span className="text-[var(--text-faint)] text-xs">ر.س</span>
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap text-[var(--text-muted)]">
                      <span className="num" dir="ltr">
                        {e.date}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap text-[var(--text)]">
                      {e.paidBy}
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      <span
                        className="pill"
                        style={{
                          background: `color-mix(in srgb, ${st.color} 15%, transparent)`,
                          color: st.color,
                        }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-top text-[var(--text-muted)] max-w-[260px]">
                      <span className="break-words leading-snug">{e.case}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-[var(--text-faint)] mt-3 px-1">
          {/* الأرقام أعلاه للشهر الجاري فقط — الأرشيف الكامل في التقارير. */}
          يعرض هذا الجدول مصروفات الشهر الجاري. للأرشيف الكامل راجع التقارير.
        </p>
      </main>
    </>
  );
}
