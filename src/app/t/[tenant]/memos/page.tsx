"use client";

import { useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useQafData } from "@/hooks/useQafData";
import { fetchMemos, createMemo } from "@/lib/data/queries";
import type { MemoItem } from "@/lib/data/types";
import { RecordFormModal, type FormField } from "@/components/app/RecordFormModal";

const MEMO_FIELDS: FormField[] = [
  { name: "title", label: "عنوان المذكرة", required: true, placeholder: "مذكرة دفاع في دعوى مطالبة مالية" },
  { name: "type", label: "النوع", type: "select", half: true, default: "مذكرة",
    options: ["مذكرة", "لائحة", "جواب", "اعتراض", "استشارة", "تنفيذ"].map((v) => ({ value: v, label: v })) },
  { name: "status", label: "الحالة", type: "select", half: true, default: "draft",
    options: [
      { value: "draft", label: "مسودة" }, { value: "audit", label: "مراجعة تدقيق" },
      { value: "legal", label: "مراجعة قانونية" }, { value: "approved", label: "معتمد" },
      { value: "published", label: "منشور" },
    ] },
  { name: "author", label: "الكاتب", half: true },
  { name: "due", label: "تاريخ الاستحقاق", type: "date", half: true },
];

type MemoStatus = "draft" | "audit" | "legal" | "approved" | "published";

// Demo fallback (shown only when no firm/DB yet). Shaped like MemoItem.
const FALLBACK_MEMOS: MemoItem[] = [
  { id: "MEMO-2026-041", title: "مذكرة دفاع في دعوى مطالبة مالية", type: "مذكرة", status: "draft", author: "أ. سلطان القحطاني", due: "2026-06-18" },
  { id: "MEMO-2026-039", title: "لائحة اعتراضية على حكم ابتدائي", type: "لائحة", status: "audit", author: "أ. نورة الدوسري", due: "2026-06-15" },
  { id: "MEMO-2026-037", title: "مذكرة رد على لائحة المدعى عليه", type: "مذكرة", status: "legal", author: "أ. عبدالعزيز الشمري", due: "2026-06-13" },
  { id: "MEMO-2026-034", title: "مذكرة طلب تنفيذ حكم نهائي", type: "مذكرة", status: "approved", author: "أ. ريم الغامدي", due: "2026-06-11" },
  { id: "MEMO-2026-030", title: "لائحة دعوى عمالية — مستحقات نهاية الخدمة", type: "لائحة", status: "published", author: "أ. سلطان القحطاني", due: "2026-06-08" },
  { id: "MEMO-2026-028", title: "مذكرة إجابة في نزاع أحوال شخصية", type: "مذكرة", status: "audit", author: "أ. نورة الدوسري", due: "2026-06-20" },
];

const STATUS_META: Record<
  MemoStatus,
  { label: string; color: string; dot: string }
> = {
  draft: { label: "مسودة", color: "var(--text-muted)", dot: "var(--text-faint)" },
  audit: { label: "مراجعة تدقيق", color: "var(--info)", dot: "var(--info)" },
  legal: { label: "مراجعة قانونية", color: "var(--warn)", dot: "var(--warn)" },
  approved: { label: "معتمد", color: "var(--accent)", dot: "var(--accent)" },
  published: { label: "منشور", color: "var(--success)", dot: "var(--success)" },
};

const WORKFLOW: { key: MemoStatus; label: string }[] = [
  { key: "draft", label: "مسودة" },
  { key: "audit", label: "مراجعة تدقيق" },
  { key: "legal", label: "مراجعة قانونية" },
  { key: "approved", label: "معتمد" },
  { key: "published", label: "منشور" },
];

function metaOf(status: string) {
  return STATUS_META[status as MemoStatus] ?? STATUS_META.draft;
}

function stageOf(status: string): number {
  const i = WORKFLOW.findIndex((w) => w.key === status);
  return i === -1 ? 1 : i + 1;
}

function StatusBadge({ status }: { status: string }) {
  const meta = metaOf(status);
  return (
    <span
      className="pill text-xs whitespace-nowrap inline-flex items-center gap-1.5"
      style={{
        background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
        color: meta.color,
        borderColor: `color-mix(in srgb, ${meta.color} 30%, transparent)`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: meta.dot }}
      />
      {meta.label}
    </span>
  );
}

