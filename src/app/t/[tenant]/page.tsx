"use client";

import { useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { StatCard } from "@/components/app/StatCard";
import { PageHeader } from "@/components/app/PageHeader";
import { useSession } from "@/components/app/SessionProvider";
import { useQafData } from "@/hooks/useQafData";
import {
  fetchCases, fetchEvents, fetchTasks, fetchNotifications, createCase, createMemo,
} from "@/lib/data/queries";
import {
  MOCK_CASES, MOCK_TASKS, MOCK_EVENTS, MOCK_NOTIFICATIONS,
} from "@/data/app-mock";
import { RecordFormModal, type FormField } from "@/components/app/RecordFormModal";
import { formatHijriShort } from "@/lib/hijri";

function greeting(full?: string | null): string {
  const name = full?.trim().split(/\s+/)[0];
  return name ? `مرحباً، ${name} 👋` : "مرحباً 👋";
}

const QUICK_CASE_FIELDS: FormField[] = [
  { name: "name", label: "رقم القضية", required: true, dir: "ltr", half: true, placeholder: "2026/0500" },
  { name: "type", label: "النوع", type: "select", half: true, default: "مدني",
    options: ["تجاري", "مدني", "جزائي", "عمالي", "أحوال شخصية", "تنفيذي"].map((v) => ({ value: v, label: v })) },
  { name: "plaintiff", label: "المدّعي", half: true },
  { name: "defendant", label: "المدّعى عليه", half: true },
  { name: "deadline", label: "الموعد القادم", type: "date", half: true },
  { name: "assignedTo", label: "المحامي المسؤول", half: true },
];

const QUICK_MEMO_FIELDS: FormField[] = [
  { name: "title", label: "عنوان المذكرة", required: true },
  { name: "type", label: "النوع", type: "select", half: true, default: "مذكرة",
    options: ["مذكرة", "لائحة", "جواب", "اعتراض"].map((v) => ({ value: v, label: v })) },
  { name: "due", label: "الاستحقاق", type: "date", half: true },
];

export default function TenantDashboardPage() {
  const { profile } = useSession();
  const { data: cases, reload: reloadCases } = useQafData(fetchCases, MOCK_CASES);
  const { data: tasks } = useQafData(fetchTasks, MOCK_TASKS);
  const { data: events } = useQafData(fetchEvents, MOCK_EVENTS);
  const { data: notifications } = useQafData(fetchNotifications, MOCK_NOTIFICATIONS);
  const [openCase, setOpenCase] = useState(false);
  const [openMemo, setOpenMemo] = useState(false);

  const activeCases = cases.filter((c) => c.status === "نشط").length;
  const urgentTasks = tasks.filter((t) => t.priority === "عالية").length;
  const upcomingHearings = events.filter((e) => e.type === "جلسة").length;
  const unreadNotifs = notifications.filter((n) => n.unread).length;

  return (
    <>
      <Topbar title="الصفحة الرئيسية" breadcrumb={["الرئيسية"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title={greeting(profile?.full_name)}
          sub="إليك ملخّص ما يحتاج انتباهك اليوم"
          actions={
            <>
              <button onClick={() => setOpenCase(true)} className="btn btn-brand text-sm py-2.5">+ قضية جديدة</button>
              <button onClick={() => setOpenMemo(true)} className="btn btn-ghost text-sm py-2.5">📝 مذكرة جديدة</button>
            </>
          }
        />

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="قضايا نشطة" value={activeCases} icon="⚖" accent="brand" trend={{ v: "+2", up: true }} hint="ضمن نطاق الأداء" />
          <StatCard label="مهام عاجلة" value={urgentTasks} icon="📌" accent="accent" hint="تحتاج إنجازك" />
          <StatCard label="جلسات قادمة" value={upcomingHearings} icon="📅" accent="info" hint="هذا الأسبوع" />
          <StatCard label="إشعارات جديدة" value={unreadNotifs} icon="🔔" accent="warn" hint="3 منها عاجلة" />
        </div>

        {/* Two columns: urgent cases + upcoming hearings */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold">القضايا العاجلة</div>
                <div className="text-xs text-[var(--text-faint)]">آخر مواعيد قريبة</div>
              </div>
              <a className="text-xs text-[var(--brand)] hover:underline">شف الكل ←</a>
            </div>
            <div className="space-y-2.5">
              {cases.filter((c) => c.status === "نشط").slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)]">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm">قضية {c.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate">
                      {c.plaintiff} ضد {c.defendant} • {c.type}
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className="text-[10px] text-[var(--text-faint)]">{formatHijriShort(c.deadline)} هـ</div>
                    <div className="text-[9px] text-[var(--text-faint)] num" dir="ltr">{c.deadline}</div>
                    <div className="text-[10px] text-[var(--accent)]">{c.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold">جدول اليوم</div>
              <a className="text-xs text-[var(--brand)] hover:underline">التقويم ←</a>
            </div>
            <div className="space-y-2.5">
              {events.slice(0, 4).map((e) => (
                <div key={e.id} className="flex items-start gap-3">
                  <div className="text-center shrink-0 w-12 bg-[var(--bg-hover)] rounded-lg p-1.5 border border-[var(--border)]">
                    <div className="text-[10px] text-[var(--text-faint)]">{e.date.slice(5)}</div>
                    <div className="text-xs font-bold">{e.time}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{e.title}</div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate">{e.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <RecordFormModal
        open={openCase}
        onClose={() => setOpenCase(false)}
        title="قضية جديدة"
        fields={QUICK_CASE_FIELDS}
        submitLabel="إضافة القضية"
        onSubmit={async (v) => { await createCase(v); reloadCases(); }}
      />
      <RecordFormModal
        open={openMemo}
        onClose={() => setOpenMemo(false)}
        title="مذكرة جديدة"
        fields={QUICK_MEMO_FIELDS}
        submitLabel="إضافة المذكرة"
        onSubmit={async (v) => { await createMemo(v); }}
      />
    </>
  );
}
