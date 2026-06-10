"use client";

import { Topbar } from "@/components/app/Topbar";
import { StatCard } from "@/components/app/StatCard";
import { PageHeader } from "@/components/app/PageHeader";
import { useSession } from "@/components/app/SessionProvider";
import { useQafData } from "@/hooks/useQafData";
import {
  fetchCases, fetchEvents, fetchTasks, fetchNotifications,
} from "@/lib/data/queries";
import {
  MOCK_CASES, MOCK_TASKS, MOCK_EVENTS, MOCK_NOTIFICATIONS,
} from "@/data/app-mock";
import { formatHijriShort } from "@/lib/hijri";

function greeting(full?: string | null): string {
  const name = full?.trim().split(/\s+/)[0];
  return name ? `مرحباً، ${name} 👋` : "مرحباً 👋";
}

export default function TenantDashboardPage() {
  const { profile } = useSession();
  const { data: cases } = useQafData(fetchCases, MOCK_CASES);
  const { data: tasks } = useQafData(fetchTasks, MOCK_TASKS);
  const { data: events } = useQafData(fetchEvents, MOCK_EVENTS);
  const { data: notifications } = useQafData(fetchNotifications, MOCK_NOTIFICATIONS);

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
              <button className="btn btn-brand text-sm py-2.5">+ قضية جديدة</button>
              <button className="btn btn-ghost text-sm py-2.5">📝 مذكرة جديدة</button>
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
    </>
  );
}
