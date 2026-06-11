"use client";

import { useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useQafData } from "@/hooks/useQafData";
import { fetchExpenses, createExpense } from "@/lib/data/queries";
import type { ExpenseItem } from "@/lib/data/types";
import { RecordFormModal, type FormField } from "@/components/app/RecordFormModal";

const EXPENSE_FIELDS: FormField[] = [
  { name: "item", label: "البند", required: true, placeholder: "رسوم رفع دعوى" },
  { name: "amount", label: "المبلغ (ر.س)", type: "number", required: true, half: true, placeholder: "1500" },
  { name: "category", label: "الفئة", type: "select", half: true,
    options: ["رسوم محكمة", "رسوم حكومية", "تنقلات", "سفر", "خبير", "ترجمة", "خدمات", "اشتراكات"].map((v) => ({ value: v, label: v })) },
  { name: "paidBy", label: "دفعها", half: true },
  { name: "status", label: "الحالة", type: "select", half: true, default: "معتمد",
    options: ["معتمد", "بانتظار", "مرفوض"].map((v) => ({ value: v, label: v })) },
  { name: "caseNumber", label: "القضية المرتبطة", half: true, dir: "ltr", placeholder: "2026/0142" },
  { name: "date", label: "التاريخ", type: "date", half: true },
];

// Demo fallback (shown only when no firm/DB yet). Shaped like ExpenseItem.
const FALLBACK_EXPENSES: ExpenseItem[] = [
  { id: "EXP-1042", item: "رسوم رفع دعوى تجارية", category: "رسوم محكمة", amount: 3500, date: "2026-06-08", paidBy: "أحمد الدوسري", status: "معتمد", caseNumber: "القضية ١٢٤ — المحكمة التجارية بالرياض" },
  { id: "EXP-1041", item: "أتعاب خبير محاسبي مُعتمد", category: "خبير", amount: 6000, date: "2026-06-05", paidBy: "سارة العتيبي", status: "بانتظار", caseNumber: "القضية ٠٩٨ — المحكمة العامة بالرياض" },
  { id: "EXP-1040", item: "تنقلات وحضور جلسة بجدة", category: "تنقلات", amount: 1850, date: "2026-06-03", paidBy: "أحمد الدوسري", status: "معتمد", caseNumber: "القضية ١١٧ — المحكمة العمالية بجدة" },
  { id: "EXP-1039", item: "ترجمة عقد معتمد إنجليزي", category: "ترجمة", amount: 950, date: "2026-05-29", paidBy: "نورة القحطاني", status: "معتمد", caseNumber: "القضية ١٠٣ — محكمة التنفيذ بالرياض" },
  { id: "EXP-1038", item: "رسوم استخراج صك تنفيذي", category: "رسوم محكمة", amount: 1200, date: "2026-05-24", paidBy: "سارة العتيبي", status: "بانتظار", caseNumber: "القضية ٠٨٧ — محكمة التنفيذ بالرياض" },
  { id: "EXP-1037", item: "أتعاب مترجم محلّف بالجلسة", category: "ترجمة", amount: 1400, date: "2026-05-20", paidBy: "خالد الشهري", status: "مرفوض", caseNumber: "القضية ١٢٢ — المحكمة الإدارية بالرياض" },
  { id: "EXP-1036", item: "تنقلات لمحكمة الأحوال الشخصية", category: "تنقلات", amount: 600, date: "2026-05-16", paidBy: "نورة القحطاني", status: "معتمد", caseNumber: "القضية ٠٧٩ — محكمة الأحوال الشخصية بالرياض" },
];

const STATUS_META: Record<string, { label: string; color: string }> = {
  "معتمد": { label: "معتمد", color: "var(--success)" },
  "بانتظار": { label: "بانتظار الموافقة", color: "var(--warn)" },
  "مرفوض": { label: "مرفوض", color: "var(--danger)" },
};

