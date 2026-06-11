"use client";

import { useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { useQafData } from "@/hooks/useQafData";
import { fetchCases, createCase } from "@/lib/data/queries";
import { MOCK_CASES } from "@/data/app-mock";
import { RecordFormModal, type FormField } from "@/components/app/RecordFormModal";

const STATUS_COLOR: Record<string, string> = {
  "نشط": "var(--success)",
  "معلق": "var(--warn)",
  "مغلق": "var(--text-faint)",
};

const CASE_FIELDS: FormField[] = [
  { name: "name", label: "رقم القضية", required: true, placeholder: "2026/0500", dir: "ltr", half: true },
  { name: "type", label: "النوع", type: "select", half: true, default: "مدني",
    options: ["تجاري", "مدني", "جزائي", "عمالي", "أحوال شخصية", "تنفيذي", "إداري"].map((v) => ({ value: v, label: v })) },
  { name: "court", label: "المحكمة", placeholder: "المحكمة العامة بالرياض" },
  { name: "plaintiff", label: "المدّعي", half: true },
  { name: "defendant", label: "المدّعى عليه", half: true },
  { name: "action", label: "الإجراء الحالي", placeholder: "جلسة قادمة", half: true },
  { name: "deadline", label: "الموعد القادم", type: "date", half: true },
  { name: "assignedTo", label: "المحامي المسؤول" },
];

export default function CasesPage() {
  const { data: cases, reload } = useQafData(fetchCases, MOCK_CASES);
  const [openNew, setOpenNew] = useState(false);
  return (
    <>
      <Topbar title="القضايا" sub="جميع قضايا المكتب" breadcrumb={["الرئيسية", "القضايا"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="القضايا"
          sub={`${cases.length} قضية`}
          actions={<button onClick={() => setOpenNew(true)} className="btn btn-brand text-sm py-2.5">+ قضية جديدة</button>}
        />

        {/* Filters bar */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["الكل", "نشطة", "معلّقة", "مغلقة", "مرفوضة"].map((f, i) => (
            <button
              key={i}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                i === 0
                  ? "bg-[var(--brand)]/10 border-[var(--brand)] text-[var(--brand)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Cases table (mobile-friendly) */}
        <div className="card !p-0 overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[1fr_1fr_120px_120px_140px] bg-[var(--bg-hover)] border-b border-[var(--border)] text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] px-4 py-2.5">
            <div>القضية</div>
            <div>الأطراف</div>
            <div>النوع</div>
            <div>الحالة</div>
            <div>الموعد</div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {cases.map((c) => (
              <div
                key={c.id}
                className="md:grid md:grid-cols-[1fr_1fr_120px_120px_140px] p-3 sm:p-4 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                <div className="mb-2 md:mb-0">
                  <div className="font-bold text-sm">قضية {c.name}</div>
                  <div className="text-[10px] text-[var(--text-faint)] truncate">{c.court}</div>
                </div>
                <div className="mb-2 md:mb-0 text-xs">
                  <div className="text-[var(--text-muted)] truncate">
                    <span className="text-[var(--text-faint)]">المدعي: </span>
                    {c.plaintiff}
                  </div>
                  <div className="text-[var(--text-muted)] truncate">
                    <span className="text-[var(--text-faint)]">المدعى عليه: </span>
                    {c.defendant}
                  </div>
                </div>
                <div className="text-xs text-[var(--text-muted)] mb-2 md:mb-0">{c.type}</div>
                <div className="mb-2 md:mb-0">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${STATUS_COLOR[c.status]} 15%, transparent)`,
                      color: STATUS_COLOR[c.status],
                    }}
                  >
                    ● {c.status}
                  </span>
                </div>
                <div className="text-xs">
                  <div className="font-mono text-[var(--text-muted)]" dir="ltr">{c.deadline}</div>
                  <div className="text-[10px] text-[var(--accent)] truncate">{c.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <RecordFormModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        title="قضية جديدة"
        sub="تُضاف لقضايا مكتبك مباشرة"
        fields={CASE_FIELDS}
        submitLabel="إضافة القضية"
        onSubmit={async (v) => { await createCase(v); reload(); }}
      />
    </>
  );
}
