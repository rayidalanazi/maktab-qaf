import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

type MemoStatus = "draft" | "audit" | "legal" | "approved" | "published";

interface Memo {
  id: string;
  title: string;
  caseTitle: string;
  caseRef: string;
  author: string;
  status: MemoStatus;
  due: string;
  stage: number; // 1..5
}

const MEMOS: Memo[] = [
  {
    id: "MEMO-2026-041",
    title: "مذكرة دفاع في دعوى مطالبة مالية",
    caseTitle: "شركة الأفق التجارية ضد مؤسسة النخبة",
    caseRef: "ق-1447-0312",
    author: "أ. سلطان القحطاني",
    status: "draft",
    due: "2026-06-18",
    stage: 1,
  },
  {
    id: "MEMO-2026-039",
    title: "لائحة اعتراضية على حكم ابتدائي",
    caseTitle: "خالد بن فهد العتيبي ضد البنك الوطني",
    caseRef: "ق-1447-0298",
    author: "أ. نورة الدوسري",
    status: "audit",
    due: "2026-06-15",
    stage: 2,
  },
  {
    id: "MEMO-2026-037",
    title: "مذكرة رد على لائحة المدعى عليه",
    caseTitle: "مؤسسة بناء المستقبل ضد مقاولات الراجحي",
    caseRef: "ق-1447-0271",
    author: "أ. عبدالعزيز الشمري",
    status: "legal",
    due: "2026-06-13",
    stage: 3,
  },
  {
    id: "MEMO-2026-034",
    title: "مذكرة طلب تنفيذ حكم نهائي",
    caseTitle: "ورثة المرحوم محمد السبيعي",
    caseRef: "ق-1447-0244",
    author: "أ. ريم الغامدي",
    status: "approved",
    due: "2026-06-11",
    stage: 4,
  },
  {
    id: "MEMO-2026-030",
    title: "لائحة دعوى عمالية — مستحقات نهاية الخدمة",
    caseTitle: "ماجد الحربي ضد شركة الإنشاءات الحديثة",
    caseRef: "ق-1447-0219",
    author: "أ. سلطان القحطاني",
    status: "published",
    due: "2026-06-08",
    stage: 5,
  },
  {
    id: "MEMO-2026-028",
    title: "مذكرة إجابة في نزاع أحوال شخصية",
    caseTitle: "سارة العنزي ضد طلال المطيري",
    caseRef: "ق-1447-0203",
    author: "أ. نورة الدوسري",
    status: "audit",
    due: "2026-06-20",
    stage: 2,
  },
];

const STATUS_META: Record<
  MemoStatus,
  { label: string; color: string; dot: string }
> = {
  draft: { label: "مسودة", color: "var(--text-muted)", dot: "var(--text-faint)" },
  audit: { label: "مراجعة تدقيق", color: "var(--info)", dot: "var(--info)" },
  legal: { label: "مراجعة قانونية", color: "var(--warn)", dot: "var(--warn)" },
  approved: { label: "معتمد", color: "var(--accent)", dot: "var(--accent)" },
  published: { label: "منشور", color: "var(--success)", dot: "var(--success)" },
};

const WORKFLOW: { key: MemoStatus; label: string }[] = [
  { key: "draft", label: "مسودة" },
  { key: "audit", label: "مراجعة تدقيق" },
  { key: "legal", label: "مراجعة قانونية" },
  { key: "approved", label: "معتمد" },
  { key: "published", label: "منشور" },
];

function StatusBadge({ status }: { status: MemoStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="pill text-xs whitespace-nowrap inline-flex items-center gap-1.5"
      style={{
        background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
        color: meta.color,
        borderColor: `color-mix(in srgb, ${meta.color} 30%, transparent)`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: meta.dot }}
      />
      {meta.label}
    </span>
  );
}

function count(status: MemoStatus) {
  return MEMOS.filter((m) => m.status === status).length;
}

