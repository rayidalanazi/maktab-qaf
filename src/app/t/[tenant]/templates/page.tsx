import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

type Accent = "brand" | "accent" | "success" | "warn" | "info";

interface Template {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: string;
  accent: Accent;
  fields: number;
  uses: number;
  updated: string;
}

const TEMPLATES: Template[] = [
  {
    id: "tpl-001",
    name: "عقد توكيل",
    desc: "توكيل عام أو خاص لمباشرة الدعاوى أمام المحاكم والجهات الرسمية.",
    icon: "📜",
    category: "عقود",
    accent: "brand",
    fields: 14,
    uses: 248,
    updated: "2026-05-28",
  },
  {
    id: "tpl-002",
    name: "مذكرة دفاع",
    desc: "مذكرة دفاع نظامية للرد على لائحة الدعوى أمام المحكمة التجارية.",
    icon: "⚖",
    category: "مرافعات",
    accent: "info",
    fields: 22,
    uses: 187,
    updated: "2026-06-02",
  },
  {
    id: "tpl-003",
    name: "إنذار قانوني",
    desc: "إنذار رسمي عبر كاتب العدل للمطالبة بحق أو إخلاء أو سداد دين.",
    icon: "📢",
    category: "إنذارات",
    accent: "warn",
    fields: 11,
    uses: 312,
    updated: "2026-05-19",
  },
  {
    id: "tpl-004",
    name: "اتفاقية عدم إفصاح",
    desc: "اتفاقية سرية NDA لحماية المعلومات بين الأطراف المتعاقدة.",
    icon: "🔐",
    category: "عقود",
    accent: "accent",
    fields: 16,
    uses: 94,
    updated: "2026-04-30",
  },
  {
    id: "tpl-005",
    name: "تظلم إداري",
    desc: "صحيفة تظلم من قرار إداري للرفع أمام المحكمة الإدارية (ديوان المظالم).",
    icon: "🏛",
    category: "إداري",
    accent: "success",
    fields: 19,
    uses: 76,
    updated: "2026-06-05",
  },
  {
    id: "tpl-006",
    name: "عقد إيجار تجاري",
    desc: "عقد إيجار محل أو مكتب تجاري موثّق وفق منصة إيجار العقارية.",
    icon: "🏢",
    category: "عقود",
    accent: "brand",
    fields: 27,
    uses: 158,
    updated: "2026-05-22",
  },
  {
    id: "tpl-007",
    name: "صحيفة دعوى عمالية",
    desc: "صحيفة دعوى عمالية للمطالبة بمستحقات نهاية الخدمة أمام المحكمة العمالية.",
    icon: "👷",
    category: "مرافعات",
    accent: "info",
    fields: 21,
    uses: 133,
    updated: "2026-05-11",
  },
  {
    id: "tpl-008",
    name: "طلب تنفيذ سند",
    desc: "طلب تنفيذ مباشر لسند لأمر أو حكم قضائي أمام محكمة التنفيذ.",
    icon: "🧾",
    category: "تنفيذ",
    accent: "warn",
    fields: 13,
    uses: 201,
    updated: "2026-06-01",
  },
];

const CATEGORY_STYLE: Record<string, Accent> = {
  عقود: "brand",
  مرافعات: "info",
  إنذارات: "warn",
  إداري: "success",
  تنفيذ: "accent",
};

const totalUses = TEMPLATES.reduce((s, t) => s + t.uses, 0);
const categoriesCount = new Set(TEMPLATES.map((t) => t.category)).size;

export default async function TemplatesPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  await params;

  return (
    <>
      <Topbar
        title="مكتبة القوالب"
        sub="قوالب جاهزة لتسريع تحرير المستندات"
        breadcrumb={["الرئيسية", "القوالب"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="مكتبة القوالب"
          sub="انطلق من قالب جاهز بدل ما تبدأ من ورقة بيضاء — عبّي البيانات والباقي علينا."
          actions={
            <button className="btn btn-brand text-sm py-2.5">
              + قالب جديد
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="إجمالي القوالب"
            value={TEMPLATES.length}
            icon="📁"
            accent="brand"
            hint="جاهزة للاستخدام الآن"
          />
          <StatCard
            label="التصنيفات"
            value={categoriesCount}
            icon="🏷"
            accent="info"
            hint="عقود · مرافعات · إنذارات…"
          />
          <StatCard
            label="مرات الاستخدام"
            value={totalUses}
            icon="⚡"
            accent="success"
            trend={{ v: "+18", up: true }}
            hint="آخر 30 يوم"
          />
          <StatCard
            label="الأكثر طلبًا"
            value="إنذار"
            icon="🔥"
            accent="warn"
            hint="312 مستند هذا الشهر"
          />
        </div>

        {/* Templates grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {TEMPLATES.map((t) => {
            const accent = CATEGORY_STYLE[t.category] ?? t.accent;
            return (
              <article
                key={t.id}
                className="card flex flex-col gap-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="w-12 h-12 shrink-0 rounded-xl grid place-items-center text-2xl"
                    style={{
                      background: `color-mix(in srgb, var(--${accent}) 14%, transparent)`,
                    }}
                  >
                    {t.icon}
                  </div>
                  <span
                    className="pill shrink-0"
                    style={{
                      background: `color-mix(in srgb, var(--${accent}) 12%, transparent)`,
                      borderColor: `color-mix(in srgb, var(--${accent}) 30%, transparent)`,
                      color: `var(--${accent})`,
                    }}
                  >
                    {t.category}
                  </span>
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-base leading-tight truncate">
                    {t.name}
                  </h3>
                  <p className="text-[13px] text-[var(--text-muted)] mt-1 leading-relaxed break-words">
                    {t.desc}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[var(--text-faint)] mt-auto pt-1">
                  <span className="flex items-center gap-1">
                    <span aria-hidden>📝</span> عدد الحقول:{" "}
                    <span className="num" dir="ltr">
                      {t.fields}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span aria-hidden>📊</span> استُخدم{" "}
                    <span className="num" dir="ltr">
                      {t.uses}
                    </span>{" "}
                    مرة
                  </span>
                  <span className="flex items-center gap-1 w-full sm:w-auto">
                    <span aria-hidden>🕓</span> آخر تحديث{" "}
                    <span className="num" dir="ltr">
                      {t.updated}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button className="btn btn-brand text-sm py-2.5 flex-1">
                    استخدم القالب
                  </button>
                  <button
                    className="btn btn-ghost text-sm py-2.5 px-3"
                    aria-label="معاينة القالب"
                    title="معاينة"
                  >
                    👁
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Hint footer */}
        <p className="text-[12px] text-[var(--text-faint)] mt-6 text-center">
          {/* ودك بقالب مو موجود؟ */}
          ما لقيت قالبك؟ أنشئ واحد جديد وخلّه جاهز لبقية الفريق.
        </p>
      </main>
    </>
  );
}
