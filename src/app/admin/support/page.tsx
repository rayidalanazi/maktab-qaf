"use client";

import { useMemo } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { useAdminData } from "@/hooks/useAdminData";
import { fetchTickets } from "@/lib/data/queries";
import type { TicketItem } from "@/lib/data/types";
import { ADMIN_SUPPORT_TICKETS } from "@/data/admin-mock";

const STATUS_COLOR: Record<string, string> = {
  "جديد": "var(--accent)",
  "قيد الحل": "var(--warn)",
  "تم الرد": "var(--info)",
  "مغلق": "var(--success)",
};

const PRIORITY_COLOR: Record<string, string> = {
  "عالية": "var(--accent)",
  "حرجة": "var(--accent)",
  "مرتفعة": "var(--warn)",
  "متوسطة": "var(--warn)",
  "عادية": "var(--text-faint)",
  "منخفضة": "var(--text-faint)",
};

// live DB status keys → Arabic display labels
const LIVE_STATUS_AR: Record<string, string> = {
  open: "جديد",
  in_progress: "قيد الحل",
  answered: "تم الرد",
  closed: "مغلق",
};

// Demo fallback — shaped like TicketItem so live and demo render the same way.
const FALLBACK_TICKETS: TicketItem[] = ADMIN_SUPPORT_TICKETS.map((t) => ({
  id: t.id,
  subject: t.subject,
  body: "",
  priority: t.priority,
  status: t.status,
  requester: t.tenant,
  created: t.opened,
}));

export default function AdminSupportPage() {
  const { data: tickets } = useAdminData(fetchTickets, FALLBACK_TICKETS);

  const rows = useMemo(
    () =>
      tickets.map((t) => ({
        ...t,
        statusAr: LIVE_STATUS_AR[t.status] ?? t.status,
      })),
    [tickets],
  );

  const openCount = rows.filter((r) => r.statusAr !== "مغلق").length;

  return (
    <>
      <Topbar title="تذاكر الدعم" breadcrumb={["Admin", "الدعم"]} />
      <main className="p-4 sm:p-6 max-w-5xl w-full">
        <PageHeader title="تذاكر الدعم" sub={`${openCount} تذكرة مفتوحة`} />

        <div className="space-y-2">
          {rows.map((t) => (
            <div key={t.id} className="card hover:border-[var(--brand)]/40 cursor-pointer">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-[var(--text-faint)] mb-0.5" dir="ltr">
                    #{String(t.id).slice(0, 8)} • {t.requester}
                  </div>
                  <div className="font-bold text-sm">{t.subject}</div>
                  {t.body && (
                    <div className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                      {t.body}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${PRIORITY_COLOR[t.priority] ?? "var(--text-faint)"} 15%, transparent)`,
                      color: PRIORITY_COLOR[t.priority] ?? "var(--text-faint)",
                    }}
                  >
                    {t.priority}
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${STATUS_COLOR[t.statusAr] ?? "var(--info)"} 15%, transparent)`,
                      color: STATUS_COLOR[t.statusAr] ?? "var(--info)",
                    }}
                  >
                    {t.statusAr}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-[var(--text-faint)] font-mono">
                فُتحت {t.created}
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="card text-center text-sm text-[var(--text-muted)] py-10">
              لا توجد تذاكر حالياً — صندوق نظيف 🎉
            </div>
          )}
        </div>
      </main>
    </>
  );
}
