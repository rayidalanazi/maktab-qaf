import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

type RegStatus = "updated" | "amended" | "stable";

interface Regulation {
  id: string;
  name: string;
  authority: string;
  version: string;
  lastUpdate: string;
  status: RegStatus;
  note: string;
  icon: string;
}

const REGULATIONS: Regulation[] = [
  {
    id: "muhama",
    name: "نظام المحاماة",
    authority: "وزارة العدل",
    version: "م/38 — الإصدار 4",
    lastUpdate: "2026-04-22",
    status: "amended",
    note: "تعديل المادة (13) المتعلقة بشروط القيد في جدول المحامين المزاولين.",
    icon: "⚖",
  },
  {
    id: "murafaat",
    name: "نظام المرافعات الشرعية",
    authority: "المجلس الأعلى للقضاء",
    version: "م/1 — الإصدار 3",
    lastUpdate: "2026-03-10",
    status: "updated",
    note: "تحديث إجراءات التبليغ الإلكتروني عبر منصة ناجز.",
    icon: "📜",
  },
  {
    id: "sharikat",
    name: "نظام الشركات",
    authority: "وزارة التجارة",
    version: "م/132 — الإصدار 2",
    lastUpdate: "2026-05-15",
    status: "amended",
    note: "تعديل أحكام شركة الشخص الواحد ومتطلبات الحوكمة للشركات المساهمة.",
    icon: "🏢",
  },
  {
    id: "amal",
    name: "نظام العمل",
    authority: "وزارة الموارد البشرية",
    version: "م/51 — الإصدار 5",
    lastUpdate: "2026-02-01",
    status: "stable",
    note: "لا توجد تعديلات حديثة. ساري المفعول دون تغيير منذ آخر تحديث.",
    icon: "👷",
  },
  {
    id: "muamalat",
    name: "نظام المعاملات المدنية",
    authority: "هيئة الخبراء بمجلس الوزراء",
    version: "م/191 — الإصدار 1",
    lastUpdate: "2026-05-28",
    status: "updated",
    note: "صدور اللائحة التنفيذية الموضّحة لأحكام العقود والالتزامات.",
    icon: "📘",
  },
  {
    id: "tanfeeth",
    name: "نظام التنفيذ",
    authority: "وزارة العدل",
    version: "م/53 — الإصدار 3",
    lastUpdate: "2026-01-18",
    status: "stable",
    note: "مستقر. تُطبَّق أحكامه عبر محاكم التنفيذ في جميع المناطق.",
    icon: "🔨",
  },
  {
    id: "jazaeyat",
    name: "نظام الإجراءات الجزائية",
    authority: "المجلس الأعلى للقضاء",
    version: "م/2 — الإصدار 2",
    lastUpdate: "2026-04-05",
    status: "amended",
    note: "تعديل مدد التوقيف الاحتياطي وضوابط التحقيق الابتدائي.",
    icon: "🛡",
  },
];

const STATUS_META: Record<
  RegStatus,
  { label: string; color: string; dot: string }
> = {
  updated: { label: "محدّث", color: "var(--success)", dot: "●" },
  amended: { label: "تعديل جديد", color: "var(--warn)", dot: "✦" },
  stable: { label: "ساري", color: "var(--info)", dot: "○" },
};

function StatusPill({ status }: { status: RegStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{
        background: `color-mix(in srgb, ${meta.color} 15%, transparent)`,
        color: meta.color,
      }}
    >
      <span className="text-[8px] leading-none">{meta.dot}</span>
      {meta.label}
    </span>
  );
}

export default async function RegulationsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  await params;

  const updatedCount = REGULATIONS.filter((r) => r.status === "updated").length;
  const amendedCount = REGULATIONS.filter((r) => r.status === "amended").length;

  return (
    <>
      <Topbar
        title="الأنظمة واللوائح"
        sub="المرجع النظامي السعودي مع تنبيهات التحديث"
        breadcrumb={["الرئيسية", "الأنظمة"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="الأنظمة واللوائح"
          sub="مكتبة مرجعية محدّثة للأنظمة السعودية ذات العلاقة بعمل المكتب"
          actions={
            <button className="btn btn-brand text-sm py-2.5">
              + اقترح نظامًا
            </button>
          }
        />

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="إجمالي الأنظمة"
            value={REGULATIONS.length}
            icon="📚"
            accent="brand"
            hint="مراجع مرتبطة بالمكتب"
          />
          <StatCard
            label="تعديلات جديدة"
            value={amendedCount}
            icon="✦"
            accent="warn"
            trend={{ v: "+2", up: true }}
            hint="تتطلب مراجعة فريقك"
          />
          <StatCard
            label="تحديثات حديثة"
            value={updatedCount}
            icon="●"
            accent="success"
            hint="خلال آخر 90 يومًا"
          />
          <StatCard
            label="آخر مزامنة"
            value="2026-05-28"
            icon="🔄"
            accent="info"
            hint="من بوابة الأنظمة"
          />
        </div>

        {/* Alert banner for amendments */}
        {amendedCount > 0 && (
          <div
            className="card mb-6 flex flex-wrap items-center gap-3 border-r-4"
            style={{
              borderColor: "var(--warn)",
              background: `color-mix(in srgb, var(--warn) 8%, var(--bg-card))`,
            }}
          >
            <span className="text-xl shrink-0">📣</span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm">
                لديك {amendedCount} أنظمة بتعديلات جديدة
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 break-words">
                راجع التعديلات الأخيرة قبل مباشرة القضايا المرتبطة بها — أنظمة
                المحاماة والشركات والإجراءات الجزائية.
              </p>
            </div>
            <button className="btn btn-ghost text-xs py-2 shrink-0">
              عرض التعديلات
            </button>
          </div>
        )}

        {/* Regulations list — responsive cards */}
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {REGULATIONS.map((reg) => (
            <article
              key={reg.id}
              className="card flex flex-col gap-3 hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-xl grid place-items-center text-xl shrink-0"
                  style={{
                    background: `color-mix(in srgb, var(--brand) 12%, transparent)`,
                  }}
                >
                  {reg.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base leading-snug break-words">
                      {reg.name}
                    </h3>
                    <StatusPill status={reg.status} />
                  </div>
                  <div className="text-xs text-[var(--text-faint)] mt-0.5 truncate">
                    {reg.authority}
                  </div>
                </div>
              </div>

              <p className="text-sm text-[var(--text-muted)] break-words leading-relaxed">
                {reg.note}
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-[var(--border)] text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--text-faint)]">رقم الإصدار:</span>
                  <span className="num font-medium text-[var(--text)]" dir="ltr">
                    {reg.version}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--text-faint)]">آخر تحديث:</span>
                  <span className="num font-medium text-[var(--text)]" dir="ltr">
                    {reg.lastUpdate}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Footer hint */}
        <p className="text-[11px] text-[var(--text-faint)] mt-6 text-center break-words">
          // تُحدَّث المراجع تلقائيًا من بوابة الأنظمة السعودية — لا تعتمد عليها
          كبديل عن النص الرسمي المنشور في أم القرى.
        </p>
      </main>
    </>
  );
}
