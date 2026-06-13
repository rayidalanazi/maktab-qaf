"use client";

import { useMemo, useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { useAdminData } from "@/hooks/useAdminData";
import { fetchTickets, replyTicket } from "@/lib/data/queries";
import type { TicketItem } from "@/lib/data/types";
import { ADMIN_SUPPORT_TICKETS } from "@/data/admin-mock";

const STATUS_COLOR: Record<string, string> = {
  "جديد": "var(--accent)",
  "قيد الحل": "var(--warn)",
  "تم الرد": "var(--info)",
  "مغلق": "var(--success)",
};

const PRIORITY_COLOR: Record<string, string> = {
  "عالية": "var(--accent)", "حرجة": "var(--accent)",
  "مرتفعة": "var(--warn)", "متوسطة": "var(--warn)",
  "عادية": "var(--text-faint)", "منخفضة": "var(--text-faint)",
};

const LIVE_STATUS_AR: Record<string, string> = {
  open: "جديد", in_progress: "قيد الحل", answered: "تم الرد", closed: "مغلق",
};

const FALLBACK_TICKETS: TicketItem[] = ADMIN_SUPPORT_TICKETS.map((t) => ({
  id: t.id, subject: t.subject, body: "", priority: t.priority,
  status: t.status, requester: t.tenant, created: t.opened,
}));

export default function AdminSupportPage() {
  const { data: tickets, reload } = useAdminData(fetchTickets, FALLBACK_TICKETS);
  const [replyingId, setReplyingId] = useState<string | number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);

  const rows = useMemo(
    () => tickets.map((t) => ({ ...t, statusAr: LIVE_STATUS_AR[t.status] ?? t.status })),
    [tickets],
  );
  const openCount = rows.filter((r) => r.statusAr !== "مغلق").length;

  async function submitReply(id: string | number, status: string) {
    setBusy(true);
    try { await replyTicket(id, replyText, status); setReplyingId(null); setReplyText(""); reload(); }
    catch { /* surfaced as no-op */ } finally { setBusy(false); }
  }
  async function quickClose(id: string | number) {
    setBusy(true);
    try { await replyTicket(id, "", "closed"); reload(); }
    catch { /* ignore */ } finally { setBusy(false); }
  }

  return (
    <>
      <Topbar title="تذاكر الدعم" breadcrumb={["Admin", "الدعم"]} />
      <main className="p-4 sm:p-6 max-w-5xl w-full">
        <PageHeader title="تذاكر الدعم" sub={`${openCount} تذكرة مفتوحة • من كل المكاتب`} />

        <div className="space-y-2">
          {rows.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-[var(--text-faint)] mb-0.5 flex flex-wrap items-center gap-x-2" dir="ltr">
                    <span>#{String(t.id).slice(0, 8)}</span>
                    {t.firm && <span className="text-[var(--brand)]">🏢 {t.firm}</span>}
                    {t.requester && <span>• {t.requester}</span>}
                  </div>
                  <div className="font-bold text-sm">{t.subject}</div>
                  {t.body && (
                    <div className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed break-words">{t.body}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: `color-mix(in srgb, ${PRIORITY_COLOR[t.priority] ?? "var(--text-faint)"} 15%, transparent)`, color: PRIORITY_COLOR[t.priority] ?? "var(--text-faint)" }}>
                    {t.priority}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: `color-mix(in srgb, ${STATUS_COLOR[t.statusAr] ?? "var(--info)"} 15%, transparent)`, color: STATUS_COLOR[t.statusAr] ?? "var(--info)" }}>
                    {t.statusAr}
                  </span>
                </div>
              </div>

              {t.reply && (
                <div className="rounded-lg bg-[var(--brand)]/8 border border-[var(--brand)]/20 px-3 py-2 text-xs leading-relaxed mb-2">
                  <span className="font-bold text-[var(--brand)]">ردّك: </span>
                  <span className="text-[var(--text-muted)] break-words">{t.reply}</span>
                </div>
              )}

              <div className="text-[10px] text-[var(--text-faint)] font-mono mb-2">فُتحت {t.created}</div>

              {replyingId === t.id ? (
                <div className="space-y-2 border-t border-[var(--border)] pt-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    placeholder="اكتب ردّك للمكتب…"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--brand)] text-sm leading-relaxed"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => submitReply(t.id, "answered")} disabled={busy || !replyText.trim()} className="btn btn-brand text-xs py-2 disabled:opacity-50">
                      إرسال الرد
                    </button>
                    <button onClick={() => submitReply(t.id, "closed")} disabled={busy} className="btn btn-ghost text-xs py-2">
                      رد وإغلاق
                    </button>
                    <button onClick={() => { setReplyingId(null); setReplyText(""); }} className="btn btn-ghost text-xs py-2">
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-xs border-t border-[var(--border)] pt-2.5">
                  <button onClick={() => { setReplyingId(t.id); setReplyText(t.reply || ""); }} className="text-[var(--brand)] font-semibold hover:underline">
                    ↩ {t.reply ? "تحديث الرد" : "رد على المكتب"}
                  </button>
                  {t.statusAr !== "مغلق" && (
                    <button onClick={() => quickClose(t.id)} disabled={busy} className="text-[var(--text-muted)] hover:underline">
                      إغلاق التذكرة
                    </button>
                  )}
                </div>
              )}
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
