"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useQafData } from "@/hooks/useQafData";
import { fetchRequests, decideRequest } from "@/lib/data/queries";
import type { RequestItem } from "@/lib/data/types";

// Demo fallback (shown only when no firm/DB yet). Shaped like RequestItem.
const FALLBACK_REQUESTS: RequestItem[] = [
  {
    id: "REQ-1042",
    code: "REQ-1042",
    employee: "نورة العتيبي",
    role: "محامية مترافعة",
    type: "إجازة سنوية",
    period: "2026-06-20 → 2026-06-27",
    reason: "إجازة عائلية مخططة مسبقًا بعد إغلاق قضية التنفيذ.",
    submitted: "2026-06-08",
    status: "بانتظار الموافقة",
  },
  {
    id: "REQ-1041",
    code: "REQ-1041",
    employee: "خالد الشهري",
    role: "مستشار قانوني",
    type: "سلفة",
    period: "دفعة واحدة",
    reason: "سلفة على راتب شهر يونيو لظروف طارئة.",
    submitted: "2026-06-07",
    status: "بانتظار الموافقة",
    amount: "6,500 ر.س",
  },
  {
    id: "REQ-1040",
    code: "REQ-1040",
    employee: "ريم القحطاني",
    role: "باحثة قانونية",
    type: "عُهدة",
    period: "عُهدة دائمة",
    reason: "جهاز لابتوب + اشتراك قواعد الأنظمة العدلية.",
    submitted: "2026-06-06",
    status: "بانتظار الموافقة",
    amount: "9,200 ر.س",
  },
  {
    id: "REQ-1039",
    code: "REQ-1039",
    employee: "سعد المالكي",
    role: "محامٍ تحت التدريب",
    type: "إجازة مرضية",
    period: "2026-06-03 → 2026-06-05",
    reason: "إجازة مرضية مرفق بها تقرير طبي معتمد.",
    submitted: "2026-06-03",
    status: "معتمدة",
  },
  {
    id: "REQ-1038",
    code: "REQ-1038",
    employee: "هند الدوسري",
    role: "مديرة العقود",
    type: "إجازة سنوية",
    period: "2026-05-25 → 2026-05-30",
    reason: "إجازة سنوية ضمن الرصيد المتبقي للعام.",
    submitted: "2026-05-18",
    status: "معتمدة",
  },
  {
    id: "REQ-1037",
    code: "REQ-1037",
    employee: "فيصل الحربي",
    role: "محاسب المكتب",
    type: "سلفة",
    period: "دفعة واحدة",
    reason: "طلب سلفة يتجاوز الحد الشهري المسموح للموظف.",
    submitted: "2026-05-14",
    status: "مرفوضة",
    amount: "15,000 ر.س",
  },
];

const STATUS_STYLE: Record<string, { var: string; label: string }> = {
  "بانتظار الموافقة": { var: "--warn", label: "بانتظار الموافقة" },
  معتمدة: { var: "--success", label: "معتمدة" },
  مرفوضة: { var: "--danger", label: "مرفوضة" },
};

const TYPE_ICON: Record<string, string> = {
  "إجازة سنوية": "🌴",
  "إجازة مرضية": "🩺",
  سلفة: "💸",
  عُهدة: "📦",
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { var: "--info", label: status };
  return (
    <span
      className="pill text-[11px] whitespace-nowrap"
      style={{
        background: `color-mix(in srgb, var(${s.var}) 15%, transparent)`,
        color: `var(${s.var})`,
        borderColor: `color-mix(in srgb, var(${s.var}) 35%, transparent)`,
      }}
    >
      {s.label}
    </span>
  );
}

function ActionButtons({
  onApprove,
  onReject,
  disabled,
}: {
  onApprove: () => void;
  onReject: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onApprove}
        disabled={disabled}
        className="btn text-xs py-1.5 px-3 whitespace-nowrap disabled:opacity-50"
        style={{
          background: `color-mix(in srgb, var(--success) 14%, transparent)`,
          color: "var(--success)",
          borderColor: `color-mix(in srgb, var(--success) 35%, transparent)`,
        }}
      >
        ✓ موافقة
      </button>
      <button
        type="button"
        onClick={onReject}
        disabled={disabled}
        className="btn text-xs py-1.5 px-3 whitespace-nowrap disabled:opacity-50"
        style={{
          background: `color-mix(in srgb, var(--danger) 14%, transparent)`,
          color: "var(--danger)",
          borderColor: `color-mix(in srgb, var(--danger) 35%, transparent)`,
        }}
      >
        ✕ رفض
      </button>
    </div>
  );
}