const CATEGORY_STYLE: Record<string, { icon: string; color: string }> = {
  "رسوم محكمة": { icon: "⚖", color: "var(--brand)" },
  "رسوم حكومية": { icon: "⚖", color: "var(--brand)" },
  "تنقلات": { icon: "✈", color: "var(--info)" },
  "سفر": { icon: "✈", color: "var(--info)" },
  "خبير": { icon: "📊", color: "var(--accent)" },
  "خبراء": { icon: "📊", color: "var(--accent)" },
  "ترجمة": { icon: "🌐", color: "var(--success)" },
  "خدمات": { icon: "🧰", color: "var(--success)" },
  "اشتراكات": { icon: "🔄", color: "var(--info)" },
};

function catStyle(cat: string) {
  return CATEGORY_STYLE[cat] ?? { icon: "💸", color: "var(--brand)" };
}

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export default function ExpensesPage() {
  const { data: expenses, reload } = useQafData(fetchExpenses, FALLBACK_EXPENSES);
  const [openNew, setOpenNew] = useState(false);

  const monthTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const approved = expenses.filter((e) => e.status === "معتمد");
  const approvedTotal = approved.reduce((s, e) => s + e.amount, 0);
  const pendingArr = expenses.filter((e) => e.status === "بانتظار");
  const pendingTotal = pendingArr.reduce((s, e) => s + e.amount, 0);

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
            <button onClick={() => setOpenNew(true)} className="btn btn-brand text-sm py-2.5">
              + تسجيل مصروف
            </button>
          }
        />

        {/* Stat row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard label="إجمالي الشهر" value={`${fmt(monthTotal)} ر.س`} icon="💰" accent="brand" trend={{ v: "+8%", up: true }} hint="مقارنة بمايو ٢٠٢٦" />
          <StatCard label="معتمد" value={`${fmt(approvedTotal)} ر.س`} icon="✓" accent="success" hint={`${approved.length} بنود مُعتمدة`} />
          <StatCard label="بانتظار الموافقة" value={`${fmt(pendingTotal)} ر.س`} icon="⏳" accent="warn" hint={`${pendingArr.length} بنود تنتظر القرار`} />
        </div>

        {/* Expenses table */}
        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-right text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="font-medium px-4 py-3.5 whitespace-nowrap">البند</th>
                <th className="font-medium px-4 py-3.5 whitespace-nowrap">المبلغ</th>
                <th className="font-medium px-4 py-3.5 whitespace-nowrap">التاريخ</th>
                <th className="font-medium px-4 py-3.5 whitespace-nowrap">دفعها</th>
                <th className="font-medium px-4 py-3.5 whitespace-nowrap">الحالة</th>
                <th className="font-medium px-4 py-3.5 whitespace-nowrap">القضية المرتبطة</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => {
                const st = STATUS_META[e.status] ?? { label: e.status, color: "var(--text-muted)" };
                const cat = catStyle(e.category);
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
                            background: `color-mix(in srgb, ${cat.color} 14%, transparent)`,
                            color: cat.color,
                          }}
                        >
                          {cat.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-[var(--text)] break-words leading-snug">
                            {e.item}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className="pill"
                              style={{
                                background: `color-mix(in srgb, ${cat.color} 12%, transparent)`,
                                color: cat.color,
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
                      <span className="num font-semibold text-[var(--text)]" dir="ltr">{fmt(e.amount)}</span>{" "}
                      <span className="text-[var(--text-faint)] text-xs">ر.س</span>
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap text-[var(--text-muted)]">
                      <span className="num" dir="ltr">{e.date}</span>
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
                      <span className="break-words leading-snug">{e.caseNumber}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-[var(--text-faint)] mt-3 px-1">
          يعرض هذا الجدول مصروفات المكتب. للأرشيف الكامل راجع التقارير.
        </p>
      </main>
      <RecordFormModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        title="تسجيل مصروف"
        fields={EXPENSE_FIELDS}
        submitLabel="تسجيل المصروف"
        onSubmit={async (v) => { await createExpense(v); reload(); }}
      />
    </>
  );
}
