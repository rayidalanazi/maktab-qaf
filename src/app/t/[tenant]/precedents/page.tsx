import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

type Precedent = {
  court: string;
  ref: string;
  year: string;
  date: string;
  summary: string;
  outcome: "مقبول" | "مرفوض" | "نقض وإحالة" | "تأييد";
  tags: string[];
};

const PRECEDENTS: Precedent[] = [
  {
    court: "المحكمة العليا",
    ref: "ع/4521",
    year: "2025",
    date: "2025-11-12",
    summary:
      "تقرير مبدأ عدم سريان شرط التحكيم على الغير الذي لم يكن طرفاً في العقد الأصلي، وعدم جواز إلزامه بالخصومة التحكيمية ما لم يقبلها صراحةً.",
    outcome: "نقض وإحالة",
    tags: ["تحكيم", "عقود", "مبدأ قضائي"],
  },
  {
    court: "محكمة الاستئناف بالرياض",
    ref: "س/1187",
    year: "2025",
    date: "2025-09-03",
    summary:
      "تأييد حكم ابتدائي بإلزام شركة بسداد مستحقات مقاول عن أعمال إضافية مثبتة بمحاضر استلام موقّعة، مع رفض الدفع بانقضاء الالتزام.",
    outcome: "تأييد",
    tags: ["مقاولات", "مستحقات", "إثبات"],
  },
  {
    court: "المحكمة التجارية بجدة",
    ref: "ت/3360",
    year: "2024",
    date: "2024-12-21",
    summary:
      "الحكم بفسخ عقد توريد لإخلال المورّد بمواعيد التسليم الجوهرية، وإلزامه بالتعويض عن الضرر المباشر الناتج عن توقف خط الإنتاج.",
    outcome: "مقبول",
    tags: ["توريد", "فسخ عقد", "تعويض"],
  },
  {
    court: "المحكمة العمالية بالدمام",
    ref: "ل/2078",
    year: "2025",
    date: "2025-06-18",
    summary:
      "رد دعوى عامل بطلب مكافأة نهاية الخدمة لثبوت فصله لسبب مشروع وفق المادة (80) من نظام العمل، مع تحميله مصاريف الدعوى.",
    outcome: "مرفوض",
    tags: ["نظام العمل", "نهاية الخدمة", "المادة 80"],
  },
  {
    court: "المحكمة الإدارية بالرياض",
    ref: "د/0915",
    year: "2024",
    date: "2024-10-09",
    summary:
      "إلغاء قرار إداري بإلغاء ترسية مناقصة حكومية لمخالفته الإجراءات النظامية، مع التعويض عن المصروفات الفعلية لإعداد العرض.",
    outcome: "مقبول",
    tags: ["قرار إداري", "مناقصات", "إلغاء"],
  },
  {
    court: "محكمة الأحوال الشخصية بمكة المكرمة",
    ref: "ح/1442",
    year: "2025",
    date: "2025-03-27",
    summary:
      "تثبيت حضانة الأم للصغار مع تقدير نفقة شهرية وأجرة مسكن، ورفض طلب الأب بإسقاط الحضانة لعدم ثبوت مانع شرعي أو نظامي.",
    outcome: "تأييد",
    tags: ["حضانة", "نفقة", "أحوال شخصية"],
  },
];

const OUTCOME_STYLE: Record<Precedent["outcome"], string> = {
  مقبول: "var(--success)",
  مرفوض: "var(--danger)",
  "نقض وإحالة": "var(--warn)",
  تأييد: "var(--info)",
};