export default async function MemosPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  await params;

  return (
    <>
      <Topbar
        title="المذكرات واللوائح"
        sub="إدارة المذكرات القانونية عبر مراحل الاعتماد"
        breadcrumb={["الرئيسية", "المذكرات"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="المذكرات واللوائح"
          sub="تتبّع كل مذكرة من المسودة حتى النشر عبر سير اعتماد متعدد المراحل"
          actions={
            <button className="btn btn-brand text-sm py-2.5">+ مذكرة جديدة</button>
          }
        />

        {/* Status stat row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="مسودة"
            value={count("draft")}
            icon="📝"
            accent="info"
            hint="قيد الكتابة"
          />
          <StatCard
            label="مراجعة تدقيق"
            value={count("audit")}
            icon="🔍"
            accent="info"
            hint="عند مدقّق لغوي"
          />
          <StatCard
            label="مراجعة قانونية"
            value={count("legal")}
            icon="⚖"
            accent="warn"
            hint="عند المحامي الأول"
          />
          <StatCard
            label="معتمد"
            value={count("approved")}
            icon="✅"
            accent="accent"
            hint="بانتظار النشر"
          />
          <StatCard
            label="منشور"
            value={count("published")}
            icon="📤"
            accent="success"
            hint="رُفع للمحكمة"
          />
        </div>

        {/* Memos table — desktop / tablet */}
        <div className="card !p-0 overflow-x-auto hidden md:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="text-start font-medium px-4 py-3">عنوان المذكرة</th>
                <th className="text-start font-medium px-4 py-3">القضية المرتبطة</th>
                <th className="text-start font-medium px-4 py-3">الكاتب</th>
                <th className="text-start font-medium px-4 py-3">الحالة</th>
                <th className="text-start font-medium px-4 py-3">تاريخ الاستحقاق</th>
              </tr>
            </thead>
            <tbody>
              {MEMOS.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-[var(--text)] max-w-[260px] break-words">
                      {m.title}
                    </div>
                    <div className="text-[11px] text-[var(--text-faint)] num" dir="ltr">
                      {m.id}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="text-[var(--text)] max-w-[240px] break-words">
                      {m.caseTitle}
                    </div>
                    <div className="text-[11px] text-[var(--text-faint)] num" dir="ltr">
                      {m.caseRef}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap text-[var(--text-muted)]">
                    {m.author}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    <span className="num text-[var(--text-muted)]" dir="ltr">
                      {m.due}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Memos cards — mobile */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {MEMOS.map((m) => (
            <div key={m.id} className="card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-medium text-[var(--text)] break-words min-w-0">
                  {m.title}
                </h3>
                <StatusBadge status={m.status} />
              </div>
              <div className="text-sm text-[var(--text-muted)] break-words mb-1">
                {m.caseTitle}
              </div>
              <div className="text-[11px] text-[var(--text-faint)] num mb-3" dir="ltr">
                {m.id} · {m.caseRef}
              </div>

              {/* mini workflow tracker */}
              <div className="flex items-center gap-1 mb-3">
                {WORKFLOW.map((w, i) => (
                  <span
                    key={w.key}
                    className="h-1.5 flex-1 rounded-full"
                    style={{
                      background:
                        i < m.stage
                          ? STATUS_META[m.status].dot
                          : "var(--border)",
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[var(--text-muted)] truncate">{m.author}</span>
                <span className="flex items-center gap-1 text-[var(--text-faint)]">
                  الاستحقاق
                  <span className="num text-[var(--text-muted)]" dir="ltr">
                    {m.due}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Workflow legend */}
        <div className="card mt-6">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
            مسار الاعتماد
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {WORKFLOW.map((w, i) => (
              <div key={w.key} className="flex items-center gap-2">
                <span
                  className="pill text-xs whitespace-nowrap inline-flex items-center gap-1.5"
                  style={{
                    background: `color-mix(in srgb, ${STATUS_META[w.key].color} 14%, transparent)`,
                    color: STATUS_META[w.key].color,
                    borderColor: `color-mix(in srgb, ${STATUS_META[w.key].color} 30%, transparent)`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: STATUS_META[w.key].dot }}
                  />
                  {w.label}
                </span>
                {i < WORKFLOW.length - 1 && (
                  <span className="text-[var(--text-faint)]">←</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-faint)] mt-3">
            {/* تنتقل المذكرة تلقائياً للمرحلة التالية عند موافقة المسؤول — ولا رجعة إلا بسبب مكتوب */}
            تنتقل المذكرة للمرحلة التالية فور اعتماد المسؤول، وأي إرجاع يتطلب سبباً مكتوباً.
          </p>
        </div>
      </main>
    </>
  );
}
