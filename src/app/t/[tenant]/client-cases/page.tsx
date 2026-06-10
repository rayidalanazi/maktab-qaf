import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

type Urgency = "danger" | "warn" | "success";

interface ClientCase {
  client: string;
  org: string;
  subject: string;
  court: string;
  lawyer: string;
  deadline: string;
  daysLeft: number;
  caseNo: string;
}

const URGENCY_VAR: Record<Urgency, string> = {
  danger: "var(--danger)",
  warn: "var(--warn)",
  success: "var(--success)",
};

function urgencyOf(days: number): Urgency {
  if (days <= 3) return "danger";
  if (days <= 10) return "warn";
  return "success";
}

function urgencyLabel(days: number): string {
  if (days < 0) return "متأخر";
  if (days === 0) return "اليوم";
  if (days <= 3) return "عاجل جدًا";
  if (days <= 10) return "قريب";
  return "في الوقت";
}

const CASES: ClientCase[] = [
  {
    client: "عبدالعزيز الدوسري",
    org: "شركة نجد للمقاولات",
    subject: "مطالبة مالية ومستحقات عقد توريد",
    court: "المحكمة التجارية بالرياض",
    lawyer: "أ. سارة القحطاني",
    deadline: "2026-06-12",
    daysLeft: 2,
    caseNo: "TJ-4471",
  },
  {
    client: "نورة الشهري",
    org: "مؤسسة الشهري التجارية",
    subject: "نزاع على حضانة وزيارة",
    court: "محكمة الأحوال الشخصية بالرياض",
    lawyer: "أ. خالد العتيبي",
    deadline: "2026-06-13",
    daysLeft: 3,
    caseNo: "AH-2098",
  },
  {
    client: "فهد بن سعد المطيري",
    org: "مصنع المطيري للبلاستيك",
    subject: "دعوى فصل تعسفي ومكافأة نهاية خدمة",
    court: "المحكمة العمالية بالرياض",
    lawyer: "أ. ريم الغامدي",
    deadline: "2026-06-18",
    daysLeft: 8,
    caseNo: "LB-1320",
  },
  {
    client: "هند العنزي",
    org: "—",
    subject: "اعتراض على قرار إداري",
    court: "المحكمة الإدارية بالرياض",
    lawyer: "أ. ماجد الحربي",
    deadline: "2026-06-22",
    daysLeft: 12,
    caseNo: "AD-0775",
  },
  {
    client: "تركي السبيعي",
    org: "شركة السبيعي القابضة",
    subject: "تنفيذ حكم بسداد دين تجاري",
    court: "محكمة التنفيذ بالرياض",
    lawyer: "أ. سارة القحطاني",
    deadline: "2026-06-11",
    daysLeft: 1,
    caseNo: "EX-6612",
  },
  {
    client: "منيرة الزهراني",
    org: "مجموعة الزهراني الطبية",
    subject: "نزاع ملكية عقار وقسمة تركة",
    court: "المحكمة العامة بالرياض",
    lawyer: "أ. خالد العتيبي",
    deadline: "2026-07-02",
    daysLeft: 22,
    caseNo: "GN-3344",
  },
  {
    client: "بدر القرني",
    org: "مؤسسة القرني للنقل",
    subject: "مطالبة بالتعويض عن أضرار مركبات",
    court: "المحكمة العامة بالرياض",
    lawyer: "أ. ريم الغامدي",
    deadline: "2026-06-16",
    daysLeft: 6,
    caseNo: "GN-3390",
  },
];

export default async function ClientCasesPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  await params;

  const total = CASES.length;
  const urgent = CASES.filter((c) => c.daysLeft <= 3).length;
  const thisWeek = CASES.filter((c) => c.daysLeft <= 7).length;
  const lawyers = new Set(CASES.map((c) => c.lawyer)).size;

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
            <button className="btn btn-brand text-sm py-2.5">+ ربط قضية بعميل</button>
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
            value={urgent}
            icon="🔴"
            accent="warn"
            trend={{ v: "خلال 3 أيام", up: false }}
            hint="تتطلّب إجراء فوري"
          />
          <StatCard
            label="مواعيد هذا الأسبوع"
            value={thisWeek}
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
          {CASES.map((c) => {
            const u = urgencyOf(c.daysLeft);
            const uColor = URGENCY_VAR[u];
            return (
              <article
                key={c.caseNo}
                className="card flex flex-col gap-3 border-t-2"
                style={{ borderTopColor: uColor }}
              >
                {/* Header: client + days badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-base leading-tight truncate">
                      {c.client}
                    </h3>
                    <p className="text-xs text-[var(--text-faint)] truncate mt-0.5">
                      {c.org}
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
                      {c.daysLeft}
                    </span>
                    <span className="text-[9px] mt-0.5">يوم متبقٍ</span>
                  </span>
                </div>

                {/* Subject */}
                <div className="text-sm text-[var(--text)] break-words leading-relaxed">
                  {c.subject}
                </div>

                {/* Court + case no */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="pill pill-brand truncate max-w-full">
                    {c.court}
                  </span>
                  <span className="num text-[var(--text-faint)]" dir="ltr">
                    #{c.caseNo}
                  </span>
                </div>

                {/* Footer: lawyer + deadline */}
                <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 shrink-0 rounded-full grid place-items-center text-xs bg-[var(--bg-hover)] text-[var(--text-muted)]">
                      👤
                    </span>
                    <span className="text-xs text-[var(--text-muted)] truncate">
                      {c.lawyer}
                    </span>
                  </div>
                  <div className="text-left shrink-0">
                    <div
                      className="text-[10px] font-medium"
                      style={{ color: uColor }}
                    >
                      {urgencyLabel(c.daysLeft)}
                    </div>
                    <div className="num text-xs text-[var(--text-muted)]" dir="ltr">
                      {c.deadline}
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
    </>
  );
}