export default async function PrecedentsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  await params;

  const total = PRECEDENTS.length;
  const courts = new Set(PRECEDENTS.map((p) => p.court)).size;
  const thisYear = PRECEDENTS.filter((p) => p.year === "2025").length;
  const supreme = PRECEDENTS.filter((p) => p.court === "المحكمة العليا").length;

  return (
    <>
      <Topbar
        title="السوابق القضائية"
        sub="قاعدة بيانات الأحكام والمبادئ القضائية"
        breadcrumb={["الرئيسية", "السوابق"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="السوابق القضائية"
          sub="ابحث في الأحكام والمبادئ القضائية الصادرة عن المحاكم السعودية"
          actions={
            <button className="btn btn-brand text-sm py-2.5">+ إضافة سابقة</button>
          }
        />

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
          <StatCard
            label="إجمالي السوابق"
            value={total}
            icon="⚖"
            accent="brand"
            hint="في القاعدة"
          />
          <StatCard
            label="المحاكم المغطّاة"
            value={courts}
            icon="🏛"
            accent="info"
            hint="جهات قضائية"
          />
          <StatCard
            label="أحكام 2025"
            value={thisYear}
            icon="📅"
            accent="accent"
            trend={{ v: "+3", up: true }}
          />
          <StatCard
            label="مبادئ المحكمة العليا"
            value={supreme}
            icon="📌"
            accent="success"
            hint="ملزمة"
          />
        </div>

        {/* صندوق البحث */}
        <div className="card mb-5">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1 min-w-0">
              <span
                className="absolute top-1/2 -translate-y-1/2 right-3 text-[var(--text-faint)] pointer-events-none"
                aria-hidden
              >
                🔍
              </span>
              <input
                type="search"
                placeholder="ابحث برقم المرجع، اسم المحكمة، أو كلمة في الحكم…"
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg py-2.5 pr-10 pl-3 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:outline-none focus:border-[var(--brand)]"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select className="bg-[var(--bg)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]">
                <option>كل المحاكم</option>
                <option>المحكمة العليا</option>
                <option>محكمة الاستئناف</option>
                <option>المحكمة التجارية</option>
                <option>المحكمة العمالية</option>
                <option>المحكمة الإدارية</option>
                <option>الأحوال الشخصية</option>
              </select>
              <select className="bg-[var(--bg)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]">
                <option>كل السنوات</option>
                <option>2025</option>
                <option>2024</option>
              </select>
              <button className="btn btn-brand text-sm py-2.5">بحث</button>
            </div>
          </div>
        </div>

        {/* قائمة السوابق */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {PRECEDENTS.map((p) => (
            <article
              key={p.ref}
              className="card flex flex-col gap-3 hover:bg-[var(--bg-hover)] transition-colors"
            >
              {/* الرأس: المحكمة + النتيجة */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-[var(--text)] text-sm sm:text-base break-words">
                    {p.court}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-[var(--text-muted)]">
                    <span>
                      المرجع:{" "}
                      <span className="num" dir="ltr">
                        {p.ref}
                      </span>
                    </span>
                    <span className="text-[var(--text-faint)]">•</span>
                    <span className="num" dir="ltr">
                      {p.date}
                    </span>
                  </div>
                </div>
                <span
                  className="pill text-xs shrink-0 whitespace-nowrap"
                  style={{
                    background: `color-mix(in srgb, ${OUTCOME_STYLE[p.outcome]} 15%, transparent)`,
                    color: OUTCOME_STYLE[p.outcome],
                  }}
                >
                  {p.outcome}
                </span>
              </div>

              {/* ملخص الحكم */}
              <p className="text-sm text-[var(--text-muted)] leading-relaxed break-words">
                {p.summary}
              </p>

              {/* الوسوم + السنة */}
              <div className="flex items-center justify-between gap-3 flex-wrap mt-auto pt-1 border-t border-[var(--border)]">
                <div className="flex gap-1.5 flex-wrap">
                  {p.tags.map((t) => (
                    <span key={t} className="pill pill-brand text-xs">
                      {t}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-[var(--text-faint)] shrink-0">
                  سنة{" "}
                  <span className="num" dir="ltr">
                    {p.year}
                  </span>
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* تلميح أسفل القائمة */}
        <p className="text-xs text-[var(--text-faint)] text-center mt-6">
          {/* ودّك بسابقة ما لقيتها؟ */}
          عرض{" "}
          <span className="num" dir="ltr">
            {total}
          </span>{" "}
          سابقة من أصل قاعدة محدّثة باستمرار — أضف سابقتك وخلّها مرجع للجميع.
        </p>
      </main>
    </>
  );
}
