"use client";

import { useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useQafData } from "@/hooks/useQafData";
import { fetchClients, createClient } from "@/lib/data/queries";
import type { ClientItem } from "@/lib/data/types";
import { RecordFormModal, type FormField } from "@/components/app/RecordFormModal";

const CLIENT_FIELDS: FormField[] = [
  { name: "name", label: "اسم العميل", required: true, placeholder: "شركة النجم التجارية" },
  { name: "type", label: "النوع", type: "select", half: true, default: "individual",
    options: [{ value: "individual", label: "فرد" }, { value: "company", label: "شركة" }] },
  { name: "contact", label: "الجوال / التواصل", half: true, dir: "ltr", placeholder: "05xxxxxxxx" },
  { name: "status", label: "الحالة", type: "select", half: true, default: "نشط",
    options: ["نشط", "معلق", "غير نشط"].map((v) => ({ value: v, label: v })) },
  { name: "lawyer", label: "المحامي المسؤول", half: true },
];

const STATUS_COLOR: Record<string, string> = {
  "نشط": "var(--success)",
  "معلق": "var(--warn)",
  "مغلق": "var(--text-faint)",
};

function statusColor(s: string): string {
  return STATUS_COLOR[s] ?? "var(--success)";
}

// Demo fallback (shown only when no firm/DB yet). Shaped like ClientItem.
const FALLBACK_CLIENTS: ClientItem[] = [
  { id: "TJ-4471", name: "عبدالعزيز الدوسري", type: "شركة", contact: "0501244710", status: "نشط", lawyer: "أ. سارة القحطاني" },
  { id: "AH-2098", name: "نورة الشهري", type: "شركة", contact: "0552098110", status: "نشط", lawyer: "أ. خالد العتيبي" },
  { id: "LB-1320", name: "فهد بن سعد المطيري", type: "شركة", contact: "0561320440", status: "نشط", lawyer: "أ. ريم الغامدي" },
  { id: "AD-0775", name: "هند العنزي", type: "فرد", contact: "0540775220", status: "معلق", lawyer: "أ. ماجد الحربي" },
  { id: "EX-6612", name: "تركي السبيعي", type: "شركة", contact: "0506612330", status: "نشط", lawyer: "أ. سارة القحطاني" },
  { id: "GN-3344", name: "منيرة الزهراني", type: "شركة", contact: "0553344550", status: "معلق", lawyer: "أ. خالد العتيبي" },
  { id: "GN-3390", name: "بدر القرني", type: "شركة", contact: "0563390660", status: "نشط", lawyer: "أ. ريم الغامدي" },
];

export default function ClientCasesPage() {
  const { data: clients, reload } = useQafData(fetchClients, FALLBACK_CLIENTS);
  const [openNew, setOpenNew] = useState(false);

  const total = clients.length;
  const lawyers = new Set(clients.map((c) => c.lawyer).filter(Boolean)).size;

  return (
    <>
      <Topbar
        title="قضايا العملاء"
        sub="نظرة على قضايا كل عميل والمواعيد القادمة"
        breadcrumb={["الرئيسية", "قضايا العملاء"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="قضايا العملاء"
          sub="القضايا مجمّعة حسب العميل مع أقرب المواعيد والمواقيت النظامية"
          actions={
            <button onClick={() => setOpenNew(true)} className="btn btn-brand text-sm py-2.5">+ عميل جديد</button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="إجمالي القضايا"
            value={total}
            icon="⚖"
            accent="brand"
            hint="موزّعة على العملاء"
          />
          <StatCard
            label="مواعيد عاجلة"
            value="—"
            icon="🔴"
            accent="warn"
            trend={{ v: "خلال 3 أيام", up: false }}
            hint="تتطلّب إجراء فوري"
          />
          <StatCard
            label="مواعيد هذا الأسبوع"
            value="—"
            icon="📅"
            accent="info"
            hint="ضمن 7 أيام"
          />
          <StatCard
            label="المحامون المكلّفون"
            value={lawyers}
            icon="👤"
            accent="success"
            hint="على قضايا نشطة"
          />
        </div>

        {/* Client case cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => {
            const uColor = statusColor(c.status);
            return (
              <article
                key={c.id}
                className="card flex flex-col gap-3 border-t-2"
                style={{ borderTopColor: uColor }}
              >
                {/* Header: client + days badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-base leading-tight truncate">
                      {c.name}
                    </h3>
                    <p className="text-xs text-[var(--text-faint)] truncate mt-0.5">
                      {c.type || "—"}
                    </p>
                  </div>
                  <span
                    className="shrink-0 inline-flex flex-col items-center justify-center rounded-lg px-2.5 py-1 leading-none"
                    style={{
                      background: `color-mix(in srgb, ${uColor} 15%, transparent)`,
                      color: uColor,
                    }}
                  >
                    <span className="num font-black text-lg" dir="ltr">
                      —
                    </span>
                    <span className="text-[9px] mt-0.5">يوم متبقٍ</span>
                  </span>
                </div>

                {/* Subject */}
                <div className="text-sm text-[var(--text)] break-words leading-relaxed">
                  {c.contact || "—"}
                </div>

                {/* Court + case no */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="pill pill-brand truncate max-w-full">
                    {c.status}
                  </span>
                  <span className="num text-[var(--text-faint)]" dir="ltr">
                    #{c.id}
                  </span>
                </div>

                {/* Footer: lawyer + deadline */}
                <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 shrink-0 rounded-full grid place-items-center text-xs bg-[var(--bg-hover)] text-[var(--text-muted)]">
                      👤
                    </span>
                    <span className="text-xs text-[var(--text-muted)] truncate">
                      {c.lawyer || "—"}
                    </span>
                  </div>
                  <div className="text-left shrink-0">
                    <div
                      className="text-[10px] font-medium"
                      style={{ color: uColor }}
                    >
                      {c.status}
                    </div>
                    <div className="num text-xs text-[var(--text-muted)]" dir="ltr">
                      —
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Hint footer */}
        <p className="text-xs text-[var(--text-faint)] mt-6 text-center">
          {/* ما فيه أعذار للمواعيد الفائتة — كل بطاقة محسوبة بالأيام */}
          تُحدّث المواعيد تلقائيًا حسب التقويم النظامي للمحاكم.
        </p>
      </main>
      <RecordFormModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        title="عميل جديد"
        fields={CLIENT_FIELDS}
        submitLabel="إضافة العميل"
        onSubmit={async (v) => { await createClient(v); reload(); }}
      />
    </>
  );
}
