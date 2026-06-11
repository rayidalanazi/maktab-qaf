"use client";

import { useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useQafData } from "@/hooks/useQafData";
import { fetchInvoices, createInvoice } from "@/lib/data/queries";
import type { InvoiceItem } from "@/lib/data/types";
import { RecordFormModal, type FormField } from "@/components/app/RecordFormModal";

const VAT_RATE = 0.15;

const INVOICE_FIELDS: FormField[] = [
  { name: "client", label: "العميل", required: true, placeholder: "شركة النجم التجارية" },
  { name: "amount", label: "المبلغ قبل الضريبة (ر.س)", type: "number", required: true, half: true, placeholder: "20000" },
  { name: "number", label: "رقم الفاتورة (اختياري)", dir: "ltr", half: true, placeholder: "تلقائي" },
  { name: "status", label: "الحالة", type: "select", half: true, default: "draft",
    options: [
      { value: "draft", label: "مسودة" }, { value: "sent", label: "مرسلة" },
      { value: "paid", label: "مدفوعة" }, { value: "partially_paid", label: "مدفوعة جزئياً" },
      { value: "overdue", label: "متأخرة" },
    ] },
  { name: "issued", label: "تاريخ الإصدار", type: "date", half: true },
  { name: "due", label: "الاستحقاق", type: "date", half: true },
];

// Demo fallback (shown only when no firm/DB yet). Shaped like InvoiceItem.
const FALLBACK_INVOICES: InvoiceItem[] = [
  { id: "QF-2026-0117", client: "شركة الخليج للمقاولات", number: "QF-2026-0117", amount: 24000, vat: 24000 * VAT_RATE, total: 24000 * 1.15, status: "paid", issued: "2026-05-02", due: "2026-06-01" },
  { id: "QF-2026-0118", client: "مؤسسة نخيل الرياض التجارية", number: "QF-2026-0118", amount: 8500, vat: 8500 * VAT_RATE, total: 8500 * 1.15, status: "sent", issued: "2026-05-09", due: "2026-06-08" },
  { id: "QF-2026-0119", client: "عبدالعزيز بن سعد الدوسري", number: "QF-2026-0119", amount: 5200, vat: 5200 * VAT_RATE, total: 5200 * 1.15, status: "overdue", issued: "2026-04-15", due: "2026-05-15" },
  { id: "QF-2026-0120", client: "شركة وادي حنيفة القابضة", number: "QF-2026-0120", amount: 41000, vat: 41000 * VAT_RATE, total: 41000 * 1.15, status: "sent", issued: "2026-05-18", due: "2026-06-17" },
  { id: "QF-2026-0121", client: "منيرة بنت فهد العتيبي", number: "QF-2026-0121", amount: 3000, vat: 3000 * VAT_RATE, total: 3000 * 1.15, status: "overdue", issued: "2026-03-28", due: "2026-04-27" },
  { id: "QF-2026-0122", client: "مجموعة طويق الصناعية", number: "QF-2026-0122", amount: 17500, vat: 17500 * VAT_RATE, total: 17500 * 1.15, status: "paid", issued: "2026-05-21", due: "2026-06-20" },
  { id: "QF-2026-0123", client: "شركة سدير اللوجستية", number: "QF-2026-0123", amount: 9800, vat: 9800 * VAT_RATE, total: 9800 * 1.15, status: "draft", issued: "2026-05-25", due: "2026-06-24" },
];

