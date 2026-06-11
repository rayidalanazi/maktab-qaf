"use client";

import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useQafData } from "@/hooks/useQafData";
import { fetchSalaries } from "@/lib/data/queries";
import type { SalaryItem } from "@/lib/data/types";

// Demo fallback (shown only when no firm/DB yet). Shaped like SalaryItem.
const FALLBACK_SALARIES: SalaryItem[] = [
  { id: 1, name: "أحمد بن سعد الدوسري", role: "محامٍ أول", base: 22000, allowances: 4500, deductions: 1200, status: "مدفوع", month: "2026-05" },
  { id: 2, name: "نورة عبدالله القحطاني", role: "محامية", base: 16000, allowances: 3000, deductions: 850, status: "مدفوع", month: "2026-05" },
  { id: 3, name: "خالد محمد العتيبي", role: "مستشار قانوني", base: 18500, allowances: 3500, deductions: 980, status: "معلّق", month: "2026-05" },
  { id: 4, name: "ريم فهد الشمري", role: "باحثة قانونية", base: 11000, allowances: 1800, deductions: 540, status: "مدفوع", month: "2026-05" },
  { id: 5, name: "عبدالعزيز ناصر الحربي", role: "مدير المكتب", base: 20000, allowances: 5000, deductions: 1100, status: "مدفوع", month: "2026-05" },
  { id: 6, name: "سارة إبراهيم الزهراني", role: "سكرتيرة تنفيذية", base: 8500, allowances: 1200, deductions: 380, status: "معلّق", month: "2026-05" },
  { id: 7, name: "ماجد طلال المطيري", role: "كاتب ضبط", base: 7500, allowances: 900, deductions: 300, status: "مدفوع", month: "2026-05" },
];

const fmt = (n: number) => n.toLocaleString("en-US");
const net = (e: SalaryItem) => e.base + e.allowances - e.deductions;

function statusStyle(status: string) {
  const c = status === "مدفوع" ? "var(--success)" : "var(--warn)";
  return {
    background: `color-mix(in srgb, ${c} 15%, transparent)`,
    color: c,
  };
}

export default function SalariesPage() {
  const { data: employees } = useQafData(fetchSalaries, FALLBACK_SALARIES);

  const totalNet = employees.reduce((s, e) => s + net(e), 0);
  const headcount = employees.length;
  const paidTotal = employees.filter((e) => e.status === "مدفوع").reduce((s, e) => s + net(e), 0);
  const pendingTotal = employees.filter((e) => e.status === "معلّق").reduce((s, e) => s + net(e), 0);
  const paidCount = employees.filter((e) => e.status === "مدفوع").length;
  const pendingCount = employees.filter((e) => e.status === "معلّق").length;

  return (
    <>
      <Topbar
        title="الرواتب"
        sub="مسير الرواتب الشهري للموظفين"
        breadcrumb={["الرئيسية", "الرواتب"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="الرواتب"
          sub="إدارة مسير الرواتب — البدلات، الاستقطاعات، والصافي لكل موظف"
          actions={
            <>
              <button className="btn btn-ghost text-sm py-2.5">تصدير المسير</button>
              <button className="btn btn-brand text-sm py-2.5">+ تشغيل مسير الرواتب</button>
            </>
          }
        />

        {/* Stat row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="إجمالي الرواتب الشهرية"
            value={fmt(totalNet)}
            icon="💰"
            accent="brand"
            hint="ر.س / شهر — صافي"
          />
          <StatCard
            label="عدد الموظفين"
            value={headcount}
            icon="👥"
            accent="info"
            hint="موظف على المسير"
          />
          <StatCard
            label="مدفوع"
            value={fmt(paidTotal)}
            icon="✅"
            accent="success"
            trend={{ v: `${paidCount} موظفين`, up: true }}
            hint="ر.س — تم الصرف"
          />
          <StatCard
            label="معلّق"
            value={fmt(pendingTotal)}
            icon="⏳"
            accent="warn"
            trend={{ v: `${pendingCount} بانتظار`, up: false }}
            hint="ر.س — لم يُصرف بعد"
          />
        </div>

        {/* Payroll table */}
        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-right text-[11px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="font-medium px-4 py-3">الموظف</th>
                <th className="font-medium px-4 py-3">الدور</th>
                <th className="font-medium px-4 py-3 text-left">الأساسي</th>
                <th className="font-medium px-4 py-3 text-left">البدلات</th>
                <th className="font-medium px-4 py-3 text-left">الاستقطاعات</th>
                <th className="font-medium px-4 py-3 text-left">الصافي</th>
                <th className="font-medium px-4 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">
                    {e.name}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">
                    {e.role}
                  </td>
                  <td className="px-4 py-3 text-left text-[var(--text-muted)]">
                    <span className="num" dir="ltr">{fmt(e.base)}</span>
                  </td>
                  <td className="px-4 py-3 text-left" style={{ color: "var(--success)" }}>
                    <span className="num" dir="ltr">+{fmt(e.allowances)}</span>
                  </td>
                  <td className="px-4 py-3 text-left" style={{ color: "var(--danger)" }}>
                    <span className="num" dir="ltr">−{fmt(e.deductions)}</span>
                  </td>
                  <td className="px-4 py-3 text-left font-bold text-[var(--text)]">
                    <span className="num" dir="ltr">{fmt(net(e))}</span>
                    <span className="text-[10px] text-[var(--text-faint)] ms-1">ر.س</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="pill text-[11px] font-medium"
                      style={statusStyle(e.status)}
                    >
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--border-strong)] bg-[var(--bg-elev)] font-bold">
                <td className="px-4 py-3 text-[var(--text)]" colSpan={2}>
                  الإجمالي
                </td>
                <td className="px-4 py-3 text-left text-[var(--text-muted)]">
                  <span className="num" dir="ltr">
                    {fmt(employees.reduce((s, e) => s + e.base, 0))}
                  </span>
                </td>
                <td className="px-4 py-3 text-left" style={{ color: "var(--success)" }}>
                  <span className="num" dir="ltr">
                    +{fmt(employees.reduce((s, e) => s + e.allowances, 0))}
                  </span>
                </td>
                <td className="px-4 py-3 text-left" style={{ color: "var(--danger)" }}>
                  <span className="num" dir="ltr">
                    −{fmt(employees.reduce((s, e) => s + e.deductions, 0))}
                  </span>
                </td>
                <td className="px-4 py-3 text-left text-[var(--brand)]">
                  <span className="num" dir="ltr">{fmt(totalNet)}</span>
                  <span className="text-[10px] text-[var(--text-faint)] ms-1">ر.س</span>
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="text-[11px] text-[var(--text-faint)] mt-3">
          {/* تُصرف الرواتب آخر يوم عمل من كل شهر — والمعلّق ينتظر اعتماد المدير */}
          آخر تشغيل للمسير: <span className="num" dir="ltr">2026-05-28</span> · الدورة القادمة:{" "}
          <span className="num" dir="ltr">2026-06-28</span>
        </p>
      </main>
    </>
  );
}