export default function MemosPage() {
  const { data: memos, reload } = useQafData(fetchMemos, FALLBACK_MEMOS);
  const [openNew, setOpenNew] = useState(false);

  const count = (status: MemoStatus) =>
    memos.filter((m) => m.status === status).length;

  return (
    <>
      <Topbar
        title="المذكرات واللوائح"
        sub="إدارة المذكرات القانونية عبر مراحل الاعتماد"
        breadcrumb={["الرئيسية", "المذكرات"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="المذكرات واللوائح"
          sub="تتبّع كل مذكرة من المسودة حتى النشر عبر سير اعتماد متعدد المراحل"
          actions={
            <button onClick={() => setOpenNew(true)} className="btn btn-brand text-sm py-2.5">+ مذكرة جديدة</button>
          }
        />

        {/* Status stat row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="مسودة"
            value={count("draft")}
            icon="📝"
            accent="info"
            hint="قيد الكتابة"
          />
          <StatCard
            label="مراجعة تدقيق"
            value={count("audit")}
            icon="🔍"
            accent="info"
            hint="عند مدقّق لغوي"
          />
          <StatCard
            label="مراجعة قانونية"
            value={count("legal")}
            icon="⚖"
            accent="warn"
            hint="عند المحامي الأول"
          />
          <StatCard
            label="معتمد"
            value={count("approved")}
            icon="✅"
            accent="accent"
            hint="بانتظار النشر"
          />
          <StatCard
            label="منشور"
            value={count("published")}
            icon="📤"
            accent="success"
            hint="رُفع للمحكمة"
          />
        </div>

        {/* Memos table — desktop / tablet */}
        <div className="card !p-0 overflow-x-auto hidden md:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="text-start font-medium px-4 py-3">عنوان المذكرة</th>
                <th className="text-start font-medium px-4 py-3">القضية المرتبطة</th>
                <th className="text-start font-medium px-4 py-3">الكاتب</th>
                <th className="text-start font-medium px-4 py-3">الحالة</th>
                <th className="text-start font-medium px-4 py-3">تاريخ الاستحقاق</th>
              </tr>
            </thead>
            <tbody>
              {memos.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-[var(--text)] max-w-[260px] break-words">
                      {m.title}
                    </div>
                    <div className="text-[11px] text-[var(--text-faint)] num" dir="ltr">
                      {m.id}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="text-[var(--text)] max-w-[240px] break-words">
                      —
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap text-[var(--text-muted)]">
                    {m.author}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    <span className="num text-[var(--text-muted)]" dir="ltr">
                      {m.due}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Memos cards — mobile */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {memos.map((m) => (
            <div key={m.id} className="card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-medium text-[var(--text)] break-words min-w-0">
                  {m.title}
                </h3>
                <StatusBadge status={m.status} />
              </div>
              <div className="text-sm text-[var(--text-muted)] break-words mb-1">
                —
              </div>
              <div className="text-[11px] text-[var(--text-faint)] num mb-3" dir="ltr">
                {m.id}
              </div>

              {/* mini workflow tracker */}
              <div className="flex items-center gap-1 mb-3">
                {WORKFLOW.map((w, i) => (
                  <span
                    key={w.key}
                    className="h-1.5 flex-1 rounded-full"
                    style={{
                      background:
                        i < stageOf(m.status)
                          ? metaOf(m.status).dot
                          : "var(--border)",
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[var(--text-muted)] truncate">{m.author}</span>
                <span className="flex items-center gap-1 text-[var(--text-faint)]">
                  الاستحقاق
                  <span className="num text-[var(--text-muted)]" dir="ltr">
                    {m.due}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Workflow legend */}
        <div className="card mt-6">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
            مسار الاعتماد
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {WORKFLOW.map((w, i) => (
              <div key={w.key} className="flex items-center gap-2">
                <span
                  className="pill text-xs whitespace-nowrap inline-flex items-center gap-1.5"
                  style={{
                    background: `color-mix(in srgb, ${STATUS_META[w.key].color} 14%, transparent)`,
                    color: STATUS_META[w.key].color,
                    borderColor: `color-mix(in srgb, ${STATUS_META[w.key].color} 30%, transparent)`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: STATUS_META[w.key].dot }}
                  />
                  {w.label}
                </span>
                {i < WORKFLOW.length - 1 && (
                  <span className="text-[var(--text-faint)]">←</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-faint)] mt-3">
            {/* تنتقل المذكرة تلقائياً للمرحلة التالية عند موافقة المسؤول — ولا رجعة إلا بسبب مكتوب */}
            تنتقل المذكرة للمرحلة التالية فور اعتماد المسؤول، وأي إرجاع يتطلب سبباً مكتوباً.
          </p>
        </div>
      </main>
      <RecordFormModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        title="مذكرة جديدة"
        fields={MEMO_FIELDS}
        submitLabel="إضافة المذكرة"
        onSubmit={async (v) => { await createMemo(v); reload(); }}
      />
    </>
  );
}