const STATUS_META: Record<string, { label: string; color: string }> = {
  paid: { label: "مدفوعة", color: "var(--success)" },
  sent: { label: "مرسلة", color: "var(--info)" },
  partially_paid: { label: "مدفوعة جزئياً", color: "var(--warn)" },
  overdue: { label: "متأخرة", color: "var(--danger)" },
  draft: { label: "مسودة", color: "var(--text-muted)" },
  cancelled: { label: "ملغاة", color: "var(--text-faint)" },
  refunded: { label: "مُستردة", color: "var(--text-faint)" },
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InvoicesPage() {
  const { data: invoices, reload } = useQafData(fetchInvoices, FALLBACK_INVOICES);
  const [openNew, setOpenNew] = useState(false);

  const totalOf = (inv: InvoiceItem) => inv.total || inv.amount + inv.vat;
  const collected = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + totalOf(i), 0);
  const pending = invoices
    .filter((i) => i.status === "sent" || i.status === "draft" || i.status === "partially_paid")
    .reduce((s, i) => s + totalOf(i), 0);
  const overdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + totalOf(i), 0);

  return (
    <>
      <Topbar
        title="الفوترة الذكية"
        sub="فواتير ضريبية + احتساب VAT — تكامل زاتكا قيد الاعتماد"
        breadcrumb={["الرئيسية", "الفواتير"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="الفوترة الذكية"
          sub="إصدار فواتير ضريبية مع احتساب ضريبة القيمة المضافة 15% تلقائيًا. التكامل المعتمد مع فاتورة/زاتكا (المرحلة الثانية) قيد الاعتماد."
          actions={
            <button onClick={() => setOpenNew(true)} className="btn btn-brand text-sm py-2.5">
              + فاتورة جديدة
            </button>
          }
        />

        {/* Stat row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard label="إجمالي محصّل" value={fmt(collected)} icon="✅" accent="success" trend={{ v: "+12%", up: true }} hint="ر.س — فواتير مدفوعة" />
          <StatCard label="معلّق" value={fmt(pending)} icon="⏳" accent="info" hint="ر.س — مرسلة + مسودات" />
          <StatCard label="متأخر" value={fmt(overdue)} icon="⚠" accent="warn" trend={{ v: "+2", up: false }} hint="ر.س — تجاوزت الاستحقاق" />
          <StatCard label="عدد الفواتير" value={invoices.length} icon="🧾" accent="brand" hint="خلال الدورة الحالية" />
        </div>

        {/* Invoices table */}
        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-right text-[11px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="font-semibold px-4 py-3">رقم الفاتورة</th>
                <th className="font-semibold px-4 py-3">العميل</th>
                <th className="font-semibold px-4 py-3">المبلغ (شامل الضريبة)</th>
                <th className="font-semibold px-4 py-3">تاريخ الإصدار</th>
                <th className="font-semibold px-4 py-3">الاستحقاق</th>
                <th className="font-semibold px-4 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const meta = STATUS_META[inv.status] ?? STATUS_META.draft;
                return (
                  <tr
                    key={inv.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="num font-mono text-[var(--brand)]" dir="ltr">
                        {inv.number}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <span className="block truncate text-[var(--text)]">{inv.client}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold">
                        <span className="num" dir="ltr">{fmt(totalOf(inv))}</span>{" "}
                        <span className="text-[var(--text-faint)] text-xs">ر.س</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-faint)]">
                        ضريبة <span className="num" dir="ltr">{fmt(inv.vat)}</span> (15%)
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--text-muted)]">
                      <span className="num" dir="ltr">{inv.issued}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--text-muted)]">
                      <span className="num" dir="ltr">{inv.due}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="pill text-xs font-semibold"
                        style={{
                          background: `color-mix(in srgb, ${meta.color} 15%, transparent)`,
                          color: meta.color,
                        }}
                      >
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-[var(--text-faint)] mt-3">
          // التكامل المعتمد مع فاتورة/زاتكا (المرحلة الثانية: QR + الختم التشفيري + المقاصّة اللحظية) قيد الاعتماد — مستهدف قبل موجة 2026. حالياً: قالب فاتورة ضريبية + احتساب VAT 15%.
        </p>
      </main>
      <RecordFormModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        title="فاتورة جديدة"
        sub="ضريبة القيمة المضافة 15% تُحتسب تلقائياً"
        fields={INVOICE_FIELDS}
        submitLabel="إصدار الفاتورة"
        onSubmit={async (v) => { await createInvoice(v); reload(); }}
      />
    </>
  );
}
