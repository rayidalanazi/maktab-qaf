"use client";

import { useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { useQafData } from "@/hooks/useQafData";
import { fetchEvents, createEvent } from "@/lib/data/queries";
import { MOCK_EVENTS } from "@/data/app-mock";
import type { EventItem } from "@/lib/data/types";
import { RecordFormModal, type FormField } from "@/components/app/RecordFormModal";
import { formatHijri } from "@/lib/hijri";

const EVENT_FIELDS: FormField[] = [
  { name: "title", label: "العنوان", required: true, placeholder: "جلسة قضية 2026/0142" },
  { name: "type", label: "النوع", type: "select", half: true, default: "جلسة",
    options: ["جلسة", "اجتماع", "موعد نهائي", "مهمة", "تدريب"].map((v) => ({ value: v, label: v })) },
  { name: "date", label: "التاريخ", type: "date", required: true, half: true },
  { name: "time", label: "الوقت", type: "time", half: true },
  { name: "location", label: "المكان", half: true, placeholder: "المحكمة العامة بالرياض" },
  { name: "desc", label: "تفاصيل", type: "textarea" },
];

const TYPE_COLOR: Record<string, string> = {
  "جلسة": "var(--brand)",
  "اجتماع": "var(--info)",
  "موعد نهائي": "var(--accent)",
  "مهمة": "var(--warn)",
  "تدريب": "var(--success)",
};

export default function SchedulePage() {
  const { data: events, reload } = useQafData(fetchEvents, MOCK_EVENTS);
  const [openNew, setOpenNew] = useState(false);

  // Group by date
  const byDate = events.reduce<Record<string, EventItem[]>>((acc, e) => {
    (acc[e.date] = acc[e.date] || []).push(e);
    return acc;
  }, {});

  return (
    <>
      <Topbar title="الجدولة" sub="التقويم والمواعيد" breadcrumb={["الرئيسية", "الجدولة"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="الجدولة"
          sub="كل الجلسات والمواعيد القادمة"
          actions={<button onClick={() => setOpenNew(true)} className="btn btn-brand text-sm py-2.5">+ موعد جديد</button>}
        />

        <div className="space-y-4">
          {Object.entries(byDate).sort().map(([date, dayEvents]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-[var(--text-muted)]">
                    {formatHijri(date, { withEra: true })}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-faint)]" dir="ltr">
                    {date}
                  </div>
                </div>
                <div className="flex-1 h-px bg-[var(--border)]" />
                <div className="text-[10px] text-[var(--text-faint)] shrink-0">
                  {dayEvents.length} موعد
                </div>
              </div>
              <div className="space-y-2">
                {dayEvents.map((e) => (
                  <div
                    key={e.id}
                    className="card flex items-start gap-4 hover:border-[var(--brand)]/40 cursor-pointer"
                  >
                    <div className="text-center shrink-0">
                      <div className="text-xs text-[var(--text-faint)]">{e.time.split(":")[0]}</div>
                      <div className="font-bold text-lg num">{e.time}</div>
                    </div>
                    <div
                      className="w-1 self-stretch rounded-full shrink-0"
                      style={{ background: TYPE_COLOR[e.type] || "var(--brand)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm mb-0.5">{e.title}</div>
                      <div className="text-xs text-[var(--text-muted)]">{e.desc}</div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${TYPE_COLOR[e.type]} 15%, transparent)`,
                        color: TYPE_COLOR[e.type],
                      }}
                    >
                      {e.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <RecordFormModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        title="موعد جديد"
        fields={EVENT_FIELDS}
        submitLabel="إضافة الموعد"
        onSubmit={async (v) => { await createEvent(v); reload(); }}
      />
    </>
  );
}