export default function RequestsPage() {
  const { data, isDemo } = useQafData(fetchRequests, FALLBACK_REQUESTS);

  // Local copy of the rows so approve/reject can update optimistically.
  const [rows, setRows] = useState<RequestItem[]>(data);
  useEffect(() => {
    setRows(data);
  }, [data]);

  const [pendingId, setPendingId] = useState<string | number | null>(null);
  const [actionError, setActionError] = useState<{
    id: string | number;
    msg: string;
  } | null>(null);

  async function decide(id: string | number, approve: boolean) {
    const prev = rows;
    const next = approve ? "معتمدة" : "مرفوضة";
    setActionError(null);
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));

    // Demo mode: local-only update, no API call.
    if (isDemo) return;

    setPendingId(id);
    try {
      await decideRequest(id, approve);
    } catch (e) {
      // Revert the optimistic update and surface a small inline error.
      setRows(prev);
      setActionError({
        id,
        msg: e instanceof Error ? e.message : "تعذّر تنفيذ الإجراء، حاول مرة أخرى.",
      });
    } finally {
      setPendingId(null);
    }
  }

  const pendingCount = rows.filter(
    (r) => r.status === "بانتظار الموافقة"
  ).length;
  const approvedCount = rows.filter((r) => r.status === "معتمدة").length;
  const rejectedCount = rows.filter((r) => r.status === "مرفوضة").length;

  return (
    <>
      <Topbar
        title="إدارة الطلبات"
        sub="الطلبات الداخلية للموظفين — إجازات، سلف، عُهد"
        breadcrumb={["الرئيسية", "الطلبات"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="إدارة الطلبات"
          sub="راجع واعتمد طلبات فريق المكتب من مكان واحد"
          actions={
            <button className="btn btn-brand text-sm py-2.5">+ طلب جديد</button>
          }
        />

        {/* Stat row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="بانتظار الموافقة"
            value={pendingCount}
            icon="⏳"
            accent="warn"
            hint="تحتاج إجراء منك"
          />
          <StatCard
            label="معتمدة"
            value={approvedCount}
            icon="✅"
            accent="success"
            hint="هذا الشهر"
          />
          <StatCard
            label="مرفوضة"
            value={rejectedCount}
            icon="🚫"
            accent="accent"
            hint="هذا الشهر"
          />
          <StatCard
            label="إجمالي الطلبات"
            value={rows.length}
            icon="📨"
            accent="info"
            trend={{ v: "+3", up: true }}
            hint="مقارنة بالشهر الماضي"
          />
        </div>

        {/* ===== Mobile: cards (stacks under md) ===== */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {rows.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <div className="font-bold truncate">{r.employee}</div>
                  <div className="text-xs text-[var(--text-faint)] truncate">
                    {r.role}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{TYPE_ICON[r.type] ?? "📨"}</span>
                <span className="pill pill-brand text-[11px] whitespace-nowrap">
                  {r.type}
                </span>
                {r.amount && (
                  <span className="num text-sm font-bold ms-auto" dir="ltr">
                    {r.amount}
                  </span>
                )}
              </div>

              <dl className="space-y-2 text-sm mb-3">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-[var(--text-muted)] shrink-0">الفترة</dt>
                  <dd className="num text-end break-words" dir="ltr">
                    {r.period}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-[var(--text-muted)] shrink-0">السبب</dt>
                  <dd className="text-end text-[var(--text)] break-words">
                    {r.reason}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--text-muted)] shrink-0">
                    تاريخ التقديم
                  </dt>
                  <dd className="num" dir="ltr">
                    {r.submitted}
                  </dd>
                </div>
              </dl>

              {r.status === "بانتظار الموافقة" && (
                <div className="pt-3 border-t border-[var(--border)]">
                  <ActionButtons
                    onApprove={() => decide(r.id, true)}
                    onReject={() => decide(r.id, false)}
                    disabled={pendingId === r.id}
                  />
                  {actionError?.id === r.id && (
                    <div className="text-[11px] text-[var(--danger)] mt-1.5">
                      {actionError.msg}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ===== Desktop: table (md and up) ===== */}
        <div className="card !p-0 overflow-x-auto hidden md:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-end text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="font-medium text-[11px] uppercase tracking-wider px-4 py-3">
                  الموظف
                </th>
                <th className="font-medium text-[11px] uppercase tracking-wider px-4 py-3">
                  نوع الطلب
                </th>
                <th className="font-medium text-[11px] uppercase tracking-wider px-4 py-3">
                  الفترة
                </th>
                <th className="font-medium text-[11px] uppercase tracking-wider px-4 py-3">
                  السبب
                </th>
                <th className="font-medium text-[11px] uppercase tracking-wider px-4 py-3">
                  الحالة
                </th>
                <th className="font-medium text-[11px] uppercase tracking-wider px-4 py-3 text-center">
                  إجراء
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors align-top"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold whitespace-nowrap">
                      {r.employee}
                    </div>
                    <div className="text-xs text-[var(--text-faint)] whitespace-nowrap">
                      {r.role}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 pill pill-brand text-[11px] whitespace-nowrap">
                      <span>{TYPE_ICON[r.type] ?? "📨"}</span>
                      {r.type}
                    </span>
                    {r.amount && (
                      <div className="num text-xs text-[var(--text-muted)] mt-1" dir="ltr">
                        {r.amount}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="num whitespace-nowrap" dir="ltr">
                      {r.period}
                    </span>
                    <div className="text-xs text-[var(--text-faint)] num mt-1" dir="ltr">
                      قُدّم {r.submitted}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[260px]">
                    <span className="text-[var(--text-muted)] break-words">
                      {r.reason}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "بانتظار الموافقة" ? (
                      <div className="flex flex-col items-center">
                        <ActionButtons
                          onApprove={() => decide(r.id, true)}
                          onReject={() => decide(r.id, false)}
                          disabled={pendingId === r.id}
                        />
                        {actionError?.id === r.id && (
                          <div className="text-[11px] text-[var(--danger)] mt-1.5 text-center">
                            {actionError.msg}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-[var(--text-faint)] text-xs">
                        —
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-[var(--text-faint)] mt-4 text-center">
          {/* ما فيه طلبات معلّقة ثانية — فاضي ومرتّب، تمام التمام */}
          يتم إشعار الموظف تلقائيًا فور اعتماد أو رفض الطلب.
        </p>
      </main>
    </>
  );
}
