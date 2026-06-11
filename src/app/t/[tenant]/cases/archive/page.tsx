"use client";

import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useQafData } from "@/hooks/useQafData";
import { fetchArchivedCases } from "@/lib/data/queries";
import type { Case } from "@/lib/data/types";

// Demo fallback (shown only when no firm/DB yet). Shaped like Case:
// status carries the outcome label, action carries the duration, deadline = closing date.
const FALLBACK_ARCHIVED: Case[] = [
  { id: "a1", name: "ق-2024-0117", court: "المحكمة التجارية بالرياض", type: "نزاع تجاري", plaintiff: "", defendant: "", status: "لصالحنا", action: "9 أشهر", deadline: "2026-05-12", risk: 0, assignedTo: "" },
  { id: "a2", name: "ق-2024-0093", court: "محكمة التنفيذ بالرياض", type: "مطالبة مالية", plaintiff: "", defendant: "", status: "تسوية", action: "5 أشهر", deadline: "2026-04-28", risk: 0, assignedTo: "" },
  { id: "a3", name: "ق-2023-0451", court: "المحكمة العمالية بجدة", type: "فصل تعسفي", plaintiff: "", defendant: "", status: "لصالحنا", action: "11 شهر", deadline: "2026-04-03", risk: 0, assignedTo: "" },
  { id: "a4", name: "ق-2023-0388", court: "محكمة الأحوال الشخصية بالرياض", type: "حضانة ونفقة", plaintiff: "", defendant: "", status: "ضدنا", action: "14 شهر", deadline: "2026-03-19", risk: 0, assignedTo: "" },
  { id: "a5", name: "ق-2024-0021", court: "المحكمة الإدارية بالدمام", type: "اعتراض إداري", plaintiff: "", defendant: "", status: "لصالحنا", action: "7 أشهر", deadline: "2026-02-26", risk: 0, assignedTo: "" },
  { id: "a6", name: "ق-2023-0274", court: "المحكمة العامة بالرياض", type: "نزاع عقاري", plaintiff: "", defendant: "", status: "تسوية", action: "13 شهر", deadline: "2026-01-30", risk: 0, assignedTo: "" },
  { id: "a7", name: "ق-2023-0159", court: "المحكمة الجزائية بالرياض", type: "شيك بدون رصيد", plaintiff: "", defendant: "", status: "لصالحنا", action: "6 أشهر", deadline: "2025-12-14", risk: 0, assignedTo: "" },
  { id: "a8", name: "ق-2022-0502", court: "محكمة التنفيذ بمكة المكرمة", type: "إخلاء عقار", plaintiff: "", defendant: "", status: "ضدنا", action: "10 أشهر", deadline: "2025-11-08", risk: 0, assignedTo: "" },
];

const OUTCOME_COLOR: Record<string, string> = {
  "لصالحنا": "var(--success)",
  "ضدنا": "var(--danger)",
  "تسوية": "var(--warn)",
};

function outcomeColor(status: string): string {
  return OUTCOME_COLOR[status] ?? "var(--text-faint)";
}

const FILTERS = ["الكل", "مكسوبة", "خاسرة", "تسوية"];

export default function CasesArchivePage() {
  const { data: archived } = useQafData(fetchArchivedCases, FALLBACK_ARCHIVED);

  const total = archived.length;
  const won = archived.filter((c) => c.status === "لصالحنا").length;
  const settled = archived.filter((c) => c.status === "تسوية").length;
  // الكسب = لصالحنا + التسويات (تُحتسب نتيجة إيجابية للمكتب)
  const winRate = total ? Math.round(((won + settled) / total) * 100) : 0;

  return (
    <>
      <Topbar
        title="أرشيف القضايا"
        sub="القضايا المغلقة والمؤرشفة"
        breadcrumb={["الرئيسية", "القضايا", "الأرشيف"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="أرشيف القضايا"
          sub={`${total} قضية مغلقة — سجل المكتب الكامل`}
          actions={
            <button className="btn btn-ghost text-sm py-2.5">↧ تصدير الأرشيف</button>
          }
        />

        {/* Stat row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="إجمالي مؤرشفة"
            value={total}
            icon="🗄"
            accent="info"
            hint="قضايا مغلقة بالكامل"
          />
          <StatCard
            label="نسبة الكسب"
            value={`${winRate}%`}
            icon="⚖"
            accent="success"
            trend={{ v: "+6%", up: true }}
            hint="لصالحنا + التسويات"
          />
          <StatCard
            label="قضايا مكسوبة"
            value={won}
            icon="🏆"
            accent="brand"
            hint="حُسمت لصالح المكتب"
          />
          <StatCard
            label="تسويات ودّية"
            value={settled}
            icon="🤝"
            accent="warn"
            hint="صلح خارج المرافعة"
          />
        </div>

        {/* Filter pills + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f, i) => (
              <button
                key={f}
                className={`px-3 py-1.5 rounded-full text-xs border whitespace-nowrap ${
                  i === 0
                    ? "bg-[var(--brand)]/10 border-[var(--brand)] text-[var(--brand)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative sm:ms-auto sm:w-64">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="ابحث برقم القضية أو المحكمة..."
              className="w-full ps-9 pe-3 py-2 text-sm rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--brand)] transition-colors"
            />
          </div>
        </div>

        {/* Archive table — horizontally scrollable on mobile */}
        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-[var(--bg-hover)] border-b border-[var(--border)] text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)]">
                <th className="text-start font-medium px-4 py-2.5">رقم القضية</th>
                <th className="text-start font-medium px-4 py-2.5">النوع</th>
                <th className="text-start font-medium px-4 py-2.5">المحكمة</th>
                <th className="text-start font-medium px-4 py-2.5">النتيجة</th>
                <th className="text-start font-medium px-4 py-2.5">تاريخ الإغلاق</th>
                <th className="text-start font-medium px-4 py-2.5">المدة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {archived.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <span className="num font-bold text-[var(--text)]" dir="ltr">
                      {c.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">
                    {c.type || "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    <span className="truncate block max-w-[220px]">{c.court || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                      style={{
                        background: `color-mix(in srgb, ${outcomeColor(c.status)} 15%, transparent)`,
                        color: outcomeColor(c.status),
                      }}
                    >
                      ● {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="num text-[var(--text-muted)]" dir="ltr">
                      {c.deadline || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">
                    {c.action || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-[var(--text-faint)] mt-3">
          {/* القضايا المؤرشفة للقراءة فقط — لإعادة فتح قضية تواصل مع مدير المكتب. */}
          الأرشيف للقراءة فقط — تُعرض آخر {total} قضايا مغلقة.
        </p>
      </main>
    </>
  );
}
